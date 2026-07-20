package com.japaneselearninghub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.japaneselearninghub.model.AppIntegration;
import com.japaneselearninghub.model.WaniKaniProgress;
import com.japaneselearninghub.model.WaniKaniVocabularyItem;
import com.japaneselearninghub.repository.AppIntegrationRepository;
import com.japaneselearninghub.repository.WaniKaniProgressRepository;
import com.japaneselearninghub.repository.WaniKaniVocabularyItemRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WaniKaniService {
    private static final String WK_BASE = "https://api.wanikani.com/v2";
    private static final String WK_REVISION = "20170710";

    private final AppIntegrationRepository appIntegrationRepository;
    private final WaniKaniProgressRepository waniKaniProgressRepository;
    private final WaniKaniVocabularyItemRepository waniKaniVocabularyItemRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public WaniKaniService(
            AppIntegrationRepository appIntegrationRepository,
            WaniKaniProgressRepository waniKaniProgressRepository,
            WaniKaniVocabularyItemRepository waniKaniVocabularyItemRepository,
            RestTemplate restTemplate,
            ObjectMapper objectMapper) {
        this.appIntegrationRepository = appIntegrationRepository;
        this.waniKaniProgressRepository = waniKaniProgressRepository;
        this.waniKaniVocabularyItemRepository = waniKaniVocabularyItemRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public WaniKaniProgress syncProgress(Long userId) {
        AppIntegration integration = getIntegrationOrThrow(userId);
        String apiKey = integration.getAuthToken();
        HttpEntity<Void> entity = new HttpEntity<>(buildHeaders(apiKey));

        WaniKaniProgress progress = new WaniKaniProgress(userId);

        // 1. Fetch user info
        try {
            JsonNode userData = objectMapper.readTree(get(WK_BASE + "/user", entity)).path("data");
            progress.setUsername(userData.path("username").asText(null));
            progress.setLevel(userData.path("level").asInt(0));
            String startedAtStr = userData.path("started_at").asText(null);
            if (startedAtStr != null && !startedAtStr.isEmpty()) {
                progress.setStartedAt(Instant.parse(startedAtStr).toEpochMilli());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch WaniKani user info: " + e.getMessage(), e);
        }

        // 2. Fetch summary (lessons & reviews available now)
        try {
            JsonNode summaryData = objectMapper.readTree(get(WK_BASE + "/summary", entity)).path("data");

            JsonNode lessonsArr = summaryData.path("lessons");
            if (lessonsArr.isArray() && !lessonsArr.isEmpty()) {
                progress.setLessonsAvailable(lessonsArr.get(0).path("subject_ids").size());
            } else {
                progress.setLessonsAvailable(0);
            }

            JsonNode reviewsArr = summaryData.path("reviews");
            if (reviewsArr.isArray() && !reviewsArr.isEmpty()) {
                progress.setReviewsAvailable(reviewsArr.get(0).path("subject_ids").size());
            } else {
                progress.setReviewsAvailable(0);
            }

            String nextReviewsAtStr = summaryData.path("next_reviews_at").asText(null);
            if (nextReviewsAtStr != null && !nextReviewsAtStr.equals("null") && !nextReviewsAtStr.isEmpty()) {
                try { progress.setNextReviewsAt(Instant.parse(nextReviewsAtStr).toEpochMilli()); } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {
            progress.setLessonsAvailable(0);
            progress.setReviewsAvailable(0);
        }

        // 3. Fetch all assignments (paginated) to compute SRS breakdown
        int apprentice = 0, guru = 0, master = 0, enlightened = 0, burned = 0, started = 0;
        int radicalsCompleted = 0, kanjiCompleted = 0, vocabCompleted = 0;
        Map<Long, Integer> vocabSubjectMap = new HashMap<>(); // subjectId -> srsStage
        try {
            String nextUrl = WK_BASE + "/assignments";
            while (nextUrl != null) {
                JsonNode root = objectMapper.readTree(get(nextUrl, entity));
                JsonNode dataArr = root.path("data");

                if (dataArr.isArray()) {
                    for (JsonNode assignment : dataArr) {
                        JsonNode d = assignment.path("data");
                        int srs = d.path("srs_stage").asInt(0);
                        String type = d.path("subject_type").asText("");

                        if (srs >= 1) started++;
                        if (srs >= 1 && srs <= 4) apprentice++;
                        else if (srs == 5 || srs == 6) guru++;
                        else if (srs == 7) master++;
                        else if (srs == 8) enlightened++;
                        else if (srs == 9) burned++;

                        if (srs >= 5) {
                            if ("radical".equals(type)) radicalsCompleted++;
                            else if ("kanji".equals(type)) kanjiCompleted++;
                            else if ("vocabulary".equals(type) || "kana_vocabulary".equals(type)) vocabCompleted++;
                        }

                        // Collect vocab subject IDs for word lookup
                        if (srs >= 1 && ("vocabulary".equals(type) || "kana_vocabulary".equals(type))) {
                            long subjectId = d.path("subject_id").asLong(0);
                            if (subjectId > 0) vocabSubjectMap.put(subjectId, srs);
                        }
                    }
                }

                JsonNode nextUrlNode = root.path("pages").path("next_url");
                nextUrl = (!nextUrlNode.isNull() && !nextUrlNode.isMissingNode()) ? nextUrlNode.asText(null) : null;
            }
        } catch (Exception ignored) {
            // Use whatever counts were gathered before the error
        }

        progress.setApprenticeCount(apprentice);
        progress.setGuruCount(guru);
        progress.setMasterCount(master);
        progress.setEnlightenedCount(enlightened);
        progress.setBurnedCount(burned);
        progress.setItemsStarted(started);
        progress.setRadicalsCompleted(radicalsCompleted);
        progress.setKanjiCompleted(kanjiCompleted);
        progress.setVocabCompleted(vocabCompleted);

        // 4. Fetch subject details for vocabulary items and store them
        List<WaniKaniVocabularyItem> vocabItems = new ArrayList<>();
        if (!vocabSubjectMap.isEmpty()) {
            List<Long> subjectIds = new ArrayList<>(vocabSubjectMap.keySet());
            int batchSize = 500;
            for (int i = 0; i < subjectIds.size(); i += batchSize) {
                List<Long> batch = subjectIds.subList(i, Math.min(i + batchSize, subjectIds.size()));
                String idsParam = batch.stream().map(String::valueOf).collect(Collectors.joining(","));
                try {
                    JsonNode subjectsRoot = objectMapper.readTree(get(WK_BASE + "/subjects?ids=" + idsParam, entity));
                    JsonNode subjectsArr = subjectsRoot.path("data");
                    if (subjectsArr.isArray()) {
                        for (JsonNode subject : subjectsArr) {
                            long subjectId = subject.path("id").asLong(0);
                            String subjectType = subject.path("object").asText("");
                            JsonNode subjectData = subject.path("data");
                            String characters = subjectData.path("characters").asText(null);
                            if (characters == null || characters.isEmpty()) continue;

                            String reading = null;
                            for (JsonNode r : subjectData.path("readings")) {
                                if (r.path("primary").asBoolean(false)) {
                                    reading = r.path("reading").asText(null);
                                    break;
                                }
                            }

                            String meaning = null;
                            for (JsonNode m : subjectData.path("meanings")) {
                                if (m.path("primary").asBoolean(false)) {
                                    meaning = m.path("meaning").asText(null);
                                    break;
                                }
                            }

                            WaniKaniVocabularyItem item = new WaniKaniVocabularyItem();
                            item.setUserId(userId);
                            item.setSubjectId(subjectId);
                            item.setCharacters(characters);
                            item.setReading(reading);
                            item.setMeaning(meaning);
                            item.setSubjectType(subjectType);
                            item.setSrsStage(vocabSubjectMap.getOrDefault(subjectId, 0));
                            vocabItems.add(item);
                        }
                    }
                } catch (Exception ignored) {}
            }
        }
        waniKaniVocabularyItemRepository.deleteByUserId(userId);
        waniKaniVocabularyItemRepository.saveAll(vocabItems);

        // 5. Fetch level progressions
        try {
            JsonNode lvlData = objectMapper.readTree(get(WK_BASE + "/level_progressions", entity)).path("data");
            progress.setLevelProgressionsJson(objectMapper.writeValueAsString(lvlData));
        } catch (Exception ignored) {
            progress.setLevelProgressionsJson("[]");
        }

        WaniKaniProgress saved = waniKaniProgressRepository.save(progress);
        integration.setLastSyncedAt(System.currentTimeMillis());
        appIntegrationRepository.save(integration);
        return saved;
    }

    public WaniKaniProgress getLatestProgress(Long userId) {
        return waniKaniProgressRepository.findFirstByUserIdOrderBySnapshotTimeDesc(userId);
    }

    public List<WaniKaniVocabularyItem> getVocabulary(Long userId) {
        return waniKaniVocabularyItemRepository.findByUserIdOrderBySrsStageDescCharactersAsc(userId);
    }

    private String get(String url, HttpEntity<Void> entity) {
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        return response.getBody();
    }

    private HttpHeaders buildHeaders(String apiKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Wanikani-Revision", WK_REVISION);
        return headers;
    }

    private AppIntegration getIntegrationOrThrow(Long userId) {
        AppIntegration integration = appIntegrationRepository.findByUserIdAndAppName(userId, "wanikani");
        if (integration == null) {
            throw new IllegalStateException("No WaniKani integration found. Add your API key in Settings first.");
        }
        if (integration.getAuthToken() == null || integration.getAuthToken().isBlank()) {
            throw new IllegalStateException("WaniKani API key is not configured. Add it in Settings.");
        }
        return integration;
    }
}

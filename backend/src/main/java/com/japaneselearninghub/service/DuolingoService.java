package com.japaneselearninghub.service;

import com.japaneselearninghub.model.AppIntegration;
import com.japaneselearninghub.model.DuolingoProgress;
import com.japaneselearninghub.model.VocabularyItem;
import com.japaneselearninghub.repository.AppIntegrationRepository;
import com.japaneselearninghub.repository.DuolingoProgressRepository;
import com.japaneselearninghub.repository.VocabularyItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class DuolingoService {
    private final AppIntegrationRepository appIntegrationRepository;
    private final DuolingoProgressRepository duolingoProgressRepository;
    private final VocabularyItemRepository vocabularyItemRepository;
    private final RestTemplate restTemplate;

    public DuolingoService(
            AppIntegrationRepository appIntegrationRepository,
            DuolingoProgressRepository duolingoProgressRepository,
            VocabularyItemRepository vocabularyItemRepository,
            RestTemplate restTemplate) {
        this.appIntegrationRepository = appIntegrationRepository;
        this.duolingoProgressRepository = duolingoProgressRepository;
        this.vocabularyItemRepository = vocabularyItemRepository;
        this.restTemplate = restTemplate;
    }

    /**
     * Sync Duome lesson totals only for a user.
     */
    public DuolingoProgress syncDuomeData(Long userId) {
        AppIntegration integration = getIntegrationOrThrow(userId);

        boolean hasDuomeConfig = integration.getDuomeUsername() != null && !integration.getDuomeUsername().isBlank();
        if (!hasDuomeConfig) {
            throw new IllegalStateException("Missing Duome username. Add it in settings first.");
        }

        LessonsSnapshot lessonsSnapshot = fetchDuomeLessonsSnapshot(integration);
        if (lessonsSnapshot == null) {
            throw new RuntimeException("Could not fetch lessons from Duome. Check Duome username in settings and try again.");
        }

        DuolingoProgress progress = new DuolingoProgress(userId);
        progress.setTotalLessonsCompleted(lessonsSnapshot.completed);
        progress.setTotalLessonsAvailable(lessonsSnapshot.total);

        DuolingoProgress savedProgress = duolingoProgressRepository.save(progress);
        integration.setLastSyncedAt(System.currentTimeMillis());
        appIntegrationRepository.save(integration);
        return savedProgress;
    }

    /**
     * Get the latest Duolingo progress snapshot for a user
     */
    public DuolingoProgress getLatestProgress(Long userId) {
        return duolingoProgressRepository.findFirstByUserIdOrderBySnapshotTimeDesc(userId);
    }

    private AppIntegration getIntegrationOrThrow(Long userId) {
        AppIntegration integration = appIntegrationRepository.findByUserIdAndAppName(userId, "duolingo");
        if (integration == null) {
            throw new IllegalStateException("No Duolingo integration found for user " + userId);
        }
        return integration;
    }

    private LessonsSnapshot fetchDuomeLessonsSnapshot(AppIntegration integration) {
        if (integration.getDuomeUsername() == null || integration.getDuomeUsername().isBlank()) {
            return null;
        }

        try {
            String profileUrl = "https://duome.eu/" + integration.getDuomeUsername().trim();
            String html = restTemplate.getForObject(profileUrl, String.class);
            if (html == null || html.isBlank()) {
                return null;
            }

            Pattern lessonsPattern = Pattern.compile("<b>Lessons:</b>\\s*([0-9,]+)\\s*/\\s*([0-9,]+)", Pattern.CASE_INSENSITIVE);
            Matcher lessonsMatcher = lessonsPattern.matcher(html);
            if (!lessonsMatcher.find()) {
                return null;
            }

            String completedText = lessonsMatcher.group(1).replace(",", "").trim();
            String totalText = lessonsMatcher.group(2).replace(",", "").trim();

            int completed = Integer.parseInt(completedText);
            int total = Integer.parseInt(totalText);
            return new LessonsSnapshot(completed, total);
        } catch (Exception ignored) {
            return null;
        }
    }

    private static class LessonsSnapshot {
        private final int completed;
        private final int total;

        private LessonsSnapshot(int completed, int total) {
            this.completed = completed;
            this.total = total;
        }
    }
}

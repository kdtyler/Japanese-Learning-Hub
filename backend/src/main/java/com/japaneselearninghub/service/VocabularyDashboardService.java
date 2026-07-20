package com.japaneselearninghub.service;

import com.japaneselearninghub.model.VocabularyItem;
import com.japaneselearninghub.model.WaniKaniVocabularyItem;
import com.japaneselearninghub.repository.VocabularyItemRepository;
import com.japaneselearninghub.repository.WaniKaniVocabularyItemRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class VocabularyDashboardService {
    private final VocabularyItemRepository vocabularyItemRepository;
    private final WaniKaniVocabularyItemRepository waniKaniVocabularyItemRepository;

    public VocabularyDashboardService(
            VocabularyItemRepository vocabularyItemRepository,
            WaniKaniVocabularyItemRepository waniKaniVocabularyItemRepository) {
        this.vocabularyItemRepository = vocabularyItemRepository;
        this.waniKaniVocabularyItemRepository = waniKaniVocabularyItemRepository;
    }

    public Map<String, Object> getDashboard(Long userId) {
        List<VocabularyItem> duoItems = vocabularyItemRepository.findByUserIdOrderByLearnedAtDesc(userId);
        List<WaniKaniVocabularyItem> wkItems =
                waniKaniVocabularyItemRepository.findByUserIdOrderBySrsStageDescCharactersAsc(userId);

        // Build WaniKani lookup by normalized meaning (first occurrence wins)
        Map<String, WaniKaniVocabularyItem> wkByMeaning = new LinkedHashMap<>();
        for (WaniKaniVocabularyItem wk : wkItems) {
            String key = normalizeMeaning(wk.getMeaning());
            if (!key.isEmpty()) wkByMeaning.putIfAbsent(key, wk);
        }

        Set<String> matchedWkMeanings = new HashSet<>();
        Set<String> processedDuoMeanings = new HashSet<>();
        List<Map<String, Object>> vocabulary = new ArrayList<>();

        // Process Duolingo items
        for (VocabularyItem duo : duoItems) {
            String key = normalizeMeaning(duo.getMeaning());
            if (key.isEmpty() || processedDuoMeanings.contains(key)) continue;
            processedDuoMeanings.add(key);

            if (wkByMeaning.containsKey(key)) {
                WaniKaniVocabularyItem wk = wkByMeaning.get(key);
                matchedWkMeanings.add(key);
                String reading = buildReading(duo.getWord(), duo.getReading(), wk.getCharacters(), wk.getReading());
                vocabulary.add(entry(wk.getCharacters(), reading, wk.getMeaning(), "both"));
            } else {
                String reading = buildDuoReading(duo.getWord(), duo.getReading());
                vocabulary.add(entry(duo.getWord(), reading, duo.getMeaning(), "duolingo"));
            }
        }

        // Process unmatched WaniKani items
        Set<String> processedWkMeanings = new HashSet<>(matchedWkMeanings);
        for (WaniKaniVocabularyItem wk : wkItems) {
            String key = normalizeMeaning(wk.getMeaning());
            if (key.isEmpty() || processedWkMeanings.contains(key)) continue;
            processedWkMeanings.add(key);
            vocabulary.add(entry(wk.getCharacters(), wk.getReading(), wk.getMeaning(), "wanikani"));
        }

        // Sort: "both" first, then "wanikani", then "duolingo" — each group alphabetical by meaning
        vocabulary.sort((a, b) -> {
            int srcCmp = sourceOrder((String) a.get("source")) - sourceOrder((String) b.get("source"));
            if (srcCmp != 0) return srcCmp;
            return String.valueOf(a.get("meaning")).compareToIgnoreCase(String.valueOf(b.get("meaning")));
        });

        long both   = vocabulary.stream().filter(e -> "both".equals(e.get("source"))).count();
        long duoOnly = vocabulary.stream().filter(e -> "duolingo".equals(e.get("source"))).count();
        long wkOnly  = vocabulary.stream().filter(e -> "wanikani".equals(e.get("source"))).count();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalUnique", both + duoOnly + wkOnly);
        summary.put("both", both);
        summary.put("duolingoOnly", duoOnly);
        summary.put("waniKaniOnly", wkOnly);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("summary", summary);
        result.put("vocabulary", vocabulary);
        return result;
    }

    // Normalize for matching: lowercase, strip leading "to "
    private String normalizeMeaning(String meaning) {
        if (meaning == null) return "";
        String s = meaning.trim().toLowerCase();
        if (s.startsWith("to ")) s = s.substring(3);
        return s;
    }

    /**
     * Build reading column for a "both" entry.
     * Collects all unique Japanese representations beyond the primary (WaniKani characters).
     */
    private String buildReading(String duoWord, String duoReading, String wkChars, String wkReading) {
        LinkedHashSet<String> parts = new LinkedHashSet<>();
        // Add Duolingo word if different from WaniKani characters
        if (notBlank(duoWord) && !duoWord.trim().equals(nullSafe(wkChars))) {
            parts.add(duoWord.trim());
        }
        // Add Duolingo reading if set and not already present
        if (notBlank(duoReading) && !duoReading.trim().equals(nullSafe(wkChars))) {
            parts.add(duoReading.trim());
        }
        // Add WaniKani hiragana reading if not already present
        if (notBlank(wkReading) && !parts.contains(wkReading.trim())) {
            parts.add(wkReading.trim());
        }
        return parts.isEmpty() ? null : String.join(", ", parts);
    }

    /**
     * Build reading column for a "duolingo only" entry.
     * Shows the separate reading field if it exists and differs from the word itself.
     */
    private String buildDuoReading(String duoWord, String duoReading) {
        if (!notBlank(duoReading)) return null;
        if (duoReading.trim().equals(nullSafe(duoWord))) return null;
        return duoReading.trim();
    }

    private Map<String, Object> entry(String japanese, String reading, String meaning, String source) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("japanese", japanese);
        m.put("reading", reading);
        m.put("meaning", meaning);
        m.put("source", source);
        return m;
    }

    private int sourceOrder(String source) {
        if ("both".equals(source))     return 0;
        if ("wanikani".equals(source)) return 1;
        return 2; // duolingo
    }

    private boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private String nullSafe(String s) {
        return s == null ? "" : s.trim();
    }
}

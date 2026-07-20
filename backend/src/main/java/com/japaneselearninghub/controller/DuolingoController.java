package com.japaneselearninghub.controller;

import com.japaneselearninghub.model.DuolingoProgress;
import com.japaneselearninghub.model.VocabularyItem;
import com.japaneselearninghub.repository.DuolingoProgressRepository;
import com.japaneselearninghub.repository.VocabularyItemRepository;
import com.japaneselearninghub.service.DuolingoService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@RestController
@RequestMapping("/api/duolingo")
public class DuolingoController {
    private final DuolingoService duolingoService;
    private final DuolingoProgressRepository duolingoProgressRepository;
    private final VocabularyItemRepository vocabularyItemRepository;

    public DuolingoController(
            DuolingoService duolingoService,
            DuolingoProgressRepository duolingoProgressRepository,
            VocabularyItemRepository vocabularyItemRepository) {
        this.duolingoService = duolingoService;
        this.duolingoProgressRepository = duolingoProgressRepository;
        this.vocabularyItemRepository = vocabularyItemRepository;
    }

    /**
     * Sync Duome lesson totals only.
     */
    @PostMapping("/sync/duome/{userId}")
    public ResponseEntity<?> syncDuomeData(@PathVariable Long userId) {
        try {
            DuolingoProgress progress = duolingoService.syncDuomeData(userId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get latest Duolingo progress for a user
     */
    @GetMapping("/progress/{userId}")
    public ResponseEntity<DuolingoProgress> getProgress(@PathVariable Long userId) {
        DuolingoProgress progress = duolingoService.getLatestProgress(userId);
        if (progress == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(progress);
    }

    /**
     * Get Duolingo vocabulary for a user
     */
    @GetMapping("/vocabulary/{userId}")
    public ResponseEntity<DuolingoVocabularyResponse> getVocabulary(@PathVariable Long userId) {
        List<VocabularyItem> items = vocabularyItemRepository.findByUserIdAndSourceAppOrderByLearnedAtDesc(userId, "duolingo");
        long totalCount = vocabularyItemRepository.countByUserIdAndSourceApp(userId, "duolingo");
        
        DuolingoVocabularyResponse response = new DuolingoVocabularyResponse();
        response.setTotalVocabulary(totalCount);
        response.setVocabulary(items);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Import vocabulary words captured by a local browser-session collector.
     */
    @PostMapping("/import-vocabulary/{userId}")
    public ResponseEntity<?> importVocabulary(@PathVariable Long userId, @RequestBody VocabularyImportRequest request) {
        if (request == null || request.getWords() == null || request.getWords().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No words were provided for import."));
        }

        List<VocabularyItem> existing = vocabularyItemRepository.findByUserIdAndSourceAppOrderByLearnedAtDesc(userId, "duolingo");
        Set<String> existingWords = new HashSet<>();
        for (VocabularyItem item : existing) {
            if (item.getWord() != null) {
                existingWords.add(item.getWord());
            }
        }

        int imported = 0;
        for (VocabularyWordImport wordImport : request.getWords()) {
            if (wordImport == null || wordImport.getWord() == null || wordImport.getWord().isBlank()) {
                continue;
            }

            String word = wordImport.getWord().trim();
            if (existingWords.contains(word)) {
                continue;
            }

            VocabularyItem vocabItem = new VocabularyItem(userId, word, "duolingo");
            if (wordImport.getMeaning() != null && !wordImport.getMeaning().isBlank()) {
                vocabItem.setMeaning(wordImport.getMeaning().trim());
            }

            vocabularyItemRepository.save(vocabItem);
            existingWords.add(word);
            imported++;
        }

        return ResponseEntity.ok(Map.of(
                "received", request.getWords().size(),
                "imported", imported
        ));
    }

    /**
     * Clear all Duolingo vocabulary for a user (for re-import / clean slate).
     */
    @DeleteMapping("/vocabulary/{userId}")
    public ResponseEntity<?> clearVocabulary(@PathVariable Long userId) {
        List<VocabularyItem> items = vocabularyItemRepository.findByUserIdAndSourceAppOrderByLearnedAtDesc(userId, "duolingo");
        int count = items.size();
        vocabularyItemRepository.deleteAll(items);
        return ResponseEntity.ok(Map.of("deleted", count));
    }

    // DTO for vocabulary response
    public static class DuolingoVocabularyResponse {
        private long totalVocabulary;
        private List<VocabularyItem> vocabulary;

        public long getTotalVocabulary() { return totalVocabulary; }
        public void setTotalVocabulary(long totalVocabulary) { this.totalVocabulary = totalVocabulary; }

        public List<VocabularyItem> getVocabulary() { return vocabulary; }
        public void setVocabulary(List<VocabularyItem> vocabulary) { this.vocabulary = vocabulary; }
    }

    public static class VocabularyImportRequest {
        private List<VocabularyWordImport> words;

        public List<VocabularyWordImport> getWords() { return words; }
        public void setWords(List<VocabularyWordImport> words) { this.words = words; }
    }

    public static class VocabularyWordImport {
        private String word;
        private String meaning;

        public String getWord() { return word; }
        public void setWord(String word) { this.word = word; }

        public String getMeaning() { return meaning; }
        public void setMeaning(String meaning) { this.meaning = meaning; }
    }
}

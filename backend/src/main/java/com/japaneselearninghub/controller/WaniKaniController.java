package com.japaneselearninghub.controller;

import com.japaneselearninghub.model.WaniKaniProgress;
import com.japaneselearninghub.model.WaniKaniVocabularyItem;
import com.japaneselearninghub.service.WaniKaniService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wanikani")
public class WaniKaniController {
    private final WaniKaniService waniKaniService;

    public WaniKaniController(WaniKaniService waniKaniService) {
        this.waniKaniService = waniKaniService;
    }

    @PostMapping("/sync/{userId}")
    public ResponseEntity<?> syncProgress(@PathVariable Long userId) {
        try {
            WaniKaniProgress progress = waniKaniService.syncProgress(userId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/progress/{userId}")
    public ResponseEntity<WaniKaniProgress> getProgress(@PathVariable Long userId) {
        WaniKaniProgress progress = waniKaniService.getLatestProgress(userId);
        if (progress == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/vocabulary/{userId}")
    public ResponseEntity<Map<String, Object>> getVocabulary(@PathVariable Long userId) {
        List<WaniKaniVocabularyItem> vocabulary = waniKaniService.getVocabulary(userId);
        return ResponseEntity.ok(Map.of("vocabulary", vocabulary));
    }
}

package com.japaneselearninghub.controller;

import com.japaneselearninghub.service.VocabularyDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vocabulary")
public class VocabularyDashboardController {
    private final VocabularyDashboardService vocabularyDashboardService;

    public VocabularyDashboardController(VocabularyDashboardService vocabularyDashboardService) {
        this.vocabularyDashboardService = vocabularyDashboardService;
    }

    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<Map<String, Object>> getDashboard(@PathVariable Long userId) {
        return ResponseEntity.ok(vocabularyDashboardService.getDashboard(userId));
    }
}

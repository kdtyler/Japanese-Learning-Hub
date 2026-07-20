package com.japaneselearninghub.controller;

import com.japaneselearninghub.model.AppIntegration;
import com.japaneselearninghub.repository.AppIntegrationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/integrations")
public class IntegrationController {
    private final AppIntegrationRepository appIntegrationRepository;

    public IntegrationController(AppIntegrationRepository appIntegrationRepository) {
        this.appIntegrationRepository = appIntegrationRepository;
    }

    /**
     * Save or update a Duolingo auth token for a user
     */
    @PostMapping("/duolingo")
    public ResponseEntity<AppIntegration> saveDuolingoToken(
            @RequestParam Long userId,
            @RequestBody DuolingoTokenRequest request) {
        AppIntegration integration = appIntegrationRepository.findByUserIdAndAppName(userId, "duolingo");
        if (integration == null) {
            integration = new AppIntegration(userId, "duolingo", "");
        }
        integration.setDuomeUsername(request.getDuomeUsername());

        AppIntegration saved = appIntegrationRepository.save(integration);
        return ResponseEntity.ok(saved);
    }

    /**
     * Get Duolingo integration status for a user
     */
    @GetMapping("/duolingo/{userId}")
    public ResponseEntity<AppIntegration> getDuolingoIntegration(@PathVariable Long userId) {
        AppIntegration integration = appIntegrationRepository.findByUserIdAndAppName(userId, "duolingo");
        if (integration == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(integration);
    }

    /**
     * Delete Duolingo integration (revoke token)
     */
    @DeleteMapping("/duolingo/{userId}")
    public ResponseEntity<Void> deleteDuolingoIntegration(@PathVariable Long userId) {
        AppIntegration integration = appIntegrationRepository.findByUserIdAndAppName(userId, "duolingo");
        if (integration != null) {
            appIntegrationRepository.delete(integration);
        }
        return ResponseEntity.ok().build();
    }

    // DTO for receiving integration settings
    public static class DuolingoTokenRequest {
        private String duomeUsername;

        public String getDuomeUsername() { return duomeUsername; }
        public void setDuomeUsername(String duomeUsername) { this.duomeUsername = duomeUsername; }
    }

    /**
     * Save or update a WaniKani API key for a user
     */
    @PostMapping("/wanikani")
    public ResponseEntity<?> saveWaniKaniKey(
            @RequestParam Long userId,
            @RequestBody WaniKaniKeyRequest request) {
        if (request.getApiKey() == null || request.getApiKey().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "API key is required"));
        }
        AppIntegration integration = appIntegrationRepository.findByUserIdAndAppName(userId, "wanikani");
        if (integration == null) {
            integration = new AppIntegration(userId, "wanikani", request.getApiKey());
        } else {
            integration.setAuthToken(request.getApiKey());
        }
        return ResponseEntity.ok(appIntegrationRepository.save(integration));
    }

    /**
     * Get WaniKani integration status (does not expose the API key)
     */
    @GetMapping("/wanikani/{userId}")
    public ResponseEntity<Map<String, Object>> getWaniKaniIntegration(@PathVariable Long userId) {
        AppIntegration integration = appIntegrationRepository.findByUserIdAndAppName(userId, "wanikani");
        if (integration == null) {
            return ResponseEntity.notFound().build();
        }
        boolean configured = integration.getAuthToken() != null && !integration.getAuthToken().isBlank();
        return ResponseEntity.ok(Map.of(
            "configured", configured,
            "lastSyncedAt", integration.getLastSyncedAt() != null ? integration.getLastSyncedAt() : 0
        ));
    }

    public static class WaniKaniKeyRequest {
        private String apiKey;
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    }
}

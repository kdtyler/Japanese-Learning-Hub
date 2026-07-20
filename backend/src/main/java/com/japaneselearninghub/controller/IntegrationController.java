package com.japaneselearninghub.controller;

import com.japaneselearninghub.model.AppIntegration;
import com.japaneselearninghub.repository.AppIntegrationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}

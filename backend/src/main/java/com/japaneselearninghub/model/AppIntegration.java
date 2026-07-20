package com.japaneselearninghub.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_integrations")
public class AppIntegration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String appName; // "duolingo", "wanikani", etc.

    @Column(name = "auth_token", nullable = false)
    private String authToken; // The user's auth header or token

    @Column(name = "external_user_id")
    private String externalUserId; // Duolingo numeric user id from network request URL

    @Column(name = "learned_lexemes_url")
    private String learnedLexemesUrl; // Full learned-lexemes URL copied from browser dev tools

    @Column(name = "cookie_header", columnDefinition = "TEXT")
    private String cookieHeader; // Optional Cookie header copied from browser request

    @Column(name = "duome_username")
    private String duomeUsername; // Duome public username used to fetch lessons total

    @Column(name = "last_synced_at")
    private Long lastSyncedAt;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;

    public AppIntegration() {}

    public AppIntegration(Long userId, String appName, String authToken) {
        this.userId = userId;
        this.appName = appName;
        this.authToken = authToken;
        this.createdAt = System.currentTimeMillis();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getAppName() { return appName; }
    public void setAppName(String appName) { this.appName = appName; }

    public String getAuthToken() { return authToken; }
    public void setAuthToken(String authToken) { this.authToken = authToken; }

    public String getExternalUserId() { return externalUserId; }
    public void setExternalUserId(String externalUserId) { this.externalUserId = externalUserId; }

    public String getLearnedLexemesUrl() { return learnedLexemesUrl; }
    public void setLearnedLexemesUrl(String learnedLexemesUrl) { this.learnedLexemesUrl = learnedLexemesUrl; }

    public String getCookieHeader() { return cookieHeader; }
    public void setCookieHeader(String cookieHeader) { this.cookieHeader = cookieHeader; }

    public String getDuomeUsername() { return duomeUsername; }
    public void setDuomeUsername(String duomeUsername) { this.duomeUsername = duomeUsername; }

    public Long getLastSyncedAt() { return lastSyncedAt; }
    public void setLastSyncedAt(Long lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }
}

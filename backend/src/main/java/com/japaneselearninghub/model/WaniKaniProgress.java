package com.japaneselearninghub.model;

import jakarta.persistence.*;

@Entity
@Table(name = "wanikani_progress")
public class WaniKaniProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String username;

    private Integer level;

    @Column(name = "started_at")
    private Long startedAt;

    @Column(name = "lessons_available")
    private Integer lessonsAvailable;

    @Column(name = "reviews_available")
    private Integer reviewsAvailable;

    @Column(name = "next_reviews_at")
    private Long nextReviewsAt;

    @Column(name = "apprentice_count")
    private Integer apprenticeCount;

    @Column(name = "guru_count")
    private Integer guruCount;

    @Column(name = "master_count")
    private Integer masterCount;

    @Column(name = "enlightened_count")
    private Integer enlightenedCount;

    @Column(name = "burned_count")
    private Integer burnedCount;

    @Column(name = "items_started")
    private Integer itemsStarted;

    @Column(name = "radicals_completed")
    private Integer radicalsCompleted;

    @Column(name = "kanji_completed")
    private Integer kanjiCompleted;

    @Column(name = "vocab_completed")
    private Integer vocabCompleted;

    @Column(name = "level_progressions_json", columnDefinition = "TEXT")
    private String levelProgressionsJson;

    @Column(name = "snapshot_time", nullable = false)
    private Long snapshotTime;

    public WaniKaniProgress() {}

    public WaniKaniProgress(Long userId) {
        this.userId = userId;
        this.snapshotTime = System.currentTimeMillis();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public Long getStartedAt() { return startedAt; }
    public void setStartedAt(Long startedAt) { this.startedAt = startedAt; }

    public Integer getLessonsAvailable() { return lessonsAvailable; }
    public void setLessonsAvailable(Integer lessonsAvailable) { this.lessonsAvailable = lessonsAvailable; }

    public Integer getReviewsAvailable() { return reviewsAvailable; }
    public void setReviewsAvailable(Integer reviewsAvailable) { this.reviewsAvailable = reviewsAvailable; }

    public Long getNextReviewsAt() { return nextReviewsAt; }
    public void setNextReviewsAt(Long nextReviewsAt) { this.nextReviewsAt = nextReviewsAt; }

    public Integer getApprenticeCount() { return apprenticeCount; }
    public void setApprenticeCount(Integer apprenticeCount) { this.apprenticeCount = apprenticeCount; }

    public Integer getGuruCount() { return guruCount; }
    public void setGuruCount(Integer guruCount) { this.guruCount = guruCount; }

    public Integer getMasterCount() { return masterCount; }
    public void setMasterCount(Integer masterCount) { this.masterCount = masterCount; }

    public Integer getEnlightenedCount() { return enlightenedCount; }
    public void setEnlightenedCount(Integer enlightenedCount) { this.enlightenedCount = enlightenedCount; }

    public Integer getBurnedCount() { return burnedCount; }
    public void setBurnedCount(Integer burnedCount) { this.burnedCount = burnedCount; }

    public Integer getItemsStarted() { return itemsStarted; }
    public void setItemsStarted(Integer itemsStarted) { this.itemsStarted = itemsStarted; }

    public Integer getRadicalsCompleted() { return radicalsCompleted; }
    public void setRadicalsCompleted(Integer radicalsCompleted) { this.radicalsCompleted = radicalsCompleted; }

    public Integer getKanjiCompleted() { return kanjiCompleted; }
    public void setKanjiCompleted(Integer kanjiCompleted) { this.kanjiCompleted = kanjiCompleted; }

    public Integer getVocabCompleted() { return vocabCompleted; }
    public void setVocabCompleted(Integer vocabCompleted) { this.vocabCompleted = vocabCompleted; }

    public String getLevelProgressionsJson() { return levelProgressionsJson; }
    public void setLevelProgressionsJson(String levelProgressionsJson) { this.levelProgressionsJson = levelProgressionsJson; }

    public Long getSnapshotTime() { return snapshotTime; }
    public void setSnapshotTime(Long snapshotTime) { this.snapshotTime = snapshotTime; }
}

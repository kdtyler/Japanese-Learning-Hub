package com.japaneselearninghub.model;

import jakarta.persistence.*;

@Entity
@Table(name = "duolingo_progress")
public class DuolingoProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(name = "total_lessons_completed")
    private Integer totalLessonsCompleted;

    @Column(name = "total_lessons_available")
    private Integer totalLessonsAvailable;

    @Column(name = "total_xp")
    private Integer totalXp;

    @Column(name = "current_streak")
    private Integer currentStreak;

    @Column(name = "total_vocabulary_learned")
    private Integer totalVocabularyLearned;

    @Column(name = "daily_goal")
    private Integer dailyGoal;

    @Column(name = "snapshot_time", nullable = false)
    private Long snapshotTime;

    @Column(columnDefinition = "TEXT")
    private String rawJsonData; // Store the full JSON response for future use

    public DuolingoProgress() {}

    public DuolingoProgress(Long userId) {
        this.userId = userId;
        this.snapshotTime = System.currentTimeMillis();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getTotalLessonsCompleted() { return totalLessonsCompleted; }
    public void setTotalLessonsCompleted(Integer totalLessonsCompleted) { this.totalLessonsCompleted = totalLessonsCompleted; }

    public Integer getTotalLessonsAvailable() { return totalLessonsAvailable; }
    public void setTotalLessonsAvailable(Integer totalLessonsAvailable) { this.totalLessonsAvailable = totalLessonsAvailable; }

    public Integer getTotalXp() { return totalXp; }
    public void setTotalXp(Integer totalXp) { this.totalXp = totalXp; }

    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

    public Integer getTotalVocabularyLearned() { return totalVocabularyLearned; }
    public void setTotalVocabularyLearned(Integer totalVocabularyLearned) { this.totalVocabularyLearned = totalVocabularyLearned; }

    public Integer getDailyGoal() { return dailyGoal; }
    public void setDailyGoal(Integer dailyGoal) { this.dailyGoal = dailyGoal; }

    public Long getSnapshotTime() { return snapshotTime; }
    public void setSnapshotTime(Long snapshotTime) { this.snapshotTime = snapshotTime; }

    public String getRawJsonData() { return rawJsonData; }
    public void setRawJsonData(String rawJsonData) { this.rawJsonData = rawJsonData; }
}

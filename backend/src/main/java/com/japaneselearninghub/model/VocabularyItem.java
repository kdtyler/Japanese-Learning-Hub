package com.japaneselearninghub.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "vocabulary_items")
public class VocabularyItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String word;

    @Column
    private String reading; // For Japanese: hiragana/kanji reading

    @Column(columnDefinition = "TEXT")
    private String meaning;

    @Column
    private String sourceApp; // "duolingo", "wanikani", etc.

    @Column(name = "learned_at")
    private Long learnedAt;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;

    public VocabularyItem() {}

    public VocabularyItem(Long userId, String word, String sourceApp) {
        this.userId = userId;
        this.word = word;
        this.sourceApp = sourceApp;
        this.learnedAt = System.currentTimeMillis();
        this.createdAt = System.currentTimeMillis();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getWord() { return word; }
    public void setWord(String word) { this.word = word; }

    public String getReading() { return reading; }
    public void setReading(String reading) { this.reading = reading; }

    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }

    public String getSourceApp() { return sourceApp; }
    public void setSourceApp(String sourceApp) { this.sourceApp = sourceApp; }

    public Long getLearnedAt() { return learnedAt; }
    public void setLearnedAt(Long learnedAt) { this.learnedAt = learnedAt; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }
}

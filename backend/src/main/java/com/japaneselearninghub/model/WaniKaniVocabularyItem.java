package com.japaneselearninghub.model;

import jakarta.persistence.*;

@Entity
@Table(name = "wanikani_vocabulary_items")
public class WaniKaniVocabularyItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(nullable = false)
    private String characters;

    private String reading;

    private String meaning;

    @Column(name = "subject_type")
    private String subjectType;

    @Column(name = "srs_stage")
    private Integer srsStage;

    public WaniKaniVocabularyItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getCharacters() { return characters; }
    public void setCharacters(String characters) { this.characters = characters; }

    public String getReading() { return reading; }
    public void setReading(String reading) { this.reading = reading; }

    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }

    public String getSubjectType() { return subjectType; }
    public void setSubjectType(String subjectType) { this.subjectType = subjectType; }

    public Integer getSrsStage() { return srsStage; }
    public void setSrsStage(Integer srsStage) { this.srsStage = srsStage; }
}

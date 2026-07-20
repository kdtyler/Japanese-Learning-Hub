package com.japaneselearninghub.repository;

import com.japaneselearninghub.model.WaniKaniVocabularyItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaniKaniVocabularyItemRepository extends JpaRepository<WaniKaniVocabularyItem, Long> {
    List<WaniKaniVocabularyItem> findByUserIdOrderBySrsStageDescCharactersAsc(Long userId);
    void deleteByUserId(Long userId);
}

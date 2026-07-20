package com.japaneselearninghub.repository;

import com.japaneselearninghub.model.VocabularyItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VocabularyItemRepository extends JpaRepository<VocabularyItem, Long> {
    List<VocabularyItem> findByUserIdOrderByLearnedAtDesc(Long userId);
    List<VocabularyItem> findByUserIdAndSourceAppOrderByLearnedAtDesc(Long userId, String sourceApp);
    long countByUserIdAndSourceApp(Long userId, String sourceApp);
}

package com.japaneselearninghub.repository;

import com.japaneselearninghub.model.WaniKaniProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WaniKaniProgressRepository extends JpaRepository<WaniKaniProgress, Long> {
    WaniKaniProgress findFirstByUserIdOrderBySnapshotTimeDesc(Long userId);
}

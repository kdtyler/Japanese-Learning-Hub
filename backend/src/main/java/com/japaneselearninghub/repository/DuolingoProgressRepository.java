package com.japaneselearninghub.repository;

import com.japaneselearninghub.model.DuolingoProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DuolingoProgressRepository extends JpaRepository<DuolingoProgress, Long> {
    List<DuolingoProgress> findByUserIdOrderBySnapshotTimeDesc(Long userId);
    DuolingoProgress findFirstByUserIdOrderBySnapshotTimeDesc(Long userId);
    List<DuolingoProgress> findTop2ByUserIdOrderBySnapshotTimeDesc(Long userId);
}

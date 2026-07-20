package com.japaneselearninghub.repository;

import com.japaneselearninghub.model.AppIntegration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppIntegrationRepository extends JpaRepository<AppIntegration, Long> {
    AppIntegration findByUserIdAndAppName(Long userId, String appName);
}

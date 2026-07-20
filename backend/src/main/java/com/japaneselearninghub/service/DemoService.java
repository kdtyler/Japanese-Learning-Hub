package com.japaneselearninghub.service;

import org.springframework.stereotype.Service;

@Service
public class DemoService {
    public String getStatus() {
        return "Japanese Learning Hub backend is running.";
    }
}

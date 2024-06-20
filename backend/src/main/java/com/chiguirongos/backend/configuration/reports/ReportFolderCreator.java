package com.chiguirongos.backend.configuration.reports;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class ReportFolderCreator {
    
    @Value("${reports.tmp.path}")
    private String reportsPath;

    @PostConstruct
    public void init() {
        if (Files.exists(Path.of(reportsPath), LinkOption.NOFOLLOW_LINKS))
            return;

        new File(reportsPath).mkdir();
    }
}

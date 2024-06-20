package com.chiguirongos.backend.scheduled;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.nio.file.attribute.FileTime;
import java.time.LocalDate;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Scheduled task that deletes temporal report files from
 * the system file path.
 */
@Configuration
@EnableScheduling
public class OldReportFilesCleaner {

    @Value("${reports.tmp.path}")
    private String reportsPath;

    /**
     * Function that runs every 24 hours and cleans all the 1 day old 
     * report files from the system file path.
     */
    @Scheduled(fixedDelay = 1, timeUnit = TimeUnit.DAYS)
    public void cleanOldReports() {
        File root = new File(reportsPath);
        File[] reports = root.listFiles();

        if (reports == null)
            return;
        
        for (File report : reports) {
            try {
                BasicFileAttributes attr = Files.readAttributes(
                        report.toPath(),
                        BasicFileAttributes.class,
                        LinkOption.NOFOLLOW_LINKS);

                FileTime time = attr.creationTime();
                if (LocalDate.now().toEpochDay() < time.to(TimeUnit.DAYS) + 1)
                    continue;

                report.delete();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}

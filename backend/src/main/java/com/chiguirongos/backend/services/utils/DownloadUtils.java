package com.chiguirongos.backend.services.utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.chiguirongos.backend.exceptions.runtime.UnsupportedFileTypeException;
import com.chiguirongos.backend.services.reports.ReportFileTypeEnum;

/**
 * Class containing utilities to download resources from
 * the backend.
 */
public class DownloadUtils {

    /**
     * Generates a ResponseEntity with a resource to download
     * 
     * @param filePath Path of the resource to download
     * @param type     Type of file to download (CSV or PDF)
     * @param name     Target name of the downloaded file
     * @return ResponseEntity containing the resource to download
     */
    public static ResponseEntity<Resource> download(String filePath, ReportFileTypeEnum type, String name) {
        try {
            File report = new File(filePath);
            ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(report.toPath()));
            MediaType mimeType;

            switch (type) {
                case PDF:
                    mimeType = MediaType.APPLICATION_PDF;
                    break;
                case CSV:
                    mimeType = new MediaType("text", "csv");
                    break;
                default:
                    throw new UnsupportedFileTypeException();
            }

            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + name + "\"");
            responseHeaders.set(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Disposition");

            return ResponseEntity.ok()
                    .headers(responseHeaders)
                    .contentLength(report.length())
                    .contentType(mimeType)
                    .body(resource);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}

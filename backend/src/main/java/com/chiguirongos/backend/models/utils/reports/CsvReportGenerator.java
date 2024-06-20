package com.chiguirongos.backend.models.utils.reports;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.file.Paths;

public class CsvReportGenerator implements ReportGenerator {

    private File csvFile;
    private Writer writer;

    public CsvReportGenerator(String rootPath, String fileName) {
        csvFile = new File(Paths.get(rootPath, fileName).toString());
        try {
            csvFile.createNewFile();
            FileOutputStream fileOutputStream = new FileOutputStream(csvFile);
            OutputStreamWriter fileStreamWriter = new OutputStreamWriter(fileOutputStream);
            writer = new BufferedWriter(fileStreamWriter);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void writeRow(String[] row) {
        try {
            writer.write(String.join(",", row) + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void finish() {
        try {
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    };
}

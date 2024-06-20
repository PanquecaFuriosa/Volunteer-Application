package com.chiguirongos.backend.models.utils.reports;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.nio.file.Paths;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfDocument;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

public class PDFReportGenerator implements ReportGenerator {

    private PdfDocument pdf;
    private PdfPTable table;

    public PDFReportGenerator(String rootPath, String fileName) {
        pdf = new PdfDocument();
        pdf.setPageSize(PageSize.TABLOID.rotate());
        pdf.setMargins(2, 2, 2, 2);

        try {
            pdf.addWriter(PdfWriter.getInstance(pdf, new FileOutputStream(Paths.get(rootPath, fileName).toString())));
            pdf.open();
        } catch (FileNotFoundException | DocumentException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void writeRow(String[] row) {
        if (table == null) {
            table = new PdfPTable(row.length);
            addTableHeader(table, row);
            return;
        }

        addRows(table, row);
    }

    @Override
    public void finish() {
        try {
            pdf.add(table);
            pdf.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        pdf.close();
    }

    private void addTableHeader(PdfPTable table, String[] headers) {
        for (String columnTitle : headers) {
            PdfPCell header = new PdfPCell();
            header.setBackgroundColor(BaseColor.LIGHT_GRAY);
            header.setBorderWidth(2);
            header.setPhrase(new Phrase(columnTitle));
            table.addCell(header);
        }
    }

    private void addRows(PdfPTable table, String[] row) {
        for (String col : row)
            table.addCell(col);
    }
}

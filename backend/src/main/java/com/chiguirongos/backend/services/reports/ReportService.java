package com.chiguirongos.backend.services.reports;

import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.chiguirongos.backend.exceptions.runtime.InvalidReportTypeException;
import com.chiguirongos.backend.exceptions.runtime.UnsupportedFileTypeException;
import com.chiguirongos.backend.models.postulations.PostulationEntity;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.utils.WorkSessionStatusEnum;
import com.chiguirongos.backend.models.utils.reports.CsvReportGenerator;
import com.chiguirongos.backend.models.utils.reports.PDFReportGenerator;
import com.chiguirongos.backend.models.utils.reports.ReportGenerator;
import com.chiguirongos.backend.models.works.WorkEntity;
import com.chiguirongos.backend.models.works.WorkSessionEntity;
import com.chiguirongos.backend.repositories.PostulationRepository;
import com.chiguirongos.backend.repositories.WorkSessionRepository;

/**
 * Service containing all the functionalities to create
 * a system report containing different information
 */
@Service
public class ReportService {

    @Autowired
    private WorkSessionRepository workSessions;
    @Autowired
    private PostulationRepository postulations;
    @Value("${reports.tmp.path}")
    private String reportsPath;

    /**
     * Generates a report for a requesting user and a list of
     * target users
     * 
     * @param start       Start date of the report
     * @param end         End date of the report
     * @param fileType    File type of the report
     * @param reportType  Type of report
     * @param targetUsers Target users to get data for the report
     * @return Path of the report file
     */
    public String generateReport(
            LocalDate start,
            LocalDate end,
            ReportFileTypeEnum fileType,
            ReportTypeEnum reportType,
            List<String> targetUsers) {

        if (start.isAfter(end))
            throw new IllegalArgumentException("Report start date is after end date");

        String fileName = UUID.randomUUID().toString();
        ReportGenerator reportGenerator;
        switch (fileType) {
            case PDF:
                fileName += ".pdf";
                reportGenerator = new PDFReportGenerator(reportsPath, fileName);
                break;
            case CSV:
                fileName += ".csv";
                reportGenerator = new CsvReportGenerator(reportsPath, fileName);
                break;
            default:
                throw new UnsupportedFileTypeException();
        }

        switch (reportType) {
            case SUPPLIER_SESSIONS:
                generateSupplierSessionsReport(targetUsers, start, end, reportGenerator);
                break;
            case SUPPLIER_POSTULATIONS:
                generateSupplierPostulationsReport(targetUsers, start, end, reportGenerator);
                break;
            case ADMIN_SESSIONS:
                generateAdminSessionsReport(targetUsers, start, end, reportGenerator);
                break;
            case ADMIN_POSTULATIONS:
                generateAdminPostulationsReport(targetUsers, start, end, reportGenerator);
                break;
            case VOLUNTEER_SESSIONS:
                generateVolunteerSessionsReport(targetUsers, start, end, reportGenerator);
                break;
            default:
                throw new InvalidReportTypeException();
        }

        return Paths.get(reportsPath, fileName).toString();
    }

    /**
     * Create a file containing all sessions related to the supplier between two
     * dates
     * 
     * @param targetUsers     The suppliers to get all the sessions from
     * @param start           The start date of search
     * @param end             The end date of search
     * @param reportGenerator The object to generate the report
     */
    private void generateSupplierSessionsReport(List<String> targetUsers, LocalDate start, LocalDate end,
            ReportGenerator reportGenerator) {

        Set<WorkSessionEntity> allSessions = workSessions
                .findSupplierWorkSessionBetweenDatesOrderByDateAndTime(
                        targetUsers,
                        start,
                        end);

        reportGenerator.writeRow(ReportColumns.SESSION_REPORT_COLUMNS);
        for (WorkSessionEntity workSessionEntity : allSessions)
            reportGenerator.writeRow(sessionToRowArray(workSessionEntity, false));

        reportGenerator.finish();
    }

    /**
     * Create a file containing all postulation related to the supplier between two
     * dates
     * 
     * @param targetUsers     The suppliers to get all the postulations from
     * @param start           The start date of search
     * @param end             The end date of search
     * @param reportGenerator The object to generate the report
     */
    private void generateSupplierPostulationsReport(List<String> targetUsers, LocalDate start, LocalDate end,
            ReportGenerator reportGenerator) {

        Set<PostulationEntity> allPostulations = postulations
                .findSupplierWorkPostulationsBetweenDatesOrderByWorkNameAndPostulationDate(
                        targetUsers,
                        start,
                        end);

        reportGenerator.writeRow(ReportColumns.POSTULATION_REPORT_COLUMNS);
        for (PostulationEntity postulation : allPostulations)
            reportGenerator.writeRow(postulationToRowArray(postulation, false));

        reportGenerator.finish();
    }

    /**
     * Create a file containing all sessions related to the supplier between two
     * dates
     * 
     * @param targetUsers     The suppliers to get all the sessions from
     * @param start           The start date of search
     * @param end             The end date of search
     * @param reportGenerator The object to generate the report
     */
    private void generateAdminSessionsReport(List<String> targetUsers, LocalDate start, LocalDate end,
            ReportGenerator reportGenerator) {

        Set<WorkSessionEntity> allSessions = workSessions
                .findSupplierWorkSessionBetweenDatesOrderByDateAndTime(
                        targetUsers,
                        start,
                        end);

        String[] columns = Stream.concat(Arrays.stream(new String[] { "Supplier name", "Supplier username" }),
                Arrays.stream(ReportColumns.SESSION_REPORT_COLUMNS)).toArray(String[]::new);

        reportGenerator.writeRow(columns);
        for (WorkSessionEntity workSessionEntity : allSessions)
            reportGenerator.writeRow(sessionToRowArray(workSessionEntity, true));

        reportGenerator.finish();
    }

    /**
     * Create a file containing all postulation related to the suppliers between two
     * dates
     * 
     * @param targetUsers     The suppliers to get all the postulations from
     * @param start           The start date of search
     * @param end             The end date of search
     * @param reportGenerator The object to generate the report
     */
    private void generateAdminPostulationsReport(List<String> targetUsers, LocalDate start, LocalDate end,
            ReportGenerator reportGenerator) {

        Set<PostulationEntity> allPostulations = postulations
                .findSupplierWorkPostulationsBetweenDatesOrderByWorkNameAndPostulationDate(
                        targetUsers,
                        start,
                        end);

        String[] columns = Stream.concat(Arrays.stream(new String[] { "Supplier name", "Supplier username" }),
                Arrays.stream(ReportColumns.POSTULATION_REPORT_COLUMNS)).toArray(String[]::new);

        reportGenerator.writeRow(columns);
        for (PostulationEntity postulation : allPostulations) {
            reportGenerator.writeRow(postulationToRowArray(postulation, true));
        }

        reportGenerator.finish();
    }

    /**
     * Create a file containing all sessions related to the volunteer between two
     * dates
     * 
     * @param targetUsers     The volunteers to get all the sessions from
     * @param start           The start date of search
     * @param end             The end date of search
     * @param reportGenerator The object to generate the report
     */
    private void generateVolunteerSessionsReport(List<String> targetUsers, LocalDate start, LocalDate end,
            ReportGenerator reportGenerator) {

        Set<WorkSessionEntity> allSessions = workSessions
                .findVolunteerWorkSessionsBetweenDatesOrderByDateAndTime(
                        targetUsers,
                        start,
                        end);

        reportGenerator.writeRow(ReportColumns.SESSION_REPORT_COLUMNS);
        for (WorkSessionEntity workSessionEntity : allSessions)
            reportGenerator.writeRow(sessionToRowArray(workSessionEntity, false));

        reportGenerator.finish();
    }

    /**
     * Converts a session set to a list of string arrays using its data. Every
     * string array has the following data:
     * Work name, Work type, volunteer's username, volunteer's name, volunteer's
     * institutional ID, session date, session time and session status
     * 
     * @param sessions The session set to convert
     * @param showUser A boolean to indicate that the report needs to show the user
     * @return A list of string arrays with the sessions' data
     */
    private String[] sessionToRowArray(WorkSessionEntity session, Boolean showUser) {
        WorkEntity work = session.getWorkInst().getWorkId();
        UserEntity volunteer = session.getWorkInst().getVolunteerId();
        String institutionalId = volunteer.getInstitutionalID();
        String[] row = new String[] {
                work.getName(),
                work.getType(),
                volunteer.getUserName(),
                volunteer.getName(),
                institutionalId == null ? "UNDEFINED" : institutionalId,
                session.getSessionDate().toString(),
                session.getSessionTime().format(DateTimeFormatter.ofPattern("hh:mm:ss a")),
                session.getStatus().equals(WorkSessionStatusEnum.ACCEPTED) ? "1" : "0" };

        if (showUser) {
            row = Stream.concat(
                    Arrays.stream(new String[] { work.getSupplierId().getName(), work.getSupplierId().getUserName() }),
                    Arrays.stream(row)).toArray(String[]::new);
        }

        return row;

    }

    /**
     * Converts a postulation set to a list of string arrays using its data. Every
     * string array has the following data:
     * Work name, Work type, volunteer's username, volunteer's name, volunteer's
     * institutional ID, postulation date and postulation status
     * 
     * @param sessions The session set to convert
     * @param showUser A boolean to indicate that the report needs to show the user
     * @return A list of string arrays with the sessions' data
     */
    private String[] postulationToRowArray(PostulationEntity postulation, Boolean showUser) {
        WorkEntity work = postulation.getWork();
        UserEntity volunteer = postulation.getVolunteer();
        String institutionalId = volunteer.getInstitutionalID();
        String[] row = new String[] {
                work.getName(),
                work.getType(),
                volunteer.getUserName(),
                volunteer.getName(),
                institutionalId == null ? "UNDEFINED" : institutionalId,
                postulation.getPostulationDate().toString(),
                postulation.getStatus().toString() };

        if (showUser) {
            row = Stream.concat(
                    Arrays.stream(new String[] { work.getSupplierId().getName(), work.getSupplierId().getUserName() }),
                    Arrays.stream(row)).toArray(String[]::new);
        }

        return row;

    }
}

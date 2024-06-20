package com.chiguirongos.backend.controllers.api.report;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.configuration.security.JWT.JWTSecurityUtils;
import com.chiguirongos.backend.dtos.requestsDTO.AdminReportDTO;
import com.chiguirongos.backend.exceptions.runtime.InvalidReportTypeException;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.utils.ModelsConstants;
import com.chiguirongos.backend.services.AuthorizationService;
import com.chiguirongos.backend.services.reports.ReportFileTypeEnum;
import com.chiguirongos.backend.services.reports.ReportService;
import com.chiguirongos.backend.services.reports.ReportTypeEnum;
import com.chiguirongos.backend.services.utils.DownloadUtils;

/**
 * Controller that contains all the endpoints to generate user's reports
 */
@RestController
public class ReportController {

    @Autowired
    private ReportService reportService;
    @Autowired
    private AuthorizationService authService;

    /**
     * Endpoint for generating a supplier user report
     * 
     * @param authCookie JWT Authorization cookie
     * @param start      Start date of the report
     * @param end        End date of the report
     * @param fileType   File type of the report
     * @param reportType Type of report
     * @return Resource containing the report generated
     */
    @GetMapping("/api/supplier/generate-report")
    public ResponseEntity<Resource> generateSupplierReports(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam LocalDate start,
            @RequestParam LocalDate end,
            @RequestParam ReportFileTypeEnum fileType,
            @RequestParam ReportTypeEnum reportType) {

        if (!isAuthorized(ModelsConstants.SUPPLIER_ROLE, reportType))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity requestingUser = authService.retrieveUser(username);

        String reportPath = reportService.generateReport(
                start,
                end,
                fileType,
                reportType,
                List.of(requestingUser.getUserName()));

        if (reportPath == null || reportPath == "")
            return ResponseEntity.badRequest().build();

        return DownloadUtils.download(reportPath, fileType,
                "Report." + fileType.getValue().toLowerCase());
    }

    /**
     * Endpoint for generating a volunteer user report
     * 
     * @param authCookie JWT Authorization cookie
     * @param start      Start date of the report
     * @param end        End date of the report
     * @param fileType   File type of the report
     * @param reportType Type of report
     * @return Resource containing the report generated
     */
    @GetMapping("/api/user/generate-report")
    public ResponseEntity<Resource> generateVolunteerReports(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam LocalDate start,
            @RequestParam LocalDate end,
            @RequestParam ReportFileTypeEnum fileType,
            @RequestParam ReportTypeEnum reportType) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity requestingUser = authService.retrieveUser(username);

        if (!isAuthorized(ModelsConstants.VOLUNTEER_ROLE, reportType))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String reportPath = reportService.generateReport(
                start,
                end,
                fileType,
                reportType,
                List.of(requestingUser.getUserName()));

        if (reportPath == null || reportPath == "")
            return ResponseEntity.badRequest().build();

        return DownloadUtils.download(reportPath, fileType,
                "Report." + fileType.getValue().toLowerCase());
    }

    /**
     * Endpoint for generating am admin user report
     * 
     * @param authCookie JWT Authorization cookie
     * @param details    DTO containing all the report details. Including:
     *                   file type, type of report, start date, end date and target
     *                   users
     * @return Resource containing the report generated
     */
    @PostMapping("/admin/generate-report")
    public ResponseEntity<Resource> generateAdminReports(
            @CookieValue(name = SecurityConstants.ADMIN_COOKIE_NAME) String adminCookie,
            @RequestBody AdminReportDTO details) {

        if (!isAuthorized(ModelsConstants.ADMIN_ROLE, details.getReportType()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String reportPath = reportService.generateReport(
                details.getStart(),
                details.getEnd(),
                details.getFileType(),
                details.getReportType(),
                details.getTargetUsers());

        if (reportPath == null || reportPath == "")
            return ResponseEntity.badRequest().build();

        return DownloadUtils.download(reportPath, details.getFileType(),
                "report_" + LocalDate.now().toString() + details.getFileType().getValue().toLowerCase());
    }

    /**
     * Checks if a role is authorized to generate a specific report type
     * 
     * @param role   Role to check authorization
     * @param report Report type to generate
     * @return True if the role is authorized to generate that report type/False
     *         otherwise
     */
    private boolean isAuthorized(String role, ReportTypeEnum report) {
        switch (report) {
            case SUPPLIER_POSTULATIONS:
            case SUPPLIER_SESSIONS:
                return role.equals(ModelsConstants.SUPPLIER_ROLE);
            case ADMIN_POSTULATIONS:
            case ADMIN_SESSIONS:
                return role.equals(ModelsConstants.ADMIN_ROLE);
            case VOLUNTEER_SESSIONS:
                return role.equals(ModelsConstants.VOLUNTEER_ROLE);
            default:
                throw new InvalidReportTypeException();
        }
    }
}

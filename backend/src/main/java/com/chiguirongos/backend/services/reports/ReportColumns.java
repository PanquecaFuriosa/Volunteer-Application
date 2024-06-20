package com.chiguirongos.backend.services.reports;

/**
 * Class containing the columns calculated when generating
 * a report type
 */
public class ReportColumns {

    public static final String[] SESSION_REPORT_COLUMNS = new String[] { 
                                                                "Work name", 
                                                                "Work type", 
                                                                "Username", 
                                                                "Full name", 
                                                                "Institutional ID",
                                                                "Date",
                                                                "Hour", 
                                                                "Assisted" };
                                                                
    public static final String[] POSTULATION_REPORT_COLUMNS = new String[] { 
                                                                "Work name", 
                                                                "Work type", 
                                                                "Username", 
                                                                "Full name", 
                                                                "Institutional ID",
                                                                "Postulation date",
                                                                "Status" };
}

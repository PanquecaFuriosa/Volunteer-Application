import { useEffect, useState } from "react";

import { Box, Grid, Typography, Button } from "@mui/material";
import dayjs from "dayjs";

import PageNavbar from "../../components/common/PageNavbar";
import MainCalendar from "../../components/calendar/MainCalendar";
import MiniCalendar from "../../components/calendar/MiniCalendar";
import SupplierWorkDayMiniSlots from "../../components/calendar/custom-day-mini/SupplierWorkDayMiniSlots";
import FollowSessionModal from "./components/FollowSessionModal";
import ReportGeneratorModal from "../../components/common/ReportGeneratorModal";

import { UserLogoutButton } from "../../components/common/LogoutButtons";
import { DayOfWeeksString } from "../../utils/constants/DayOfTheWeeks";
import { StartHour, EndHour } from "../../utils/constants/StartEndHours";
import { ReportTypes } from "../../utils/constants/ReportTypes";
import ReportFormats from "../../utils/constants/ReportFormats";

import useAuth from "../../hooks/useAuth";

// alerts
import { useGlobalAlert } from "../../hooks/useGlobalAlert";

// Navigation
import { useLocation, useNavigate } from "react-router-dom";

// style
import "../../styles/Panel.css";
import {
    BigCalendarVolunteerLegend,
    MiniCalendarVolunteerLegend,
} from "../../components/PagesLegends";
import PageRoutes from "../../utils/constants/Routes";
import {
    getWorkSessions,
    getVolunteerReport,
} from "../../utils/fetchs/ApiFetchesVolunteer";
import VolunteerSessionCalendarBlock from "../../components/calendar/VolunteerSessionCalendarBlock";
import { AlertSeverity } from "../../context/AlertProvider";

/**
 * Starts the fetch of all the works of the supplier where month and year
 * are between the work start date and end date
 *
 * @param {*} month Month of the works to retrieve
 * @param {*} year Year of the works to retrieve
 * @param {*} popAlert Pop alerter
 * @param {*} setSessions Data setter after the works are retrieved
 */
const fetchMonthYearSessions = async (month, year, popAlert, setSessions) => {
    try {
        const rWorkSessions = await getWorkSessions(month, year);
        if (!rWorkSessions.ok) {
            const errorText = await rWorkSessions.text();
            popAlert(errorText, AlertSeverity.ERROR);
            return;
        }
        const volWorks = await rWorkSessions.json();
        setSessions(volWorks);
    } catch (e) {
        popAlert("A network error occurred.", AlertSeverity.ERROR);
        return;
    }
};

const fetchGenerateReport = async (
    start,
    end,
    fileType,
    reportType,
    popAlert
) => {
    try {
        const response = await getVolunteerReport(
            start,
            end,
            fileType,
            reportType
        );
        if (!response.ok) {
            const errorText = await response.text();
            popAlert(errorText, AlertSeverity.ERROR);
            return;
        }
        const filename = response.headers
            .get("Content-Disposition")
            .split("filename=")[1];
        response.blob().then((blob) => {
            // Creating new object of PDF file
            const fileURL = window.URL.createObjectURL(blob);
            // Setting various property values
            let alink = document.createElement("a");
            alink.href = fileURL;
            alink.download = filename.replaceAll('"', "");
            alink.click();
        });
    } catch (e) {
        popAlert("A network error occurred.", AlertSeverity.ERROR);
        return;
    }
};

/**
 * Creates a weekly table with the given sessions, where the table
 * contains the days of the week, which in turn contains the blocks
 * of hours, which in turn contain the session for that block
 *
 * @param {*} sessions list of sessions from which those corresponding to the week are selected
 * @param {*} day day indicating the date of the corresponding week
 * @returns A table with the corresponding session in each block
 */
const createSessionHashTable = (sessions, day) => {
    const hashTable = Array(DayOfWeeksString.length);

    /* fill the table with the days of the week */
    for (let i = 0; i < hashTable.length; i++) {
        hashTable[i] = Array(EndHour - StartHour);
    }

    /* the days are filled with the blocks of hours */
    for (let i = 0; i < hashTable.length; i++) {
        for (let j = 0; j < hashTable[i].length; j++) {
            hashTable[i][j] = undefined;
        }
    }

    const weekStart = day.startOf("week");
    const weekEnd = day.endOf("week");

    sessions.forEach((session) => {
        const sessionDate = dayjs(session.date, "DD-MM-YYYY");
        const weekDay = dayjs(session.date, "DD-MM-YYYY").day();

        if (sessionDate.isBetween(weekStart, weekEnd, "day", "[]")) {
            hashTable[weekDay][parseInt(session.time.slice(0, 2)) - StartHour] =
                session;
        }
    });

    return hashTable;
};

/**
 * Calculates a boolean array for all the days of the months
 * that indicates if a day has a work session in it.
 *
 * @param {*} sessions List of work sessions
 * @param {*} day Current day of the month
 * @returns Boolean array from 0 to the amount of days in the month.
 *          A value in the index i indicates that at least a work is
 *          available in that day.
 */
const calculateMonthSessionsDays = (sessions) => {
    const monthSessions = [].fill(false, 0);
    sessions.forEach((s) => {
        monthSessions[dayjs(s.date, "DD-MM-YYYY").date() - 1] = true;
    });

    return monthSessions;
};

const generateCalendarBlocks = (
    setHour,
    day,
    setDay,
    sessions,
    setSelectedSession,
    setShow
) => {
    const grids = [];
    for (let j = StartHour; j < EndHour; j++) {
        for (let i = 0; i < DayOfWeeksString.length; i++) {
            grids.push(
                <VolunteerSessionCalendarBlock
                    key={`${i}-${j}`}
                    type={"works"}
                    isBlockHour={true}
                    session={sessions[i][j - StartHour]}
                    hour={day.day(i).hour(j)}
                    setHour={setHour}
                    day={day.day(i)}
                    setDay={setDay}
                    setSelectedSession={setSelectedSession}
                    setShow={setShow}
                />
            );
        }
    }

    return grids;
};

/**
 * Create the page that shows the work sessions of the volunteer
 *
 * @returns The page that shows the work sessions of the volunteer
 */
const VolunteerFollowSessionsPage = () => {
    const [hour, setHour] = useState(dayjs()); // Date of the block selected
    const [day, setDay] = useState(dayjs()); // Date of the block selected
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(undefined); // Work in the block selected
    const [daysWithSessions, setDaysWithSessions] = useState([]); // Boolean array representing days with session works
    const [show, setShow] = useState(false);
    const [exporting, setExporting] = useState(false);

    const { auth } = useAuth();
    const { popAlert } = useGlobalAlert();

    const navigate = useNavigate();
    const location = useLocation();

    const year = day.year();
    const month = day.month();

    // Initial configuration of the time blocks and their works
    let sessionsHashTable = createSessionHashTable(sessions, day);
    let calendarBlocks = generateCalendarBlocks(
        setHour,
        day,
        setDay,
        sessionsHashTable,
        setSelectedSession,
        setShow
    );

    // Fetchs all works according to user preferences
    useEffect(() => {
        fetchMonthYearSessions(month + 1, year, popAlert, setSessions);
    }, [year, month]);

    /**
     * Calculates the days with works and set them up in a boolean array.
     * Required for mini calendar.
     */
    useEffect(() => {
        setDaysWithSessions(calculateMonthSessionsDays(sessions));
    }, [JSON.stringify(sessions)]);

    /**
     * Sets the mini calendar days array that have works available
     * @param {*} d
     */
    const handleDayChange = (d) => {
        if (!day.isSame(d, "month"))
            setDaysWithSessions(calculateMonthSessionsDays(sessions));
        setDay(d);
    };

    return (
        <>
            {show && selectedSession && (
                <FollowSessionModal
                    session={selectedSession}
                    showSession={show}
                    setShowSession={setShow}
                />
            )}
            {exporting && (
                <ReportGeneratorModal
                    options={{
                        formats: ReportFormats,
                        types: ReportTypes.VOLUNTEER,
                        open: exporting,
                        onClose: () => setExporting(false),
                        onExport: fetchGenerateReport,
                    }}
                />
            )}
            <Box className="box-content">
                <PageNavbar
                    barTitle={"Volunteer"}
                    buttons={[
                        {
                            text: "Main calendar",
                            onClick: () =>
                                navigate(PageRoutes.VOLUNTEER_PANEL, {
                                    state: { from: location },
                                    replace: true,
                                }),
                            endIcon: "bi bi-calendar-week",
                        },
                        {
                            text: "Postulations",
                            onClick: () =>
                                navigate(PageRoutes.VOLUNTEER_POSTULATIONS, {
                                    state: { from: location },
                                    replace: true,
                                }),
                            endIcon: "bi bi-puzzle-fill",
                        },
                    ]}
                    logout={<UserLogoutButton />}
                />
                <Box sx={{ p: 4 }}>
                    <Grid
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingRight: "1px",
                        }}
                    >
                        <Typography className="welcome-text" variant="h5">
                            {`Welcome, ${auth.username}!`}
                        </Typography>
                        <Button
                            className="options-button"
                            variant="contained"
                            onClick={() => setExporting(true)}
                            startIcon={
                                <i className="bi bi-file-earmark-spreadsheet"></i>
                            }
                        >
                            <Typography
                                variant="subtitle1"
                                className="text-options-button"
                            >
                                Export
                            </Typography>
                        </Button>
                    </Grid>
                    <Box className="date-content">
                        <MiniCalendar
                            day={day}
                            onDateChange={handleDayChange}
                            legend={MiniCalendarVolunteerLegend(true)}
                            slots={{ day: SupplierWorkDayMiniSlots }}
                            slotProps={{
                                day: {
                                    highlightedDays: daysWithSessions,
                                },
                            }}
                        />
                        <Grid className="container-works-calendar">
                            <MainCalendar
                                day={day}
                                content={calendarBlocks}
                                legend={BigCalendarVolunteerLegend(true)}
                                onDayChange={handleDayChange}
                            />
                        </Grid>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default VolunteerFollowSessionsPage;

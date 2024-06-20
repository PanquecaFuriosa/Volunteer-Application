import { useEffect, useRef, useState } from "react";

import { Box, Button, Grid, Typography } from "@mui/material";
import dayjs from "dayjs";

import SupplierCalendarBlock from "../../components/calendar/SupplierCalendarBlock";
import ItemWrapper from "../../components/common/ItemWrapperContainer";
import PageNavbar from "../../components/common/PageNavbar";
import ModalJob from "./CreateEditWorkModal";
import SupplierWorkList from "./SupplierWorkList";
import MainCalendar from "../../components/calendar/MainCalendar";
import MiniCalendar from "../../components/calendar/MiniCalendar";
import { UserLogoutButton } from "../../components/common/LogoutButtons";
import SupplierWorkDayMiniSlots from "../../components/calendar/custom-day-mini/SupplierWorkDayMiniSlots";
import { createHashTable } from "../../utils/CommonFunctionsPanels";
import ReportGeneratorModal from "../../components/common/ReportGeneratorModal";

import { DayOfWeeksString } from "../../utils/constants/DayOfTheWeeks";
import { StartHour, EndHour } from "../../utils/constants/StartEndHours";
import HTTPStatus from "../../utils/constants/HttpStatus";
import {
    getSupplierWorksByMonthYear,
    getSupplierReport,
} from "../../utils/fetchs/ApiFetchesSupplier";

// alerts
import useAuth from "../../hooks/useAuth";
import { useGlobalAlert } from "../../hooks/useGlobalAlert";

// style
import "../../styles/Panel.css";
import WorkTypes from "../../utils/constants/WorkTypes";
import { ReportTypes } from "../../utils/constants/ReportTypes";
import ReportFormats from "../../utils/constants/ReportFormats";
import {
    BigCalendarSupplierLegend,
    MiniCalendarSupplierLegend,
} from "../../components/PagesLegends";
import { AlertSeverity } from "../../context/AlertProvider";

/**
 * Starts the fetch of all the works of the supplier where month and year
 * are between the work start date and end date
 *
 * @param {*} month Month of the works to retrieve
 * @param {*} year Year of the works to retrieve
 * @param {*} popAlert Pop alerter.
 * @param {*} setData Data setter after the works are retrieved
 * @returns
 */
const fetchMonthYearWorks = async (month, year, popAlert, setData) => {
    try {
        const response = await getSupplierWorksByMonthYear(month, year);
        if (!response.ok) {
            if (response.status !== HTTPStatus.BAD_REQUEST) {
                popAlert("An error ocurred: " + response.statusText, "error");
                return;
            }
            popAlert("Error", "error");
            return;
        }
        const json = await response.json();
        setData(json);
    } catch (e) {
        popAlert("A network error occurred.", "error");
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
        const response = await getSupplierReport(
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
 * Calculates a two boolean arrays (from zero to the last day of the month)
 * for all the days of the months that indicates if a day has a work in it/has a
 * pending postulation.
 *
 * @param {*} works List of works available
 * @param {*} day Current day of the month
 * @returns Object containing the two array in the attributes:
 *          monthWorks (days with works)
 *          monthPosts (days with pending postulations)
 */
const calculateMonthWorkAndPostulationsDays = (works, day) => {
    const monthWorks = [].fill(false, 0);
    const monthPosts = [].fill(false, 0);
    works.forEach((w) => {
        const startDate = dayjs(w.startDate, "DD-MM-YYYY");
        const startSameMonth = startDate.isSame(day, "month");

        if (w.type === WorkTypes.SESSION) {
            if (!startSameMonth) return; // Not needed anymore

            monthPosts[startDate.date() - 1] =
                monthPosts[startDate.date() - 1] ||
                w.pendingPostulationsCount > 0;
            monthWorks[startDate.date() - 1] = true;
            return;
        }

        const monthStart = day.startOf("month");
        const monthEnd = day.endOf("month");
        const endDate = dayjs(w.endDate, "DD-MM-YYYY");

        if (
            endDate.isBefore(monthStart, "month") ||
            startDate.isAfter(monthEnd, "month")
        )
            return;

        const startDay = !startSameMonth ? 1 : startDate.date();

        const endDay = !endDate.isSame(day, "month")
            ? day.daysInMonth()
            : endDate.date();

        let curWeekDay = !startSameMonth
            ? day.startOf("month").day()
            : startDate.day();

        for (let pivot = startDay; pivot <= endDay; pivot++) {
            for (let wb = 0; wb < w.hours.length; ++wb) {
                if (w.hours[wb].weekDay !== curWeekDay) continue;

                monthPosts[pivot - 1] =
                    monthPosts[pivot - 1] || w.pendingPostulationsCount > 0;
                monthWorks[pivot - 1] = true;
                break;
            }
            // This line can go in the for, but I prefer it
            // here for readability
            curWeekDay = (curWeekDay + 1) % 7;
        }
    });

    return { monthWorks, monthPosts };
};

/**
 * Configure the weekly calendar time blocks with their corresponding works
 *
 * @param {*} day day indicating the date of the corresponding week
 * @param {*} works hash table with the works of the week
 * @param {*} setCreating function that will be passed to the blocks to configure the
 *            variable that indicates work creation
 * @param {*} setDataList function that will be passed to the blocks so that they configure the list
 *            of works shown with those of the corresponding block
 * @param {*} setDataModal function that will be passed to the blocks to set the time and date
 * @returns list of SupplierCalendarBlock elements with the blocks of weekly calendar
 *          hours that contain the corresponding works
 */
const generateCalendarBlocks = (
    day,
    works,
    setCreating,
    setDataList,
    setDataModal,
    dateHourRef
) => {
    const grids = [];
    let hourBlock = 0;
    for (let j = StartHour; j < EndHour; j++) {
        for (let i = 0; i < DayOfWeeksString.length; i++) {
            hourBlock = j < 10 ? `0${j}:00:00` : `${j}:00:00`;
            grids.push(
                <SupplierCalendarBlock
                    key={`${i}-${j}`}
                    type={"works"}
                    isBlockHour={true}
                    works={works[i][j - StartHour]}
                    hour={hourBlock}
                    date={day.day(i).format("DD-MM-YYYY")}
                    setCreating={setCreating}
                    setDataList={setDataList}
                    setDataModal={setDataModal}
                    dateHourRef={dateHourRef}
                />
            );
        }
    }

    return grids;
};

const SupplierPanel = () => {
    const [day, setDay] = useState(dayjs()); // Date of the block selected
    const [creating, setCreating] = useState(false); // Visualization of the work creation modal
    const [data, setData] = useState([]); // List of all works of the user
    const [dataList, setDataList] = useState([]); // List of works in the hour block selected
    const [dataModal, setDataModal] = useState([]); // Hour and Date of the block selected
    const [highlightedDays, setHighlightedDays] = useState({
        // Contains the highlighted days with works and postulations
        monthWorks: [],
        monthPosts: [],
    });
    const [exporting, setExporting] = useState(false);
    const blockDateHour = useRef(undefined);

    const { auth } = useAuth();
    const { popAlert } = useGlobalAlert();

    const year = day.year();
    const month = day.month();

    // Initial configuration of the time blocks and their works
    let worksHashTable = createHashTable(data, day);
    let calendarBlocks = generateCalendarBlocks(
        day,
        worksHashTable,
        setCreating,
        setDataList,
        setDataModal,
        blockDateHour
    );

    // Load all the supplier's works in the month/year
    useEffect(() => {
        fetchMonthYearWorks(month + 1, year, popAlert, setData);
    }, [year, month, day, setData]);

    // Change flags in minicalendar
    const handleDayChange = (d) => {
        if (!day.isSame(d, "month"))
            setHighlightedDays(calculateMonthWorkAndPostulationsDays(data, d));
        setDataList([]);
        setDay(d);
    };

    // Change flags in minicalendar
    useEffect(() => {
        setHighlightedDays(calculateMonthWorkAndPostulationsDays(data, day));
    }, [data, setHighlightedDays]);

    return (
        <>
            {creating && (
                <ModalJob
                    open={creating}
                    setOpen={setCreating}
                    create={true}
                    data={dataModal}
                />
            )}
            {exporting && (
                <ReportGeneratorModal
                    options={{
                        formats: ReportFormats,
                        types: ReportTypes.SUPPLIER,
                        open: exporting,
                        onClose: () => setExporting(false),
                        onExport: fetchGenerateReport,
                    }}
                />
            )}
            <Box className="box-content">
                <PageNavbar
                    barTitle={"Supplier"}
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
                            onClick={() => {
                                setDataModal(null);
                                setCreating(true);
                            }}
                            startIcon={<i className="bi bi-plus-circle "></i>}
                        >
                            <Typography
                                variant="subtitle1"
                                className="text-options-button"
                            >
                                Create work
                            </Typography>
                        </Button>
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
                            legend={MiniCalendarSupplierLegend()}
                            slots={{ day: SupplierWorkDayMiniSlots }}
                            slotProps={{
                                day: {
                                    highlightedDays: highlightedDays.monthWorks,
                                    postulationDays: highlightedDays.monthPosts,
                                },
                            }}
                        />
                        <Grid
                            className="container-works-calendar"
                            container
                            spacing={2}
                        >
                            <MainCalendar
                                day={day}
                                content={calendarBlocks}
                                legend={BigCalendarSupplierLegend()}
                                onDayChange={handleDayChange}
                            />
                            <Grid
                                item
                                xs={12}
                                md={4.5}
                                sx={{
                                    marginTop: "2.7rem",
                                }}
                            >
                                <ItemWrapper>
                                    <SupplierWorkList
                                        title={
                                            blockDateHour.current === undefined
                                                ? undefined
                                                : `Works at ${blockDateHour.current.dateBlock} - ${blockDateHour.current.hourBlock}`
                                        }
                                        data={dataList}
                                        dateAndHour={blockDateHour.current}
                                        onRefresh={async () =>
                                            fetchMonthYearWorks(
                                                month + 1,
                                                year,
                                                popAlert,
                                                setData
                                            )
                                        }
                                    />
                                </ItemWrapper>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default SupplierPanel;

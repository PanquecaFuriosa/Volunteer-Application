import { useEffect, useState } from "react";

import { Box, Grid, Typography } from "@mui/material";
import dayjs from "dayjs";

import MainCalendar from "../../components/calendar/MainCalendar";
import MiniCalendar from "../../components/calendar/MiniCalendar";
import VolunteerCalendarBlock from "../../components/calendar/VolunteerCalendarBlock";
import SupplierWorkDayMiniSlots from "../../components/calendar/custom-day-mini/SupplierWorkDayMiniSlots";
import ItemWrapper from "../../components/common/ItemWrapperContainer";
import PageNavbar from "../../components/common/PageNavbar";
import EditPreferencesModal from "./components/EditPreferencesModal";
import ProfileModal from "./components/ProfileModal";
import WorkList from "./components/WorkList";

import { UserLogoutButton } from "../../components/common/LogoutButtons";
import {
    calculateMonthWorkDays,
    createHashTable,
} from "../../utils/CommonFunctionsPanels";
import { DayOfWeeksString } from "../../utils/constants/DayOfTheWeeks";
import { EndHour, StartHour } from "../../utils/constants/StartEndHours";

import useAuth from "../../hooks/useAuth";
import HTTPStatus from "../../utils/constants/HttpStatus";
import {
    getDetailsUser,
    getVolunteerWorksByMonthYear,
} from "../../utils/fetchs/ApiFetchesVolunteer";

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
import { AlertSeverity } from "../../context/AlertProvider";

/**
 * Starts the fetch of all the works of the supplier where month and year
 * are between the work start date and end date
 *
 * @param {*} month Month of the works to retrieve
 * @param {*} year Year of the works to retrieve
 * @param {*} popAlert Pop alerter.
 * @param {*} setAllWorks Data setter after the works are retrieved
 */

const fetchMonthYearWorks = async (month, year, popAlert, setAllWorks) => {
    try {
        const rUserDetails = await getDetailsUser();
        if (!rUserDetails.ok) {
            const errorText = await rUserDetails.text();
            popAlert(errorText, AlertSeverity.ERROR);
            return;
        }

        const userDetails = await rUserDetails.json();
        const rVolWorks = await getVolunteerWorksByMonthYear(
            month,
            year,
            userDetails.hourBlocks
        );
        if (!rVolWorks.ok) {
            const errorText = await rVolWorks.text();
            popAlert(errorText, AlertSeverity.ERROR);
            return;
        }
        const volWorks = await rVolWorks.json();
        setAllWorks(volWorks);
    } catch (e) {
        popAlert("A network error occurred.", AlertSeverity.ERROR);
        return;
    }
};

/**
 * Configure the weekly calendar time blocks with their corresponding works
 *
 * @param {*} setHour function that will be passed to the blocks to set the hour
 * @param {*} day day indicating the date of the corresponding week
 * @param {*} setDay function that will be passed to the blocks to configure the day
 * @param {*} works hash table with the works of the week
 * @param {*} setWorksBlock function that will be passed to the blocks to configure the list of works
 * @param {*} setWorkList function that will be passed to the blocks so that they configure the list
 *            of works shown with those of the corresponding block
 * @returns List of VolunteerCalendarBlock elements with the blocks of weekly calendar
 *          hours that contain the corresponding works
 */
const generateCalendarBlocks = (
    setHour,
    day,
    setDay,
    works,
    setWorksBlock,
    setWorkList
) => {
    const grids = [];
    for (let j = StartHour; j < EndHour; j++) {
        for (let i = 0; i < DayOfWeeksString.length; i++) {
            grids.push(
                <VolunteerCalendarBlock
                    key={`${i}-${j}`}
                    type={"works"}
                    isBlockHour={true}
                    works={works[i][j - StartHour]}
                    hour={day.day(i).hour(j)}
                    setHour={setHour}
                    day={day.day(i)}
                    setDay={setDay}
                    setWorksBlock={setWorksBlock}
                    setWorkList={setWorkList}
                />
            );
        }
    }

    return grids;
};

/**
 * function that orders the works depending on the tags, being
 * ordered from highest to lowest, where the largest works are
 * the ones that match the most number of tags
 *
 * @param {*} worksUnordered list of works to order
 * @param {*} userTags user tags that will indicate the order of works
 * @returns List of works ordered from highest to lowest according to the
 *          number of matches with the user tags
 */
const orderWorks = (worksUnordered = [], userTags = []) => {
    const works = worksUnordered.map((work) => [
        work,
        work.tags.filter((tag) => {
            return userTags.some((userTag) => userTag === tag);
        }).length,
    ]);
    const orderedWorks = works
        .sort((a, b) => {
            if (a[1] > b[1]) return -1;
            if (a[1] < b[1]) return 1;
            return 0;
        })
        .map((work) => work[0]);

    return orderedWorks;
};

// User tags request
const fetchUserTags = async (setUserTags, popAlert) => {
    try {
        const response = await getDetailsUser();
        if (!response.ok) {
            if (response.status !== HTTPStatus.BAD_REQUEST) {
                popAlert("An error ocurred: " + response.statusText, "error");
                return;
            }
            popAlert("Error", "error");
            return;
        }
        const user = await response.json();
        setUserTags(user.userTags);
    } catch (e) {
        popAlert("A network error occurred.", "error");
        return;
    }
};

/**
 * Create the main page that shows the work available works, profile, preferences  and postulations of the volunteer
 *
 * @returns The main page that shows the work available works, profile, preferences  and postulations of the volunteer
 */
const VolunteerMainPage = () => {
    const [day, setDay] = useState(dayjs()); // Date of the block selected
    const [hour, setHour] = useState(dayjs().hour()); // Hour of the block selected
    const [allWorks, setAllWorks] = useState([]); // All the works
    const [worksBlock, setWorksBlock] = useState([]); // Works in the block selected
    const [workList, setWorkList] = useState([]); // Works to show in the side list
    const [daysWithWorks, setDaysWithWorks] = useState([]); // Boolean array representing days with works
    const [userTags, setUserTags] = useState([]); // Current user prefered tags
    const [viewProfile, setViewProfile] = useState(false); // Visualization of the profile modal
    const [editPreferences, setEditPreferences] = useState(false); // Visualization of the edit preferences modal
    const { auth } = useAuth();
    const { popAlert } = useGlobalAlert();

    const navigate = useNavigate();
    const location = useLocation();

    const year = day.year();
    const month = day.month();

    // Initial configuration of the time blocks and their works
    let worksHashTable = createHashTable(allWorks, day);
    let calendarBlocks = generateCalendarBlocks(
        setHour,
        day,
        setDay,
        worksHashTable,
        setWorksBlock,
        setWorkList
    );

    // Fetch user tags
    useEffect(() => {
        fetchUserTags(setUserTags, popAlert);
    }, [setUserTags]);

    // Fetchs all works according to user preferences
    useEffect(() => {
        fetchMonthYearWorks(month + 1, year, popAlert, setAllWorks);
    }, [setAllWorks, year, month]);

    /**
     * Sets the new block list whenever the user tags or selected hour block
     * changes.
     */
    useEffect(() => {
        if (worksBlock.length === 0) return;

        setWorkList(orderWorks(worksBlock, userTags));
    }, [JSON.stringify(userTags), JSON.stringify(worksBlock)]);

    /**
     * Calculates the days with works and set them up in a boolean array.
     * Required for mini calendar.
     */
    useEffect(() => {
        setDaysWithWorks(calculateMonthWorkDays(allWorks, day));
    }, [JSON.stringify(allWorks), day, setDaysWithWorks]);

    /**
     * Sets the mini calendar days array that have works available
     * @param {*} d
     */
    const handleDayChange = (d) => {
        if (!day.isSame(d, "month"))
            setDaysWithWorks(calculateMonthWorkDays(allWorks, d));
        setDay(d);
    };

    return (
        <>
            <Box className="box-content">
                <PageNavbar
                    barTitle={"Volunteer"}
                    buttons={[
                        {
                            text: "View profile",
                            onClick: () => setViewProfile(true),
                            endIcon: "bi bi-person-lines-fill",
                        },
                        {
                            text: "Edit preferences",
                            onClick: () => setEditPreferences(true),
                            endIcon: "bi bi-sliders",
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
                        {
                            text: "Work Sessions",
                            onClick: () =>
                                navigate(PageRoutes.VOLUNTEER_SESSIONS, {
                                    state: { from: location },
                                    replace: true,
                                }),
                            endIcon: "bi bi-bookmark-check-fill",
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
                    </Grid>
                    <Box className="date-content">
                        <MiniCalendar
                            day={day}
                            onDateChange={handleDayChange}
                            legend={MiniCalendarVolunteerLegend()}
                            slots={{ day: SupplierWorkDayMiniSlots }}
                            slotProps={{
                                day: {
                                    highlightedDays: daysWithWorks,
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
                                legend={BigCalendarVolunteerLegend(false)}
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
                                    <WorkList
                                        data={workList}
                                        setPostulationChanged={async () => {
                                            fetchMonthYearWorks(
                                                month + 1,
                                                year,
                                                popAlert,
                                                setAllWorks
                                            );
                                        }}
                                    />
                                </ItemWrapper>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Box>
            {viewProfile && (
                <ProfileModal
                    open={viewProfile}
                    handleClose={() => setViewProfile(false)}
                />
            )}
            {editPreferences && (
                <EditPreferencesModal
                    open={editPreferences}
                    handleClose={() => setEditPreferences(false)}
                    handleTagChange={(t) => setUserTags(t)}
                    onPreferencesChanged={() =>
                        fetchMonthYearWorks(
                            month + 1,
                            year,
                            popAlert,
                            setAllWorks
                        )
                    }
                />
            )}
        </>
    );
};

export default VolunteerMainPage;

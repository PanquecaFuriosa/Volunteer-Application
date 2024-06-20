import { Box, Grid, IconButton, Typography } from "@mui/material";
import { DayOfWeeksString } from "../../utils/constants/DayOfTheWeeks";
import { HoursAllowed } from "../../utils/constants/HoursOfTheDays";
import ItemWrapper from "../common/ItemWrapperContainer";
import SupplierCalendarBlock from "./SupplierCalendarBlock";

/**
 * Generate the date row to the days of the week in the weekly calendar
 * 
 * @param {*} day Day of the week that you want to display. 
 * @returns a list of SupplierCalendarBlock elements that correspond to
 *          the blocks of the dates of the days of the week
 */
const generateCalendarBlocks = (day) => {
    const grids = [];
    for (let i = 0; i < DayOfWeeksString.length; i++) {
        grids.push(
            <SupplierCalendarBlock
                key={i}
                day={day}
                value={day.day(i)}
                type={"custom-block"}
                isBlockHour={false}
            />
        );
    }

    return grids;
};


/**
 * Calendar grid component. Displays a calendar with hours from 7am to 5pm in the y axis
 * and the days from sunday to monday on the x axis. Displays the whole week that the day
 * from the day argument is at.
 * 
 * @param {*} day Day of the week that you want to display. 
 * @param {*} content Content of the calendar grid
 * @param {*} legend Component to display as a legend at the bottom of the calendar
 * @param {*} onDayChange callback function called when the calendar day is changed.
 */
const MainCalendar = ({day, content, legend=undefined, onDayChange=undefined}) => {
    const gridDays = generateCalendarBlocks(day);
    const gridWorks = content;
    
    const navigateBigCalendar = (up) => {
        const nd = up ? day.add(DayOfWeeksString.length, "day") : day.subtract(DayOfWeeksString.length, "day")
        if (onDayChange !== undefined) onDayChange(nd);
    };

    return (
        <Grid
            item
            xs={12}
            md={7.5}
            sx={{
                overflowX: "scroll",
                p: 0.5,
                paddingRight: "5px",
            }}
        >
            <Grid
                container
                columns={10}
                sx={{
                    display: "inline-flex",
                    minWidth: "550px",
                }}
            >
                <Grid
                    item
                    xs={10}
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography>
                        {"Week from " + day.day(0).format("DD-MM-YYYY") + " to " + day.day(6).format("DD-MM-YYYY")}
                    </Typography>
                    <Box
                        sx={{
                            marginRight: "10px",
                            fontSize: "1rem",
                            fontWeight: "600",
                        }}
                    >
                        <IconButton onClick={() => navigateBigCalendar(false)}>
                            <i className="bi bi-chevron-left"></i>
                        </IconButton>
                        <IconButton onClick={() => navigateBigCalendar(true)}>
                            <i className="bi bi-chevron-right"></i>
                        </IconButton>
                    </Box>
                </Grid>
                <ItemWrapper>
                    <Grid container columns={10}>
                        <Grid item xs={1}>
                            <Grid
                                container
                                direction="column"
                                sx={{
                                    marginTop: "calc(35px - 0.75em)",
                                }}
                            >
                                {HoursAllowed.map((hour, index) => (
                                    <SupplierCalendarBlock
                                        key={index}
                                        value={hour}
                                        isBlockHour={false}
                                        type={"custom-block-hours"}
                                    />
                                ))}
                            </Grid>
                        </Grid>
                        <Grid item xs={9}>
                            <Grid container columns={7} sx={{ marginTop: "0" }}>
                                {DayOfWeeksString.map((name, index) => (
                                    <SupplierCalendarBlock
                                        key={index}
                                        value={name}
                                        isBlockHour={false}
                                        type={"custom-block"}
                                    />
                                ))}
                                {gridDays}
                            </Grid>
                            <Grid
                                container
                                columns={7}
                                sx={{
                                    marginTop: "5px",
                                }}
                            >
                                {gridWorks}
                            </Grid>
                        </Grid>
                    </Grid>
                </ItemWrapper>
                {legend !== undefined && legend}
            </Grid>
        </Grid>
    );
};

export default MainCalendar
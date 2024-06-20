import { Box } from "@mui/material";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ItemWrapper from "../common/ItemWrapperContainer";

/**
 * Small navigation calendar
 *
 * @param {*} day Current day selected
 * @param {*} slots Calendar day button component
 * @param {*} slotProps Props passed to every slot
 * @param {*} legend Component to display as a legend at the bottom of the calendar
 * @param {*} onDateChange Callback called when the selected day changes
 */
const MiniCalendar = ({
    day,
    slots = undefined,
    slotProps = undefined,
    legend = undefined,
    onDateChange = undefined,
}) => {
    const handleChange = (date) => {
        if (onDateChange !== undefined) onDateChange(date);
    };

    return (
        <Box className="custom-grid-calendar">
            <ItemWrapper>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                        className="custom-date-calendar"
                        showDaysOutsideCurrentMonth
                        fixedWeekNumber={6}
                        value={day}
                        onYearChange={handleChange}
                        onMonthChange={handleChange}
                        onChange={handleChange}
                        slots={slots}
                        slotProps={slotProps}
                    />
                </LocalizationProvider>
            </ItemWrapper>
            {legend !== undefined && legend}
        </Box>
    );
};

export default MiniCalendar;

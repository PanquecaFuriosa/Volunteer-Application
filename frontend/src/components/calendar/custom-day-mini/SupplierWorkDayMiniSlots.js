import { Badge } from "@mui/material";
import { PickersDay } from "@mui/x-date-pickers";

/**
 * MiniCalendar day button component that shows up a flag
 * if the day is highlighted. Used to highlight the days
 * that contains works in them
 *
 * @param {*} props
 * @returns
 */
const SupplierWorkDayMiniSlots = (props) => {
    const {
        highlightedDays = [],
        postulationDays = [],
        day,
        outsideCurrentMonth,
        ...other
    } = props;

    const hasWorks = highlightedDays[day.date() - 1];
    const hasPostulations = postulationDays[day.date() - 1];

    // Calculate the icon to show in the day slot
    const dayIcon = () => {
        if (outsideCurrentMonth)
            return undefined;
        
        if (hasPostulations)
            return "🧔";
        
        if (hasWorks)
            return "🔵";
        
        return undefined;
    }

    return (
        <Badge
            key={day.toString()}
            overlap="circular"
            badgeContent={dayIcon()}
        >
            <PickersDay
                {...other}
                outsideCurrentMonth={outsideCurrentMonth}
                day={day}
            />
        </Badge>
    );
};

export default SupplierWorkDayMiniSlots;

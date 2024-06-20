import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Tooltip,
} from "@mui/material";

import { DayOfWeeksString } from "../../utils/constants/DayOfTheWeeks";

/**
 * Input form that lets you select a weekday as a select form.
 *
 * @param {*} day Value for controlled usage
 * @param {*} onChange Callback for value changes.
 * @param {*} dayOptions Days of the week that can be selected.
 * @param {*} readonly Indicates if the form is readonly
 */
const DaySelector = ({
    day,
    onChange = undefined,
    dayOptions = [1, 2, 3, 4, 5, 6, 0],
    readonly = false,
}) => {
    return (
        <Tooltip title="Day of the week for the hour block" arrow placement="right">
            <FormControl sx={{ width: "150px", pr: 4 }}>
                <InputLabel>Day</InputLabel>
                <Select
                    value={day}
                    label="Day"
                    readOnly={readonly}
                    disabled={readonly}
                    onChange={(e) => {
                        if (onChange !== undefined) onChange(e.target.value);
                    }}
                >
                    {dayOptions.map((day) => (
                        <MenuItem key={day} value={day}>
                            {DayOfWeeksString[day]}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Tooltip>
    );
};

export default DaySelector;

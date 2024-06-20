import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import {
    Button,
    IconButton,
    List,
    ListItem,
    ListSubheader,
    Tooltip,
    Typography,
} from "@mui/material";

import dayjs from "dayjs";
import "dayjs/plugin/customParseFormat";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import ItemWrapper from "./ItemWrapperContainer";
import DaySelector from "./DaySelector";
import { useGlobalAlert } from "../../hooks/useGlobalAlert";

const minHour = dayjs().set("hour", 7).startOf("hour");
const maxHour = dayjs().set("hour", 17).startOf("hour");

/**
 * Input form that lets you choose an hour block 7am to 17pm, along
 * with the day for that block.
 *
 * @param {*} hourBlocks Value for controlled usage
 * @param {*} minBlocks Min hour blocks to be selected
 * @param {*} maxBlocks Max hour blocks to be selected
 * @param {*} onChange Callback for value changes.
 * @param {*} startDate Startdate for the day selector (in case the days
 *                      to be selected are limited to a date range)
 * @param {*} endDate EndDate for the day selector (in case the days
 *                    to be selected are limited to a date range)
 * @param {*} readonly Indicates if the fields are only readonly
 * @param {*} view Array. If "hour" is in the array, the component lets you select an hour block.
 *                 If "day" is in the array, the component lets you select a week day.
 */
const WorkHourSelector = ({
    hourBlocks = [{ hourBlock: minHour, weekDay: 0 }],
    minBlocks = 1,
    maxBlocks = 100,
    onChange = undefined,
    startDate = undefined,
    endDate = undefined,
    readonly = false,
    view = ["hour", "day"],
}) => {
    const { popAlert } = useGlobalAlert();

    if (maxBlocks < hourBlocks.length) {
        if (onChange !== undefined) {
            onChange(hourBlocks.slice(0, maxBlocks));
            return;
        }
    }

    const handleAdd = () => {
        if (maxBlocks === hourBlocks.length) {
            popAlert(`Can't add more than ${maxBlocks} block(s)!`, "error");
            return;
        }
        if (onChange !== undefined)
            onChange(hourBlocks.concat([{ hourBlock: minHour, weekDay: 0 }]));
    };

    /**
     * Shows an hour block field in the list.
     *
     * @param {*} block Hour block to show
     * @param {*} pos Position in the list of the hour block
     */
    const HourBlockListItem = (block, pos) => {
        const handleHourChange = (v) => {
            let sc = [...hourBlocks];
            const nb = { ...sc[pos] };
            nb.hourBlock = v;
            sc[pos] = nb;
            if (onChange !== undefined) onChange(sc);
        };

        const handleDayChange = (v) => {
            let sc = [...hourBlocks];
            const nb = { ...sc[pos] };
            nb.weekDay = v;
            sc[pos] = nb;
            if (onChange !== undefined) onChange(sc);
        };

        const calculateValidDays = () => {
            if (startDate === undefined || endDate === undefined)
                return undefined;

            const possibleOptions = [];
            let actualDate = startDate;
            while (
                !actualDate.isAfter(endDate, "day") &&
                possibleOptions.length < 7
            ) {
                possibleOptions.push(actualDate.day());
                actualDate = actualDate.add(1, "day");
            }

            possibleOptions.sort();
            if (!possibleOptions.includes(block.weekDay)) {
                handleDayChange(possibleOptions[0]);
                block.weekDay = possibleOptions[0];
            }

            const zeroPos = possibleOptions.indexOf(0);
            if (zeroPos !== -1) {
                possibleOptions.splice(zeroPos, 1);
                possibleOptions.push(0);
            }

            return possibleOptions;
        };

        const handleRemoval = () => {
            if (hourBlocks.length === minBlocks) {
                popAlert(
                    `You must have at least ${maxBlocks} block(s)!`,
                    "error"
                );
                return;
            }
            if (onChange !== undefined)
                onChange(hourBlocks.filter((_, i) => i !== pos));
        };

        const dayOptions = !readonly
            ? calculateValidDays()
            : [1, 2, 3, 4, 5, 6, 0];
        return (
            <>
                <ListItem sx={{ pl: 0 }}>
                    {view.includes("hour") && (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                                minTime={minHour}
                                maxTime={maxHour}
                                value={block.hourBlock}
                                onChange={(v) => handleHourChange(v)}
                                ampm={false}
                                views={["hours"]}
                                sx={{ pr: 4 }}
                                readOnly={readonly}
                            />
                        </LocalizationProvider>
                    )}
                    {view.includes("day") && (
                        <DaySelector
                            day={block.weekDay}
                            onChange={(v) => handleDayChange(v)}
                            dayOptions={dayOptions}
                            readonly={readonly}
                        />
                    )}
                    {!readonly && (
                        <Tooltip title={"Remove hour block"} arrow>
                            <IconButton onClick={handleRemoval}>
                                <i className="bi bi-dash-square" />
                            </IconButton>
                        </Tooltip>
                    )}
                </ListItem>
            </>
        );
    };

    return (
        <ItemWrapper sx={{ width: "100%", marginTop: 3 }}>
            <List subheader={<ListSubheader>Work hour blocks</ListSubheader>}>
                {hourBlocks.map((b, i) => HourBlockListItem(b, i))}
                {!readonly && (
                    <ListItem sx={{ pl: 0, pb: 0 }}>
                        <Button onClick={() => handleAdd()}>
                            <Typography sx={{ pr: 1 }}>
                                New work hour block
                            </Typography>
                            <i className="bi bi-plus-square" />
                        </Button>
                    </ListItem>
                )}
            </List>
        </ItemWrapper>
    );
};

export default WorkHourSelector;

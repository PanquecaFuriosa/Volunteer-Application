import { Box, Button, Grid, Badge, Tooltip, Typography } from "@mui/material";
import "../../styles/CalendarBlock.css";

import dayjs from "dayjs";
import "dayjs/plugin/customParseFormat";
import WorkTypes from "../../utils/constants/WorkTypes";

/**
 * Create the block data
 *
 * @param {*} hour hour of the block data
 * @param {*} date date of the block data
 * @returns an object containing a time block and a date
 */
const createData = (hour, date) => {
    return {
        blocks: [
            {
                hourBlock: dayjs(hour, "HH:00:00"),
                weekDay: dayjs(date, "DD-MM-YYYY").day(),
            },
        ],
        date: date,
    };
};

const SupplierCalendarBlock = (props) => {
    /**
     * Creates the icons for the work types in the supplier calendar block.
     * @returns Icons for the work types
     */
    const workIcons = () => {
        if (props.works === undefined) return <></>;

        const hasSession = props.works.some(
            (w) => w.type === WorkTypes.SESSION
        );
        const hasRecurr = props.works.some(
            (w) => w.type === WorkTypes.RECURRING
        );
        const hasPending = props.works.some(
            (w) => w.pendingPostulationsCount > 0
        );
        return (
            <>
                <Box>
                    <Box className="box-icon-works">
                        {props.works.length > 0 && hasSession && (
                            <i className="bi bi-bookmark-fill block-icons"></i>
                        )}
                        {props.works.length > 0 && hasRecurr && (
                            <i
                                className="bi-bookmark-fill block-icons"
                                style={{ color: "green" }}
                            ></i>
                        )}
                        {props.works.length > 0 && hasPending && (
                            <Badge
                                color="error"
                                variant="dot"
                                overlap="circular"
                            >
                                <i className="bi bi-person-fill block-icons"></i>
                            </Badge>
                        )}
                    </Box>
                    {props.works.length > 0 && (
                        <Typography className="block-fonts">
                            {`${props.works.length} work(s)`}
                        </Typography>
                    )}
                </Box>
            </>
        );
    };

    /**
     * Label for the supplier work block tooltip.
     * @returns Label for the supplier work block tooltip.
     */
    const workBlockTooltipLabel = () => {
        return props.works.length === 0 ? "Create new work" : "Inspect works";
    };

    /**
     * Returns the blocks containing the dates of the days of the
     * selected week
     *
     * @param {*} day day selected
     * @param {*} dayBlock day of the block
     * @returns A round block with a blue background with the date if
     *          it matches the date of the selected day, only the date otherwise
     */
    const boxDate = (day, dayBlock) => {
        return day.isSame(dayBlock, "day") ? (
            <>
                <Box
                    sx={{
                        backgroundColor: "#1976d2",
                        color: "#FFF",
                        borderRadius: "50%",
                        height: "35px",
                        width: "35px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {dayBlock.date()}
                </Box>
            </>
        ) : (
            dayBlock.date()
        );
    };

    return (
        <>
            {!props.isBlockHour && (
                <Grid
                    className={props.type}
                    item
                    xs={1}
                    sx={{
                        mt: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {dayjs.isDayjs(props.value)
                        ? boxDate(props.day, props.value)
                        : props.value}
                </Grid>
            )}
            {props.isBlockHour && (
                <Tooltip title={workBlockTooltipLabel()} arrow enterDelay={300}>
                    <Grid className={props.type} item xs={1} sx={{ mt: 0 }}>
                        <Button
                            className="button-block"
                            color="inherit"
                            onClick={() => {
                                props.setDataList(props.works);
                                props.dateHourRef.current = {
                                    hourBlock: props.hour,
                                    dateBlock: props.date,
                                };
                                if (props.works.length === 0) {
                                    props.setCreating(true);
                                    props.setDataModal(
                                        createData(props.hour, props.date)
                                    );
                                }
                            }}
                            endIcon={workIcons()}
                        ></Button>
                    </Grid>
                </Tooltip>
            )}
        </>
    );
};

export default SupplierCalendarBlock;

import { Box, Button, Grid, Tooltip, Typography } from "@mui/material";
import WorkTypes from "../../utils/constants/WorkTypes";
import "../../styles/CalendarBlock.css";

const VolunteerCalendarBlock = ({
    value = "",
    type,
    isBlockHour = false,
    works = [],
    hour = undefined,
    setHour = undefined,
    day = undefined,
    setDay = undefined,
    setWorksBlock = undefined,
}) => {
    /**
     * Creates the icons for the work types in the supplier calendar block.
     *
     * @returns Icons for the work types
     */
    const workIcons = () => {
        if (works.length === 0) return <></>;

        const hasSession = works.some((w) => w.type === WorkTypes.SESSION);
        const hasRecurr = works.some((w) => w.type === WorkTypes.RECURRING);
        const hasPostulation = works.some((w) => w.isPostulated);

        return (
            <>
                <Box>
                    <Box className="box-icon-works">
                        {works.length > 0 && hasSession && (
                            <i className="bi bi-bookmark-fill block-icons"></i>
                        )}
                        {works.length > 0 && hasRecurr && (
                            <i
                                className="bi-bookmark-fill block-icons"
                                style={{ color: "green" }}
                            ></i>
                        )}
                        {works.length > 0 && hasPostulation && (
                            <i
                                className="bi bi-person-fill block-icons"
                                style={{
                                    color: "black",
                                }}
                            ></i>
                        )}
                    </Box>
                    {works.length > 0 && (
                        <Typography className="block-fonts">
                            {`${works.length} work(s)`}
                        </Typography>
                    )}
                </Box>
            </>
        );
    };

    return (
        <>
            {!isBlockHour && (
                <Grid className={type} item xs={1} sx={{ mt: 0 }}>
                    {value}
                </Grid>
            )}
            {isBlockHour && (
                <Grid className={type} item xs={1} sx={{ mt: 0 }}>
                    {works.length > 0 && (
                        <Tooltip title={"Inspect work"} arrow enterDelay={300}>
                            <Button
                                className="button-block"
                                color="inherit"
                                onClick={() => {
                                    if (setHour !== undefined) setHour(hour);
                                    if (setDay !== undefined) setDay(day);
                                    if (setWorksBlock !== undefined)
                                        setWorksBlock(works);
                                }}
                                endIcon={workIcons()}
                            />
                        </Tooltip>
                    )}
                    {works.length === 0 && <Box sx={{ width: "99.22px" }} />}
                </Grid>
            )}
        </>
    );
};

export default VolunteerCalendarBlock;

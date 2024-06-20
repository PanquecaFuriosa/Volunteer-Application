import { Box, Button, Grid, Tooltip, Typography } from "@mui/material";
import "../../styles/CalendarBlock.css";

const VolunteerSessionCalendarBlock = ({
    value = "",
    type,
    isBlockHour = false,
    session = undefined,
    hour = undefined,
    setHour = undefined,
    day = undefined,
    setDay = undefined,
    setSelectedSession = undefined,
    setShow,
}) => {
    /**
     * Creates the icons for the work types in the supplier calendar block.
     *
     * @returns Icons for the work types
     */
    const workIcons = () => {
        if (!session) return <></>;

        return (
            <>
                <Box>
                    {session && (
                        <>
                            <i className="bi bi-alarm block-icons"></i>
                            <Typography className="block-fonts">
                                Work Session
                            </Typography>
                        </>
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
                    {session && (
                        <Tooltip
                            title={"Inspect session"}
                            arrow
                            enterDelay={300}
                        >
                            <Button
                                className="button-block"
                                color="inherit"
                                onClick={() => {
                                    if (setHour !== undefined) setHour(hour);
                                    if (setDay !== undefined) setDay(day);
                                    if (setSelectedSession !== undefined)
                                        setSelectedSession(session);
                                    if (setShow !== undefined) setShow(true);
                                }}
                                endIcon={workIcons()}
                            />
                        </Tooltip>
                    )}
                    {!session && <Box sx={{ width: "99.22px" }} />}
                </Grid>
            )}
        </>
    );
};

export default VolunteerSessionCalendarBlock;

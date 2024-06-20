import { useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Grid, Box, Button, Typography } from "@mui/material";
import { useGlobalAlert } from "../../../hooks/useGlobalAlert";
import WorkTypes from "../../../utils/constants/WorkTypes";

// fetch
import { editUserPostulation } from "../../../utils/fetchs/ApiFetchesVolunteer";
import { AlertSeverity } from "../../../context/AlertProvider";

dayjs.extend(isBetween);

/**
 * Does the fetch to edit the postulation
 *
 * @param {*} startDay new starting day
 * @param {*} finalDay new final day
 * @param {*} postulation postulation to be edited
 * @param {*} setEditPostulation function to close the edit postulation modal
 * @param {*} onEdited function to establish the new edited postulation
 * @param {*} popAlert function that displays the messages about the fetch
 */
const handleSubmitDialog = async (
    startDay,
    finalDay,
    postulation,
    setEditPostulation,
    onEdited,
    popAlert
) => {
    try {
        if (startDay.isAfter(finalDay, "day")) {
            popAlert(
                "Error, the start date must be before the end date",
                AlertSeverity.ERROR
            );
            return;
        }

        const response = await editUserPostulation({
            postulationId: postulation.postulationId,
            startDate: startDay.format("DD-MM-YYYY"),
            endDate: finalDay.format("DD-MM-YYYY"),
        });

        if (!response.ok) {
            const errorText = await response.text();
            popAlert(errorText, "error");
            return;
        }

        popAlert("Postulation successfully edited!", AlertSeverity.SUCCESS);

        if (onEdited !== undefined) onEdited(postulation);
    } catch (e) {
        popAlert("A network error occurred.", AlertSeverity.ERROR);
        return;
    }
    setEditPostulation(false);
};

/**
 * Create the components to show in the edit postulation modal
 * 
 * @param {*} postulation postulation to be edited
 * @param {*} work postulation work
 * @param {*} setEditPostulation function that closes the modal
 * @param {*} setPageModal function that change the page modal
 * @param {*} onEdited function to do if the postulation is edited
 * @returns The components to show in the edit postulation modal
 */
const EditPostulationModal = ({
    postulation,
    work,
    setEditPostulation,
    setPageModal = undefined,
    onEdited = undefined,
}) => {
    const [startDay, setStartDay] = useState(
        dayjs(postulation.startDate, "DD-MM-YYYY")
    ); // New starting day
    const [finalDay, setFinalDay] = useState(
        dayjs(postulation.endDate, "DD-MM-YYYY")
    ); // New final day
    const { popAlert } = useGlobalAlert();

    /**
     * This function determines the date that are enabled for the user to pick
     *
     * @param {*} date date that will be disabled or not
     * @returns Boolean, true if the date is disabled, false otherwise
     */
    const disableDays = (date) => {
        return !date.isBetween(
            dayjs(work.startDate, "DD-MM-YYYY"),
            dayjs(work.endDate, "DD-MM-YYYY"),
            "day",
            "[]"
        );
    };

    return (
        <>
            {work.type === WorkTypes.RECURRING && (
                <>
                    <Typography>
                        Edit your proposed start and/or end date
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={2} sx={{ marginTop: 0 }}>
                            <Grid item xs={6}>
                                <DatePicker
                                    format="DD-MM-YYYY"
                                    label="Start date"
                                    value={startDay}
                                    onChange={(newDay) => setStartDay(newDay)}
                                    shouldDisableDate={disableDays}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    format="DD-MM-YYYY"
                                    label="End date"
                                    value={finalDay}
                                    onChange={(newDay) => setFinalDay(newDay)}
                                    shouldDisableDate={disableDays}
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                    <Grid
                        container
                        columns={2}
                        sx={{
                            marginTop: 4,
                        }}
                    >
                        {setPageModal !== undefined && (
                            <Grid item xs={1}>
                                <Button onClick={(_) => setPageModal(1)}>
                                    <Typography>Back</Typography>
                                </Button>
                            </Grid>
                        )}
                        <Grid
                            item
                            xs={setPageModal === undefined ? 2 : 1}
                            sx={{
                                display: "flex",
                                flexDirection: "row-reverse",
                            }}
                        >
                            <Button
                                color="success"
                                variant="contained"
                                onClick={(_) =>
                                    handleSubmitDialog(
                                        startDay,
                                        finalDay,
                                        postulation,
                                        setEditPostulation,
                                        onEdited,
                                        popAlert
                                    )
                                }
                            >
                                <Typography>Submit</Typography>
                            </Button>
                            <Button
                            className="cancel-button-contained"
                                variant="contained"
                                onClick={(_) => setEditPostulation(false)}
                            >
                                <Typography>Cancel</Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </>
            )}
            {work.type === WorkTypes.SESSION && (
                <>
                    <Typography>
                        Cannot edit a postulation for a session type work
                    </Typography>
                    <Box
                        sx={{
                            marginTop: 4,
                            display: "flex",
                            flexDirection: "row-reverse",
                        }}
                    >
                        <Button onClick={(_) => setEditPostulation(false)}>
                            <Typography>Close</Typography>
                        </Button>
                    </Box>
                </>
            )}
        </>
    );
};

export default EditPostulationModal;

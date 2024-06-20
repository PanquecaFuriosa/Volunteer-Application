import { Grid, Button, Typography } from "@mui/material";

// fetch
import { cancelUserPostulation } from "../../../utils/fetchs/ApiFetchesVolunteer";
import { useGlobalAlert } from "../../../hooks/useGlobalAlert";
import { AlertSeverity } from "../../../context/AlertProvider";

/**
 * Does the fetch to cancel the postulation
 *
 * @param {*} postulation postulation to be canceled
 * @param {*} setCancelPostulation function to close the cancel postulation modal
 * @param {*} onCanceled function to establish the new canceled postulation
 * @param {*} popAlert function that displays the messages about the fetch
 */
const handleSubmitDialog = async (
    postulation,
    setCancelPostulation,
    onCanceled,
    popAlert
) => {
    try {
        const response = await cancelUserPostulation(postulation.postulationId);
        if (!response.ok) {
            const errorText = await response.text();
            popAlert(errorText, AlertSeverity.ERROR);
            return;
        }

        if (onCanceled !== undefined) onCanceled(postulation);
        popAlert("Application canceled satisfactorily!", AlertSeverity.SUCCESS);
    } catch (e) {
        popAlert("A network error occurred.", AlertSeverity.ERROR);
        return;
    }
    setCancelPostulation(false);
};

/**
 * Create the components to show in the cancel postulation modal
 * 
 * @param {*} postulation postulation to be canceled
 * @param {*} setCancelPostulation function that closes the modal
 * @param {*} setPageModal function that change the page modal
 * @param {*} onCanceled function to do if the postulation is canceled
 * @returns The components to show in the cancel postulation modal
 */
const CancelPostulationModal = ({
    postulation,
    setCancelPostulation,
    setPageModal = undefined,
    onCanceled = undefined,
}) => {
    const { popAlert } = useGlobalAlert();

    return (
        <>
            <Typography>
                Are you sure you want to delete this postulation?
            </Typography>
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
                        color="error"
                        variant="contained"
                        onClick={(_) =>
                            handleSubmitDialog(
                                postulation,
                                setCancelPostulation,
                                onCanceled,
                                popAlert
                            )
                        }
                    >
                        <Typography>Delete</Typography>
                    </Button>
                    <Button
                        className="cancel-button-contained"
                        variant="contained"
                        onClick={(_) => setCancelPostulation(false)}
                    >
                        <Typography>Cancel</Typography>
                    </Button>
                </Grid>
            </Grid>
        </>
    );
};

export default CancelPostulationModal;

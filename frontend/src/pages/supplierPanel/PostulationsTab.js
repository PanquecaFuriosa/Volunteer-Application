import { Paper, Button, Typography, Stack, Skeleton } from "@mui/material";
import {
    rejectVolunteerPostulation,
    acceptVolunteerPostulation,
} from "../../utils/fetchs/ApiFetchesSupplier";
import { useGlobalAlert } from "../../hooks/useGlobalAlert";
import { AlertSeverity } from "../../context/AlertProvider";
import { fetchVolunteers } from "./VolunteersManagementTab";
import { getWorkPendingPostulations } from "../../utils/fetchs/ApiFetchesSupplier";

/**
 * Fetches postulations for a specific work
 * @param {string} workId - The ID of the work for which postulations are fetched.
 * @param {function} popAlert - The function used to display alerts.
 * @param {function} setPostulations - The function used to update the postulations state.
 */
const fetchPostulations = async (workId, popAlert, setPostulations) => {
    try {
        const response = await getWorkPendingPostulations(workId);
        if (!response.ok) {
            popAlert("An error ocurred: " + response.statusText, "error");
            return;
        }
        const allPostulations = await response.json();
        setPostulations(allPostulations);
    } catch (e) {
        popAlert("A network error occurred.", "error");
        return;
    }
};

/**
 * Component representing a tab that displays information about all volunteer's postulation
 * and provides options to accept or deny the postulation.
 * @param {Object} postulations - The list of postulations.
 * @param {boolean} isBeforeDate - Indicates if the work was finished or not.
 * @param {Object} workData - Data related to the work.
 */
const PostulationsTab = ({
    postulations,
    isBeforeDate,
    workData,
    onPostulationChange = undefined,
}) => {
    const { popAlert } = useGlobalAlert();

    /**
     * Handles accepting a volunteer's postulation.
     * @param {Object} postulation - The postulation of a volunteer.
     */
    const handleAccept = async (postulation) => {
        try {
            const response = await acceptVolunteerPostulation(
                postulation.postulationId
            );
            if (!response.ok) {
                const errorText = await response.text();
                popAlert(errorText, AlertSeverity.ERROR);
                return;
            }
            popAlert(
                `User postulation accepted successfully!.`,
                AlertSeverity.SUCCESS
            );
            fetchPostulations(
                workData.workId,
                popAlert,
                workData.setPostulations
            );
            fetchVolunteers(
                workData.workId,
                workData.dateBlock,
                workData.hourBlock,
                popAlert,
                workData.setVolunteers
            );
            if (onPostulationChange !== undefined) onPostulationChange();
        } catch (error) {
            popAlert(
                "There was a problem connecting with the server. Please try again.",
                AlertSeverity.ERROR
            );
        }
    };

    /**
     * Handles denying a volunteer's postulation.
     * @param {Object} postulation - The postulation of a volunteer.
     */
    const handleReject = async (postulation) => {
        try {
            const response = await rejectVolunteerPostulation(
                postulation.postulationId
            );

            if (!response.ok) {
                const errorText = await response.text();
                popAlert(errorText, AlertSeverity.ERROR);
                return;
            }
            popAlert(
                `User postulation rejected successfully!.`,
                AlertSeverity.SUCCESS
            );
            fetchPostulations(
                workData.workId,
                popAlert,
                workData.setPostulations
            );
            if (onPostulationChange !== undefined) onPostulationChange();
        } catch (error) {
            popAlert(
                "There was a problem connecting with the server. Please try again.",
                AlertSeverity.ERROR
            );
        }
    };

    return (
        <>
            {isBeforeDate ? (
                <Typography>
                    The work has ended. Can't accept new postulations.
                </Typography>
            ) : (
                <>
                    {postulations === undefined ? (
                        <Stack spacing={2}>
                            <Skeleton
                                variant="rounded"
                                fullwidth
                                height={100}
                            />
                            <Skeleton
                                variant="rounded"
                                fullwidth
                                height={100}
                            />
                            <Skeleton
                                variant="rounded"
                                fullwidth
                                height={100}
                            />
                        </Stack>
                    ) : (
                        postulations.map((postulation, index) => (
                            <Paper
                                key={index}
                                elevation={2}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "20px",
                                    marginBottom: "16px",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <Typography variant="h5">
                                        {postulation.volunteerUsername}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        style={{
                                            flexGrow: 1,
                                            marginLeft: "15px",
                                            marginTop: "8px",
                                        }}
                                    >
                                        Fullname:{" "}
                                        {postulation.volunteerFullname}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        style={{
                                            flexGrow: 1,
                                            marginLeft: "15px",
                                            marginTop: "8px",
                                        }}
                                    >
                                        Start date: {postulation.startDate}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        style={{
                                            flexGrow: 1,
                                            marginLeft: "15px",
                                            marginTop: "8px",
                                        }}
                                    >
                                        End date: {postulation.endDate}
                                    </Typography>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <Button
                                        style={{
                                            padding: "5px",
                                            backgroundColor: "#4CAF50",
                                            color: "#fff",
                                            marginBottom: "15px",
                                            marginTop: "45px",
                                            width: "100%",
                                        }}
                                        onClick={() =>
                                            handleAccept(postulation)
                                        }
                                    >
                                        <Typography>Accept</Typography>
                                    </Button>

                                    <Button
                                        style={{
                                            padding: "5px",
                                            backgroundColor: "#F44336",
                                            color: "#fff",
                                            cursor: "pointer",
                                            width: "100%",
                                        }}
                                        onClick={() =>
                                            handleReject(postulation)
                                        }
                                    >
                                        <Typography>Reject</Typography>
                                    </Button>
                                </div>
                            </Paper>
                        ))
                    )}
                </>
            )}
        </>
    );
};

export { fetchPostulations, PostulationsTab as default };

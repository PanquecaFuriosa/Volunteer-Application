import React, { useState } from "react";
import {
    Paper,
    Typography,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Skeleton,
} from "@mui/material";
import TableFilter from "../../components/userTable/TableFilter";
import { editSessionStatus } from "../../utils/fetchs/ApiFetchesSupplier";
import { useGlobalAlert } from "../../hooks/useGlobalAlert";
import { AlertSeverity } from "../../context/AlertProvider";
import WorkSessionStatus from "../../utils/constants/WorkSessionStatus";
import dayjs from "dayjs";
import { dateFormatter } from "../../utils/DateFormatter";
import { getSuppliersVolunteersBySession } from "../../utils/fetchs/ApiFetchesSupplier";

/**
 * Fetches volunteers for a specific work session.
 * @param {Long} workId - The ID of the work for which volunteers are fetched.
 * @param {LocalDate} dateBlock - The date block for which volunteers are fetched.
 * @param {string} hourBlock - The hour block for which volunteers are fetched.
 * @param {function} popAlert - The function used to display alerts.
 * @param {function} setVolunteers - The function used to update the volunteers state.
 * @param {function} [setFilteredRows] - Optional function to set the filtered rows state.
 */
const fetchVolunteers = async (
    workId,
    dateBlock,
    hourBlock,
    popAlert,
    setVolunteers,
    setFilteredRows = undefined
) => {
    try {
        const response = await getSuppliersVolunteersBySession({
            blockDate: dateFormatter(dayjs(dateBlock, "DD-MM-YYYY")),
            blockTime: hourBlock,
            workId: workId,
        });
        if (!response.ok) {
            popAlert("An error ocurred: " + response.statusText, "error");
            return;
        }
        const allVolunteers = await response.json();
        setVolunteers(allVolunteers);
        if (setFilteredRows !== undefined) {
            setFilteredRows(allVolunteers);
        }
    } catch (e) {
        popAlert("A network error occurred.", "error");
        return;
    }
};

/**
 * Component representing a tab that displays information about all volunteers in a work.
 * @param {Array} volunteers - The list of volunteers in the works with their information
 * @param {Object} workData - Data related to the work.
 */
const VolunteersManagementTab = ({
    volunteers,
    workData,
    onVolunteerChange = undefined,
}) => {
    const columnsToFilter = ["volunteerUsername", "volunteerFullname"];
    const [filteredRows, setFilteredRows] = useState(volunteers);

    // alerts
    const { popAlert } = useGlobalAlert();
    /**
     * Handles the change of volunteer status for a specific profile.
     * @param {Event} event - The event object from the Select component.
     * @param {Array} volunteer - A volunteer profile.
     */
    const handleChange = async (event, volunteer) => {
        try {
            const response = await editSessionStatus(
                volunteer.id,
                event.target.value
            );
            if (!response.ok) {
                const errorText = await response.text();
                popAlert(errorText, AlertSeverity.ERROR);
                return;
            }
            popAlert(`Status changed successfully!.`, AlertSeverity.SUCCESS);

            fetchVolunteers(
                workData.workId,
                workData.dateBlock,
                workData.hourBlock,
                popAlert,
                workData.setVolunteers,
                setFilteredRows
            );
            if (onVolunteerChange !== undefined) onVolunteerChange();
        } catch (error) {
            popAlert(
                "There was a problem connecting with the server. Please try again.",
                AlertSeverity.ERROR
            );
        }
    };

    return (
        <>
            <Grid item md={12} style={{ marginBottom: "12px" }}>
                <TableFilter
                    columns={columnsToFilter}
                    rows={volunteers}
                    setFilteredRows={setFilteredRows}
                />
            </Grid>

            {filteredRows === undefined ? (
                <Stack spacing={2}>
                    <Skeleton variant="rounded" fullwidth height={100} />
                    <Skeleton variant="rounded" fullwidth height={100} />
                    <Skeleton variant="rounded" fullwidth height={100} />
                </Stack>
            ) : (
                <>
                    {filteredRows.map((volunteer, index) => (
                        <Paper
                            key={index}
                            elevation={2}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "15px",
                                marginBottom: "12px",
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
                                    {volunteer.volunteerUsername}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    style={{
                                        flexGrow: 1,
                                        marginLeft: "15px",
                                        marginTop: "8px",
                                    }}
                                >
                                    Fullname: {volunteer.volunteerFullname}
                                </Typography>
                            </div>
                            <Box sx={{ minWidth: 120 }}>
                                <FormControl fullWidth style={{}}>
                                    <InputLabel id="select-status-label">
                                        Volunteer status
                                    </InputLabel>
                                    <Select
                                        labelId="select-status-label"
                                        id="Select a status"
                                        value={volunteer.status}
                                        label="Volunteer work status"
                                        onChange={(event) =>
                                            handleChange(event, volunteer)
                                        }
                                    >
                                        <MenuItem
                                            value={WorkSessionStatus.ACCEPTED}
                                        >
                                            {WorkSessionStatus.ACCEPTED}
                                        </MenuItem>
                                        <MenuItem
                                            value={WorkSessionStatus.REJECTED}
                                        >
                                            {WorkSessionStatus.REJECTED}
                                        </MenuItem>
                                        <MenuItem
                                            value={WorkSessionStatus.PENDING}
                                        >
                                            {WorkSessionStatus.PENDING}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Paper>
                    ))}
                </>
            )}
        </>
    );
};
export { fetchVolunteers, VolunteersManagementTab as default };

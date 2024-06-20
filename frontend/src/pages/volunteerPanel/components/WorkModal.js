import { useEffect, useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
    Grid,
    Dialog,
    InputLabel,
    TextField,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    Box,
    Typography,
    Tooltip,
    IconButton,
    Skeleton,
} from "@mui/material";
import EditPostulationModal from "./EditPostulationModal";
import CancelPostulationModal from "./CancelPostulationModal";
import WorkHourSelector from "../../../components/common/WorkHourSelector";
import WorkTypes from "../../../utils/constants/WorkTypes";

// Fetch
import {
    userPostulation,
    getWorkPostulation,
} from "../../../utils/fetchs/ApiFetchesVolunteer";

import { useGlobalAlert } from "../../../hooks/useGlobalAlert";
import PostulationStatus from "../../../utils/constants/PostulationStatus";
import { AlertSeverity } from "../../../context/AlertProvider";

dayjs.extend(isBetween);

/**
 * Does the fetch to get the postulation of a work
 *
 * @param {*} workId work's id
 * @param {*} setPostulation function to set the actual postulation
 * @param {*} popAlert function that displays the messages about the fetch
 */
const fetchWorkPostulation = async (workId, setPostulation, popAlert) => {
    try {
        const response = await getWorkPostulation(workId);
        if (!response.ok) {
            const errorText = await response.text();
            popAlert(errorText, AlertSeverity.ERROR);
            return;
        }
        const postulation = await response.json();
        setPostulation(postulation);
    } catch (e) {
        popAlert("A network error occurred.", AlertSeverity.ERROR);
        return;
    }
};

/**
 * Does the fetch that allows the postulation of a user
 *
 * @param {*} startDay proposed start day
 * @param {*} finalDay proposed final day
 * @param {*} work postulation's work
 * @param {*} setShowWork function that opens and closes the
 *            postulation modal
 * @param {*} popAlert function that displays the messages about the fetch
 * @param {*} setCreated function that indicates if the postulation was created
 */
const handleSubmitDialog = async (
    startDay,
    finalDay,
    work,
    setShowWork,
    popAlert,
    setCreated
) => {
    const isRecurringWork = work.type === WorkTypes.RECURRING;
    if (isRecurringWork) {
        if (startDay.isAfter(finalDay, "day")) {
            popAlert(
                "Error, the start date must be before the end date",
                AlertSeverity.ERROR
            );
            return;
        }
    }

    const request = {
        startDate: isRecurringWork
            ? startDay.format("YYYY-MM-DD")
            : dayjs(work.startDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
        endDate: isRecurringWork
            ? finalDay.format("YYYY-MM-DD")
            : dayjs(work.endDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
        workName: work.name,
        supplierUsername: work.supplierUsername,
    };

    try {
        const response = await userPostulation(request);
        if (!response.ok) {
            const errorText = await response.text();
            popAlert(errorText, AlertSeverity.ERROR);
            return;
        }
        popAlert("Successful postulation!", AlertSeverity.SUCCESS);
        if (setCreated !== undefined) setCreated(request);
    } catch (e) {
        popAlert("A network error occurred.", AlertSeverity.ERROR);
        return;
    }

    setShowWork(false);
};

/**
 * Create the icon buttons of the actions on the postulation
 *
 * @param {*} setPageModal function to set de actual modal page
 * @param {*} isRecurringWork boolean that indicates if the actual work is recurring
 * @returns A component that contains the actions on the postulations
 */
const ActionsComponent = ({ setPageModal, isRecurringWork }) => {
    return [
        <Grid sx={{ display: "flex" }}>
            <Tooltip
                title={
                    isRecurringWork
                        ? "Edit postulation"
                        : "Cannot edit a session type work"
                }
            >
                <Typography variant="subtitle2">
                    <IconButton
                        disabled={isRecurringWork ? false : true}
                        color="warning"
                        onClick={(_) => setPageModal(2)}
                    >
                        <i className="bi bi-pencil" />
                    </IconButton>
                </Typography>
            </Tooltip>
            <Tooltip title="Cancel postulation">
                <IconButton color="error" onClick={(_) => setPageModal(3)}>
                    <i className="bi bi-x-circle" />
                </IconButton>
            </Tooltip>
        </Grid>,
    ];
};

/**
 * Component that contains the fields of a form with the details of a work
 *
 * @param {*} label field label
 * @param {*} value field value
 * @param {*} pad boolean, true for padding, false otherwise
 * @param {*} personalizedWidth custom width, 6 by default
 * @returns A component that contains the fields of a form with the details of a work
 */
const WorkField = ({ label, value, pad, personalizedWidth = 6 }) => (
    <Grid
        item
        xs={personalizedWidth}
        style={pad ? { paddingLeft: "30px" } : {}}
    >
        <InputLabel style={{ color: "inherit" }}>{label}</InputLabel>
        <TextField
            value={value}
            InputProps={{ readOnly: true }}
            multiline
            fullWidth
            variant="standard"
        />
    </Grid>
);

/**
 * Function that displays work information
 *
 * @param {*} work work's information to show
 * @param {*} postulate indicates if the user can to postulate
 * @param {*} setPageModal function that set the modal's actual page
 * @param {*} setShowWork  function that open and close de work's modal
 * @returns The fields that contain the information of the work
 */
const InfoWork = ({ work }) => {
    if (!work) {
        return (
            <>
                <Skeleton variant="rectangle" />
            </>
        );
    }

    return (
        <>
            <Grid container rowSpacing={3}>
                <WorkField
                    label="Description"
                    value={work.description}
                    personalizedWidth={12}
                />
                <WorkField
                    label="Supplier Name"
                    value={work.supplierName}
                    personalizedWidth={12}
                />
                <WorkField label="Type of Work" value={work.type} />
                <WorkField
                    label="Number of volunteers required"
                    value={work.volunteersNeeded}
                    pad
                />
                <WorkField label="Start date" value={work.startDate} />
                <WorkField label="End date" value={work.endDate} pad />
                <WorkHourSelector
                    readonly={true}
                    hourBlocks={work.hours.map((w) => {
                        return {
                            hourBlock: dayjs(w.hourBlock, "HH:00:00"),
                            weekDay:
                                w.weekDay === -1
                                    ? dayjs(work.startDate, "DD-MM-YYYY").day()
                                    : w.weekDay,
                        };
                    })}
                />
                <Grid item xs={12}>
                    <InputLabel style={{ color: "inherit" }}>
                        {"Tags"}
                    </InputLabel>
                    <TextField
                        variant="standard"
                        InputProps={{
                            startAdornment: (
                                <div
                                    style={{
                                        display: "inline-flex",
                                    }}
                                >
                                    {work.tags.map((tag, index) => (
                                        <Chip
                                            key={index}
                                            label={tag}
                                            variant="outlines"
                                            style={{
                                                marginRight: 5,
                                                fontSize: 17,
                                            }}
                                        />
                                    ))}
                                </div>
                            ),
                            readOnly: true,
                        }}
                        value=""
                        multiline
                        fullWidth
                    />
                </Grid>
            </Grid>
        </>
    );
};

/**
 * Create the buttons of the work information modal
 * 
 * @param {*} postulate boolean indicating if the user can postulate
 * @param {*} isPostulated boolean that indicates if the user is postulated
 * @param {*} workType work's type
 * @param {*} setPageModal function that modifies the current page of the modal
 * @param {*} setShowWork function that modifies the current page of the modal
 * @returns The buttons of the work information modal
 */
const InfoWorkButtons = ({
    postulate,
    isPostulated,
    workType,
    setPageModal,
    setShowWork,
}) => {
    return (
        <>
            <Grid sx={{ p: 2 }}>
                <Button onClick={(_) => setShowWork(false)}>
                    <Typography>Close</Typography>
                </Button>
                {postulate && !isPostulated && (
                    <Button
                        onClick={(_) => {
                            workType === WorkTypes.RECURRING
                                ? setPageModal(1)
                                : setPageModal(2);
                        }}
                    >
                        <Typography>Postulate</Typography>
                    </Button>
                )}
                {postulate && isPostulated && (
                    <Button onClick={(_) => setPageModal(1)}>
                        <Typography>View postulation</Typography>
                    </Button>
                )}
            </Grid>
        </>
    );
};

/**
 * Function that provides the functionality to postulate
 *
 * @param {*} startDay start date proposed
 * @param {*} setStartDay function to set the start date proposed
 * @param {*} finalDay end date proposed
 * @param {*} setFinalDay function to set the end date proposed
 * @param {*} setPageModal function that set the modal's actual page
 * @param {*} setShowWork  function that open and close de work's modal
 * @returns The fields to be filled with the proposed dates
 */
const CreatePostulation = ({
    work,
    startDay,
    setStartDay,
    finalDay,
    setFinalDay,
}) => {
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
            <Grid container rowSpacing={3}>
                <Grid item xs={12}>
                    <Typography>
                        Select your proposed start and end date
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <DatePicker
                                    format="DD-MM-YYYY"
                                    label="Starting day"
                                    value={startDay}
                                    onChange={(newDay) => setStartDay(newDay)}
                                    shouldDisableDate={disableDays}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    format="DD-MM-YYYY"
                                    label="Final day"
                                    value={finalDay}
                                    onChange={(newDay) => setFinalDay(newDay)}
                                    shouldDisableDate={disableDays}
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </Grid>
            </Grid>
        </>
    );
};

/**
 * Create the buttons of the create postulation modal
 * 
 * @param {*} setPageModal function that modifies the current page of the modal
 * @param {*} setShowWork function that modifies the current page of the modal
 * @returns The buttons of the create postulation modal
 */
const CreatePostulationButtons = ({ setPageModal, setShowWork }) => {
    return (
        <>
            <Grid container columns={2} sx={{ p: 2 }}>
                <Grid item xs={1}>
                    <Button onClick={(_) => setPageModal(0)}>
                        <Typography>Back</Typography>
                    </Button>
                </Grid>
                <Grid
                    item
                    xs={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row-reverse",
                    }}
                >
                    <Button onClick={(_) => setPageModal(2)}>
                        <Typography>Next</Typography>
                    </Button>
                    <Button
                        className="cancel-button-contained"
                        varian="contained"
                        onClick={(_) => setShowWork(false)}
                    >
                        <Typography>Cancel</Typography>
                    </Button>
                </Grid>
            </Grid>
        </>
    );
};

/**
 * Allows you to submit a postulation
 *
 * @param {*} isRecurringWork indicates if the work's postulation is recurring
 * @param {*} startDay start date proposed
 * @param {*} finalDay end date proposed
 * @param {*} work work's postulation
 * @param {*} pageModal modal's actual page
 * @param {*} setPageModal function that set the modal's actual page
 * @param {*} setShowWork function that open and close de work's modal
 * @param {*} popAlert function that display an alert
 * @param {*} handleSubmitDialog function to fetch the postulation
 * @returns Texts and buttons that allow submitting the postulation
 */
const SubmitPostulation = () => {
    return (
        <>
            <Grid>
                <Typography>Are you sure you want to postulate?</Typography>
            </Grid>
        </>
    );
};

/**
 * Create the buttons of the postulation submission message modal
 * 
 * @param {*} startDay proposed start date
 * @param {*} finalDay proposed end date
 * @param {*} work work to which the postulation will be sent
 * @param {*} pageModal actual page modal
 * @param {*} setPageModal function that changes the actual page modal
 * @param {*} setShowWork function that closes de modal
 * @param {*} popAlert pop alerter
 * @param {*} handleSubmitDialog function to send the postulation
 * @param {*} setCreated function that modifies the last postulation created
 * @returns The buttons of the postulation submission message modal
 */
const SubmitPostulationButtons = ({
    startDay,
    finalDay,
    work,
    pageModal,
    setPageModal,
    setShowWork,
    popAlert,
    handleSubmitDialog,
    setCreated,
}) => {
    return (
        <>
            <Grid container columns={2} sx={{ p: 2 }}>
                <Grid item xs={1}>
                    <Button
                        onClick={(_) => {
                            work.type === WorkTypes.RECURRING
                                ? setPageModal(pageModal - 1)
                                : setPageModal(0);
                        }}
                    >
                        <Typography>Back</Typography>
                    </Button>
                </Grid>
                <Grid
                    item
                    xs={1}
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
                                work,
                                setShowWork,
                                popAlert,
                                setCreated
                            )
                        }
                    >
                        <Typography>Submit</Typography>
                    </Button>
                    <Button
                        className="cancel-button-contained"
                        variant="contained"
                        onClick={(_) => setShowWork(false)}
                    >
                        <Typography>Cancel</Typography>
                    </Button>
                </Grid>
            </Grid>
        </>
    );
};

/**
 * Create the components to display an application and the buttons to edit it
 * 
 * @param {*} postulation postulation that will be handled
 * @param {*} isRecurringWork boolean that indicates is de postulation work is recurring
 * @param {*} setPageModal function that changes the current page of the modal
 * @returns The components to display an application and the buttons to edit it
 */
const HandlePostulation = ({ postulation, isRecurringWork, setPageModal }) => {
    return (
        <>
            <Grid container rowSpacing={3}>
                <WorkField
                    label="Status"
                    value={postulation.status}
                    personalizedWidth={12}
                />
                <WorkField label="Start date" value={postulation.startDate} />
                <WorkField label="End date" value={postulation.endDate} pad />
            </Grid>
            {postulation.status === PostulationStatus.PENDING && (
                <Box
                    sx={{
                        marginTop: 4,
                        display: "flex",
                        flexDirection: "row-reverse",
                    }}
                >
                    <ActionsComponent
                        setPageModal={setPageModal}
                        isRecurringWork={isRecurringWork}
                    />
                </Box>
            )}
        </>
    );
};

/**
 * Create the buttons of the postulation handling modal
 * 
 * @param {*} setPageModal function that changes the current page of the modal
 * @param {*} setShowWork function that closes de modal
 * @returns The buttons of the postulation handling modal
 */
const HandlePostulationButtons = ({ setPageModal, setShowWork }) => {
    return (
        <Grid container columns={2} sx={{ p: 2 }}>
            <Grid item xs={1}>
                <Button onClick={(_) => setPageModal(0)}>
                    <Typography>Back</Typography>
                </Button>
            </Grid>
            <Grid
                item
                xs={1}
                sx={{
                    display: "flex",
                    flexDirection: "row-reverse",
                }}
            >
                <Button onClick={(_) => setShowWork(false)}>
                    <Typography>Close</Typography>
                </Button>
            </Grid>
        </Grid>
    );
};

/**
 * Create the modal that show the information, postulation and handle postulation of a work
 * 
 * @param {*} work work to be showed
 * @param {*} showWork boolean that indicates true if the modal is open
 * @param {*} setShowWork function that closes the modal
 * @param {*} postulate boolean that indicates true if the user can postulate
 * @param {*} setPostulationChanged function to do if the work postulation if changed
 * @returns The modal that show the information, postulation and handle postulation of a work
 */
const WorkModal = ({
    work,
    showWork,
    setShowWork,
    postulate = false,
    setPostulationChanged = undefined,
}) => {
    const [startDay, setStartDay] = useState(dayjs()); // Initial day of the postulation proposal
    const [finalDay, setFinalDay] = useState(dayjs()); // Final day of the postulation proposal
    const [pageModal, setPageModal] = useState(0); // Modal actual page
    const [postulation, setPostulation] = useState({}); // Work's postulation (if its exists)
    const { popAlert } = useGlobalAlert();

    useEffect(() => {
        if (work.isPostulated && postulate)
            fetchWorkPostulation(work.id, setPostulation, popAlert);
    }, []);

    return (
        <>
            <Dialog
                open={showWork}
                onClose={(_) => setShowWork(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{work.name}</DialogTitle>
                <DialogContent>
                    <Box>
                        {pageModal === 0 && <InfoWork work={work} />}
                        {pageModal === 1 && !work.isPostulated && (
                            <CreatePostulation
                                work={work}
                                startDay={startDay}
                                setStartDay={setStartDay}
                                finalDay={finalDay}
                                setFinalDay={setFinalDay}
                            />
                        )}
                        {pageModal === 2 && !work.isPostulated && (
                            <SubmitPostulation />
                        )}
                        {pageModal === 1 && work.isPostulated && (
                            <HandlePostulation
                                postulation={postulation}
                                isRecurringWork={
                                    work.type === WorkTypes.RECURRING
                                }
                                setPageModal={setPageModal}
                            />
                        )}
                        {pageModal === 2 && work.isPostulated && (
                            <EditPostulationModal
                                postulation={postulation}
                                work={work}
                                setEditPostulation={setShowWork}
                                setPageModal={setPageModal}
                                onEdited={setPostulationChanged}
                            />
                        )}
                        {pageModal === 3 && work.isPostulated && (
                            <CancelPostulationModal
                                postulation={postulation}
                                work={work}
                                setCancelPostulation={setShowWork}
                                setPageModal={setPageModal}
                                onCanceled={setPostulationChanged}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    {pageModal === 0 && (
                        <InfoWorkButtons
                            postulate={postulate}
                            isPostulated={work.isPostulated}
                            workType={work.type}
                            setPageModal={setPageModal}
                            setShowWork={setShowWork}
                        />
                    )}
                    {pageModal === 1 && !work.isPostulated && (
                        <CreatePostulationButtons
                            setPageModal={setPageModal}
                            setShowWork={setShowWork}
                        />
                    )}
                    {pageModal === 2 && !work.isPostulated && (
                        <SubmitPostulationButtons
                            startDay={startDay}
                            finalDay={finalDay}
                            work={work}
                            pageModal={pageModal}
                            setPageModal={setPageModal}
                            setShowWork={setShowWork}
                            popAlert={popAlert}
                            handleSubmitDialog={handleSubmitDialog}
                            setCreated={setPostulationChanged}
                        />
                    )}
                    {pageModal === 1 && work.isPostulated && (
                        <HandlePostulationButtons
                            setPageModal={setPageModal}
                            setShowWork={setShowWork}
                        />
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};
export default WorkModal;

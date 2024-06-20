import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
    Grid,
    Dialog,
    InputLabel,
    TextField,
    DialogTitle,
    DialogContent,
    Button,
    Chip,
    Box,
    Typography,
    IconButton,
    Skeleton,
} from "@mui/material";
import WorkHourSelector from "../../../components/common/WorkHourSelector";
import WorkTypes from "../../../utils/constants/WorkTypes";
import WorkSessionStatus from "../../../utils/constants/WorkSessionStatus";
import { getWorkFromSession } from "../../../utils/fetchs/ApiFetchesVolunteer";
import { useGlobalAlert } from "../../../hooks/useGlobalAlert";
import { AlertSeverity } from "../../../context/AlertProvider";

/**
 * Does the fetch to get the work of a session
 * 
 * @param {*} sessionid session's id
 * @param {*} setWork function to set the actual work
 * @param {*} popAlert function that displays the messages about the fetch
 */
const fetchWorkFromSession = async (sessionid, setWork, popAlert) => {
    try {
        const response = await getWorkFromSession(sessionid);
        if (!response.ok) {
            const errorText = await response.text();
            popAlert(errorText, AlertSeverity.ERROR);
            return;
        }
        const work = await response.json();
        setWork(work);
    } catch (e) {
        popAlert("A network error occurred.", AlertSeverity.ERROR);
        return;
    }
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
            variant="standard"
            multiline
            fullWidth
        />
    </Grid>
);

/**
     * Determines the color of the edge of the chip that shows the status
     * depending on it, green for accepted, red for rejected and gray for pending
     * @returns The chip's border color
     */
const borderColorChip = (session) => {
    switch (session.status) {
        case WorkSessionStatus.ACCEPTED:
            return "#2e7d32";
        case WorkSessionStatus.REJECTED:
            return "#d32f2f";
        default:
            return "#616161";
    }
};

/**
 * Determines the backgorund color of the chip that shows the status
 * depending on it, green for accepted, red for rejected and gray for pending
 * @returns The chip's background color
 */
const backgroundColorChip = (session) => {
    switch (session.status) {
        case WorkSessionStatus.ACCEPTED:
            return "#2e7d3226";
        case WorkSessionStatus.REJECTED:
            return "#d32f2f26";
        default:
            return "#61616126";
    }
};

/**
 * Determines the font color of the chip that shows the status depending
 * on it, green for accepted, red for rejected and gray for pending
 * @returns The chip's font color
 */
const fontColor = (session) => {
    switch (session.status) {
        case WorkSessionStatus.ACCEPTED:
            return "#2e7d32";
        case WorkSessionStatus.REJECTED:
            return "#d32f2f";
        default:
            return "#616161";
    }
};

/**
 * Function that creates a component to display the status of a session
 * 
 * @param {*} session session whose status will be displayed
 * @param {*} setShowSession function that opens and closes the modal that 
 *            shows the state of the session
 * @returns Component that shows the status of the session
 */
const SessionStatus = ({ session, setShowSession }) => {
    return (
        <>
            <Grid container columns={2}>
                <Grid item xs={1}>
                    <Typography variant="h6">Session date: </Typography>
                    <Typography variant="subtitle1">
                        {session.date}
                    </Typography>
                </Grid>
                <Grid item xs={1}>
                    <Typography variant="h6">Session hour: </Typography>
                    <Typography variant="subtitle1">{session.time}</Typography>
                </Grid>
            </Grid>
            <Typography></Typography>
            <Typography variant="h6" sx={{ marginTop: 2 }}>
                {"Status:  "}
                <Chip
                    label={session.status}
                    sx={{
                        fontWeight: "600",
                        padding: 1,
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderColor: borderColorChip(session),
                        backgroundColor: backgroundColorChip(session),
                        color: fontColor(session),
                    }}
                />
            </Typography>
            <Box
                sx={{
                    marginTop: 4,
                    display: "flex",
                    flexDirection: "row-reverse",
                }}
            >
                <Button onClick={(_) => setShowSession(false)}>
                    <Typography>Close</Typography>
                </Button>
            </Box>
        </>
    );
};

/**
 * Function that displays work information
 *
 * @param {*} work work's information to show
 * @param {*} type work's type
 * @param {*} postulation indicates if the user can to postulate
 * @param {*} isRecurringWork indicates if the work is recurring
 * @param {*} setPageModal function that set the modal's actual page
 * @param {*} setShowWork  function that open and close de work's modal
 * @returns The fields that contain the information of the work
 */
const WorkInfo = ({ work, setPageModal, setShowWork }) => {
    if (!work) {
        return (
            <>
                <Skeleton />
                <Skeleton variant="rectangular" height={200} />
                <Box display="flex">
                    <Skeleton width={200} />
                    <Skeleton width={200} />
                </Box>
                <Grid
                    sx={{
                        marginTop: 4,
                        display: "flex",
                        flexDirection: "row-reverse",
                    }}
                >
                    <Button onClick={(_) => setShowWork(false)}>
                        <Typography>Close</Typography>
                    </Button>
                    <Button onClick={(_) => setPageModal(0)}>
                        <Typography>Back</Typography>
                    </Button>
                </Grid>
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
                <WorkField
                    label="Type of Work"
                    value={
                        work.type === WorkTypes.RECURRING
                            ? "Recurring"
                            : "Session"
                    }
                />
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
            <Grid
                sx={{
                    marginTop: 4,
                    display: "flex",
                    flexDirection: "row-reverse",
                }}
            >
                <Button onClick={(_) => setShowWork(false)}>
                    <Typography>Close</Typography>
                </Button>
                <Button onClick={(_) => setPageModal(0)}>
                    <Typography>Back</Typography>
                </Button>
            </Grid>
        </>
    );
};

/**
 * Create the modal tho show the session work following
 * 
 * @param {*} session session to be followed
 * @param {*} showSession boolean that indicates true if the modal is open
 * @param {*} setShowSession function that closes the modal
 * @returnsthe The modal tho show the session work following
 */
const FollowSessionModal = ({ session, showSession, setShowSession }) => {
    const [pageModal, setPageModal] = useState(0);
    const [work, setWork] = useState({});
    const { popAlert } = useGlobalAlert();

    useEffect(() => {
        fetchWorkFromSession(session.id, setWork, popAlert);
    }, []);

    return (
        <>
            <Dialog
                open={showSession}
                onClose={(_) => setShowSession(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    <Grid container columns={10}>
                        <Grid item xs={pageModal === 0 ? 9 : 10}>
                            {session.workName}
                        </Grid>
                        {pageModal === 0 && (
                            <Grid item xs={1}>
                                <IconButton
                                    aria-label="info"
                                    color="primary"
                                    onClick={(_) => setPageModal(1)}
                                    size="large"
                                >
                                    <i className="bi bi-info-circle"></i>
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Box>
                        {pageModal === 0 && (
                            <SessionStatus
                                session={session}
                                setShowSession={setShowSession}
                            />
                        )}
                        {pageModal === 1 && (
                            <WorkInfo
                                work={work}
                                setPageModal={setPageModal}
                                setShowWork={setShowSession}
                            />
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default FollowSessionModal;

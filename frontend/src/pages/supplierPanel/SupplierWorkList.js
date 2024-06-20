import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Divider,
    IconButton,
    Badge,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tab,
    Tabs,
    Typography,
    Grid,
    TextField,
    Tooltip,
    InputLabel,
} from "@mui/material";
import {
    ThemeProvider,
    createTheme,
    responsiveFontSizes,
} from "@mui/material/styles";
import ModalJob from "./CreateEditWorkModal";
import { useState } from "react";
import { deleteSupplierWork } from "../../utils/fetchs/ApiFetchesSupplier";
import { useGlobalAlert } from "../../hooks/useGlobalAlert";
import useAuth from "../../hooks/useAuth";
import WorkTypes from "../../utils/constants/WorkTypes";
import WorkHourSelector from "../../components/common/WorkHourSelector";
import dayjs from "dayjs";
import TagSelector from "../../components/common/TagSelector";
import VolunteersManagementTab from "./VolunteersManagementTab";
import PostulationsTab from "./PostulationsTab";
import { fetchVolunteers } from "./VolunteersManagementTab";
import { fetchPostulations } from "./PostulationsTab";

/**
 * Configures a block's worklist item with its show, edit and delete modals
 *
 * @param {*} work work list item
 * @param {*} pos work position in the list
 * @param {*} workListItemProps work's propertys
 * @returns A worklist item with its show, edit and delete modals
 */
const WorkListItem = (work, pos, workListItemProps, onRefresh = undefined) => {
    const {
        removeWork,
        setRemoveWork,
        removingTry,
        setRemovingTry,
        editingWork,
        setEditingWork,
        showWork,
        setShowWork,
        popAlert,
        workSelected,
        setWorkSelected,
        tabValue,
        setTabValue,
        currentDate,
        dateBlock,
        hourBlock,
        postulations,
        setPostulations,
        volunteers,
        setVolunteers,
    } = workListItemProps;

    /**
     * Component of a spinner that is used to show the progress of
     * elimination
     * @returns A spinner that shows the progress of elimination
     */
    const removeWorkSpinner = () => {
        return (
            <Backdrop open={true}>
                <CircularProgress />
            </Backdrop>
        );
    };

    /**
     * Request to delete a work
     *
     * @param {*} work work to eliminate
     */
    const handleDelete = async (work) => {
        setRemovingTry(true);
        try {
            const response = await deleteSupplierWork({
                name: work.name,
            });

            setRemovingTry(false);
            if (!response.ok) {
                popAlert(
                    "There was a problem deleting the work. Please try again.",
                    "error"
                );
                return;
            }

            popAlert("Work removed successfully!.", "success");
            setRemoveWork(false);
            window.location.reload();
        } catch (error) {
            setRemovingTry(false);
            popAlert(
                "There was a problem connecting with the server. Please try again.",
                "error"
            );
        }
    };

    /**
     * Creating the modal to delete a work
     *
     * @param {*} work work to eliminate
     * @returns The dialog component that allows you to delete a work
     */
    const removeWorkModal = (work) => {
        return (
            <>
                <Dialog open={removeWork} onClose={(_) => setRemoveWork(false)}>
                    <DialogTitle>
                        Are you sure that you want to delete this work?
                    </DialogTitle>
                    <DialogContent>
                        <Typography sx={{ pb: 4 }}>
                            {`It seems tha you are trying to delete the work: "${work.name}".\n
                        Are you sure?`}
                        </Typography>
                        <Box display="flex" flexDirection="row-reverse">
                            <Button
                                variant="contained"
                                onClick={(_) => setRemoveWork(false)}
                            >
                                <Typography>Cancel</Typography>
                            </Button>
                            <Box sx={{ pr: 1 }}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#f44336",
                                        ":hover": {
                                            backgroundColor: "red",
                                        },
                                    }}
                                    onClick={(_) => handleDelete(work)}
                                >
                                    <Typography>Delete</Typography>
                                </Button>
                            </Box>
                        </Box>
                    </DialogContent>
                    {removingTry && removeWorkSpinner()}
                </Dialog>
            </>
        );
    };

    /**
     * Creating the modal to edit a work
     *
     * @param {*} work work to edit
     * @returns The dialog component that allows you to edit a work
     */
    const editWorkModal = (work) => {
        return (
            <ModalJob
                open={editingWork}
                setOpen={setEditingWork}
                create={false}
                data={work}
                dateAndHour={{
                    hourBlock: hourBlock,
                    dateBlock: dateBlock,
                    workId: work.id,
                }}
                onVolunteerChange={() => {
                    if (onRefresh !== undefined) onRefresh();
                }}
                onPostulationChange={() => {
                    if (onRefresh !== undefined) onRefresh();
                }}
            />
        );
    };

    /**
     * Creating the modal to show a work
     *
     * @param {*} work work to show
     * @returns The dialog component that allows you to show a work
     */
    const showWorkModal = (work) => {
        const isRecurringWork = work.type === WorkTypes.RECURRING;
        const type = isRecurringWork ? "Recurring" : "Session";
        const endDate = dayjs(work.endDate, "DD-MM-YYYY");

        const handleTabsChange = (event, newValue) => {
            setTabValue(newValue);
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
                    <DialogTitle style={{ marginBottom: "10px" }}>
                        {work.name}
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                            <Tabs value={tabValue} onChange={handleTabsChange}>
                                <Tab label="Show Work" />
                                <Tab label="Volunteers Session" />
                                <Tab label="New Postulations" />
                            </Tabs>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        {tabValue === 0 && (
                            <Grid container rowSpacing={3} sx={{ pt: 1 }}>
                                <WorkField
                                    label="Description"
                                    value={work.description}
                                    personalizedWidth={12}
                                />

                                <WorkField label="Type of Work" value={type} />
                                <WorkField
                                    label="Number of volunteers required"
                                    value={work.volunteersNeeded}
                                    pad
                                />

                                <WorkField
                                    label="Start day"
                                    value={work.startDate}
                                />
                                <WorkField
                                    label="End date"
                                    value={work.endDate}
                                    pad
                                />

                                <WorkHourSelector
                                    readonly={true}
                                    hourBlocks={work.hours.map((w) => {
                                        return {
                                            hourBlock: dayjs(
                                                w.hourBlock,
                                                "HH:00:00"
                                            ),
                                            weekDay:
                                                w.weekDay === -1
                                                    ? dayjs(
                                                          work.startDate,
                                                          "DD-MM-YYYY"
                                                      ).day()
                                                    : w.weekDay,
                                        };
                                    })}
                                />

                                <Grid item xs={12}>
                                    <TagSelector
                                        readOnly={true}
                                        value={work.tags.map((t) => {
                                            return { tag: t };
                                        })}
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {tabValue === 1 && (
                            <div>
                                <VolunteersManagementTab
                                    volunteers={volunteers}
                                    workData={{
                                        workId: work.id,
                                        dateBlock: dateBlock,
                                        hourBlock: hourBlock,
                                        setVolunteers: setVolunteers,
                                    }}
                                    onVolunteerChange={() => {
                                        if (onRefresh !== undefined)
                                            onRefresh();
                                    }}
                                />
                            </div>
                        )}

                        {tabValue === 2 && (
                            <div>
                                <PostulationsTab
                                    postulations={postulations}
                                    isBeforeDate={endDate.isBefore(currentDate)}
                                    workData={{
                                        workId: work.id,
                                        dateBlock: dateBlock,
                                        hourBlock: hourBlock,
                                        setVolunteers: setVolunteers,
                                        setPostulations: setPostulations,
                                    }}
                                    onPostulationChange={() => {
                                        if (onRefresh !== undefined)
                                            onRefresh();
                                    }}
                                />
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={(_) => setShowWork(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    };

    return (
        <>
            {editingWork && workSelected === pos && editWorkModal(work)}
            {removeWork && workSelected === pos && removeWorkModal(work)}
            {showWork && workSelected === pos && showWorkModal(work)}
            <ListItem
                disablePadding
                divider
                sx={{
                    backgroundColor: pos % 2 === 1 ? "whitesmoke" : "",
                    ":hover": {
                        backgroundColor: "lightgray",
                    },
                }}
            >
                <Box
                    display="flex"
                    width="100%"
                    justifyContent="left"
                    flexDirection="row"
                >
                    <Tooltip title={"Show work details"} arrow>
                        <ListItemButton
                            onClick={(_) => {
                                setWorkSelected(pos);
                                fetchPostulations(
                                    work.id,
                                    popAlert,
                                    setPostulations
                                );
                                fetchVolunteers(
                                    work.id,
                                    dateBlock,
                                    hourBlock,
                                    popAlert,
                                    setVolunteers
                                );
                                setTabValue(0);
                                setShowWork(true);
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: "20px",
                                    width: "20px",
                                    display: "block",
                                    color: "black",
                                }}
                            >
                                <i className="bi bi-clipboard" />
                            </ListItemIcon>
                            <ListItemText>{work.name}</ListItemText>
                        </ListItemButton>
                    </Tooltip>
                    <Tooltip title={"Show new postulations"} arrow>
                        <IconButton
                            onClick={(_) => {
                                setWorkSelected(pos);
                                fetchPostulations(
                                    work.id,
                                    popAlert,
                                    setPostulations
                                );
                                fetchVolunteers(
                                    work.id,
                                    dateBlock,
                                    hourBlock,
                                    popAlert,
                                    setVolunteers
                                );
                                setTabValue(2);
                                setShowWork(true);
                            }}
                        >
                            <Badge
                                color="error"
                                badgeContent={work.pendingPostulationsCount}
                                max={15}
                            >
                                <i className="bi bi-person-fill" />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"Edit work"} arrow>
                        <IconButton
                            onClick={(_) => {
                                setWorkSelected(pos);
                                setEditingWork(true);
                            }}
                        >
                            <i className="bi bi-pencil" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"Remove work"} arrow>
                        <IconButton
                            onClick={(_) => {
                                setWorkSelected(pos);
                                setRemoveWork(true);
                            }}
                        >
                            <i className="bi bi-trash" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </ListItem>
        </>
    );
};

const SupplierWorkList = ({
    title = "Supplier Work List",
    data,
    dateAndHour,
    onRefresh = undefined,
}) => {
    const works = data;
    let theme = createTheme();
    theme = responsiveFontSizes(theme);
    const currentDate = dayjs();

    const [removeWork, setRemoveWork] = useState(false); // Visualization of the remove work modal
    const [removingTry, setRemovingTry] = useState(false); // Attempt to delete a work
    const [editingWork, setEditingWork] = useState(false); // Visualization of the edit work modal
    const [showWork, setShowWork] = useState(false); // Visualization of the show work modal
    const [workSelected, setWorkSelected] = useState(-1); // Work selected
    const [tabValue, setTabValue] = useState(0);
    const [postulations, setPostulations] = useState(undefined);
    const [volunteers, setVolunteers] = useState(undefined);

    const { popAlert } = useGlobalAlert();
    const { auth } = useAuth();

    const dateBlock = dateAndHour?.dateBlock;
    const hourBlock = dateAndHour?.hourBlock;

    // Properties of a work in a work list
    const workListItemProps = {
        removeWork,
        setRemoveWork,
        removingTry,
        setRemovingTry,
        editingWork,
        setEditingWork,
        showWork,
        setShowWork,
        popAlert,
        auth,
        workSelected,
        setWorkSelected,
        tabValue,
        setTabValue,
        currentDate,
        dateBlock,
        hourBlock,
        postulations,
        setPostulations,
        volunteers,
        setVolunteers,
    };

    return (
        <>
            <Container sx={{ maxHeight: "695.016px", overflowY: "scroll" }}>
                <ThemeProvider theme={theme}>
                    <Typography noWrap align="left" sx={{ fontWeight: "bold" }}>
                        {title}
                    </Typography>
                </ThemeProvider>
                <Divider />
                <List>
                    {works.map((w, i) =>
                        WorkListItem(w, i, workListItemProps, onRefresh)
                    )}
                </List>
            </Container>
        </>
    );
};

export default SupplierWorkList;

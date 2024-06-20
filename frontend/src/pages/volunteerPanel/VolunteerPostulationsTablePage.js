import { useState, useEffect } from "react";
import {
    Box,
    Grid,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";
import PageNavbar from "../../components/common/PageNavbar";
import TableFilter from "../../components/userTable/TableFilter";
import PostulationTable from "../../components/postulationTable/PostulationTable";
import WorkModal from "./components/WorkModal";
import TableActionsComponents from "../../components/common/TableActionsComponents";
import EditPostulationModal from "./components/EditPostulationModal";
import CancelPostulationModal from "./components/CancelPostulationModal";
import { UserLogoutButton } from "../../components/common/LogoutButtons";

// Navigation
import { useLocation, useNavigate } from "react-router-dom";

// Fetch
import { getUserPostulations } from "../../utils/fetchs/ApiFetchesVolunteer";

// Alert
import { useGlobalAlert } from "../../hooks/useGlobalAlert";

// style
import "../../styles/Panel.css";
import PageRoutes from "../../utils/constants/Routes";
import { AlertSeverity } from "../../context/AlertProvider";

// Columns of the postulations table
const columns = [
    "Name",
    "Supplier username",
    "Start date",
    "End date",
    "Status",
    "Actions",
];

const columnsToFilter = [columns[0], columns[1], columns[4]];

/**
 * Does the fetch to get the user's postulations by pages of a table
 * 
 * @param {*} page current page of the table
 * @param {*} pageSize current page size
 * @param {*} setPostulations function that establishes the postulations obtained
 * @param {*} setFilteredRows function that establishes the filtered postulations obtained
 * @param {*} popAlert function that displays the messages about the fetch
 * @param {*} createActionsComponent function that creates the buttons for viewing 
 *            postulation's work, editing and canceling an postulation
 */
const fetchPostulations = async (
    page,
    pageSize,
    setPostulations,
    setFilteredRows,
    popAlert,
    createActionsComponent
) => {
    try {
        const response = await getUserPostulations(page, pageSize);
        if (!response.ok) {
            const errorText = await response.text();
            popAlert(errorText, AlertSeverity.ERROR);
            return;
        }
        const allPostulations = await response.json();
        const postulationList = allPostulations.map((r) => {
            return {
                workName: r.work.name,
                supplierUsername: r.work.supplierUsername,
                startDate: r.startDate,
                endDate: r.endDate,
                status: r.status,
                work: r.work,
                actions: (
                    <TableActionsComponents
                        iconButtons={createActionsComponent(r)}
                    />
                ),
            };
        });

        setPostulations(postulationList);
        setFilteredRows(postulationList);
    } catch (e) {
        popAlert("A network error occurred.", AlertSeverity.ERROR);
        return;
    }
};

/**
 * Create the page that contains the postulations table of the volunteer
 * 
 * @returns The page that contains the postulations table of the volunteer
 */
const VolunteerPostulationsTablePage = () => {
    const [show, setShow] = useState(false); // Open/close sisualization of the work of a postulation modal
    const [edit, setEdit] = useState(false); // Open/close edit postulation modal
    const [cancel, setCancel] = useState(false); //Open/close cancel postulation modal
    const [postulation, setPostulation] = useState({}); // Postulation selected
    const [postulations, setPostulations] = useState([]); // Postulations by pages
    const [filteredRows, setFilteredRows] = useState(postulations); // Postulations filtered
    const [page, setPage] = useState(0); // Actual table's page
    const [pageSize, setPageSize] = useState(5); // Actual table's page size

    const navigate = useNavigate();
    const location = useLocation();
    const { popAlert } = useGlobalAlert();

    /**
     * Management of the visualization of the application work
     *
     * @param {*} postulation postulation's work to show
     */
    const showWorkPostulation = (postulation) => {
        setPostulation(postulation);
        setShow(true);
    };

    /**
     * Postulation modify management
     *
     * @param {*} postulation postulation to edit
     */
    const modifyPostulation = (postulation) => {
        setPostulation(postulation);
        setEdit(true);
    };

    /**
     * Postulation cancel management
     *
     * @param {*} name work's name
     */
    const handleCancelPostulation = (postulation) => {
        setPostulation(postulation);
        setCancel(true);
    };

    /**
     * Create the icon buttons of the actions on the postulation
     *
     * @param {*} postulation postulation to whom the actions will be performed
     * @returns A component that contains the actions on the users
     */
    const createActionsComponent = (postulation) => {
        return [
            {
                title: "Work's information",
                onClick: () => showWorkPostulation(postulation),
                icon: "bi bi-info-circle",
            },
            {
                title: "Modify postulation",
                onClick: () => modifyPostulation(postulation),
                icon: "bi bi-pencil",
            },
            {
                title: "Cancel postulation",
                onClick: () => handleCancelPostulation(postulation),
                icon: "bi bi-x-circle",
            },
        ];
    };

    const handlePostulationChange = async () => {
        fetchPostulations(
            page,
            pageSize,
            setPostulations,
            setFilteredRows,
            popAlert,
            createActionsComponent
        );
    };
    // Load all the postulations
    useEffect(() => {
        handlePostulationChange();
    }, [page, pageSize]);

    return (
        <>
            {show && (
                <WorkModal
                    work={postulation.work}
                    showWork={show}
                    setShowWork={setShow}
                />
            )}
            {edit && (
                <Dialog
                    open={edit}
                    onClose={(_) => setEdit(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Edit Postulation</DialogTitle>
                    <DialogContent>
                        <EditPostulationModal
                            postulation={postulation}
                            work={postulation.work}
                            setEditPostulation={setEdit}
                            onEdited={handlePostulationChange}
                        />
                    </DialogContent>
                </Dialog>
            )}
            {cancel && (
                <Dialog
                    open={cancel}
                    onClose={(_) => setCancel(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Cancel Postulation</DialogTitle>
                    <DialogContent>
                        <CancelPostulationModal
                            postulation={postulation}
                            cancelPostulation={cancel}
                            setCancelPostulation={setCancel}
                            onCanceled={handlePostulationChange}
                        />
                    </DialogContent>
                </Dialog>
            )}
            <Box className="box-content">
                <PageNavbar
                    barTitle={"Volunteer"}
                    buttons={[
                        {
                            text: "Main Calendar",
                            onClick: () =>
                                navigate(PageRoutes.VOLUNTEER_PANEL, {
                                    state: { from: location },
                                    replace: true,
                                }),
                            endIcon: "bi bi-calendar-week",
                        },
                        {
                            text: "Work Sessions",
                            onClick: () =>
                                navigate(PageRoutes.VOLUNTEER_SESSIONS, {
                                    state: { from: location },
                                    replace: true,
                                }),
                            endIcon: "bi bi-bookmark-check-fill",
                        },
                    ]}
                    logout={<UserLogoutButton />}
                />
                <Box sx={{ p: 4 }}>
                    <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        paddingRight="1px"
                    >
                        <Typography variant="h5" className="welcome-text">
                            Postulation List
                        </Typography>
                    </Grid>
                    <Grid item md={12}>
                        <TableFilter
                            columns={columnsToFilter}
                            rows={postulations}
                            setFilteredRows={setFilteredRows}
                        />
                        <PostulationTable
                            filteredRows={filteredRows}
                            columns={columns}
                            postulations={postulations}
                            onPageChange={setPage}
                            onSizeChange={setPageSize}
                        />
                    </Grid>
                </Box>
            </Box>
        </>
    );
};

export default VolunteerPostulationsTablePage;

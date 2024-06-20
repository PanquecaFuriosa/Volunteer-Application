import React, { useState, useEffect } from "react";

import {
    Box,
    Button,
    IconButton,
    Tooltip,
    Grid,
    Typography,
} from "@mui/material";
import UserTable from "../../components/userTable/UserTable";
import {
    ModalUserCreate,
    ModalUserDelete,
    ModalUserResetPs,
    ModalUserSuspend,
} from "./AdminUserModals";
import {
    getAdminReports,
    getAdminUsers,
} from "../../utils/fetchs/ApiFetchesAdmin";

import { useGlobalAlert } from "../../hooks/useGlobalAlert";
import TableFilter from "../../components/userTable/TableFilter";
import UserRoles from "../../utils/constants/UserRoles";
import PageNavbar from "../../components/common/PageNavbar";
import { AdminLogoutButton } from "../../components/common/LogoutButtons";
import ReportGeneratorModal from "../../components/common/ReportGeneratorModal";
import ReportFormats from "../../utils/constants/ReportFormats";
import { AlertSeverity } from "../../context/AlertProvider";
import { ReportTypes } from "../../utils/constants/ReportTypes";

/**
 * Create user data
 *
 * @param {*} Username user's username
 * @param {*} Fullname user's fullname
 * @param {*} Birthdate user's birthdate
 * @param {*} Role user's role
 * @param {*} Tags user's tags
 * @param {*} Actions available actions on the user
 * @returns An object with the data of a user
 */
const createData = (Username, Fullname, Birthdate, Role, Tags, Actions) => {
    return { Username, Fullname, Birthdate, Role, Tags, Actions };
};

const columns = [
    "Username",
    "Fullname",
    "Birthdate",
    "Role",
    "Tags",
    "Actions",
];
const columnsToFilter = [columns[0], columns[1], columns[3]];

const AdministratorUserPanel = () => {
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [suspending, setSuspending] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [dataModal, setDataModal] = useState([]);

    const [users, setUsers] = useState([]);
    const [filteredRows, setFilteredRows] = useState(users);

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    const { popAlert } = useGlobalAlert();

    const [exporting, setExporting] = useState(false);

    /**
     * User creation management
     */
    const handleCreateUser = () => {
        setDataModal(null);
        setCreating(true);
    };

    /**
     * User modify management
     *
     * @param {*} user user to edit
     */
    const modifyUser = (user) => {
        setDataModal(user);
        setEditing(true);
    };

    /**
     * User remove management
     *
     * @param {*} userName user's username
     */
    const handleRemoveUser = (userName) => {
        setDataModal({ userName });
        setRemoving(true);
    };

    /**
     * User password change handling
     *
     * @param {*} userName user's username
     */
    const handleChangePassword = (userName) => {
        setDataModal({ userName });
        setGenerating(true);
    };

    /**
     * User suspension management
     *
     * @param {*} userName user's username
     * @param {*} suspended user's suspend state
     */
    const toggleLock = (userName, suspended) => {
        setDataModal({ userName, suspended });
        setSuspending(true);
    };

    /**
     * Create the component that contains the actions on the users
     *
     * @param {*} user user to whom the actions will be performed
     * @returns A component that contains the actions on the users
     */
    const createActionsComponent = ({ user }) => {
        return (
            <Grid container columns={4} spacing={1.5}>
                <Grid item xs={1} align="right">
                    <Tooltip title="Modify user" arrow>
                        <IconButton
                            color="primary"
                            onClick={() => modifyUser(user)}
                        >
                            <i className="bi bi-pencil"></i>
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid item xs={1} align="center">
                    <Tooltip
                        title={user.suspended ? "Resume user" : "Suspend user"}
                        arrow
                    >
                        <IconButton
                            color="primary"
                            onClick={() =>
                                toggleLock(user.userName, user.suspended)
                            }
                        >
                            <i
                                className={
                                    user.suspended
                                        ? "bi bi-unlock"
                                        : "bi bi-lock"
                                }
                            ></i>
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid item xs={0} align="center">
                    <Tooltip title="Delete user" arrow>
                        <IconButton
                            color="primary"
                            onClick={() => handleRemoveUser(user.userName)}
                        >
                            <i className="bi bi-trash"></i>
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid item xs={1} align="center">
                    <Tooltip title="Generate new password" arrow>
                        <IconButton
                            color="primary"
                            onClick={() => handleChangePassword(user.userName)}
                        >
                            <i className="bi bi-key"></i>
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
        );
    };

    /**
     * Fetches and generates a report based on the provided parameters.
     * @param {Date} start - The start date for the report.
     * @param {Date} end - The end date for the report.
     * @param {string} fileType - The desired file type for the report (e.g., "PDF", "CSV").
     * @param {string} reportType - The type of report to generate.
     * @param {Function} popAlert - A function to display an alert message.
     * @param {Array} users - An array of user objects.
     */
    const fetchGenerateReport = async (
        start,
        end,
        fileType,
        reportType,
        popAlert,
        users
    ) => {
        if (users === undefined) {
            popAlert(
                "No supplier selected. Please choose a supplier.",
                AlertSeverity.ERROR
            );
            return;
        }
        try {
            const response = await getAdminReports({
                start: start,
                end: end,
                reportType: reportType,
                fileType: fileType,
                targetUsers: [...users],
            });

            if (!response.ok) {
                const errorText = await response.text();
                popAlert(errorText, AlertSeverity.ERROR);
                return;
            }
            const filename = response.headers
                .get("Content-Disposition")
                .split("filename=")[1];

            response.blob().then((blob) => {
                const fileURL = window.URL.createObjectURL(blob);
                let alink = document.createElement("a");
                alink.href = fileURL;
                alink.download = filename.replaceAll('"', "");
                alink.click();
            });
        } catch (e) {
            popAlert("A network error occurred.", AlertSeverity.ERROR);
            return;
        }
    };

    // Request from all system users
    const fetchUsers = async (page, pageSize) => {
        try {
            const response = await getAdminUsers(page, pageSize);
            if (!response.ok) {
                const errorText = await response.text();
                popAlert(errorText, "error");
                return;
            }
            const allUsers = await response.json();
            const userList = allUsers.map((user) => {
                return createData(
                    user.userName,
                    user.fullName,
                    user.birthDate,
                    user.role,
                    user.role === UserRoles.Volunteer
                        ? user.userTags.map((t) => {
                              return { tag: t };
                          })
                        : "",
                    createActionsComponent((user = { user }))
                );
            });
            setUsers(userList);
            setFilteredRows(userList);
        } catch (e) {
            popAlert("A network error occurred.", "error");
            return;
        }
    };

    // Load all the users
    useEffect(() => {
        fetchUsers(page, pageSize);
    }, [page, pageSize]);

    return (
        <>
            {creating && (
                <ModalUserCreate
                    open={creating}
                    setOpen={setCreating}
                    create={true}
                    data={dataModal}
                    onChangedUsers={async () => fetchUsers(page, pageSize)}
                />
            )}
            {editing && (
                <ModalUserCreate
                    open={editing}
                    setOpen={setEditing}
                    create={false}
                    data={dataModal}
                    onChangedUsers={async () => fetchUsers(page, pageSize)}
                />
            )}
            {removing && (
                <ModalUserDelete
                    open={removing}
                    setOpen={setRemoving}
                    data={dataModal}
                    onDelete={async () => fetchUsers(page, pageSize)}
                />
            )}
            {suspending && (
                <ModalUserSuspend
                    open={suspending}
                    setOpen={setSuspending}
                    isLocked={dataModal.suspended}
                    data={dataModal}
                />
            )}
            {generating && (
                <ModalUserResetPs
                    open={generating}
                    setOpen={setGenerating}
                    data={dataModal}
                />
            )}
            {exporting && (
                <ReportGeneratorModal
                    options={{
                        formats: ReportFormats,
                        types: ReportTypes.ADMIN,
                        users: true,
                        open: exporting,
                        onClose: () => setExporting(false),
                        onExport: fetchGenerateReport,
                    }}
                />
            )}
            <Box className="box-content">
                <PageNavbar
                    barTitle={"Administrator"}
                    logout={<AdminLogoutButton />}
                />
                <Box sx={{ p: 4 }}>
                    <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        paddingRight="1px"
                    >
                        <Typography variant="h5" className="welcome-text">
                            User List
                        </Typography>
                        <Button
                            variant="contained"
                            className="options-button"
                            onClick={handleCreateUser}
                            startIcon={<i className="bi bi-plus-circle "></i>}
                        >
                            <Typography
                                variant="subtitle1"
                                className="text-options-button"
                            >
                                Create User
                            </Typography>
                        </Button>
                        <Button
                            className="options-button"
                            variant="contained"
                            onClick={() => setExporting(true)}
                            startIcon={
                                <i className="bi bi-file-earmark-spreadsheet"></i>
                            }
                        >
                            <Typography
                                variant="subtitle1"
                                className="text-options-button"
                            >
                                Export
                            </Typography>
                        </Button>
                    </Grid>
                    <Grid item md={12}>
                        <TableFilter
                            columns={columnsToFilter}
                            rows={users}
                            setFilteredRows={setFilteredRows}
                        />
                        <UserTable
                            filteredRows={filteredRows}
                            columns={columns}
                            onPageChange={setPage}
                            onSizeChange={setPageSize}
                            users={users}
                        />
                    </Grid>
                </Box>
            </Box>
        </>
    );
};

export default AdministratorUserPanel;

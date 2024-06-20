import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import {
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Radio,
    RadioGroup,
    FormLabel,
    FormControl,
    FormControlLabel,
    Select,
    MenuItem,
    InputLabel,
    Button,
    Paper,
    Typography,
    Tooltip,
    Checkbox,
    TablePagination,
} from "@mui/material";
import Selected from "../../utils/constants/UsersSelected";
import TableFilter from "../userTable/TableFilter";
import { useGlobalAlert } from "../../hooks/useGlobalAlert";
import { getAdminSuppliers } from "../../utils/fetchs/ApiFetchesAdmin";
import { ReportTypes, ReportTypesDisplay } from "../../utils/constants/ReportTypes";

const columnsToFilter = ["Username", "Fullname"];

const ReportGeneratorModal = ({ options }) => {
    const [format, setFormat] = useState(
        options.formats !== undefined ? options.formats[0] : ""
    );
    const [type, setType] = useState(
        options.types !== undefined ? options.types[0] : ""
    );
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [users, setUsers] = useState(
        options.users !== undefined ? [] : undefined
    );
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [checkedList, setCheckedList] = useState(
        users !== undefined ? Array(users.length).fill(false) : undefined
    );
    const [dict, setDict] = useState({});
    const [isAllChecked, setIsAllChecked] = useState(Selected.NONE);
    const [selectedUsers] = useState(new Set());

    const [page, setPage] = useState(0); // List page
    const [usersPerPage, setUsersPerPage] = useState(5); // Number of rows to show

    const { popAlert } = useGlobalAlert();

    /**
     * Updates the checked list by toggling the value at the specified index
     * also updates the isAllChecked by mapping the selected users in filteredUsers;
     * @param {String} username - The username to change the check list.
     */
    const handleUserCheck = (username) => {
        selectedUsers.has(username)
            ? selectedUsers.delete(username)
            : selectedUsers.add(username);
        const index = dict[username];
        const newVal = !checkedList[index];

        // Change the item in checkList
        setCheckedList((prevList) => {
            const newList = [...prevList.slice()]; // copy of the array
            newList[index] = newVal;
            return newList;
        });

        // Change isAllChecked
        let allFalse = true;
        let allTrue = true;
        for (const user of filteredUsers) {
            const tempIndex = dict[user.Username];
            if (tempIndex === index) {
                if (newVal) {
                    allFalse = false;
                } else {
                    allTrue = false;
                }
            } else if (checkedList[tempIndex]) {
                allFalse = false;
            } else {
                allTrue = false;
            }
            if (!allFalse && !allTrue) {
                setIsAllChecked(Selected.SOME);
                return;
            }
        }
        setIsAllChecked(allFalse ? Selected.NONE : Selected.ALL);
    };

    /**
     * Handles the "Select/Unselect All" action for the filtered users.
     */
    const handleUserCheckAll = () => {
        const newVal = isAllChecked === Selected.ALL ? false : true;
        let index;

        filteredUsers.forEach((user) => {
            index = dict[user.Username];
            checkedList[index] = newVal;
            selectedUsers.has(user.Username)
                ? !newVal && selectedUsers.delete(user.Username)
                : newVal && selectedUsers.add(user.Username);
        });

        setCheckedList(checkedList);
        setIsAllChecked(newVal ? Selected.ALL : Selected.NONE);
    };

    // Request from all system users
    const fetchUsers = async (page, usersPerPage) => {
        try {
            const response = await getAdminSuppliers(page, usersPerPage);
            if (!response.ok) {
                const errorText = await response.text();
                popAlert(errorText, "error");
                return;
            }
            const allUsers = await response.json();
            const userList = allUsers.map((user) => ({
                Username: user.userName,
                Fullname: user.fullName,
            }));
            setUsers(userList);
        } catch (e) {
            popAlert("A network error occurred.", "error");
            return;
        }
    };

    /**
     * Calculates the page number for a given first user index based on the new number of rows per page.
     * @param {String} firstUserIndex - The index of the first user being displayed.
     * @param {String} newUsersPerPage - The new number of users per page.
     * @returns the page number where the first user will be located after changing the number of rows per page.
     */
    const calculateOnResizePage = (firstUserIndex, newUsersPerPage) => {
        return Math.floor(firstUserIndex / newUsersPerPage);
    };

    /**
     * Handles the rows per page change event and updates the current page state and rows per page.
     */
    const handleRowsPerPageChange = (event) => {
        const newUsersPerPage = parseInt(event.target.value, 10);
        setPage(calculateOnResizePage(page * usersPerPage, newUsersPerPage));
        setUsersPerPage(newUsersPerPage);
    };

    /**
     * Updates the dictionary of users and resets to false the checkedList when users change.
     */
    useEffect(() => {
        if (users !== undefined) {
            const tempDict = {};
            users.forEach((user, index) => {
                tempDict[user.Username] = index;
            });
            setDict(tempDict);

            users.forEach((user) => {
                checkedList[tempDict[user.Username]] = selectedUsers.has(
                    user.Username
                );
            });
            setCheckedList(checkedList);
            setFilteredUsers(users);
        }
    }, [users]);

    /**
     * Updates the isAllChecked when the filtered users change.
     */
    useEffect(() => {
        if (filteredUsers !== undefined) {
            let allFalse = true;
            let allTrue = true;
            for (const user of filteredUsers) {
                if (checkedList[dict[user.Username]]) {
                    allFalse = false;
                } else {
                    allTrue = false;
                }
                if (!allFalse && !allTrue) {
                    setIsAllChecked(Selected.SOME);
                    return;
                }
            }
            setIsAllChecked(allFalse ? Selected.NONE : Selected.ALL);
        }
    }, [filteredUsers]);

    // Load all the users
    useEffect(() => {
        if (users !== undefined) {
            fetchUsers(page, usersPerPage);
        }
    }, [page, usersPerPage]);

    return (
        <Dialog open={options.open} onClose={options.onClose}>
            <DialogTitle>Generate report</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 1 }}>
                    {options.types !== undefined &&
                        options.types.length !== 1 && (
                            <>
                                <InputLabel id="select-type-label">
                                    Report type
                                </InputLabel>
                                <Select
                                    labelId="select-type-label"
                                    id="select-type"
                                    value={type}
                                    label="Report type"
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    {options.types.map((t, index) => {
                                        return (
                                            <MenuItem key={index} value={t}>
                                                {ReportTypesDisplay[t]}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </>
                        )}
                    {options.formats !== undefined &&
                        options.formats.length !== 1 && (
                            <>
                                <FormLabel
                                    id="radio-format-label"
                                    className="radio-format-label"
                                >
                                    Export Format
                                </FormLabel>
                                <RadioGroup
                                    aria-labelledby="radio-format-label"
                                    name="radio-format-group"
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value)}
                                >
                                    {options.formats.map((f, index) => (
                                        <FormControlLabel
                                            key={index}
                                            value={f}
                                            control={
                                                <Radio className="radio-format" />
                                            }
                                            label={f}
                                        />
                                    ))}
                                </RadioGroup>
                            </>
                        )}

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={2} sx={{ marginTop: 0 }}>
                            <Grid item xs={6}>
                                <DatePicker
                                    format="DD-MM-YYYY"
                                    label="Start date"
                                    value={startDate}
                                    onChange={(newDay) => {
                                        setStartDate(newDay);
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    format="DD-MM-YYYY"
                                    label="End date"
                                    value={endDate}
                                    onChange={(newDay) => {
                                        setEndDate(newDay);
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                    {users !== undefined && (
                        <>
                            <Grid
                                item
                                md={8}
                                style={{
                                    marginTop: "20px",
                                    marginBottom: "-15px",
                                }}
                            >
                                <FormLabel
                                    id="radio-users-label"
                                    className="radio-format-label"
                                >
                                    Users to select
                                </FormLabel>
                            </Grid>
                            <Grid item md={12}>
                                <TableFilter
                                    columns={columnsToFilter}
                                    rows={users}
                                    setFilteredRows={setFilteredUsers}
                                />
                            </Grid>

                            {filteredUsers.length > 0 && (
                                <Grid
                                    item
                                    md={4}
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        alignItems: "center",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <FormLabel
                                        id="radio-users-label"
                                        className="radio-format-label"
                                        style={{
                                            marginRight: "10px",
                                        }}
                                    >
                                        {isAllChecked === Selected.ALL
                                            ? "Unselect all users"
                                            : "Select all users"}
                                    </FormLabel>
                                    <Tooltip
                                        title={
                                            isAllChecked === Selected.ALL
                                                ? "Unselect all users"
                                                : "Select all users"
                                        }
                                        arrow
                                    >
                                        <Checkbox
                                            checked={
                                                isAllChecked === Selected.ALL
                                            }
                                            indeterminate={
                                                isAllChecked === Selected.SOME
                                            }
                                            style={{ marginRight: "15px" }}
                                            sx={{
                                                "& .MuiSvgIcon-root": {
                                                    fontSize: 30,
                                                },
                                            }}
                                            onChange={() =>
                                                handleUserCheckAll()
                                            }
                                        ></Checkbox>
                                    </Tooltip>
                                </Grid>
                            )}
                            {filteredUsers.map((user, index) => (
                                <Paper
                                    key={index}
                                    elevation={2}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "10px",
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
                                        <Typography
                                            variant="body1"
                                            style={{
                                                flexGrow: 1,
                                                marginLeft: "20px",
                                            }}
                                        >
                                            Username: {user.Username}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            style={{
                                                flexGrow: 1,
                                                marginLeft: "20px",
                                                marginTop: "8px",
                                            }}
                                        >
                                            Fullname: {user.Fullname}
                                        </Typography>
                                    </div>
                                    <Tooltip
                                        title={
                                            checkedList[dict[user.Username]]
                                                ? "unselect user"
                                                : "Select user"
                                        }
                                        arrow
                                    >
                                        <Checkbox
                                            checked={
                                                checkedList[
                                                    dict[user.Username]
                                                ] === undefined
                                                    ? false
                                                    : checkedList[
                                                          dict[user.Username]
                                                      ]
                                            }
                                            style={{ marginRight: "5px" }}
                                            sx={{
                                                "& .MuiSvgIcon-root": {
                                                    fontSize: 30,
                                                },
                                            }}
                                            onChange={() =>
                                                handleUserCheck(user.Username)
                                            }
                                        ></Checkbox>
                                    </Tooltip>
                                </Paper>
                            ))}
                        </>
                    )}
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                {users !== undefined && (
                    <TablePagination
                        component="div"
                        count={-1}
                        page={page}
                        rowsPerPage={usersPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        onPageChange={(_, newPage) => {
                            setPage(newPage);
                        }}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        labelRowsPerPage={"Rows per page"}
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}-${to}`
                        }
                        nextIconButtonProps={{
                            disabled: users.length < usersPerPage,
                        }}
                    />
                )}
                <Button onClick={options.onClose}>Close</Button>
                {options.onExport !== undefined && (
                    <Button
                        color="success"
                        variant="contained"
                        onClick={() =>
                            options.onExport(
                                dayjs(startDate).format("YYYY-MM-DD"),
                                dayjs(endDate).format("YYYY-MM-DD"),
                                format,
                                type,
                                popAlert,
                                selectedUsers.size !== 0
                                    ? selectedUsers
                                    : undefined
                            )
                        }
                    >
                        Export
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ReportGeneratorModal;

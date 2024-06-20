import { useState } from "react";

// MUI
import {
    TextField,
    Grid,
    Button,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    InputAdornment,
    DialogTitle,
    Select,
    Box,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Tooltip,
} from "@mui/material";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Validator functions
import {
    GenerateRandomPassword,
    ValidatePassword,
} from "../../utils/PasswordVerificator";
import {
    ValidateId,
    ValidateName,
    ValidateUserName,
    UsernameValidation,
    UsernameValidationLabel,
    FullnameValidationLabel,
    FullnameValidation,
} from "../../utils/RegisterFormValidators";
import UserRoles from "../../utils/constants/UserRoles";

// alerts
import { useGlobalAlert } from "../../hooks/useGlobalAlert";

import LoadSpinner from "../../components/common/LoadSpinner";

import HTTPStatus from "../../utils/constants/HttpStatus";
import { ValidPasswordEnum } from "../../utils/PasswordVerificator";
import { PasswordValidationLabel } from "../../utils/PasswordVerificator";

import TagSelector from "../../components/common/TagSelector";

import dayjs from "dayjs";
import {
    changeUserSuspendedStatus,
    editAdminUser,
    deleteAdminUser,
    resetPasswordAdminUser,
} from "../../utils/fetchs/ApiFetchesAdmin";
import { registerUser } from "../../utils/fetchs/ApiFetches";
import { AlertSeverity } from "../../context/AlertProvider";
import { dateFormatter } from "../../utils/DateFormatter";

/**
 * Create the user creation modal
 *
 * @param {*} open Indicates if the modal is open
 * @param {*} setOpen Open status setter function.
 * @param {*} create Indicates if the modal must create a new user or edit it
 * @param {*} data User data in case the modal i used to edit
 * @returns A dialog component with the form to create a user
 */
const ModalUserCreate = ({
    open,
    setOpen,
    create,
    data,
    onChangedUsers = undefined,
}) => {
    //form fields states
    const [userName, setUserName] = useState(create ? "" : data.userName);
    const [fullName, setFullName] = useState(create ? "" : data.fullName);
    const [id, setID] = useState(create ? "" : data.institutionalID);
    const [date, setDate] = useState(
        create ? null : dayjs(data.birthDate, "DD-MM-YYYY")
    );
    const [password, setPassword] = useState(GenerateRandomPassword()); // only used for new user
    const [role, setRole] = useState(create ? UserRoles.Supplier : data.role);
    const [tags, setTags] = useState(
        create
            ? []
            : data.userTags.map((t) => {
                  return { tag: t };
              })
    );
    const [taken, setTaken] = useState(false);

    // Error states
    const [userNameError, setUserNameError] = useState(false);
    const [userNameErrorText, setUserNameErrorText] = useState("");

    const [fullNameError, setFullNameError] = useState(false);
    const [fullNameErrorText, setFullNameErrorText] = useState("");

    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorText, setPasswordErrorText] = useState("");

    const [idError, setIDError] = useState(false);
    const [idErrorText, setIDErrorText] = useState("");

    // alerts
    const { popAlert } = useGlobalAlert();
    const [userTry, setUserTry] = useState(false);

    const handleSubmitDialog = async () => {
        const validationUserName = ValidateUserName(userName);
        if (validationUserName !== UsernameValidation.VALID_USERNAME) {
            setUserNameError(true);
            setUserNameErrorText(UsernameValidationLabel(validationUserName));
            return;
        }

        const validationFullName = ValidateName(fullName);
        if (validationFullName !== FullnameValidation.VALID_NAME) {
            setFullNameError(true);
            setFullNameErrorText(FullnameValidationLabel(validationFullName));
            return;
        }

        const validationPassword = ValidatePassword(password);
        if (validationPassword !== ValidPasswordEnum.VALID) {
            setPasswordError(true);
            setPasswordErrorText(PasswordValidationLabel(validationPassword));
            return;
        }

        const validationID = ValidateId(id);
        if (!validationID) {
            setIDError(true);
            setIDErrorText("ID is too long");
            return;
        }

        if (date === null) {
            popAlert("Date must not be empty", AlertSeverity.ERROR);
            return;
        }

        if (taken) {
            popAlert(
                "Error, make sure that the user has not been created before.",
                AlertSeverity.ERROR
            );
            return;
        }

        let request;
        if (create) {
            request = {
                username: userName,
                password: btoa(password),
                name: fullName,
                birthDate: dateFormatter(date),
                role: role,
                institutionalID: id,
            };
        } else {
            request = {
                userName: userName,
                name: fullName,
                birthDate: dateFormatter(date),
                role: role,
                institutionalID: id,
                userTags: tags.map((t) => t.tag),
                hourBlocks: data.hourBlocks,
            };
        }

        try {
            const response = create
                ? await registerUser(request)
                : await editAdminUser(request);

            if (!response.ok) {
                if (response.status !== HTTPStatus.BAD_REQUEST) {
                    popAlert(
                        "An error ocurred: " + response.statusText,
                        AlertSeverity.ERROR
                    );
                } else {
                    popAlert(
                        create
                            ? "Error, make sure that the user has not been created before."
                            : "Error, please check all the fields",
                        AlertSeverity.ERROR
                    );
                    if (create) setTaken(true);
                }
                return;
            }
            popAlert(
                `User successfully ${create ? " created!" : " edited!"}`,
                AlertSeverity.SUCCESS
            );
        } catch (e) {
            popAlert("A network error occurred.", AlertSeverity.ERROR);
            return;
        } finally {
            setUserTry(false);
        }
        if (onChangedUsers !== undefined) onChangedUsers();
        setOpen(false);
    };

    const handleChangeUserName = (event) => {
        if (userNameError) {
            setUserNameError(false);
            setUserNameErrorText("");
        }
        setUserName(event.target.value);
        setTaken(false);
    };

    const handleChangeFullName = (event) => {
        if (fullNameError) {
            setFullNameError(false);
            setFullNameErrorText("");
        }
        setFullName(event.target.value);
    };

    const handleChangePassword = (event) => {
        if (passwordError) {
            setPasswordError(false);
            setPasswordErrorText("");
        }
        setPassword(event.target.value);
    };

    const handleChangeID = (event) => {
        if (idError) {
            setIDError(false);
            setIDErrorText("");
        }
        setID(event.target.value);
    };

    const handleChangeDate = (event) => {
        setDate(event);
    };

    const handleChangeRole = (event) => {
        setRole(event.target.value);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="alert-dialog-title">
                    {create ? "Create User" : "Edit User"}
                </DialogTitle>
                <DialogContent>
                    <Grid container rowSpacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                value={userName}
                                onChange={handleChangeUserName}
                                id="userName"
                                label="Username"
                                fullWidth
                                error={userNameError}
                                helperText={userNameErrorText}
                                style={{ marginTop: "0.5rem" }}
                                InputProps={{
                                    readOnly: !create,
                                    placeholder: "Username",
                                    endAdornment: (
                                        <InputAdornment
                                            position="end"
                                            className="bi bi-person"
                                        />
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                value={fullName}
                                onChange={handleChangeFullName}
                                id="Fullname"
                                label="Fullname"
                                fullWidth
                                error={fullNameError}
                                helperText={fullNameErrorText}
                                InputProps={{
                                    placeholder: "Fullname",
                                    endAdornment: (
                                        <InputAdornment
                                            position="end"
                                            className="bi bi-person"
                                        />
                                    ),
                                }}
                            />
                        </Grid>

                        {create && (
                            <Grid item xs={12}>
                                <TextField
                                    value={password}
                                    onChange={handleChangePassword}
                                    id="Password"
                                    label="Password"
                                    fullWidth
                                    error={passwordError}
                                    helperText={passwordErrorText}
                                    InputProps={{
                                        placeholder: "Fullname",
                                        endAdornment: (
                                            <InputAdornment
                                                position="end"
                                                className="bi bi-lock"
                                            />
                                        ),
                                    }}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        label="Birthdate"
                                        value={date}
                                        onChange={(d, _) => handleChangeDate(d)}
                                        format="DD-MM-YYYY"
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                value={id}
                                onChange={handleChangeID}
                                id="id"
                                label="ID"
                                multiline
                                fullWidth
                                error={idError}
                                helperText={idErrorText}
                                InputProps={{
                                    placeholder: "ID",
                                    endAdornment: (
                                        <InputAdornment
                                            position="end"
                                            className="bi bi-person-vcard"
                                        />
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="select-role-label">
                                    Select a Role
                                </InputLabel>
                                <Select
                                    labelId="select-role-label"
                                    label="Select an option"
                                    value={role}
                                    onChange={handleChangeRole}
                                >
                                    <MenuItem value={UserRoles.Volunteer}>
                                        Volunteer
                                    </MenuItem>
                                    <MenuItem value={UserRoles.Supplier}>
                                        Supplier
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {!create && role === UserRoles.Volunteer && (
                            <Grid item xs={12}>
                                <TagSelector
                                    value={tags}
                                    onChange={(v) => setTags(v)}
                                />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                {userTry && <LoadSpinner />}
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmitDialog} autoFocus>
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

/**
 * Create the user deletion modal
 *
 * @param {*} open Indicates if the modal is open
 * @param {*} setOpen Open status setter function.
 * @param {*} data Data of the user to delete
 * @returns A dialog component with the form to delete a user
 */
const ModalUserDelete = ({ open, setOpen, data, onDelete = undefined }) => {
    const { popAlert } = useGlobalAlert();

    const handleDelete = async (data) => {
        try {
            const response = await deleteAdminUser(data.userName);

            if (!response.ok) {
                popAlert(
                    `There was a problem trying to delete the user. Please try again.`,
                    AlertSeverity.ERROR
                );
                return;
            }
            popAlert(`User deleted successfully!.`, AlertSeverity.SUCCESS);
            setOpen(false);
            if (onDelete !== undefined) onDelete();
        } catch (error) {
            popAlert(
                "There was a problem connecting with the server. Please try again.",
                AlertSeverity.ERROR
            );
        }
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>{`Are you sure you want to delete this user?`}</DialogTitle>
            <DialogContent>
                <Typography sx={{ pb: 4 }}>
                    {`It seems that you are trying to delete the user: "${data.userName}".\nAre you sure?`}
                </Typography>
                <Box display="flex" flexDirection="row-reverse">
                    <Button variant="contained" onClick={() => setOpen(false)}>
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
                            onClick={(_) => handleDelete(data)}
                        >
                            <Typography>Delete</Typography>
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

/**
 * Create the user suspension modal
 *
 * @param {*} open Indicates if the modal is open
 * @param {*} setOpen Open status setter function.
 * @param {*} data Data of the user to suspend
 * @returns A dialog component with the form to suspend a user
 */
const ModalUserSuspend = ({ open, setOpen, isLocked, data }) => {
    const intention = isLocked ? "resume" : "suspend";
    const intentionPast = isLocked ? "resumed" : "suspended";
    const { popAlert } = useGlobalAlert();

    const handleSuspend = async (data) => {
        try {
            const response = await changeUserSuspendedStatus(data.userName);

            if (!response.ok) {
                popAlert(
                    `There was a problem trying to ${intention} the user. Please try again.`,
                    AlertSeverity.ERROR
                );
            } else {
                popAlert(
                    `User ${intentionPast} successfully!.`,
                    AlertSeverity.SUCCESS
                );
                setOpen(false);
                window.location.reload();
            }
        } catch (error) {
            popAlert(
                "There was a problem connecting with the server. Please try again.",
                AlertSeverity.ERROR
            );
        }
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>{`Are you sure you want to ${intention} this user?`}</DialogTitle>
            <DialogContent>
                <Typography sx={{ pb: 4 }}>
                    {`It seems that you are trying to ${intention} the user: "${data.userName}".\nAre you sure?`}
                </Typography>
                <Box display="flex" flexDirection="row-reverse">
                    <Button variant="contained" onClick={() => setOpen(false)}>
                        <Typography>Cancel</Typography>
                    </Button>
                    <Box sx={{ pr: 1 }}>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#ffaf24",
                                ":hover": {
                                    backgroundColor: "orange",
                                },
                            }}
                            onClick={(_) => handleSuspend(data)}
                        >
                            <Typography>
                                {!isLocked ? "Suspend" : "Resume"}
                            </Typography>
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

/**
 * Create the user reset password modal
 *
 * @param {*} open Indicates if the modal is open
 * @param {*} setOpen Open status setter function.
 * @param {*} data Data of the user to change password
 * @returns A dialog component with the form to suspend a user
 */
const ModalUserResetPs = ({ open, setOpen, data }) => {
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [changedPassword, setChangedPassword] = useState("");
    const { popAlert } = useGlobalAlert();

    const handleChange = async (data) => {
        const newPassword = GenerateRandomPassword();
        const request = {
            username: data.userName,
            password: btoa(newPassword),
        };
        try {
            const response = await resetPasswordAdminUser(request);
            if (!response.ok) {
                popAlert(
                    `There was a problem trying to reset the password. Please try again.`,
                    AlertSeverity.ERROR
                );
                setOpen(false);
                return;
            }
            popAlert(`Password reset successfully!.`, AlertSeverity.SUCCESS);
            setChangedPassword(newPassword);
            setPasswordChanged(true);
        } catch (error) {
            popAlert(
                "There was a problem connecting with the server. Please try again.",
                AlertSeverity.ERROR
            );
            setOpen(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(changedPassword);
        popAlert(`New password copied to clipboard!`, AlertSeverity.SUCCESS);
    };

    return (
        <Dialog open={open} fullWidth onClose={() => setOpen(false)}>
            <DialogTitle>
                {passwordChanged
                    ? `"${data.userName}" password changed to:`
                    : "Are you sure that you want to reset this password?"}
            </DialogTitle>
            <DialogContent>
                {passwordChanged ? (
                    <>
                        <TextField
                            value={changedPassword}
                            InputProps={{ readOnly: true }}
                            sx={{ width: "85%", pr: 3 }}
                            variant="standard"
                        />
                        <Tooltip title="Copy new password" arrow>
                            <IconButton onClick={handleCopy}>
                                <i className="bi bi-clipboard"></i>
                            </IconButton>
                        </Tooltip>
                        <Box mt={2} display="flex" flexDirection="row-reverse">
                            <Button
                                variant="contained"
                                onClick={() => setOpen(false)}
                            >
                                <Typography>Accept</Typography>
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography sx={{ pb: 4 }}>
                            {`It seems that you are trying to reset the password from: "${data.userName}".\nAre you sure?`}
                        </Typography>

                        <Box display="flex" flexDirection="row-reverse">
                            <Button
                                variant="contained"
                                onClick={() => setOpen(false)}
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
                                    onClick={(_) => handleChange(data)}
                                >
                                    <Typography>Reset</Typography>
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export { ModalUserCreate, ModalUserDelete, ModalUserResetPs, ModalUserSuspend };

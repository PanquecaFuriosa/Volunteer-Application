import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

// UX
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
    Button,
    Box,
    InputLabel,
    InputAdornment,
    FormControl,
    Typography,
    MenuItem,
    Select,
    TextField,
    IconButton,
    Tooltip,
} from "@mui/material/";
import "../../styles/Form.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Utils
import {
    ValidatePassword,
    GenerateRandomPassword,
    ValidPasswordEnum,
    PasswordValidationLabel,
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
import HTTPStatus from "../../utils/constants/HttpStatus";

// Hooks
import useAuth from "../../hooks/useAuth";
import { useGlobalAlert } from "../../hooks/useGlobalAlert";
import { registerUser } from "../../utils/fetchs/ApiFetches";
import { dateFormatter } from "../../utils/DateFormatter";


const SignUpPage = () => {
    const [role, setRole] = useState(""); // Role selected by user

    return (
        <>
            {role === "" ? (
                <RoleSelect roleSetter={setRole} role={role} />
            ) : (
                <Signup role={role} roleSetter={setRole} />
            )}
        </>
    );
};

/**
 * View to select role
 * @param {*} role role selected by user
 * @param {*} roleSetter function to set de role
 * @returns 
 */
const RoleSelect = ({ role, roleSetter }) => {
    const handleRole = (event) => {
        roleSetter(event.target.value);
    };

    return (
        <Box className="custom-box-bg">
            <Box
                className="custom-box-form"
                component="form"
                sx={{
                    width: "20%",
                    padding: "35px",
                    backgroundColor: "white",
                    borderRadius: "3px",
                }}
            >
                <Typography sx={{ textAlign: "center", m: 3 }} variant="h5">
                    Select your role
                </Typography>
                <FormControl fullWidth>
                    <InputLabel id="select-role-label">
                        Select an option
                    </InputLabel>
                    <Select
                        labelId="select-role-label"
                        label="Select an option"
                        value={role}
                        onChange={handleRole}
                    >
                        <MenuItem value={UserRoles.Volunteer}>
                            Volunteer
                        </MenuItem>
                        <MenuItem value={UserRoles.Supplier}>Supplier</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
};

/**
 * Check if the username is valid
 * @param {*} username username entered by the user
 * @param {*} taken indicates if the username is taken
 * @param {*} usernameChanged indicates if the username entered was changed
 * @returns The label tha indicates if the username is valid
 */
const usernameLabel = (username, taken, usernameChanged) => {
    const usernameStatus = ValidateUserName(username);
    return (
        <Typography
            variant="inherit"
            color={
                (usernameStatus === UsernameValidation.VALID_USERNAME ||
                !usernameChanged) && ! taken
                    ? "initial"
                    : "error"
            }
        >
            {!usernameChanged ? "Username" : (taken
                ? "Username already taken"
                : UsernameValidationLabel(usernameStatus))}
        </Typography>
    );
};

/**
 * Check if the fullname is valid
 * @param {*} fullname fullname entered by the user
 * @param {*} fullnameChanged indicates if the fullname entered was changed
 * @returns The label tha indicates if the fullname is valid
 */
const fullnameLabel = (fullname, fullnameChanged) => {
    const fullnameStatus = ValidateName(fullname);
    return (
        <Typography
            variant="inherit"
            color={
                fullnameStatus === FullnameValidation.VALID_NAME ||
                ! fullnameChanged
                    ? "initial"
                    : "error"
            }
        >
            {!fullnameChanged ? "Fullname" : FullnameValidationLabel(fullnameStatus)}
        </Typography>
    );
};

/**
 * Check if the id is valid
 * @param {*} id id entered by the user
 * @returns The label tha indicates if the id is valid
 */
const idLabel = (id) => {
    const isValid = ValidateId(id);
    return (
        <Typography variant="inherit" color={isValid ? "initial" : "error"}>
            {isValid ? "ID" : "ID is too long"}
        </Typography>
    );
};

/**
 * Check if the password is valid
 * @param {*} password password entered by the user
 * @returns The label tha indicates if the password is valid
 */
const passwordLabel = (password) => {
    const passwordStatus = ValidatePassword(password);
    return (
        <Typography
            variant="inherit"
            color={
                password.length === 0 ||
                passwordStatus === ValidPasswordEnum.VALID
                    ? "initial"
                    : "error"
            }
        >
            {password.length === 0
                ? "Password"
                : PasswordValidationLabel(passwordStatus)}
        </Typography>
    );
};

/**
 * Renders the user signup screen.
 */
const Signup = ({ role, roleSetter }) => {
    const [username, setUsername] = useState(""); // User's username
    const [id, setID] = useState(""); // User's id
    const [fullname, setFullname] = useState(""); // User's fullname
    const [date, setDate] = useState(null); // User's birdtdate
    const [showPassword, setShowPassword] = useState(true); // Idicates if the user wants to see the password 
    const [password, setPassword] = useState(GenerateRandomPassword()); // User's password
    const [validPassword, setValidPassword] = useState(ValidPasswordEnum.VALID); // Validate password
    const [taken, setTaken] = useState(false); // Indicates if unername is already taken
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { popAlert } = useGlobalAlert();
    const [fullnameChanged, setFullnameChanged] = useState(false); // Indicate if the username was changed
    const [usernameChanged, setUsernameChanged] = useState(false); // Indicates if the fullname was changed

    const handlePasswordChange = (event) => {
        const newPassword = event.target.value;
        setPassword(newPassword);
        ValidatePassword(newPassword);
        const isValid = ValidatePassword(newPassword);
        setValidPassword(isValid);
    };

    /**
     * Submits the user registration data and redirects it
     * to its respective panel.
     */
    const handleSubmit = async () => {
        if (
            validPassword !== ValidPasswordEnum.VALID ||
            !ValidateId(id) ||
            ValidateName(fullname) !== FullnameValidation.VALID_NAME ||
            ValidateUserName(username) !== UsernameValidation.VALID_USERNAME ||
            taken ||
            date === null
        ) {
            popAlert("Please check the errors in the form's fields.", "error");
            return;
        }

        try {
            const response = await registerUser({
                username: username,
                password: btoa(password),
                name: fullname,
                birthDate: dateFormatter(date),
                institutionalID: id,
                role: role,
            });

            if (!response.ok) {
                if (response.status !== HTTPStatus.BAD_REQUEST) {
                    popAlert(
                        "An error ocurred: " + response.statusText,
                        "error"
                    );
                    return;
                }

                popAlert("Username already taken!", "error");
                setTaken(true);
                return;
            }

            popAlert("User successfully registered!", "success");
            setAuth({ role: role });
            navigate("/", { state: { from: location }, replace: true });
        } catch (e) {
            popAlert("A network error occurred.", "error");
        }
    };

    return (
        <Box className="custom-box-bg">
            <Box
                className="custom-box-form"
                component="form"
                sx={{
                    width: "32%",
                    padding: "35px",
                    backgroundColor: "white",
                    borderRadius: "3px",
                }}
            >
                <Tooltip title="Role selection" arrow placement="top">
                    <IconButton
                        disableRipple
                        sx={{
                            m: 0,
                            p: 0,
                            alignItems: "center",
                            justifyContent: "left",
                        }}
                        onClick={() => roleSetter("")}
                    >
                        <i
                            className="bi bi-arrow-left"
                            style={{ fontSize: 26, color: "rgba(0,0,0,0.5)" }}
                        ></i>
                    </IconButton>
                </Tooltip>
                <Typography
                    sx={{ textAlign: "center", m: 3, mt: 1 }}
                    variant="h5"
                >
                    Sign in our platforms
                </Typography>

                <TextField
                    fullWidth
                    sx={{ mb: 2 }}
                    variant="outlined"
                    label={usernameLabel(username, taken, usernameChanged)}
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setUsernameChanged(true);
                        setTaken(false);
                    }}
                    InputProps={{
                        placeholder: "Username",
                        endAdornment: (
                            <InputAdornment
                                position="end"
                                className="bi bi-person"
                            />
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    sx={{ mb: 2 }}
                    variant="outlined"
                    label={fullnameLabel(fullname, fullnameChanged)}
                    value={fullname}
                    onChange={(e) => {
                        setFullnameChanged(true);
                        setFullname(e.target.value);
                    }}
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

                <TextField
                    fullWidth
                    sx={{ mb: 2 }}
                    variant="outlined"
                    label={passwordLabel(password)}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    InputProps={{
                        placeholder: "Password",
                        endAdornment: (
                            <InputAdornment
                                position="end"
                                className="endAdornment"
                            >
                                <Button
                                    position="end"
                                    onClick={(_) => {
                                        setShowPassword(!showPassword);
                                    }}
                                    disableRipple
                                    disableTouchRipple
                                >
                                    <InputAdornment
                                        position="end"
                                        className="endAdornment"
                                    >
                                        <i
                                            className={
                                                showPassword
                                                    ? "bi bi-eye-slash"
                                                    : "bi bi-eye"
                                            }
                                        ></i>
                                    </InputAdornment>
                                </Button>
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Birthdate"
                            value={date}
                            onChange={(d, _) => {
                                setDate(d);
                            }}
                            format="DD-MM-YYYY"
                        />
                    </LocalizationProvider>
                </FormControl>

                <TextField
                    fullWidth
                    sx={{ mb: 2 }}
                    variant="outlined"
                    label={idLabel(id)}
                    value={id}
                    onChange={(e) => {
                        setID(e.target.value);
                    }}
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

                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    fullWidth
                    sx={{ display: "grid", mb: 2 }}
                >
                    Sign up
                </Button>
                <Box sx={{ display: "grid", mb: 1 }}>
                    <Typography sx={{ textAlign: "center" }} variant="span">
                        {"Already have an account? "}
                        <Link to="/" className="mx-1 link-custom-color">
                            Login here
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default SignUpPage;

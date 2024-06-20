import React, { useEffect, useState } from "react";
import {
    Button,
    Box,
    OutlinedInput,
    InputLabel,
    InputAdornment,
    FormControl,
    Typography,
} from "@mui/material/";
import "../../styles/Form.css";
import { useGlobalAlert } from "../../hooks/useGlobalAlert";
import { healthCheckAdmin, loginAdmin } from "../../utils/fetchs/ApiFetchesAdmin";
import PageRoutes from "../../utils/constants/Routes";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Renders the admin login main view.
 * Pretty similar to the normal login but it uses
 * a different login request and has no sign up option.
 */
const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const { popAlert } = useGlobalAlert();
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Submits the user auth data form and tries
     * to log the user in. If the authentication is successfull,
     * the user is redirected to its respective panel
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await loginAdmin({
            username: username,
            password: btoa(password),
        });
        if (!response.ok) {
            popAlert("Invalid credentials", "error");
            return;
        }

        popAlert("Successfully loged in", "success");
        navigate(PageRoutes.ADMINISTRATOR_USER_PANEL, {
            state: { from: location },
            replace: true,
        });
    };

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const resp = await healthCheckAdmin();
                if (!resp.ok) return;
                popAlert("Successfully loged in", "success");
                navigate(PageRoutes.ADMINISTRATOR_USER_PANEL, {
                    state: { from: location },
                    replace: true,
                });
            } catch (error) {}
        };

        checkHealth();
    }, []);

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
                <Typography sx={{ textAlign: "center", m: 3 }} variant="h5">
                    Sign in our platforms
                </Typography>
                <FormControl fullWidth sx={{ mb: 1 }} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-username">
                        Username
                    </InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-username"
                        type="username"
                        endAdornment={
                            <InputAdornment position="end">
                                <i className="bi bi-person-circle"></i>
                            </InputAdornment>
                        }
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">
                        Password
                    </InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? "text" : "password"}
                        endAdornment={
                            <InputAdornment
                                position="end"
                                className="endAdornment"
                            >
                                <Button
                                    position="end"
                                    onClick={(e) => {
                                        e.preventDefault(); // Evita que la página se recargue
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
                        }
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </FormControl>
                <Box sx={{ display: "grid", mb: 2 }}>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        fullWidth
                    >
                        Sign in
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
export default AdminLogin;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Box,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  FormControl,
  Typography,
} from "@mui/material/";
import jwtDecode from "jwt-decode";
import catchJWTCookie from "../../utils/CatchJWTCookie"
import secureFetch from "../../utils/fetchs/SecureFetch";
import useAuth from "../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import UserRoles from "../../utils/constants/UserRoles";
import "../../styles/Form.css"
import { useGlobalAlert } from "../../hooks/useGlobalAlert";
import PageRoutes from "../../utils/constants/Routes";


/**
 * Renders the login main view
 */
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { setAuth } = useAuth();
  const { popAlert } = useGlobalAlert();
  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(()=> {
    const jwtTok = catchJWTCookie(document.cookie);
      if (jwtTok) {
        try {
          const jwtObj = jwtDecode(jwtTok)
          setAuth({role: jwtObj.role, username: jwtObj.sub});

          switch (jwtObj.role) {
            case UserRoles.Volunteer:
              navigate(PageRoutes.VOLUNTEER_PANEL, {state: {from : location}, replace: true});
              break;
            case UserRoles.Supplier:
              navigate(PageRoutes.SUPPLIER_PANEL,  {state: {from : location}, replace: true});
              break;
            default:
              break;
          }

        } catch (e){
          console.log(e)
        }
      } 
  },[])

  /**
   * Submits the user auth data form and tries
   * to log the user in. If the authentication is successfull,
   * the user is redirected to its respective panel
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const encodedPass = btoa(password);  
    const response = await secureFetch(
      "http://localhost:8080/auth/login",
      "POST",
      JSON.stringify({ username: username, password: encodedPass }),
      { }
    );
    if (!response.ok) {
      popAlert("Invalid credentials", "error");
      return;
    } 
    const jwtTok = catchJWTCookie(document.cookie);
      try {
        const jwtObj = jwtDecode(jwtTok)
        setAuth({role: jwtObj.role, username: username});
        switch (jwtObj.role) {
          case UserRoles.Volunteer:
            navigate(PageRoutes.VOLUNTEER_PANEL, {state: {from : location}, replace: true});
            break;
          case UserRoles.Supplier:
            navigate(PageRoutes.SUPPLIER_PANEL,  {state: {from : location}, replace: true});
            break;
          default:
            break;
        }
      } catch (e){
        console.log(e)
      }
  }

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
            onChange={(e) => {setUsername(e.target.value)}}
          />
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">
            Password
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end" className="endAdornment">
                <Button 
                  position="end"
                  onClick={(e) => {
                    e.preventDefault(); // Evita que la página se recargue
                    setShowPassword(!showPassword);
                  }}
                  disableRipple
                  disableTouchRipple
                >
                  <InputAdornment position="end" className="endAdornment">
                    <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </InputAdornment>
                </Button>
              </InputAdornment>
            }
            label="Password"
            value={password}
            onChange={(e) => {setPassword(e.target.value)}}
          />
        </FormControl>
        <Box sx={{ display: "grid", mb: 2 }}>
          <Button onClick={handleSubmit} variant="contained" fullWidth>
            Sign in
          </Button>
        </Box>
        <Box sx={{ display: "grid", mb: 1 }}>
          <Typography sx={{ textAlign: "center" }} variant="span">
            {"Not registered? "}
            <Link to="/signup" className="mx-1 link-custom-color">
              Create account
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
export default Login;

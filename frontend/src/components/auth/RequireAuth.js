import { useLocation, Navigate, Outlet } from "react-router-dom";
import catchJWTCookie from "../../utils/CatchJWTCookie";
import useAuth from "../../hooks/useAuth";
import jwtDecode from "jwt-decode";


/**
 * Allows to protect a route.
 * It check if the user is authenticated and authorized
 * 
 * @param {*} authRole Role required to access the route
 */
const RequireAuth = ({authRole}) => {
  const { auth } = useAuth();
  const location = useLocation();

  const jwtTok = catchJWTCookie(document.cookie);
  try {
    jwtDecode(jwtTok);


    /**
     * If the cookie is present and the role is authorized, allow access
     * If the cookie is present but the role is not authorized, go to unauthorized route
     * If the cookie isnt present, go to the login
     */
    return (jwtTok ? (auth.role === authRole ? <Outlet/> 
                        : <Navigate to="/unauthorized" state={{ from: location }} replace />) 
                    : <Navigate to="/" state={{ from: location }} replace />)
  }
  catch (e) {
    return <Navigate to="/" state={{ from: location }} replace />
  }
};

export default RequireAuth;

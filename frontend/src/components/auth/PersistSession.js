import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import catchJWTCookie from "../../utils/CatchJWTCookie";
import jwt_decode from "jwt-decode";

/**
  * Persists the user session/login.
  * It verifies if an user JWT cookie exists. 
  * If that's the case, we decode the roles.
  * Otherwhise, it means the user is not logged.
  */
const PersistSession = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { setAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const jwtToken = catchJWTCookie(document.cookie);
    try {
      const jwtObj = jwt_decode(jwtToken);
      setAuth({ role: jwtObj.role, username: jwtObj.sub });
      setIsLoading(false);
    } catch (err) {
      // JWT error
      navigate("/", { state: { from: location }, replace: true });
    }
  }, []);
  return <>{isLoading ? <p> Loading ... </p> : <Outlet />}</>;
};

export default PersistSession;

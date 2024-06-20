import { useContext } from "react";
import AuthContext from "../context/AuthProvider";


/**
 * Retrieves the authorization context
 */
const useAuth = () => {
    return useContext(AuthContext);   
}

export default useAuth;
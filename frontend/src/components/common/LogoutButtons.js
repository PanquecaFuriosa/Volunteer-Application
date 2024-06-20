import { Button } from "@mui/material";
import { logOutUser } from "../../utils/fetchs/ApiFetches";
import { logoutAdmin } from "../../utils/fetchs/ApiFetchesAdmin";
import { useGlobalAlert } from "../../hooks/useGlobalAlert";
import { useLocation, useNavigate } from "react-router-dom";
import HTTPStatus from "../../utils/constants/HttpStatus";
/**
 * Volunteer/Supplier users' logout button
 */
export const UserLogoutButton = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { popAlert } = useGlobalAlert();

    const handleLogout = async () => {
        try {
            const response = await logOutUser();

            if (!response.ok) {
                if (response.status !== HTTPStatus.BAD_REQUEST) {
                    popAlert(
                        "An error ocurred: " + response.statusText,
                        "error"
                    );
                    return;
                }
            }
            navigate("/", { state: { from: location }, replace: true });
        } catch (e) {
            popAlert("A network error occurred.", "error");
        }
    };

    return (
        <Button
            color="inherit"
            className="navbar-button"
            endIcon={<i className="bi bi-box-arrow-right"></i>}
            onClick={handleLogout}
        >
            Logout
        </Button>
    );
};


/**
 * Admin user's logout button
 */
export const AdminLogoutButton = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { popAlert } = useGlobalAlert();

    const handleLogout = async () => {
        try {
            const response = await logoutAdmin();

            if (!response.ok) {
                if (response.status !== HTTPStatus.BAD_REQUEST) {
                    popAlert(
                        "An error ocurred: " + response.statusText,
                        "error"
                    );
                    return;
                }
            }
            navigate("/", { state: { from: location }, replace: true });
        } catch (e) {
            popAlert("A network error occurred.", "error");
        }
    };

    return (
        <Button
            color="inherit"
            className="navbar-button"
            endIcon={<i className="bi bi-box-arrow-right"></i>}
            onClick={handleLogout}
        >
            Logout
        </Button>
    );
};

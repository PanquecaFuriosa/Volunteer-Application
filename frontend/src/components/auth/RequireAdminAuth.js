import { useEffect, useState } from "react";
import { useLocation, Navigate, Outlet, useNavigate } from "react-router-dom";
import { healthCheckAdmin } from "../../utils/fetchs/ApiFetchesAdmin";
import PageRoutes from "../../utils/constants/Routes";

/**
 * Components that makes a route only available for admin users.
 * The way this works is that everytime an user tries to access an
 * admin protected route, it does a health check of the admin cookie
 * and checks if it is present and valid.
 */
const RequireAdminAuth = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [healthy, setHealthy] = useState(false);
    useEffect(() => {
        console.log("checking admin auth...");
        const checkHealth = async () => {
            try {
                const resp = await healthCheckAdmin();
                if (!resp.ok) {
                    navigate(`/${PageRoutes.UNAUTHORIZED}`, {
                        state: { from: location },
                        replace: true,
                    });
                    return;
                }

                setHealthy(true);
            } catch (error) {}
        };

        checkHealth();
    });

    
    try {
        return healthy ? <Outlet /> : <>Loading...</>;
    } catch (e) {
        return (
            <Navigate
                to={`/${PageRoutes.UNAUTHORIZED}`}
                state={{ from: location }}
                replace
            />
        );
    }
};

export default RequireAdminAuth;

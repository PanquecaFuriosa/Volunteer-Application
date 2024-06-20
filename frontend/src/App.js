import React from "react";
import { Routes, Route } from "react-router-dom";

// Authentication and Authorization
import RequireAuth from "./components/auth/RequireAuth";
import PersistSession from "./components/auth/PersistSession";

// Pages
import Login from "./pages/login/Login";
import SignUpPage from "./pages/signup/Signup";
import SupplierPanel from "./pages/supplierPanel/SupplierPanel";
import Unauthorized from "./pages/common/Unauthorized";
import Missing from "./pages/common/Missing";
import AdministratorUserPanel from "./pages/adminPanel/AdministratorPanel";

// Utils
import UserRoles from "./utils/constants/UserRoles";
import GlobalAlert from "./components/common/GlobalAlert";

// Styles
import "./styles/reset.css";
import PageRoutes from "./utils/constants/Routes";
import AdminLogin from "./pages/adminPanel/AdminLogin";
import RequireAdminAuth from "./components/auth/RequireAdminAuth";
import VolunteerMainPage from "./pages/volunteerPanel/VolunteerMainPage";
import VolunteerPostulationsTablePage from "./pages/volunteerPanel/VolunteerPostulationsTablePage";
import VolunteerFollowSessionsPage from "./pages/volunteerPanel/VolunteerFollowSessionsPage";

function App() {
    return (
        <>
            <GlobalAlert />
            <Routes>
                {/*Public pages*/}
                <Route path="/" element={<Login />} />
                <Route path={PageRoutes.SIGNUP} element={<SignUpPage />} />
                <Route
                    path={PageRoutes.UNAUTHORIZED}
                    element={<Unauthorized />}
                />

                {/*Privated pages*/}
                <Route element={<PersistSession />}>
                    <Route
                        element={<RequireAuth authRole={UserRoles.Supplier} />}
                    >
                        <Route
                            path={PageRoutes.SUPPLIER_PANEL}
                            element={<SupplierPanel />}
                        />
                    </Route>

                    <Route
                        element={<RequireAuth authRole={UserRoles.Volunteer} />}
                    >
                        <Route
                            path={PageRoutes.VOLUNTEER_PANEL}
                            element={<VolunteerMainPage/>}
                        />
                    </Route>

                    <Route
                        element={<RequireAuth authRole={UserRoles.Volunteer} />}
                    >
                        <Route
                            path={PageRoutes.VOLUNTEER_POSTULATIONS}
                            element={<VolunteerPostulationsTablePage/>}
                        />
                    </Route>

                    <Route
                        element={<RequireAuth authRole={UserRoles.Volunteer} />}
                    >
                        <Route
                            path={PageRoutes.VOLUNTEER_SESSIONS}
                            element={<VolunteerFollowSessionsPage/>}
                        />
                    </Route>
                </Route>

                <Route
                    path={PageRoutes.ADMINISTRATOR_LOGIN}
                    element={<AdminLogin />}
                />
                <Route element={<RequireAdminAuth />}>
                    <Route
                        path={PageRoutes.ADMINISTRATOR_USER_PANEL}
                        element={<AdministratorUserPanel />}
                    />
                </Route>

                {/*others*/}
                <Route path="*" element={<Missing />} />
            </Routes>
        </>
    );
}

export default App;

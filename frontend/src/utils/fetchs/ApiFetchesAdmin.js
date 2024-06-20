import httpMethods from "../constants/HTTPMethods";
import secureFetch from "./SecureFetch";

const adminBaseRoute = "admin";

/**
 * Retrieves all users from the system.
 */
export const getAdminUsers = (page, pageSize) => {
    return secureFetch(
        `http://localhost:8080/${adminBaseRoute}/users?page=${page}&pageSize=${pageSize}`,
        httpMethods.GET,
        null,
        {}
    );
};

/**
 * Changes an user suspended status
 * @param {*} username Username of the user to change suspended status
 */
export const changeUserSuspendedStatus = (username) => {
    const encodedUsername = btoa(username);

    return secureFetch(
        `http://localhost:8080/${adminBaseRoute}/change-suspended-status?encodedUsername=${encodedUsername}`,
        httpMethods.GET,
        null,
        {}
    );
};

/**
 * Deletes an user account
 * @param {*} username User username to delete
 */
export const deleteAdminUser = (username) => {
    const encodedUsername = btoa(username);

    return secureFetch(
        `http://localhost:8080/${adminBaseRoute}/delete-user?encodedUsername=${encodedUsername}`,
        httpMethods.GET,
        null,
        {}
    );
};

/**
 * Edits an user
 * @param {*} request Request with the new details of the user
 */
export const editAdminUser = (request) => {
    return secureFetch(
        `http://localhost:8080/${adminBaseRoute}/edit-user`,
        httpMethods.POST,
        JSON.stringify(request),
        {}
    );
};

/**
 * Request a password reset for an user
 * @param {*} request Request with the new password
 */
export const resetPasswordAdminUser = (request) => {
    return secureFetch(
        `http://localhost:8080/${adminBaseRoute}/reset-password`,
        httpMethods.POST,
        JSON.stringify(request),
        {}
    );
};

/**
 * Login for admin users
 * @param {*} request Credentials
 */
export const loginAdmin = (request) => {
    return secureFetch(
        `http://localhost:8080/auth/admin-login`,
        httpMethods.POST,
        JSON.stringify(request),
        {}
    );
};

/**
 * Logouts an admin user.
 */
export const logoutAdmin = () => {
    return secureFetch(
        `http://localhost:8080/${adminBaseRoute}/logout`,
        httpMethods.GET,
        null,
        {}
    );
};

/**
 * Health checks an admin auth token
 */
export const healthCheckAdmin = () => {
    return secureFetch(
        `http://localhost:8080/${adminBaseRoute}/health`,
        httpMethods.GET,
        null,
        {}
    );
};

/**
 * Retrieves all suppliers from the system.
 */
export const getAdminSuppliers = (page, pageSize) => {
    return secureFetch(
        `http://localhost:8080/${adminBaseRoute}/suppliers?page=${page}&pageSize=${pageSize}`,
        httpMethods.GET,
        null,
        {}
    );
};

/**
 * Generate report of a list of suppliers
 * @param {*} request request with the date and suppliers
 */
export const getAdminReports = (request) => {
    return secureFetch(
        `http://localhost:8080/${adminBaseRoute}/generate-report`,
        httpMethods.POST,
        JSON.stringify(request),
        {}
    );
};
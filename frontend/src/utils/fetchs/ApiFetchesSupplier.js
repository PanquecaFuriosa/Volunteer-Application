import httpMethods from "../constants/HTTPMethods";
import secureFetch from "./SecureFetch";

const supplierBaseRoute = "api/supplier";

/**
 * Gets all of the works from a supplier within a month and year
 *
 * @param {*} month Month to get the works from
 * @param {*} year  Year to get the works from
 */
export const getSupplierWorksByMonthYear = (month, year) => {
    return secureFetch(
        `http://localhost:8080/${supplierBaseRoute}/works?month=${month}&year=${year}`,
        httpMethods.GET,
        null,
        {}
    );
};

/**
 * Creates a supplier work
 *
 * @param {*} request Request containing the information required to create a work
 */
export const createSupplierWork = (request) => {
    return secureFetch(
        `http://localhost:8080/${supplierBaseRoute}/work-create`,
        httpMethods.POST,
        JSON.stringify(request),
        {}
    );
};

/**
 * Edits a supplier work
 *
 * @param {*} request Request containing the information required to edit a work
 */
export const editSupplierWork = (request) => {
    return secureFetch(
        `http://localhost:8080/${supplierBaseRoute}/work-edit`,
        httpMethods.POST,
        JSON.stringify(request),
        {}
    );
};

/**
 * Deletes a supplier work
 *
 * @param {*} request Request containing the information to delete a work
 */
export const deleteSupplierWork = (request) => {
    try {
        return secureFetch(
            `http://localhost:8080/${supplierBaseRoute}/del-work`,
            httpMethods.DELETE,
            JSON.stringify(request),
            {}
        );
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * deny a Volunteer postulation in a work
 * @param {*} postulationId The postulation ID
 */
export const rejectVolunteerPostulation = (postulationId) => {
    return secureFetch(
        `http://localhost:8080/${supplierBaseRoute}/reject-postulation?postulationId=${postulationId}`,
        httpMethods.POST,
        null,
        {}
    );
};

/**
 * Accept a Volunteer postulation in a work
 * @param {*} postulationId The postulation ID
 */
export const acceptVolunteerPostulation = (postulationId) => {
    return secureFetch(
        `http://localhost:8080/${supplierBaseRoute}/accept-postulation?postulationId=${postulationId}`,
        httpMethods.POST,
        null,
        {}
    );
};

/**
 * Edits the session status of a work for a supplier.
 * @param {Object} request - The request object containing session details.
 * @param {Long} sessionId - The ID of the volunteer's session to change its status.
 * @param {String} newStatus - The new status of the session.
 */
export const editSessionStatus = (sessionId, newStatus) => {
    return secureFetch(
        `http://localhost:8080/${supplierBaseRoute}/session-status?sessionId=${sessionId}&newStatus=${newStatus}`,
        httpMethods.POST,
        null
    );
};

/**
 * Get all Volunteers accepted in an blockDate and BlockTime of a work.
 * @param {Object} request - The request object containing session details.
 * @param {LocalDate} request.blockDate - The Date block of the session.
 * @param {LocalTime} request.blockTime - The Time block of the session.
 * @param {Long} request.workId - The ID of the work.
 */
export const getSuppliersVolunteersBySession = (request) => {
    return secureFetch(
        `http://localhost:8080/${supplierBaseRoute}/work-sessions`,
        httpMethods.POST,
        JSON.stringify(request),
        {}
    );
};

/**
 * Gets all the pending postulations for works of a supplier work.
 * @param {Long} workId - The ID of the work
 */
export const getWorkPendingPostulations = (workId) => {
    return secureFetch(
        `http://localhost:8080/${supplierBaseRoute}/work-pending-postulations?workId=${workId}`,
        httpMethods.GET,
        null,
        {}
    );
};

/**
 * Gets all the pending postulations for works of a supplier work by pages.
 * @param {Long} page - The page number for pagination.
 * @param {Long} pageSize  - The number of items per page for pagination.
 */
export const getPendingPostulations = (page, pageSize) => {
    return secureFetch(
        `http://localhost:8080/${supplierBaseRoute}/pending-postulations-works?page=${page}&pageSize=${pageSize}`,
        httpMethods.GET,
        null,
        {}
    );
};

export const getSupplierReport = (start, end, fileType, reportType) => {
    return secureFetch(
        `http://localhost:8080/${supplierBaseRoute}/generate-report?start=${start}&end=${end}&fileType=${fileType}&reportType=${reportType}`,
        httpMethods.GET,
        null,
        {}
    );
};

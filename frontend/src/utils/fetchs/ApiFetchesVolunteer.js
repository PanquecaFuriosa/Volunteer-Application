import httpMethods from "../constants/HTTPMethods";
import secureFetch from "./SecureFetch";

const apiBaseRoute = "api/user";

export const getVolunteerWorksByMonthYear = (month, year, blocks) => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/works-by?month=${month}&year=${year}`,
        httpMethods.POST,
        JSON.stringify(blocks),
        {}
    );
};

export const getAllWorks = () => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/works`,
        httpMethods.GET,
        null,
        {}
    );
};

export const getDetailsUser = () => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/details`,
        httpMethods.GET,
        null,
        {}
    );
};

export const editUserPreferences = (request) => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/user-edit`,
        httpMethods.POST,
        JSON.stringify(request),
        {}
    );
};

export const getUserPostulations = (page, pageSize) => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/page-postulations?page=${page}&pageSize=${pageSize}`,
        httpMethods.GET,
        null,
        {}
    );
};

export const getPostulationWork = (id) => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/postulation-work?postulationId=${id}`,
        httpMethods.GET,
        null,
        {}
    );
};

export const cancelUserPostulation = (id) => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/cancel-postulation?postulationId=${id}`,
        httpMethods.GET,
        null,
        {}
    );
};

export const getAllUserPostulation = () => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/postulations`,
        httpMethods.GET,
        null,
        {}
    );
};

export const userPostulation = (request) => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/postulate`,
        httpMethods.POST,
        JSON.stringify(request),
        {}
    );
};

export const editUserPostulation = (request) => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/edit-postulation`,
        httpMethods.POST,
        JSON.stringify(request),
        {}
    );
};

export const getWorkPostulation = (id) => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/work-postulation?workId=${id}`,
        httpMethods.GET,
        null,
        {}
    );
};

export const getWorkSessions = (month, year) => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/work-sessions?month=${month}&year=${year}`,
        httpMethods.GET,
        null,
        {}
    );
};

export const getWorkFromSession = (sessionId) => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/work-from-session?sessionId=${sessionId}`,
        httpMethods.GET,
        null,
        {}
    );
};

export const getVolunteerReport = (start, end, fileType, reportType) => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/generate-report?start=${start}&end=${end}&fileType=${fileType}&reportType=${reportType}`,
        httpMethods.GET,
        null,
        {}
    );
};

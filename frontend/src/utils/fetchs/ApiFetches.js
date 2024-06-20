import httpMethods from "../constants/HTTPMethods";
import secureFetch from "./SecureFetch";

const authBaseRoute = "auth";
const apiBaseRoute = "api";

export const logOutUser = () => {
    return secureFetch(
        `http://localhost:8080/${authBaseRoute}/logout`,
        httpMethods.GET,
        null,
        {}
    );
};

export const registerUser = (request) => {
    return secureFetch(
        `http://localhost:8080/${authBaseRoute}/register`,
        httpMethods.POST,
        JSON.stringify(request),
        {}
    );
};

export const getAllTags = () => {
    return secureFetch(
        `http://localhost:8080/${apiBaseRoute}/all/tags`,
        httpMethods.GET,
        null,
        {}
    );
};

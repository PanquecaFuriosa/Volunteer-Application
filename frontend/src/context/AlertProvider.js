import { createContext, useRef, useState } from "react";

// msg: "", severity: ""
export const AlertContext = createContext({});

export const AlertSeverity = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
};

/**
 * Displays an alert in the top left corner of the screen as an overlay.
 *
 * @param {*} text Alert text to display
 * @param {*} severity Alert severity to display
 * @param {*} lastTimeout Last alert fade timeout id
 * @param {*} alertSetter AlertProvider state.
 */
const popAlert = (text, severity, lastTimeout, alertSetter) => {
    if (lastTimeout.current !== undefined) clearTimeout(lastTimeout.current);

    alertSetter({ text: text, severity: severity, fade: true });

    lastTimeout.current = setTimeout(() => {
        alertSetter({});
    }, 4000);
};

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({});
    let timeOutID = useRef(undefined);

    return (
        <AlertContext.Provider
            value={{
                alert,
                popAlert: (text, severity) =>
                    popAlert(text, severity, timeOutID, setAlert),
            }}
        >
            {children}
        </AlertContext.Provider>
    );
};

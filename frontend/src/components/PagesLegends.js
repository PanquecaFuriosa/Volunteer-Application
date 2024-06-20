import { Box, Typography } from "@mui/material";

/**
 * Main Volunteer calendar legend
 * @returns Main Volunteer calendar legend components
 */
export const BigCalendarVolunteerLegend = (isSession) => {
    return isSession ? (
        <Box display={"flex"} flexDirection={"row"} flexWrap={"wrap"}>
            <Box display={"flex"} flexDirection={"row"} flexBasis={"100%"}>
                <Typography>Legend</Typography>
            </Box>
            <Box display={"flex"} flexDirection={"row"} flexBasis={"100%"}>
                <i className="bi bi-alarm" style={{ alignSelf: "center" }}></i>
                <Typography>Session work</Typography>
            </Box>
        </Box>
    ) : (
        <Box display={"flex"} flexDirection={"row"} flexWrap={"wrap"}>
            <Box display={"flex"} flexDirection={"row"} flexBasis={"100%"}>
                <Typography>Legend</Typography>
            </Box>
            <Box display={"flex"} flexDirection={"row"} flexBasis={"50%"}>
                <i
                    className="bi bi-bookmark-fill"
                    style={{ alignSelf: "center" }}
                ></i>
                <Typography>Session work</Typography>
            </Box>
            <Box
                display={"flex"}
                flexDirection={"row"}
                flexBasis={"50%"}
            >
                <i className="bi bi-person-fill"></i>
                <Typography>Postulations</Typography>
            </Box>
            <Box display={"flex"} flexDirection={"row"} flexBasis={"50%"}>
                <i
                    className="bi-bookmark-fill"
                    style={{ color: "green", alignSelf: "center" }}
                ></i>
                <Typography>Recurrent work</Typography>
            </Box>
        </Box>
    );
};

/**
 * Main supplier calendar legend
 * @returns Main supplier calendar legend components
 */
export const BigCalendarSupplierLegend = () => {
    return (
        <Box display={"flex"} flexDirection={"row"} flexWrap={"wrap"}>
            <Box display={"flex"} flexDirection={"row"} flexBasis={"100%"}>
                <Typography>Legend</Typography>
            </Box>
            <Box display={"flex"} flexDirection={"row"} flexBasis={"50%"}>
                <i
                    className="bi bi-bookmark-fill"
                    style={{ alignSelf: "center" }}
                ></i>
                <Typography>Session work</Typography>
            </Box>
            <Box
                display={"flex"}
                alignItems={"center"}
                flexDirection={"row"}
                flexBasis={"50%"}
            >
                <i
                    className="bi bi-person-fill"
                    style={{ alignSelf: "center" }}
                ></i>
                <Typography>New postulations</Typography>
            </Box>
            <Box display={"flex"} flexDirection={"row"} flexBasis={"50%"}>
                <i
                    className="bi-bookmark-fill"
                    style={{ color: "green", alignSelf: "center" }}
                ></i>
                <Typography>Recurrent work</Typography>
            </Box>
        </Box>
    );
};

/**
 * Mini volunteer calendar legend
 * @param isSession a boolean that indicates if the minicalendar
 *                  show days with sessions
 * @returns Mini volunteer calendar legend components
 */
export const MiniCalendarVolunteerLegend = (isSession) => {
    return (
        <Typography>
            🔵{isSession ? "Day with session" : "Available work"}
        </Typography>
    );
};

/**
 * Mini supplier calendar legend
 * @returns Mini supplier calendar legend components
 */
export const MiniCalendarSupplierLegend = () => {
    return (
        <>
            <Typography>🔵 Available work</Typography>
            <Typography>🧔 New postulations</Typography>
        </>
    );
};

import { useState, useEffect } from "react";
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    Skeleton,
} from "@mui/material";
import WorkHourSelector from "../../../components/common/WorkHourSelector";
import TagSelector from "../../../components/common/TagSelector";
import dayjs from "dayjs";
import { getDetailsUser } from "../../../utils/fetchs/ApiFetchesVolunteer";
import { useGlobalAlert } from "../../../hooks/useGlobalAlert";
import { AlertSeverity } from "../../../context/AlertProvider";

/**
 * Configure form fields to view the user's profile
 *
 * @param {*} username user's username
 * @param {*} fullname user's fullname
 * @param {*} id user's id
 * @param {*} date user's birthdate
 * @param {*} tags user's tags
 * @param {*} workBlocks user's preferences blocks
 * @returns The form fields to view the user's profile
 */
const formData = (username, fullname, id, date, tags = [], workBlocks) => {
    if (!username) {
        return (
            <>
                <Skeleton variant="rectangle" width={500} />
                <Skeleton variant="rectangle" height={200} sx={{ mt: 2 }} />
                <Skeleton variant="rectangle" width={500} sx={{ mt: 2 }} />
            </>
        );
    }
    return (
        <>
            <TextField
                variant="standard"
                disabled
                fullWidth
                className="input-disabled"
                sx={{ mb: 2, color: "rgba(0, 0, 0, 0.8)" }}
                label="Username"
                value={username}
                InputProps={{
                    endAdornment: (
                        <InputAdornment
                            position="end"
                            className="bi bi-person"
                        />
                    ),
                }}
            />

            <TextField
                variant="standard"
                disabled
                fullWidth
                className="input-disabled"
                sx={{ mb: 2 }}
                label="Fullname"
                value={fullname}
                InputProps={{
                    endAdornment: (
                        <InputAdornment
                            position="end"
                            className="bi bi-person"
                        />
                    ),
                }}
            />

            <TextField
                variant="standard"
                disabled
                fullWidth
                className="input-disabled"
                sx={{ mb: 2 }}
                label="Birthdate"
                value={date}
                InputProps={{
                    placeholder: "Birthdate",
                    endAdornment: (
                        <InputAdornment
                            position="end"
                            className="bi bi-calendar"
                        />
                    ),
                }}
            />

            <TextField
                variant="standard"
                disabled
                fullWidth
                className="input-disabled"
                sx={{ mb: 2 }}
                label="ID"
                value={id}
                InputProps={{
                    placeholder: "ID",
                    endAdornment: (
                        <InputAdornment
                            position="end"
                            className="bi bi-person-vcard"
                        />
                    ),
                }}
            />

            <TagSelector value={tags} readOnly={true} />

            <WorkHourSelector
                readonly={true}
                hourBlocks={workBlocks}
                minBlocks={0}
            />
        </>
    );
};

/**
 * Create the modal that shows the user profile
 * 
 * @param {*} open boolean that indicates true if the modal is open
 * @param {*} handleClose function that closes the modal
 * @returns The modal that shows the user profile
 */
const ProfileModal = ({ open, handleClose }) => {
    const [dataUser, setDataUser] = useState({}); // User's information

    const { popAlert } = useGlobalAlert();

    // Request all the user's details
    const fetchUserDetails = async () => {
        try {
            const response = await getDetailsUser();
            if (!response.ok) {
                const errorText = await response.text();
                popAlert(errorText, AlertSeverity.ERROR);
                return;
            }
            setDataUser(await response.json());
        } catch (e) {
            popAlert("A network error occurred.", "error");
            return;
        }
    };

    // Load all the user's details
    useEffect(() => {
        fetchUserDetails();
    }, []);

    return (
        <div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ padding: "35px 35px 0px 35px" }}>
                    {`${dataUser.userName}'s profile`}
                </DialogTitle>
                <DialogContent
                    sx={{ padding: "35px 35px 35px 35px !important" }}
                >
                    {formData(
                        dataUser.userName,
                        dataUser.fullName,
                        dataUser.institutionalID,
                        dataUser.birthDate,
                        dataUser.userTags !== undefined
                            ? dataUser.userTags.map((t) => {
                                  return {
                                      tag: t,
                                  };
                              })
                            : [],
                        dataUser.hourBlocks !== undefined
                            ? dataUser.hourBlocks.map((h) => {
                                  return {
                                      hourBlock: dayjs(h.hourBlock, "HH:mm:ss"),
                                      weekDay: h.weekDay,
                                  };
                              })
                            : []
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Accept</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
export default ProfileModal;

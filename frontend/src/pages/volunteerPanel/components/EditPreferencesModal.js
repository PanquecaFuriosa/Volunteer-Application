import { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import {
    validateWorkBlocks,
    AllBlocksValidation,
    scheduleValidation,
    validateSchedule,
    scheduleValidationLabel,
} from "../../../utils/WorkModalFormValidator";
import WorkHourSelector from "../../../components/common/WorkHourSelector";
import TagSelector from "../../../components/common/TagSelector";
import {
    getDetailsUser,
    editUserPreferences,
} from "../../../utils/fetchs/ApiFetchesVolunteer";
import { useGlobalAlert } from "../../../hooks/useGlobalAlert";
import HTTPStatus from "../../../utils/constants/HttpStatus";
import dayjs from "dayjs";
import { AlertSeverity } from "../../../context/AlertProvider";

const minHour = dayjs().set("hour", 7).startOf("hour");
const maxHour = dayjs().set("hour", 17).startOf("hour");

/**
 * Configure form fields to edit preferences
 *
 * @param {*} tags user's tags
 * @param {*} setTags function to set user's tags
 * @param {*} hourBlocks user's preferences blocks
 * @param {*} setHourBlocks function to ser user's preferences blocks
 * @returns The form fields to edit preferences
 */
const formData = (tags, setTags, hourBlocks, setHourBlocks) => {
    return (
        <>
            <TagSelector value={tags} onChange={setTags} />
            <WorkHourSelector
                hourBlocks={hourBlocks}
                minBlocks={0}
                maxBlocks={3}
                onChange={setHourBlocks}
            />
        </>
    );
};

/**
 * Does the fetch to get the user's information
 *
 * @param {*} popAlert function that displays the messages about the fetch
 * @param {*} setDataUser function that set de data user
 */
const fetchUserDetails = async (popAlert, setDataUser) => {
    try {
        const rPrefs = await getDetailsUser();
        if (!rPrefs.ok) {
            const errorText = await rPrefs.text();
            popAlert(errorText, AlertSeverity.ERROR);
            return;
        }

        const prefs = await rPrefs.json();
        setDataUser(prefs);
    } catch (e) {
        popAlert("A network error occurred.", AlertSeverity.ERROR);
        return;
    }
};

/**
 * Crate the edit preferences modal
 * 
 * @param {*} open boolean that indicates true if the modal is open
 * @param {*} handleClose function to clase the modal
 * @param {*} handleTagChange function to changes the tags in the tags field
 * @param {*} onPreferencesChanged function to changes the tags and the block hours
 * @returns The edit preferences modal
 */
const EditPreferencesModal = ({
    open,
    handleClose,
    handleTagChange = undefined,
    onPreferencesChanged = undefined,
}) => {
    const [dataUser, setDataUser] = useState({}); // User's information
    const [hourBlocks, setHourBlocks] = useState([]); // User's preferences blocks
    const [tags, setTags] = useState([]); // User's tags

    const { popAlert } = useGlobalAlert();

    // Load all the user's details
    useEffect(() => {
        fetchUserDetails(popAlert, setDataUser);
    }, [popAlert, setDataUser]);

    // Load all the user's tags and the user's hours blocks
    useEffect(() => {
        setTags(
            dataUser.userTags !== undefined
                ? dataUser.userTags.map((t) => {
                      return { tag: t };
                  })
                : []
        );
        setHourBlocks(
            dataUser.hourBlocks !== undefined
                ? dataUser.hourBlocks.map((h) => {
                      return {
                          hourBlock: dayjs(h.hourBlock, "HH:mm:ss"),
                          weekDay: h.weekDay,
                      };
                  })
                : []
        );
    }, [dataUser]);

    // Does the fetch to edit the user's preferences
    const handleSubmitDialog = async () => {
        const validationAllBlocks = validateWorkBlocks(hourBlocks);
        if (validationAllBlocks === AllBlocksValidation.REPEATED_BLOCKS) {
            popAlert("Some hour blocks are repeated", "error");
            return;
        }

        // apply format required by the TagSelector
        const tagsSubmit = [];
        for (let tag in tags) {
            tagsSubmit.push(tags[tag].tag);
        }

        // time block validation
        const processedBlock = [];
        for (let i = 0; i < hourBlocks.length; ++i) {
            const block = hourBlocks[i];
            const schVal = validateSchedule(block.hourBlock, minHour, maxHour);
            if (schVal !== scheduleValidation.VALID_SCHEDULE) {
                popAlert(
                    scheduleValidationLabel(schVal, `Hour ${block.hourBlock}`),
                    "error"
                );
                return;
            }

            processedBlock.push({
                hourBlock: block.hourBlock.format("HH:00:00"),
                weekDay: block.weekDay,
            });
        }

        const request = {
            userTags: tagsSubmit,
            hourBlocks: processedBlock,
        };

        try {
            const response = await editUserPreferences(request);

            if (!response.ok) {
                if (response.status !== HTTPStatus.BAD_REQUEST) {
                    popAlert(
                        "An error ocurred: " + response.statusText,
                        "error"
                    );
                    return;
                }
            }
            popAlert("Preferences successfully edited!", "success");
        } catch (e) {
            popAlert("A network error occurred.", "error");
            return;
        }

        if (onPreferencesChanged !== undefined)
            onPreferencesChanged({ tags, hourBlocks });

        if (handleTagChange !== undefined)
            handleTagChange(tags.map((t) => t.tag));
        handleClose();
    };

    return (
        <div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ padding: "35px 35px 0px 35px" }}>
                    {`Edit ${dataUser.userName}'s preferences`}
                </DialogTitle>
                <DialogContent
                    sx={{ padding: "35px 35px 35px 35px !important" }}
                >
                    {formData(tags, setTags, hourBlocks, setHourBlocks)}
                </DialogContent>
                <DialogActions>
                    <Button
                        className="cancel-button-contained"
                        variant="contained"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="success"
                        variant="contained"
                        onClick={handleSubmitDialog}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default EditPreferencesModal;

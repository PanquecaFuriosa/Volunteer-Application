import { useEffect, useState } from "react";

// dayjs
import dayjs from "dayjs";
import "dayjs/plugin/customParseFormat";

// MUI
import {
    TextField,
    Grid,
    Tabs,
    Tab,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tooltip,
} from "@mui/material";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// constants
import WorkTypes from "../../utils/constants/WorkTypes";

// Validator functions
import {
    nameValidation,
    validateName,
    nameValidationLabel,
    descriptionValidation,
    validateDescription,
    descriptionValidationLabel,
    tagsValidation,
    validateTags,
    tagsValidationLabel,
    startDateValidation,
    validateStartDate,
    startDateValidationLabel,
    endDateValidation,
    validateEndDate,
    endDateValidationLabel,
    scheduleValidation,
    validateSchedule,
    scheduleValidationLabel,
    numberVolunteerValidation,
    validateNumberVolunteer,
    numberVolunteerValidationLabel,
    validateWorkBlocks,
    AllBlocksValidation,
} from "../../utils/WorkModalFormValidator";

// fetchs
import {
    createSupplierWork,
    editSupplierWork,
} from "../../utils/fetchs/ApiFetchesSupplier";
import HTTPStatus from "../../utils/constants/HttpStatus";

// alerts
import { useGlobalAlert } from "../../hooks/useGlobalAlert";

// load Spinner
import LoadSpinner from "../../components/common/LoadSpinner";
import WorkHourSelector from "../../components/common/WorkHourSelector";
import WorkDetails from "../../utils/constants/WorkDetails";
import TagSelector from "../../components/common/TagSelector";
import VolunteersManagementTab from "./VolunteersManagementTab";
import PostulationsTab from "./PostulationsTab";
import { fetchPostulations } from "./PostulationsTab";
import { fetchVolunteers } from "./VolunteersManagementTab";

// Range of hours avaibles to make a work
const minHour = dayjs().set("hour", 7).startOf("hour");
const maxHour = dayjs().set("hour", 17).startOf("hour");

const ModalJob = ({
    open,
    setOpen,
    create,
    data,
    dateAndHour = undefined,
    onVolunteerChange = undefined,
    onPostulationChange = undefined,
}) => {
    const [hourBlocks, setHourBlocks] = useState(
        create
            ? data
                ? data.blocks
                : [{ hourBlock: minHour, weekDay: 0 }]
            : data.hours.map((w) => {
                  return {
                      hourBlock: dayjs(w.hourBlock, "HH:00:00"),
                      weekDay: w.weekDay,
                  };
              })
    );
    const [postulations, setPostulations] = useState(undefined);
    const [volunteers, setVolunteers] = useState(undefined);

    //form fields states
    const [name, setName] = useState(create ? "" : data.name);
    const [description, setDescription] = useState(
        create ? "" : data.description
    );
    const [type, setType] = useState(create ? WorkTypes.SESSION : data.type);
    const [numberVolunteer, setNumberVolunteer] = useState(
        create ? "1" : data.volunteersNeeded
    );

    const [tags, setTags] = useState(
        create
            ? []
            : data.tags.map((t) => {
                  return { tag: t };
              })
    );
    const [startDate, setStartDate] = useState(
        create
            ? data
                ? dayjs(data.date, "DD-MM-YYYY")
                : dayjs().add(1, "day")
            : dayjs(data.startDate, "DD-MM-YYYY")
    );
    const [endDate, setEndDate] = useState(
        create
            ? data
                ? dayjs(data.date, "DD-MM-YYYY")
                : dayjs().add(1, "day")
            : dayjs(data.endDate, "DD-MM-YYYY")
    );

    // Error states
    const [nameError, setNameError] = useState(false);
    const [nameErrorText, setNameErrorText] = useState("");

    const [descriptionError, setDescriptionError] = useState(false);
    const [descriptionErrorText, setDescriptionErrorText] = useState("");

    const [numberVolunteerError, setNumberVolunteerError] = useState(false);
    const [numberVolunteerErrorText, setNumberVolunteerErrorText] =
        useState("");

    const [workingTry, setWorkingTry] = useState(false);

    // tabs
    const [tabValue, setTabValue] = useState(
        !create && data.postulation ? 2 : 0
    );
    // alerts
    const { popAlert } = useGlobalAlert();
    const currentDate = dayjs();
    const hourBlock = dateAndHour === undefined ? "" : dateAndHour.hourBlock;
    const dateBlock = dateAndHour === undefined ? "" : dateAndHour.dateBlock;
    const workId = dateAndHour === undefined ? "" : dateAndHour.workId;

    const handleCloseDialog = () => {
        window.location.reload();
        setOpen(false);
    };

    const handleSubmitDialog = async () => {
        const validationName = validateName(name);
        if (validationName !== nameValidation.VALID_NAME) {
            setNameError(true);
            setNameErrorText(nameValidationLabel(validationName));
            return;
        }

        const validationDescription = validateDescription(description);
        if (validationDescription !== descriptionValidation.VALID_DESCRIPTION) {
            setDescriptionError(true);
            setDescriptionErrorText(
                descriptionValidationLabel(validationDescription)
            );
            return;
        }

        const validationNumberVolunteer =
            validateNumberVolunteer(numberVolunteer);
        if (
            validationNumberVolunteer !==
            numberVolunteerValidation.VALID_NUMBER_VOLUNTEER
        ) {
            setNumberVolunteerError(true);
            setNumberVolunteerErrorText(
                numberVolunteerValidationLabel(validationNumberVolunteer)
            );
            return;
        }

        const validationStartDate = validateStartDate(startDate);
        if (validationStartDate !== startDateValidation.VALID_START_DATE) {
            popAlert(startDateValidationLabel(validationStartDate), "error");
            return;
        }

        const validationEndDate = validateEndDate(endDate, startDate);
        if (validationEndDate !== endDateValidation.VALID_END_DATE) {
            popAlert(endDateValidationLabel(validationEndDate), "error");
            return;
        }

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
                weekDay: type === WorkTypes.SESSION ? -1 : block.weekDay,
            });
        }

        const validationAllBlocks = validateWorkBlocks(processedBlock);
        if (validationAllBlocks === AllBlocksValidation.REPEATED_BLOCKS) {
            popAlert("Some hour blocks are repeated", "error");
            return;
        }

        const validationTags = validateTags(tags);
        if (validationTags !== tagsValidation.VALID_TAGS) {
            popAlert(tagsValidationLabel(validationTags), "error");
            return;
        }

        const request = {
            name: name,
            description: description,
            type: type,
            tags: tags.map((t) => t.tag),
            startDate: startDate.format("DD-MM-YYYY"),
            endDate: endDate.format("DD-MM-YYYY"),
            volunteersNeeded: numberVolunteer,
            hourBlocks: processedBlock,
        };

        if (!create) {
            request.name = data.name;
            request.newName = name !== data.name ? name : null;
        }

        try {
            setWorkingTry(true);
            const response = create
                ? await createSupplierWork(request)
                : await editSupplierWork(request);

            if (!response.ok) {
                if (response.status !== HTTPStatus.BAD_REQUEST) {
                    popAlert(
                        "An error ocurred: " + response.statusText,
                        "error"
                    );
                    return;
                }
                popAlert(
                    create
                        ? "Error, make sure that the work has not been created before."
                        : "Error, please check all the fields",
                    "error"
                );
                return;
            }
            popAlert(
                `Work successfully ${create ? " created!" : " edited!"}`,
                "success"
            );
        } catch (e) {
            popAlert("A network error occurred.", "error");
            return;
        } finally {
            setWorkingTry(false);
        }

        handleCloseDialog();
    };

    const handleChangeName = (event) => {
        if (nameError) {
            setNameError(false);
            setNameErrorText("");
        }
        setName(event.target.value);
    };

    const handleChangeDescription = (event) => {
        if (descriptionError) {
            setDescriptionError(false);
            setDescriptionErrorText("");
        }
        setDescription(event.target.value);
    };

    const handleChangeType = (event) => {
        if (event.target.value === WorkTypes.SESSION) setEndDate(startDate);
        else if (event.target.value === WorkTypes.RECURRING)
            setEndDate(startDate.add(1, "day"));

        setType(event.target.value);
    };

    const handleNumbVolunteers = (event) => {
        if (numberVolunteerError) {
            setNumberVolunteerError(false);
            setNumberVolunteerErrorText("");
        }

        if (/^[0-9]*$/.test(event.target.value)) {
            setNumberVolunteer(event.target.value);
        }
    };

    const handleChangeStartDate = (newValue) => {
        if (type === WorkTypes.SESSION) setEndDate(newValue);
        else if (newValue.isAfter(endDate)) setEndDate(newValue.add(1, "day"));

        setStartDate(newValue);
    };

    const isNotAEndDateValid = (date) => {
        return !startDate.isBefore(date, "day");
    };

    useEffect(() => {
        if (!create) {
            fetchPostulations(workId, popAlert, setPostulations);
            fetchVolunteers(
                workId,
                dateBlock,
                hourBlock,
                popAlert,
                setVolunteers
            );
        }
    }, []);

    return (
        <>
            <Dialog
                open={open}
                onClose={(_) => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
                maxWidth="sm"
            >
                {create ? (
                    <DialogTitle id="alert-dialog-title">
                        {"Create Work"}
                    </DialogTitle>
                ) : (
                    <DialogTitle
                        id="alert-dialog-title"
                        style={{ marginBottom: "7px" }}
                    >
                        {name.length > 20
                            ? `${name.substring(0, 20)}...`
                            : name}
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                            <Tabs
                                value={tabValue}
                                onChange={(_, t) => setTabValue(t)}
                            >
                                <Tab label="Edit Work" />
                                <Tab label="Volunteers Session" />
                                <Tab label="New Postulations" />
                            </Tabs>
                        </Box>
                    </DialogTitle>
                )}

                <DialogContent>
                    {(create || tabValue === 0) && (
                        <Grid container rowSpacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    value={name}
                                    onChange={handleChangeName}
                                    id="name"
                                    label="Name"
                                    variant="standard"
                                    autoComplete="off"
                                    fullWidth
                                    error={nameError}
                                    helperText={nameErrorText}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    value={description}
                                    onChange={handleChangeDescription}
                                    id="description"
                                    label="Description"
                                    multiline
                                    fullWidth
                                    rows={4}
                                    error={descriptionError}
                                    helperText={descriptionErrorText}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Tooltip
                                    title={"Type of the work"}
                                    arrow
                                    placement="top"
                                >
                                    <FormControl fullWidth>
                                        <InputLabel id="type-input-label-id">
                                            Type
                                        </InputLabel>
                                        <Select
                                            labelId="type-label-id"
                                            id="type-id"
                                            value={type}
                                            label="Type"
                                            onChange={handleChangeType}
                                            defaultValue={WorkTypes.SESSION}
                                        >
                                            <MenuItem value={WorkTypes.SESSION}>
                                                Session
                                            </MenuItem>
                                            <MenuItem
                                                value={WorkTypes.RECURRING}
                                            >
                                                Recurring
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Tooltip>
                            </Grid>

                            <Grid item xs={12}>
                                <Tooltip
                                    title={
                                        "Number of volunteers required for the work. It must be higher than 0."
                                    }
                                    arrow
                                >
                                    <TextField
                                        label="Volunteers Required"
                                        value={numberVolunteer}
                                        onChange={handleNumbVolunteers}
                                        error={numberVolunteerError}
                                        helperText={numberVolunteerErrorText}
                                        sx={{ width: 245 }}
                                    />
                                </Tooltip>
                            </Grid>
                            <Grid item xs={6}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        label="Start date"
                                        value={startDate}
                                        onChange={handleChangeStartDate}
                                        sx={{ marginTop: 1 }}
                                        fullWidth
                                        disablePast
                                        format="DD-MM-YYYY"
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={6}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    {type === WorkTypes.SESSION ? (
                                        <DatePicker
                                            label="End date"
                                            value={endDate}
                                            onChange={(v) => setEndDate(v)}
                                            sx={{ marginTop: 1 }}
                                            readOnly
                                            fullWidth
                                            disablePast
                                            format="DD-MM-YYYY"
                                        />
                                    ) : (
                                        <DatePicker
                                            label="End date"
                                            value={endDate}
                                            onChange={(v) => setEndDate(v)}
                                            sx={{ marginTop: 1 }}
                                            shouldDisableDate={
                                                isNotAEndDateValid
                                            }
                                            fullWidth
                                            disablePast
                                            format="DD-MM-YYYY"
                                        />
                                    )}
                                </LocalizationProvider>
                            </Grid>

                            <Grid container sx={{ paddingTop: 3 }}>
                                <WorkHourSelector
                                    hourBlocks={hourBlocks}
                                    maxBlocks={
                                        type === WorkTypes.RECURRING
                                            ? WorkDetails.MAX_RECURRENT_HOURS
                                            : WorkDetails.MAX_SESSION_HOURS
                                    }
                                    onChange={(w) => setHourBlocks(w)}
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            </Grid>
                            <Grid item xs={8}>
                                <TagSelector
                                    value={tags}
                                    onChange={(v) => setTags(v)}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {!create && tabValue === 1 && (
                        <div>
                            <VolunteersManagementTab
                                volunteers={volunteers}
                                workData={{
                                    workId: workId,
                                    dateBlock: dateBlock,
                                    hourBlock: hourBlock,
                                    setVolunteers: setVolunteers,
                                }}
                                onVolunteerChange={() => {
                                    if (onVolunteerChange !== undefined)
                                        onVolunteerChange();
                                }}
                            />
                        </div>
                    )}

                    {!create && tabValue === 2 && (
                        <div>
                            <PostulationsTab
                                isBeforeDate={endDate.isBefore(currentDate)}
                                postulations={postulations}
                                workData={{
                                    workId: workId,
                                    dateBlock: dateBlock,
                                    hourBlock: hourBlock,
                                    setVolunteers: setVolunteers,
                                    setPostulations: setPostulations,
                                }}
                                onPostulationChange={() => {
                                    if (onPostulationChange !== undefined)
                                        onPostulationChange();
                                }}
                            />
                        </div>
                    )}
                </DialogContent>
                {workingTry && <LoadSpinner />}
                <DialogActions>
                    <Button onClick={(_) => setOpen(false)}>Cancel</Button>
                    {tabValue === 0 && (
                        <Button onClick={handleSubmitDialog} autoFocus>
                            Apply
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ModalJob;

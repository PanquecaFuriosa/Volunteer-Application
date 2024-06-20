import dayjs from "dayjs";

export const nameValidation = {
    VALID_NAME: 0,
    EMPTY_NAME: 1,
};

export const descriptionValidation = {
    VALID_DESCRIPTION: 0,
    EMPTY_DESCRIPTION: 1,
};

export const tagsValidation = {
    VALID_TAGS: 0,
    EMPTY_TAGS: 1,
};

export const startDateValidation = {
    VALID_START_DATE: 0,
    START_DATE_BEFORE_TODAY: 1,
};

export const endDateValidation = {
    VALID_END_DATE: 0,
    END_DATE_BEFORE_START: 1,
};

export const scheduleValidation = {
    VALID_SCHEDULE: 0,
    SCHEDULE_OUT_OF_RANGE: 1,
};

export const numberVolunteerValidation = {
    VALID_NUMBER_VOLUNTEER: 0,
    EMPTY_NUMBER_VOLUNTEER: 1,
};

export const AllBlocksValidation = {
    VALID_BLOCKS: 0,
    REPEATED_BLOCKS: 1,
};

export const validateName = (name) => {
    if (!name.trim()) {
        return nameValidation.EMPTY_NAME;
    }

    return nameValidation.VALID_NAME;
};

export const nameValidationLabel = (validation) => {
    switch (validation) {
        case nameValidation.EMPTY_NAME:
            return "The name must not be empty";
        default:
            return "";
    }
};

export const validateDescription = (description) => {
    if (!description.trim()) {
        return descriptionValidation.EMPTY_DESCRIPTION;
    }

    return descriptionValidation.VALID_DESCRIPTION;
};

export const descriptionValidationLabel = (validation) => {
    switch (validation) {
        case descriptionValidation.EMPTY_DESCRIPTION:
            return "The description must not be empty";
        default:
            return "";
    }
};

export const validateTags = (tags) => {
    if (tags.length === 0) {
        return tagsValidation.EMPTY_TAGS;
    }

    return tagsValidation.VALID_TAGS;
};

export const tagsValidationLabel = (validation) => {
    switch (validation) {
        case tagsValidation.EMPTY_TAGS:
            return "The tags list must not be empty";
        default:
            return "";
    }
};

export const validateStartDate = (startDate) => {
    if (dayjs().isAfter(startDate, "day")) {
        return startDateValidation.START_DATE_BEFORE_TODAY;
    }

    return startDateValidation.VALID_START_DATE;
};

export const startDateValidationLabel = (validation) => {
    switch (validation) {
        case startDateValidation.START_DATE_BEFORE_TODAY:
            return "The start date must not be a date before today";
        default:
            return "";
    }
};

export const validateEndDate = (endDate, startDate) => {
    if (startDate.isAfter(endDate, "day")) {
        return endDateValidation.END_DATE_BEFORE_START;
    }

    return endDateValidation.VALID_END_DATE;
};

export const endDateValidationLabel = (validation) => {
    switch (validation) {
        case endDateValidation.END_DATE_BEFORE_START:
            return "The end date must not be a date before start date";
        default:
            return "";
    }
};

export const validateSchedule = (schedule, minHour, maxHour) => {
    if (
        schedule.isBefore(minHour, "minute") ||
        schedule.isAfter(maxHour, "minute")
    )
        return scheduleValidation.SCHEDULE_OUT_OF_RANGE;

    return scheduleValidation.VALID_SCHEDULE;
};

export const scheduleValidationLabel = (validation, name) => {
    switch (validation) {
        case scheduleValidation.SCHEDULE_OUT_OF_RANGE:
            return `${name} is out of range`;
        default:
            return "";
    }
};

export const validateNumberVolunteer = (numberVolunteer) => {
    if (!numberVolunteer) {
        return numberVolunteerValidation.EMPTY_NUMBER_VOLUNTEER;
    }
    return nameValidation.VALID_NAME;
};

export const numberVolunteerValidationLabel = (validation) => {
    switch (validation) {
        case numberVolunteerValidation.EMPTY_NUMBER_VOLUNTEER:
            return "The number of volunteer required must not be empty";
        default:
            return "";
    }
};

export const validateWorkBlocks = (blocks) => {
    if (blocks.length === 0) return AllBlocksValidation.VALID_BLOCKS;

    if (
        blocks.some((v, i) =>
            blocks.some((v2, i2) => {
                if (i2 === i) return false;
                return v2.weekDay === v.weekDay && v2.hourBlock === v.hourBlock;
            })
        )
    )
        return AllBlocksValidation.REPEATED_BLOCKS;

    return AllBlocksValidation.VALID_BLOCKS;
};

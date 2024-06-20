/**
 * Function that passes a format to a date
 * @param {*} date date to be formatted
 * @returns The date with de format
 */
export const dateFormatter = (date) => {
    return `${date.$y}-${date.$M + 1 < 10 ? "0" : ""}${date.$M + 1}-${
        date.$D < 10 ? "0" : ""
    }${date.$D}`;
};

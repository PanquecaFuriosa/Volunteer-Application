import dayjs from "dayjs";
import WorkTypes from "./constants/WorkTypes";
import { DayOfWeeksString } from "./constants/DayOfTheWeeks";
import { StartHour, EndHour } from "./constants/StartEndHours";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

/**
 * Determines if a given weekday in number is between a start
 * date and an end date.
 *
 * @param {*} day day indicating the date of the corresponding week
 * @param {*} weekDay day of the week to check
 * @param {*} startDate range start day
 * @param {*} endDate range end day
 * @returns Boolean, true if the day is between the given dates,
 *          false otherwise
 */
const checkDay = (day, weekDay, startDate, endDate) => {
    return day
        .day(weekDay)
        .isBetween(
            dayjs(startDate, "DD-MM-YYYY"),
            dayjs(endDate, "DD-MM-YYYY"),
            "day",
            "[]"
        );
};

/**
 * creates a weekly table with the given works, where the table
 * contains the days of the week, which in turn contains the blocks
 * of hours, which in turn contain the list of pending works for
 * that block
 *
 * @param {*} works list of works from which those corresponding to the week are selected
 * @param {*} day day indicating the date of the corresponding week
 * @returns A table with the corresponding works in each block
 */
const createHashTable = (works, day) => {
    const hashTable = Array(DayOfWeeksString.length);

    /* fill the table with the days of the week */
    for (let i = 0; i < hashTable.length; i++) {
        hashTable[i] = Array(EndHour - StartHour);
    }

    /* the days are filled with the blocks of hours */
    for (let i = 0; i < hashTable.length; i++) {
        for (let j = 0; j < hashTable[i].length; j++) {
            hashTable[i][j] = [];
        }
    }

    /** for each job, the corresponding blocks are determined,
     * the blocks are filled with the works */
    works.forEach((work) => {
        if (work.type === WorkTypes.RECURRING) {
            work.hours.forEach((block) => {
                if (
                    checkDay(day, block.weekDay, work.startDate, work.endDate)
                ) {
                    hashTable[block.weekDay][
                        parseInt(block.hourBlock.slice(0, 2)) - StartHour
                    ].push(work);
                }
            });
        } else if (work.type === WorkTypes.SESSION) {
            work.hours.forEach((block) => {
                const weekDay = dayjs(work.startDate, "DD-MM-YYYY").day();
                if (checkDay(day, weekDay, work.startDate, work.endDate)) {
                    hashTable[weekDay][
                        parseInt(block.hourBlock.slice(0, 2)) - StartHour
                    ].push(work);
                }
            });
        }
    });

    return hashTable;
};

/**
 * Calculates a boolean array for all the days of the months
 * that indicates if a day has a work in it.
 *
 * @param {*} works List of works available
 * @param {*} day Current day of the month
 * @returns Boolean array from 0 to the amount of days in the month.
 *          A value in the index i indicates that at least a work is
 *          available in that day.
 */
const calculateMonthWorkDays = (works, day) => {
    const monthWorks = [].fill(false, 0);

    works.forEach((w) => {
        const startDate = dayjs(w.startDate, "DD-MM-YYYY");
        const startSameMonth = startDate.isSame(day, "month");

        if (w.type === WorkTypes.SESSION) {
            if (!startSameMonth) return;

            monthWorks[startDate.date() - 1] = true;
            return;
        }

        const monthStart = day.startOf("month");
        const monthEnd = day.endOf("month");
        const endDate = dayjs(w.endDate, "DD-MM-YYYY");

        if (endDate.isBefore(monthStart, "month") || startDate.isAfter(monthEnd, "month")) return;

        const startDay = !startSameMonth ? 1 : startDate.date();

        const endDay = !endDate.isSame(day, "month")
            ? day.daysInMonth()
            : endDate.date();

        let curWeekDay = !startSameMonth
            ? day.startOf("month").day()
            : startDate.day();

        for (let pivot = startDay; pivot <= endDay; pivot++) {
            for (let wb = 0; wb < w.hours.length; ++wb) {
                if (w.hours[wb].weekDay !== curWeekDay) continue;

                monthWorks[pivot - 1] = true;
                break;
            }
            // This line can go in the for, but I prefer it
            // here for readability
            curWeekDay = (curWeekDay + 1) % 7;
        }
    });

    return monthWorks;
};

export {
    checkDay,
    createHashTable,
    calculateMonthWorkDays
};

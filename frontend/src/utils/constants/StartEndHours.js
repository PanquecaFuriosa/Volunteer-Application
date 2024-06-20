import { HoursAllowed } from "../../utils/constants/HoursOfTheDays";

// start and end times of the blocks of the weekly calendar
const StartHour = parseInt(HoursAllowed[0].slice(0, 2));
const EndHour = parseInt(HoursAllowed[HoursAllowed.length - 1].slice(0, 2)) + 1;

export { StartHour, EndHour };

import { parseISO } from "date-fns";
import { format, utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { th } from "date-fns/locale";

export enum Shift {
  ALL = "all",
  DAY = "day",
  NIGHT = "night",
}

export enum ShiftMapper {
  all = "ทั้งหมด",
  day = "กลางวัน",
  night = "กลางคืน",
}

export enum ShiftAbbreviation {
  all = "A",
  day = "D",
  night = "N",
}

export interface TimePickerTimeInterface {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface DateRangeInterface {
  from: string | null;
  to: string | null;
}

export type TimePickerData = {
  hours: number;
  minutes: number;
  seconds: number;
};

export const useDate = (timeZone = "Asia/Bangkok") => {
  function today() {
    return utcToZonedTime(new Date(), timeZone);
  }

  function timezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  function parseDate(date) {
    return typeof date === "string" ? parseISO(date) : date;
  }

  function onlyDate(date) {
    return format(parseDate(date), "yyyy-MM-dd", { timeZone });
  }

  function onlyMonth(date) {
    return format(parseDate(date), "yyyy-MM", { timeZone });
  }

  function onlyTime(date, includeSeconds = true) {
    let timeFormat = "HH:mm";

    if (includeSeconds) {
      timeFormat += ":ss";
    }

    return format(parseDate(date), timeFormat, { timeZone });
  }

  function toObject(dateString, timeObject = null) {
    let dateObject = new Date(dateString);

    dateObject.setMinutes(0, 0, 0);

    if (timeObject) {
      dateObject.setHours(
        timeObject.hours,
        timeObject.minutes,
        timeObject.seconds
      );
    }

    return dateObject;
  }

  function toTimestamp(dateString, timeObject): Date {
    let dateObject = toObject(dateString, timeObject);

    if (timezone) {
      dateObject = zonedTimeToUtc(dateObject, timeZone);
    }

    return dateObject;
  }

  function timePickerToTimeString(
    timePickerTime: TimePickerTimeInterface,
    includeSeconds = true
  ) {
    const mockDate = new Date();

    mockDate.setHours(
      timePickerTime.hours,
      timePickerTime.minutes,
      timePickerTime.seconds
    );

    return onlyTime(mockDate, includeSeconds);
  }

  function timeStringToTimePicker(
    timeString: string,
    includeSeconds = true
  ): TimePickerData {
    const splittedTimeString = timeString.split(":");

    if (splittedTimeString.length !== 3) {
      throw new Error(
        "(Invalid time string) time string should be formatted in 'HH:mm:ss'"
      );
    }

    return {
      hours: Number(splittedTimeString[0]),
      minutes: Number(splittedTimeString[1]),
      seconds: includeSeconds ? Number(splittedTimeString[2]) : 0,
    };
  }

  function dateToShift(date): Shift {
    const currentHour = date.getHours();

    const isDayShift = currentHour >= 6 && currentHour < 19; // between 6 a.m. - 19 p.m.

    return isDayShift ? Shift.DAY : Shift.NIGHT;
  }

  function timePickerToTimeShift(timePickerTime: TimePickerTimeInterface) {
    const mockDate = new Date();

    mockDate.setHours(
      timePickerTime.hours,
      timePickerTime.minutes,
      timePickerTime.seconds
    );

    return dateToShift(mockDate);
  }

  function stringToShift(string): Shift | null {
    return string ? Shift[string.toUpperCase()] : null;
  }

  function shiftToAbbreviation(shift: Shift): ShiftAbbreviation | null {
    return shift ? ShiftAbbreviation[shift] : null;
  }

  function formatThLocale(date, formatType = "PP"): string {
    return format(parseDate(date), formatType, { locale: th });
  }

  function formatTimeThLocale(timeString, formatType = "p"): string {
    const mockDate = new Date();

    const timeStringSplitted = timeString.split(":");

    if (timeStringSplitted.length !== 3) {
      throw new Error(
        "Invalid time format: make sure time is in format 'HH:mm:ss'"
      );
    }

    mockDate.setHours(
      timeStringSplitted[0],
      timeStringSplitted[1],
      timeStringSplitted[2],
      0
    );

    return format(mockDate, formatType, { locale: th });
  }

  function formatShortYear(date, formatType = "M-yy"): string {
    return format(parseDate(date), formatType, { timeZone });
  }

  function updateDateRangeQueryParams(
    dateRangeValue: DateRangeInterface,
    additionalParams = {}
  ): void {
    const { getCurrentQuery, updateQueryParams } = useQueryParams();

    let fromDate = null,
      toDate = null;

    if (dateRangeValue) {
      if (dateRangeValue.from) {
        fromDate = onlyDate(dateRangeValue.from);
      }

      if (dateRangeValue.to) {
        toDate = onlyDate(dateRangeValue.to);
      }
    }

    const updatedQuery = { ...getCurrentQuery() };

    if (fromDate) {
      updatedQuery.from = fromDate;
      updatedQuery.to = !toDate ? fromDate : toDate;
    } else {
      if (updatedQuery.from) {
        delete updatedQuery.from;
      }

      if (updatedQuery.to) {
        delete updatedQuery.to;
      }
    }

    updateQueryParams({
      ...updatedQuery,
      ...additionalParams,
    });
  }

  function getFirstAndLastDateOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayCurrentMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    );

    return { from: firstDay, to: lastDayCurrentMonth };
  }

  return {
    today,
    timezone,
    onlyDate,
    onlyMonth,
    onlyTime,
    toObject,
    toTimestamp,
    parseDate,
    timePickerToTimeString,
    timeStringToTimePicker,
    dateToShift,
    timePickerToTimeShift,
    stringToShift,
    shiftToAbbreviation,
    formatThLocale,
    formatTimeThLocale,
    formatShortYear,
    updateDateRangeQueryParams,
    getFirstAndLastDateOfMonth,
  };
};

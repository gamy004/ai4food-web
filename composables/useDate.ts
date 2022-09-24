import { format, utcToZonedTime } from "date-fns-tz";
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

export interface TimePickerTimeInterface {
  hours: number;
  minutes: number;
  seconds: number;
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

  function onlyDate(date) {
    return format(date, "yyyy-MM-dd", { timeZone });
  }

  function onlyTime(date, includeSeconds = true) {
    let timeFormat = "HH:mm";

    if (includeSeconds) {
      timeFormat += ":ss";
    }

    return format(date, timeFormat, { timeZone });
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

  function timeStringToTimePicker(timeString: string): TimePickerData {
    const splittedTimeString = timeString.split(":");

    if (splittedTimeString.length !== 3) {
      throw new Error(
        "(Invalid time string) time string should be formatted in 'HH:mm:ss'"
      );
    }

    return {
      hours: Number(splittedTimeString[0]),
      minutes: Number(splittedTimeString[1]),
      seconds: Number(splittedTimeString[2]),
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

  function stringToShift(string): Shift {
    return string ? Shift[string.toUpperCase()] : null;
  }

  function formatThLocale(date, formatType = "PP"): string {
    return format(date, formatType, { locale: th });
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

  return {
    today,
    onlyDate,
    timePickerToTimeString,
    timeStringToTimePicker,
    dateToShift,
    timePickerToTimeShift,
    stringToShift,
    formatThLocale,
    formatTimeThLocale,
  };
};
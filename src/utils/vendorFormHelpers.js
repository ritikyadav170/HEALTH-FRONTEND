export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EMPTY_DAY_SCHEDULE = {
  enabled: false,
  openingTime: "",
  closingTime: "",
  sessionTime: "",
  breakTime: "",
  lunchStart: "",
  lunchEnd: "",
};

export function createEmptyDaySchedules() {
  return WEEKDAYS.reduce((acc, day) => {
    acc[day] = { ...EMPTY_DAY_SCHEDULE };
    return acc;
  }, {});
}

export function daySchedulesToSelectDays(daySchedules) {
  return WEEKDAYS.filter((day) => daySchedules[day]?.enabled).map((day) => {
    const s = daySchedules[day];
    return {
      day,
      available: true,
      openingTime: s.openingTime || "",
      closingTime: s.closingTime || "",
      sessionTime: s.sessionTime || "",
      breakTime: s.breakTime || "",
      lunchStart: s.lunchStart || "",
      lunchEnd: s.lunchEnd || "",
    };
  });
}

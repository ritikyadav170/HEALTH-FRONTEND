import React from "react";
import { WEEKDAYS } from "../utils/vendorFormHelpers";

export default function DayScheduleSection({ daySchedules, onChange }) {
  const updateDay = (day, field, value) => {
    onChange({
      ...daySchedules,
      [day]: {
        ...daySchedules[day],
        [field]: value,
      },
    });
  };

  const toggleDay = (day, enabled) => {
    onChange({
      ...daySchedules,
      [day]: {
        ...daySchedules[day],
        enabled,
      },
    });
  };

  const copyToAllDays = (sourceDay) => {
    const sourceSchedule = daySchedules[sourceDay];
    const newSchedules = { ...daySchedules };
    WEEKDAYS.forEach((day) => {
      newSchedules[day] = {
        ...newSchedules[day],
        enabled: true,
        openingTime: sourceSchedule.openingTime,
        closingTime: sourceSchedule.closingTime,
        sessionTime: sourceSchedule.sessionTime,
        breakTime: sourceSchedule.breakTime,
        lunchStart: sourceSchedule.lunchStart,
        lunchEnd: sourceSchedule.lunchEnd,
      };
    });
    onChange(newSchedules);
  };

  const InputField = ({ label, type, value, onChange }) => (
    <div className="flex flex-col">
      <label className="text-xs font-bold text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {WEEKDAYS.map((day) => {
        const schedule = daySchedules[day] || {};
        return (
          <div
            key={day}
            className={`border rounded-xl p-4 transition-all ${
              schedule.enabled ? "border-indigo-200 bg-indigo-50/30 shadow-sm" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!schedule.enabled}
                  onChange={(e) => toggleDay(day, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className={`font-bold ${schedule.enabled ? "text-indigo-900" : "text-slate-500"}`}>{day}</span>
              </label>
              
              {schedule.enabled && (
                <button
                  type="button"
                  onClick={() => copyToAllDays(day)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors bg-white shadow-sm"
                >
                  Copy to all days
                </button>
              )}
            </div>
            
            {schedule.enabled && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-indigo-100">
                <InputField label="Opening Time" type="time" value={schedule.openingTime || ""} onChange={(e) => updateDay(day, "openingTime", e.target.value)} />
                <InputField label="Closing Time" type="time" value={schedule.closingTime || ""} onChange={(e) => updateDay(day, "closingTime", e.target.value)} />
                <InputField label="Session (min)" type="number" value={schedule.sessionTime || ""} onChange={(e) => updateDay(day, "sessionTime", e.target.value)} />
                <InputField label="Break (min)" type="number" value={schedule.breakTime || ""} onChange={(e) => updateDay(day, "breakTime", e.target.value)} />
                <InputField label="Lunch Start" type="time" value={schedule.lunchStart || ""} onChange={(e) => updateDay(day, "lunchStart", e.target.value)} />
                <InputField label="Lunch End" type="time" value={schedule.lunchEnd || ""} onChange={(e) => updateDay(day, "lunchEnd", e.target.value)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

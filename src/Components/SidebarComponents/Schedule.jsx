"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Clock } from "lucide-react";

// Custom Button component to replace shadcn/ui button
const Button = ({ children, variant, className, ...props }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors";
  const variantStyles =
    variant === "outline"
      ? "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
      : "bg-blue-900 dark:bg-blue-700 text-white hover:bg-blue-900 dark:hover:bg-blue-600";

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Input component to replace shadcn/ui input
const Input = ({ className, ...props }) => {
  return (
    <input
      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500 focus:border-transparent ${
        className || ""
      }`}
      {...props}
    />
  );
};

// Custom Textarea component to replace shadcn/ui textarea
const Textarea = ({ className, ...props }) => {
  return (
    <textarea
      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500 focus:border-transparent ${
        className || ""
      }`}
      {...props}
    />
  );
};

export default function Calendar() {
  const API_BASE_URL = "https://crm-brown-gamma.vercel.app/api/meetings";
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [notes, setNotes] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [noteText, setNoteText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [modalError, setModalError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, [currentMonth, currentYear]);

  const fetchMeetings = async () => {
    try {
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const updatedNotes = {};
      const requests = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const formattedDate = formatDate(currentYear, currentMonth, day);
        requests.push(
          axios.get(`${API_BASE_URL}/${formattedDate}`).then((response) => {
            updatedNotes[formattedDate] = response.data.meetings || [];
          })
        );
      }
      await Promise.all(requests);
      setNotes(updatedNotes);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const handleSaveNote = async () => {
    if (!startTime || !endTime || !noteText || !keyword) {
      setModalError("All fields are required.");
      return;
    }

    const today = new Date();
    const selectedDate = new Date(currentYear, currentMonth, selectedDay);
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setModalError("Cannot schedule meetings in the past.");
      return;
    }

    const currentTime = new Date().toLocaleTimeString("en-GB", {
      hour12: false,
    });

    if (selectedDate.getTime() === today.getTime() && endTime <= currentTime) {
      setModalError("Cannot schedule meetings with past times.");
      return;
    }

    if (startTime >= endTime) {
      setModalError("End time must be later than start time.");
      return;
    }

    const isOverlapping = dayEvents.some(
      (event) =>
        (startTime >= event.startTime && startTime < event.endTime) ||
        (endTime > event.startTime && endTime <= event.endTime) ||
        (startTime <= event.startTime && endTime >= event.endTime)
    );

    if (isOverlapping) {
      setModalError("Meeting time overlaps with an existing event.");
      return;
    }

    const formattedDate = formatDate(currentYear, currentMonth, selectedDay);

    try {
      if (isEditing) {
        const updatedEvents = [...dayEvents];
        updatedEvents[editIndex] = {
          startTime,
          endTime,
          note: noteText,
          keyword,
        };
        setDayEvents(updatedEvents);
        setIsEditing(false);
        await axios.put(`${API_BASE_URL}/update`, {
          date: formattedDate,
          startTime,
          endTime,
          note: noteText,
          keyword,
        });
      } else {
        const newEvent = { startTime, endTime, note: noteText, keyword };
        setDayEvents([...dayEvents, newEvent]);
        await axios.post(API_BASE_URL, {
          date: formattedDate,
          startTime,
          endTime,
          note: noteText,
          keyword,
        });
      }

      setModalError("");
      fetchMeetings();
      setStartTime("");
      setEndTime("");
      setNoteText("");
      setKeyword("");
    } catch (error) {
      setModalError(error.response?.data?.message || "Error saving meeting.");
    }
  };

  const addNote = (day) => {
    setSelectedDay(day);
    const dateKey = formatDate(currentYear, currentMonth, day);
    setDayEvents(notes[dateKey] || []);
    setStartTime("");
    setEndTime("");
    setNoteText("");
    setKeyword("");
    setModalError("");
  };

  const loadCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const getMonthName = (monthIndex) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthIndex];
  };

  const changeMonth = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const days = loadCalendarDays();

  return (
    <div className="flex w-full flex-col md:flex-row gap-20 p-4 h-screen mx-auto">
      <div className="w-full md:w-2/3">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => changeMonth(-1)}
              className="px-4"
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="font-medium dark:text-white">
                {getMonthName(currentMonth)}
              </span>
              <Input
                type="number"
                value={currentYear}
                onChange={(e) =>
                  setCurrentYear(Number.parseInt(e.target.value))
                }
                className="w-20 text-center"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => changeMonth(1)}
              className="px-4"
            >
              Next
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <th
                        key={day}
                        className="bg-blue-900 dark:bg-blue-800 text-white p-2 text-sm font-medium"
                      >
                        {day}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.ceil(days.length / 7) }, (_, i) => (
                  <tr key={i}>
                    {days.slice(i * 7, i * 7 + 7).map((day, index) => {
                      const dateKey = day
                        ? formatDate(currentYear, currentMonth, day)
                        : null;
                      const hasNotes = day && notes[dateKey]?.length > 0;
                      const isToday =
                        day === currentDate.getDate() &&
                        currentMonth === currentDate.getMonth() &&
                        currentYear === currentDate.getFullYear();
                      const isSelected = day === selectedDay;

                      return (
                        <td
                          key={`day-${i}-${index}`}
                          onClick={() => day && addNote(day)}
                          className={`relative h-20 p-1 border dark:border-gray-700 text-center cursor-pointer transition-colors
                            ${
                              !day
                                ? "bg-gray-50 dark:bg-gray-800"
                                : "dark:bg-gray-900"
                            }
                            ${isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                            ${
                              isSelected
                                ? "bg-blue-100 dark:bg-blue-800/30"
                                : ""
                            }
                            ${
                              hasNotes && !isSelected
                                ? "bg-blue-50/50 dark:bg-blue-900/10"
                                : ""
                            }
                            ${
                              day
                                ? "hover:bg-blue-50/80 dark:hover:bg-blue-900/15"
                                : ""
                            }`}
                        >
                          {day && (
                            <>
                              <div
                                className={`text-sm font-medium dark:text-gray-200 ${
                                  isToday
                                    ? "text-blue-800 dark:text-blue-400"
                                    : ""
                                }`}
                              >
                                {day}
                              </div>
                              {hasNotes && (
                                <div className="mt-1">
                                  {notes[dateKey]
                                    .slice(0, 1)
                                    .map((event, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 text-xs p-1 rounded truncate"
                                      >
                                        {event.keyword}
                                      </div>
                                    ))}
                                  {notes[dateKey].length > 1 && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                      +{notes[dateKey].length - 1} more
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/3">
        {selectedDay ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Events for {selectedDay} {getMonthName(currentMonth)}{" "}
              {currentYear}
            </h2>

            {dayEvents.length > 0 ? (
              <div className="space-y-2 mb-6">
                {dayEvents.map((event, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-900 dark:border-blue-500 p-3 rounded-md"
                  >
                    <div className="flex items-center text-blue-800 dark:text-blue-300 font-medium mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {event.startTime} - {event.endTime}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {event.note}
                    </p>
                    <div className="mt-1">
                      <span className="inline-block bg-blue-100 dark:bg-blue-800/60 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded">
                        {event.keyword}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic mb-6">
                No events scheduled for this day.
              </p>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium dark:text-white">
                Add New Event
              </h3>

              {modalError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2 rounded text-sm">
                  {modalError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time:
                  </label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time:
                  </label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes:
                  </label>
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Keyword:
                  </label>
                  <Input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button onClick={handleSaveNote} className="w-full">
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Select a day to view or add events
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

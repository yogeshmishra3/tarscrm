import React, { useState, useEffect } from "react";
import axios from "axios";

const MeetingNotifications = () => {
  const API_BASE_URL = "https://crm-brown-gamma.vercel.app/api/meetings";
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const todayFormatted = formatDate(today);
      const tomorrowFormatted = formatDate(tomorrow);

      const todayMeetings = await axios.get(
        `${API_BASE_URL}/${todayFormatted}`
      );
      const tomorrowMeetings = await axios.get(
        `${API_BASE_URL}/${tomorrowFormatted}`
      );

      setMeetings([
        {
          date: todayFormatted,
          events: todayMeetings.data.meetings || [],
          isTomorrow: false,
        },
        {
          date: tomorrowFormatted,
          events: tomorrowMeetings.data.meetings || [],
          isTomorrow: true,
        },
      ]);
    } catch (err) {
      if (err.response) {
        // Server responded with a status other than 200
        setError(
          `Error: ${err.response.status} - ${
            err.response.data.message || "An error occurred"
          }`
        );
      } else {
        // Network or other issues
        setError(
          "Error fetching meetings. Please check your network connection."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="meetingDiv p-9 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Meeting Schedule
      </h3>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Loading...
        </p>
      ) : error ? (
        <p
          className="text-red-600 dark:text-red-400 font-bold text-center"
          aria-live="assertive"
        >
          {error}
        </p>
      ) : (
        <div className="space-y-4">
          {meetings.map(({ date, events, isTomorrow }) => (
            <div
              key={date}
              className={`bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border-l-4 ${
                isTomorrow ? "border-blue-300 opacity-70" : "border-blue-500"
              } transition-all duration-200 hover:shadow-lg`}
            >
              <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">
                Meetings on {date}
              </h4>
              {events.length > 0 ? (
                events.map((event, index) => (
                  <div
                    key={index}
                    className="mb-4 last:mb-0 p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Time:</span>{" "}
                      {event.startTime} - {event.endTime}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      <span className="font-medium">Purpose:</span>{" "}
                      {event.keyword}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      <span className="font-medium">Description:</span>{" "}
                      {event.note}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                  No meetings scheduled.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingNotifications;

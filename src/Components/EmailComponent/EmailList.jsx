import React from "react";
import { Check, Star, Paperclip, Tag, Clock } from "lucide-react";

// Skeleton component for loading state
const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

// Badge component for labels with Gmail-like appearance
const Badge = ({ children, variant, className }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "important":
        return "bg-red-50 text-red-700 border-red-200";
      case "social":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "promotions":
        return "bg-green-50 text-green-700 border-green-200";
      case "updates":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "forums":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 border rounded-sm font-normal flex items-center ${getVariantClasses()} ${
        className || ""
      }`}
    >
      <Tag size={12} className="mr-1" /> {children}
    </span>
  );
};

const CategoryTab = ({ category, active }) => {
  const getTabStyles = () => {
    switch (category) {
      case "Primary":
        return active ? "text-red-600 border-red-600" : "text-gray-600";
      case "Social":
        return active ? "text-blue-600 border-blue-600" : "text-gray-600";
      case "Promotions":
        return active ? "text-green-600 border-green-600" : "text-gray-600";
      case "Updates":
        return active ? "text-yellow-600 border-yellow-600" : "text-gray-600";
      default:
        return active ? "text-gray-800 border-gray-800" : "text-gray-600";
    }
  };

  return (
    <div
      className={`px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm cursor-pointer ${getTabStyles()} ${
        active ? "border-b-4" : ""
      }`}
    >
      {category}
    </div>
  );
};

// StarFilled component since it's used but not imported
const StarFilled = ({ size, className }) => (
  <Star className={`${className} fill-current`} size={size} />
);

const EmailList = ({
  emails = [],
  loading,
  onSelect,
  type = "inbox",
  onStar,
  onCheck,
  activeCategory = "Primary",
}) => {
  if (loading) {
    return (
      <div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className="flex items-center px-2 py-3 hover:shadow-sm"
            >
              <div className="flex items-center space-x-2 sm:space-x-4 w-24 sm:w-52 px-1 sm:px-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-10 sm:w-36 hidden sm:block" />
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2 hidden sm:block" />
              </div>
              <Skeleton className="h-4 w-10 sm:w-16 ml-1 sm:ml-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div>
        {/* Gmail-like category tabs */}

        <div className="flex items-center justify-center h-64">
          <div className="text-center px-4">
            <div className="text-gray-300 mb-4">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 mx-auto"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="22,6 12,13 2,6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-base sm:text-lg">
              No messages in your {type}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Messages that match your search will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y  divide-gray-100">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`flex items-center hover:shadow-md transition-all py-2 sm:py-3 px-1 sm:px-2 cursor-pointer ${
              !email.isRead ? "bg-blue-50" : "bg-white"
            }`}
            onClick={() => onSelect(email)}
          >
            {/* Left section with checkbox, star and category indicators */}
            <div className="flex items-center space-x-1 sm:space-x-4 w-24 sm:w-52 px-1 sm:px-2">
              <div
                className="p-1 sm:p-1.5 rounded-full hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onCheck) onCheck(email);
                }}
              >
                {email.isChecked ? (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-800 rounded-sm flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                ) : (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border border-gray-400 rounded-sm"></div>
                )}
              </div>

              <div
                className="p-1 sm:p-1.5 rounded-full hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onStar) onStar(email);
                }}
              >
                {email.isStarred ? (
                  <StarFilled size={16} className="text-yellow-500" />
                ) : (
                  <Star size={16} className="text-gray-400" />
                )}
              </div>

              {email.labels && email.labels.length > 0 && (
                <div className="hidden sm:flex space-x-1">
                  {email.labels.slice(0, 1).map((label, idx) => (
                    <Badge key={idx} variant={label.toLowerCase()}>
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Middle section with sender/recipient and subject+snippet */}
            <div className="flex-1 min-w-0 pr-2 sm:pr-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <div
                  className={`w-full sm:w-52 truncate mr-0 sm:mr-4 text-sm sm:text-base ${
                    !email.isRead
                      ? "font-bold text-gray-900"
                      : "font-medium text-gray-800"
                  }`}
                >
                  {type === "inbox" ? email.from : email.to}
                </div>

                <div className="flex-1 truncate hidden sm:block">
                  <span
                    className={`${
                      !email.isRead
                        ? "font-bold text-gray-900"
                        : "font-medium text-gray-800"
                    }`}
                  >
                    {email.subject}
                  </span>
                  <span
                    className={`${
                      !email.isRead ? "text-gray-800" : "text-gray-500"
                    }`}
                  >
                    {" - "}
                    {email.body}
                  </span>
                </div>

                <div className="text-xs truncate sm:hidden mt-1">
                  <span
                    className={`${
                      !email.isRead
                        ? "font-semibold text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {email.subject}
                  </span>
                </div>
              </div>
            </div>

            {/* Right section with date and actions */}
            <div className="flex items-center space-x-1 sm:space-x-3 ml-1 sm:ml-2 min-w-14 sm:min-w-24 justify-end">
              {email.hasAttachment && (
                <Paperclip
                  size={14}
                  className="text-gray-500 hidden sm:block"
                />
              )}

              {email.isImportant && (
                <Clock size={14} className="text-yellow-600 hidden sm:block" />
              )}

              <div
                className={`text-xs whitespace-nowrap ${
                  !email.isRead
                    ? "font-bold text-gray-900"
                    : "font-medium text-gray-500"
                }`}
              >
                {formatDate(email.date)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to format date in Gmail style
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if valid date
    if (isNaN(date.getTime())) return "Unknown";

    // If today, show time only
    if (date.toDateString() === today.toDateString()) {
      return `${date.getHours() % 12 || 12}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")} ${date.getHours() >= 12 ? "pm" : "am"}`;
    }

    // If yesterday, show "Yesterday"
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // If within last 7 days, show day name
    const dayDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (dayDiff < 7) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[date.getDay()];
    }

    // If this year, show month and day
    if (date.getFullYear() === today.getFullYear()) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    }

    // Otherwise, show abbreviated date
    return `${date.getMonth() + 1}/${date.getDate()}/${date
      .getFullYear()
      .toString()
      .substr(2)}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Unknown";
  }
};

export default EmailList;

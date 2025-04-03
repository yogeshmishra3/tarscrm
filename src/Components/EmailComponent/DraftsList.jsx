import React from "react";
import { Trash, Paperclip } from "lucide-react";

// Simple Button component
const Button = ({ children, variant, size, onClick, className }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "ghost":
        return "bg-transparent hover:bg-gray-100";
      case "outline":
        return "bg-transparent border border-gray-300 hover:bg-gray-50";
      default:
        return "bg-blue-800 text-white hover:bg-blue-700";
    }
  };

  const getSizeClasses = () => {
    if (size === "icon") {
      return "p-2";
    }
    return "px-4 py-2";
  };

  return (
    <button
      className={`rounded font-medium transition-colors ${getVariantClasses()} ${getSizeClasses()} ${
        className || ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Simple Skeleton component
const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

const DraftsList = ({ drafts = [], loading, onSelect, onDelete }) => {
  if (loading) {
    return (
      <div className="p-2 sm:p-4 space-y-4">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex items-center space-x-4 p-2 sm:p-3 border rounded-md"
          >
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-4 w-16 shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 p-4 sm:p-8 text-center">No drafts found</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {drafts.map((draft) => (
        <div
          key={draft.id}
          className="p-3 sm:p-4 hover:bg-gray-100 cursor-pointer"
        >
          <div className="flex items-start" onClick={() => onSelect(draft)}>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between flex-wrap sm:flex-nowrap mb-1">
                <div className="truncate max-w-full sm:max-w-xs">
                  {draft.toEmail || "No recipient"}
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap pl-0 sm:pl-2 w-full sm:w-auto text-right sm:text-left mt-1 sm:mt-0">
                  {formatDate(draft.updatedAt)}
                </div>
              </div>

              <div className="flex items-center">
                <div className="truncate font-medium mr-1">
                  {draft.subject || "No subject"}
                </div>
                {draft.hasAttachment && (
                  <Paperclip className="h-4 w-4 ml-2 text-gray-500 shrink-0" />
                )}
              </div>

              <div className="text-sm text-gray-500 truncate mt-1 pr-4">
                {draft.message || "No content"}
              </div>
            </div>
          </div>

          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(draft.id);
              }}
              className="h-8 w-8"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const today = new Date();

    // Check if valid date
    if (isNaN(date.getTime())) return "Unknown date";

    // If today, show time
    if (date.toDateString() === today.toDateString()) {
      return `${date.getHours()}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`;
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

    // Otherwise, show month, day and year
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
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Unknown date";
  }
};

export default DraftsList;

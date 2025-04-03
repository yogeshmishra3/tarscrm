import React from "react";
import { ArrowLeft, Reply, Trash } from "lucide-react";

const ViewEmail = ({ email, onBack }) => {
  if (!email) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 sm:p-4 border-b flex items-center flex-wrap sm:flex-nowrap">
        <button
          onClick={onBack}
          className="mr-2 p-1 sm:p-2 rounded-md flex items-center hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="text-sm sm:text-base">Back</span>
        </button>

        <div className="ml-auto flex space-x-1 sm:space-x-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
          <button className="p-1 sm:p-2 rounded-md flex items-center hover:bg-gray-100">
            <Reply className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Reply</span>
          </button>
          <button className="p-1 sm:p-2 rounded-md flex items-center hover:bg-gray-100">
            <Trash className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Delete</span>
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-6 flex-1 overflow-auto">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
            {email.subject}
          </h2>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
            <div>
              <p className="font-medium text-sm sm:text-base">{email.from}</p>
              <p className="text-xs sm:text-sm text-gray-500">To: {email.to}</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
              {formatDate(email.date)}
            </p>
          </div>
        </div>

        <div className="prose max-w-none text-sm sm:text-base">
          <div className="whitespace-pre-wrap">{email.body}</div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  } catch (error) {
    return "Unknown date";
  }
};

export default ViewEmail;

import React from "react";
import { ArrowLeft, Reply, Trash } from "lucide-react";

const ViewEmail = ({ email, onBack }) => {
  if (!email) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center">
        <button
          onClick={onBack}
          className="mr-2 p-2 rounded-md flex items-center hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back</span>
        </button>

        <div className="ml-auto flex space-x-2">
          <button className="p-2 rounded-md flex items-center hover:bg-gray-100">
            <Reply className="h-4 w-4 mr-2" />
            <span>Reply</span>
          </button>
          <button className="p-2 rounded-md flex items-center hover:bg-gray-100">
            <Trash className="h-4 w-4 mr-2" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">{email.subject}</h2>

          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-medium">{email.from}</p>
              <p className="text-sm text-muted-foreground">To: {email.to}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(email.date)}
            </p>
          </div>
        </div>

        <div className="prose max-w-none">
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

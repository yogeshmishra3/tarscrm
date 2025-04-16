import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7OuII_7uoDgvomQQbPVwT9ri5bXqs84M",
  authDomain: "akprortfolio.firebaseapp.com",
  databaseURL: "https://akprortfolio-default-rtdb.firebaseio.com",
  projectId: "akprortfolio",
  storageBucket: "akprortfolio.appspot.com",
  messagingSenderId: "784602760468",
  appId: "1:784602760468:web:02238859fa918e89cbee01",
  measurementId: "G-YPLD4B7HP7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function CustomerComplaintsDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updatedComplaint, setUpdatedComplaint] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showFeedbacks, setShowFeedbacks] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [customStatus, setCustomStatus] = useState("");
  const [useCustomStatus, setUseCustomStatus] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch complaints
  useEffect(() => {
    setLoading(true);
    fetch("https://crm-brown-gamma.vercel.app/api/complaints")
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching complaints:", error);
        setError("Failed to fetch complaints. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Fetch feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const feedbackCollection = collection(db, "feedback");
        const feedbackSnapshot = await getDocs(feedbackCollection);
        const feedbackList = feedbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeedbacks(feedbackList);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setFeedbackLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  // Handle deletion
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this complaint?")) {
      fetch(`https://crm-brown-gamma.vercel.app/api/complaints/${id}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (res.ok) {
            setComplaints(
              complaints.filter((complaint) => complaint._id !== id)
            );
            if (selectedComplaint && selectedComplaint._id === id) {
              setSelectedComplaint(null);
            }
            alert("Complaint deleted successfully");
          } else {
            alert("Error deleting complaint");
          }
        })
        .catch((error) => console.error("Error deleting complaint:", error));
    }
  };

  // Handle viewing a complaint
  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdatedComplaint({
      ...complaint,
      showFull: complaint.showFull || false,
    });
    setCustomStatus(complaint.customStatus || "");
    setUseCustomStatus(!!complaint.customStatus);
  };

  // Handle changes in form
  const handleChange = (e) => {
    setUpdatedComplaint({
      ...updatedComplaint,
      [e.target.name]: e.target.value,
    });
  };

  // Handle updating
  const handleUpdate = () => {
    setLoading(true);
    const finalStatus = useCustomStatus
      ? customStatus
      : updatedComplaint.status;

    fetch(
      `https://crm-brown-gamma.vercel.app/api/complaints/${selectedComplaint._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedComplaint,
          status: finalStatus,
          customStatus: useCustomStatus ? customStatus : "",
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setComplaints(
          complaints.map((comp) =>
            comp._id === selectedComplaint._id ? data : comp
          )
        );
        setSelectedComplaint(data);
        setLoading(false);
        alert("Complaint updated successfully");
      })
      .catch((error) => {
        console.error("Error updating complaint:", error);
        setError("Failed to update complaint. Please try again later.");
        setLoading(false);
      });
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaintID.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" &&
        (!complaint.status || complaint.status === "Pending")) ||
      (statusFilter === "in-progress" && complaint.status === "In Progress") ||
      (statusFilter === "resolved" && complaint.status === "Resolved");

    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Close complaint details on mobile
  const closeComplaintDetails = () => {
    setSelectedComplaint(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Complaints Management
          </h1>
          <button
            onClick={() => setShowFeedbacks(!showFeedbacks)}
            className="px-3 py-1 sm:px-4 sm:py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 text-sm sm:text-base"
          >
            {showFeedbacks ? "Hide Feedbacks" : "View Feedbacks"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:px-8">
        {/* Filters */}
        <div className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow">
          <div className="flex flex-col gap-3">
            {/* Search Bar */}
            <div className="w-full">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-300"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-8 sm:pl-10 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md py-2 border"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Status Filter Buttons */}
              <div className="w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status:
                  </span>
                  <div
                    className="inline-flex rounded-md shadow-sm"
                    role="group"
                  >
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-l-lg border ${
                        statusFilter === "all"
                          ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("pending")}
                      className={`px-2 py-1 text-xs sm:text-sm font-medium border-t border-b ${
                        statusFilter === "pending"
                          ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("in-progress")}
                      className={`px-2 py-1 text-xs sm:text-sm font-medium border-t border-b ${
                        statusFilter === "in-progress"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("resolved")}
                      className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-r-lg border ${
                        statusFilter === "resolved"
                          ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="w-full sm:w-auto">
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`relative inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-l-md border border-gray-300 text-xs sm:text-sm font-medium ${
                      viewMode === "list"
                        ? "bg-indigo-600 text-white dark:bg-indigo-500"
                        : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`relative inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-r-md border border-gray-300 text-xs sm:text-sm font-medium ${
                      viewMode === "grid"
                        ? "bg-indigo-600 text-white dark:bg-indigo-500"
                        : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Complaints List */}
          <div
            className={`${
              selectedComplaint && !isMobile ? "lg:w-2/5" : "w-full"
            } bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden`}
          >
            <div className="px-3 py-3 sm:px-4 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Complaints ({filteredComplaints.length})
              </h3>
            </div>

            {loading && (
              <div className="p-6 sm:p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Loading complaints...
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-md m-3 sm:m-4 text-sm sm:text-base">
                {error}
              </div>
            )}

            {!loading && filteredComplaints.length === 0 && (
              <div className="p-6 sm:p-8 text-center text-sm sm:text-base text-gray-500 dark:text-gray-400">
                No complaints found matching your criteria
              </div>
            )}

            {viewMode === "list" ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredComplaints.map((complaint) => (
                  <li
                    key={complaint._id}
                    className={`px-3 py-3 sm:px-4 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      selectedComplaint?._id === complaint._id
                        ? "bg-indigo-50 dark:bg-indigo-900"
                        : ""
                    }`}
                    onClick={() => handleViewComplaint(complaint)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div
                          className={`flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm ${
                            !complaint.status || complaint.status === "Pending"
                              ? "bg-red-500 dark:bg-red-600"
                              : complaint.status === "In Progress"
                              ? "bg-yellow-500 dark:bg-yellow-600"
                              : "bg-green-500 dark:bg-green-600"
                          }`}
                        >
                          {complaint.status ? complaint.status.charAt(0) : "P"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                            {complaint.subject}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {complaint.fullName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(complaint.createdAt)}
                        </p>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                          {complaint.projectName}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4">
                {filteredComplaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className={`border rounded-lg p-3 sm:p-4 hover:shadow-md cursor-pointer ${
                      selectedComplaint?._id === complaint._id
                        ? "ring-2 ring-indigo-500 dark:ring-indigo-400"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                    onClick={() => handleViewComplaint(complaint)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {complaint.subject}
                      </h3>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xxs sm:text-xs font-medium ${
                          !complaint.status || complaint.status === "Pending"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : complaint.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {complaint.customStatus ||
                          complaint.status ||
                          "Pending"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {complaint.complaintDescription}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xxs sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                        {complaint.fullName}
                      </p>
                      <p className="text-xxs sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(complaint.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complaint Detail View */}
          {selectedComplaint && (
            <div
              className={`flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${
                isMobile ? "fixed inset-0 z-50 overflow-y-auto" : ""
              }`}
            >
              {isMobile && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <button
                    onClick={closeComplaintDetails}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-gray-600 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleDelete(selectedComplaint._id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}

              {!isMobile && (
                <div className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    Complaint Details
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(selectedComplaint._id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs sm:text-sm leading-5 font-medium rounded-md text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              <div className="px-3 py-3 sm:px-4 sm:py-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Complaint ID
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                      {selectedComplaint.complaintID}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Date Submitted
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(selectedComplaint.createdAt)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Client Name
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                      {selectedComplaint.fullName}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                      {selectedComplaint.email}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Project Name
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                      {selectedComplaint.projectName}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Preferred Contact
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                      {selectedComplaint.preferredContact}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Category
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                      {selectedComplaint.category}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Attachment
                    </h4>
                    {selectedComplaint.attachment ? (
                      <a
                        href={selectedComplaint.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                      >
                        View Attachment
                      </a>
                    ) : (
                      <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        No attachment
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 sm:mt-6">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    Subject
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                    {selectedComplaint.subject}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </h4>
                  <div className="mt-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line">
                      {selectedComplaint.complaintDescription}
                    </p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6">
                  <label
                    htmlFor="status"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Update Status
                  </label>

                  <div className="mt-1 sm:mt-2 flex items-center">
                    <input
                      id="use-custom-status"
                      name="use-custom-status"
                      type="checkbox"
                      checked={useCustomStatus}
                      onChange={(e) => setUseCustomStatus(e.target.checked)}
                      className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label
                      htmlFor="use-custom-status"
                      className="ml-2 block text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                    >
                      Use custom status
                    </label>
                  </div>

                  {useCustomStatus ? (
                    <div className="mt-1 sm:mt-2">
                      <input
                        type="text"
                        value={customStatus}
                        onChange={(e) => setCustomStatus(e.target.value)}
                        placeholder="Enter custom status"
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 sm:mt-2 flex rounded-md shadow-sm">
                      <select
                        id="status"
                        name="status"
                        value={updatedComplaint.status || ""}
                        onChange={handleChange}
                        className="flex-1 min-w-0 block w-full px-2 py-1 sm:px-3 sm:py-2 rounded-none rounded-l-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  )}

                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="mt-3 sm:mt-4 inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Feedback Modal */}
      {showFeedbacks && (
        <div
          className="fixed inset-0 overflow-y-auto z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowFeedbacks(false)}
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              ​
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100"
                      id="modal-title"
                    >
                      Customer Feedback
                    </h3>
                    <div className="mt-2">
                      {feedbackLoading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
                          <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Loading feedback...
                          </p>
                        </div>
                      ) : feedbacks.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 py-4">
                          No feedback available
                        </p>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {feedbacks.map((feedback) => (
                            <div
                              key={feedback.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-500 dark:bg-purple-600 flex items-center justify-center text-white font-bold">
                                  {feedback.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {feedback.name}
                                    </h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {feedback.timestamp
                                        ? formatDate(
                                            feedback.timestamp.toDate()
                                          )
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {feedback.email}
                                  </p>
                                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {feedback.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowFeedbacks(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

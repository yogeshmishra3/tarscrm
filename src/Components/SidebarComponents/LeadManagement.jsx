import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const dealManagementApiUrl =
  "https://crm-brown-gamma.vercel.app/api/dealmanagement";
const newLeadsApiUrl = "https://crm-brown-gamma.vercel.app/api/NewLeads";
const meetingsApiUrl = "https://crm-brown-gamma.vercel.app/api/meetings";
const quotationsApiUrl = "https://crm-brown-gamma.vercel.app/api/newquotations";
const recycleBinApiUrl =
  "https://crm-brown-gamma.vercel.app/api/dealmanagement";
const recyclebinhai =
  "https://crm-brown-gamma.vercel.app/api/recyclebin/restore";

function Leadmanagement() {
  const [deals, setDeals] = useState([]);
  const [quotationClients, setQuotationClients] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [meetingDate, setMeetingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingNote, setMeetingNote] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [archivedLeads, setArchivedLeads] = useState([]);

  // New state for the project details popup
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(null);
  const [finalAmount, setFinalAmount] = useState("");
  const [projectStatus, setProjectStatus] = useState("Active");
  const [projectId, setProjectId] = useState("");
  const [projectPassword, setProjectPassword] = useState("");
  const navigate = useNavigate();

  const stages = ["Lead", "Contacted", "Proposal", "Qualified"];

  useEffect(() => {
    fetchAndStoreNewLeads();
    fetchInitialData();
    fetchArchivedLeads();
    const interval = setInterval(fetchInitialData, 15000); // Fetch data every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAndStoreNewLeads = async () => {
    try {
      const newLeadsResponse = await fetch(newLeadsApiUrl);
      if (!newLeadsResponse.ok) {
        throw new Error("Failed to fetch new leads.");
      }
      const newLeadsData = await newLeadsResponse.json();

      const connectedLeads = newLeadsData.contacts.filter(
        (lead) => lead.dealStatus === "connected"
      );

      for (const lead of connectedLeads) {
        const { name, leadName } = lead;
        const leadData = {
          name, // Client name
          leadName, // Deal name
          stage: "Lead",
          amount: 0, // Default amount
          scheduledMeeting: new Date().toISOString(), // Default to the current date in ISO format
        };

        console.log("Sending lead data:", leadData); // Log the data being sent

        const existingDealResponse = await fetch(dealManagementApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData),
        });

        if (!existingDealResponse.ok) {
          const errorData = await existingDealResponse.json(); // Get error details from response
          console.warn("Failed to store lead:", errorData); // Log the error message
        }
      }
    } catch (error) {
      console.error("Error storing new leads:", error);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [transactionsResponse, quotationsResponse] = await Promise.all([
        fetch(dealManagementApiUrl),
        fetch(quotationsApiUrl),
      ]);

      if (!transactionsResponse.ok || !quotationsResponse.ok) {
        throw new Error("Failed to fetch data.");
      }

      const transactionsData = await transactionsResponse.json();
      const quotationsData = await quotationsResponse.json();

      // Sync Quotations to Deal Management API (create deals with Proposal stage)
      await syncQuotationsToDealManagement(quotationsData);

      // Check for duplicate deals and delete them from dealManagementApiUrl
      await deleteDuplicateDeals(transactionsData, quotationsData);

      // Filter out the "Proposal" deals from the transactionsData
      const filteredDeals = transactionsData.filter(
        (deal) => deal.stage !== "Proposal"
      );

      // Map quotations data into the "Proposal" stage
      const proposalDeals = quotationsData.map((quotation) => ({
        _id: quotation._id,
        name: quotation.dealName,
        leadName: quotation.clientName,
        quotationNo: quotation.quotationNo || "", // In case quotationNo doesn't exist
        date: quotation.date,
        stage: "Proposal",
        totalAmount: quotation.Totalamount, // Use the direct field
      }));

      // Combine the filtered transactions data (excluding "Proposal" stage) with the proposalDeals
      const updatedDeals = [...filteredDeals, ...proposalDeals];
      setDeals(updatedDeals);

      // Store total amount per client in quotationClients state
      const clientAmounts = quotationsData.reduce((acc, quotation) => {
        const { clientName, items } = quotation;
        const totalAmount = items.reduce(
          (sum, item) => sum + parseFloat(item.amount),
          0
        );
        acc[clientName] = (acc[clientName] || 0) + totalAmount;
        return acc;
      }, {});

      setQuotationClients(clientAmounts);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const syncQuotationsToDealManagement = async (quotationsData) => {
    try {
      for (const quotation of quotationsData) {
        const { dealName, clientName, quotationNo, items } = quotation;
        const totalAmount = items.reduce(
          (sum, item) => sum + parseFloat(item.amount),
          0
        );

        const dealData = {
          leadName: dealName, // Quotation dealName to leadName
          name: clientName, // Quotation clientName to name
          amount: totalAmount, // Total amount from the quotation
          stage: "Proposal", // Stage set to "Proposal"
        };

        // Send the new deal to the dealmanagement API
        const response = await fetch(dealManagementApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dealData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to create deal in dealmanagement:", errorData);
        } else {
          console.log(
            `Successfully created deal for ${dealName} - ${clientName}`
          );
        }
      }
    } catch (error) {
      console.error("Error syncing quotations to deal management:", error);
    }
  };

  const deleteDuplicateDeals = async (transactionsData, quotationsData) => {
    for (const quotation of quotationsData) {
      const { dealName, clientName } = quotation;

      // Find matching deals where stage is "Contacted" OR "Lead"
      const matchingDeals = transactionsData.filter(
        (deal) =>
          deal.leadName === dealName &&
          deal.name === clientName &&
          (deal.stage === "Contacted" || deal.stage === "Lead")
      );

      for (const matchingDeal of matchingDeals) {
        try {
          console.log(`Deleting duplicate deal: ${dealName} - ${clientName}`);
          const response = await fetch(
            `https://crm-brown-gamma.vercel.app/api/dealmanagement/${matchingDeal._id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            console.log(`Successfully deleted: ${dealName} - ${clientName}`);
          } else {
            const errorData = await response.json();
            console.error(
              `Failed to delete. Status: ${response.status}`,
              errorData
            );
          }
        } catch (error) {
          console.error(
            `Error deleting deal: ${dealName} - ${clientName}`,
            error
          );
        }
      }
    }
  };

  const handleScheduleMeeting = (dealId, clientName) => {
    setSelectedDealId(dealId);
    setMeetingNote(`Client name: ${clientName}\n`);
    setShowModal(true);
  };

  const submitMeeting = async () => {
    if (!meetingDate || !startTime || !endTime || !meetingNote.trim()) {
      alert("Please fill in all meeting details.");
      return;
    }

    const formattedMeeting = {
      date: meetingDate,
      startTime: startTime,
      endTime: endTime,
      note: meetingNote.trim(),
    };

    try {
      const response = await fetch(meetingsApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedMeeting),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule meeting.");
      }

      alert("Meeting scheduled successfully!");
      setShowModal(false);
      fetchInitialData();
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      alert(error.message);
    }
  };

  const handleRedirectToQuotes = (deal) => {
    navigate("/quotation", {
      state: {
        dealData: {
          dealName: deal.leadName,
          clientName: deal.name,
        },
      },
    });
  };

  const handleDragStart = (e, dealId, stage) => {
    e.dataTransfer.setData("dealId", dealId);
    e.dataTransfer.setData("stage", stage);
  };

  // Generate a random 8-digit password
  const generatePassword = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  // Generate a project ID with format TT-6digit
  const generateProjectId = () => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    return `TT-${randomDigits}`;
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");

    if (!dealId) {
      alert("Invalid Deal ID");
      return;
    }

    const deal = deals.find((deal) => deal._id === dealId);
    if (!deal) {
      console.error("Deal not found in local state");
      return;
    }

    // Allow only moving from "Lead" to "Contacted"
    if (deal.stage === "Lead" && newStage !== "Contacted") {
      alert("Deals in the 'Lead' stage can only be moved to 'Contacted'.");
      return;
    }

    // Handle moving from "Proposal" to "Qualified" and show the project details modal
    if (deal.stage === "Proposal" && newStage === "Qualified") {
      // Set current deal and show project modal
      setCurrentDeal(deal);

      // Pre-generate project ID and password
      const newProjectId = generateProjectId();
      const newPassword = generatePassword();

      setProjectId(newProjectId);
      setProjectPassword(newPassword);
      setShowProjectModal(true);

      // Pre-fill with the quotation amount if available
      if (quotationClients[deal.leadName]) {
        setFinalAmount(quotationClients[deal.leadName].toFixed(2));
      } else {
        setFinalAmount("");
      }
    } else {
      // Normal stage change logic
      try {
        const response = await fetch(`${dealManagementApiUrl}/${dealId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        });

        if (!response.ok) {
          throw new Error("Failed to update deal stage.");
        }

        fetchInitialData();
      } catch (error) {
        console.error("Error updating deal stage:", error);
      }
    }
  };

  const handleSaveProjectInOMS = async () => {
    try {
      const response = await fetch("/api/save-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadName: currentDeal.leadName,
          clientName: currentDeal.name,
          finalAmount: finalAmount,
          projectStatus: projectStatus,
          projectId: projectId,
          projectPassword: projectPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Project saved successfully!");
        setShowProjectModal(false); // Close the modal on success
      } else {
        const errorData = await response.json();
        alert(`Failed to save project: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error saving project:", error);
      alert("An error occurred while saving the project.");
    }
  };

  // Handle saving the project
  const handleSaveProject = async () => {
    if (!finalAmount || isNaN(finalAmount) || parseFloat(finalAmount) <= 0) {
      alert("Please enter a valid amount for the project.");
      return;
    }

    if (!projectStatus) {
      alert("Please select a project status.");
      return;
    }

    try {
      // First, save the project details to the client-projects API
      const clientProjectResponse = await fetch(
        "https://crm-brown-gamma.vercel.app/api/client-projects",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadName: currentDeal.leadName,
            clientName: currentDeal.name,
            finalAmount: parseFloat(finalAmount),
            projectStatus: projectStatus,
            projectId: projectId,
            projectPassword: projectPassword,
          }),
        }
      );

      if (!clientProjectResponse.ok) {
        const errorData = await clientProjectResponse.json();
        throw new Error(errorData.message || "Failed to save project details.");
      }

      console.log(
        "Project details saved successfully to ClientProject collection"
      );

      // Delete the deal from the newquotations API
      const response = await fetch(
        `https://crm-brown-gamma.vercel.app/api/newquotations/${currentDeal._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete deal from newquotations.");
      }

      console.log(`Deleted deal from newquotations: ${currentDeal.leadName}`);

      // Create a new deal in dealmanagement with the project details
      const newDeal = {
        name: currentDeal.name,
        leadName: currentDeal.leadName,
        stage: "Qualified", // Set the stage to "Qualified"
        amount: parseFloat(finalAmount), // Use the final amount
        scheduledMeeting: currentDeal.scheduledMeeting,
        projectId: projectId,
        projectPassword: projectPassword,
        projectStatus: projectStatus,
      };

      const newDealResponse = await fetch(
        "https://crm-brown-gamma.vercel.app/api/dealmanagement",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDeal),
        }
      );

      if (!newDealResponse.ok) {
        throw new Error("Failed to store deal in dealmanagement.");
      }

      console.log(
        `Stored deal in dealmanagement with Qualified stage: ${currentDeal.leadName}`
      );

      // Close the modal and reset fields
      setShowProjectModal(false);
      setCurrentDeal(null);
      setFinalAmount("");
      setProjectStatus("Active");

      // Show success message with project details
      alert(
        `Project created successfully!\nProject ID: ${projectId}\nPassword: ${projectPassword}`
      );

      // Fetch updated data after the changes
      fetchInitialData();
    } catch (error) {
      console.error("Error saving project:", error);
      alert(error.message);
    }
  };

  const handleArchive = async (dealId) => {
    const confirmArchive = window.confirm(
      "Are you sure you want to archive this deal?"
    );
    if (!confirmArchive) return;

    try {
      const response = await fetch(`${dealManagementApiUrl}/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "Archived",
          moveToFolder: "DeleteLeads",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to archive deal.");
      }

      alert("Deal archived and moved to DeleteLeads folder successfully!");

      // Optimistic UI update: Remove archived deal from local state before refetching data
      setDeals((prevDeals) => prevDeals.filter((deal) => deal.id !== dealId));

      // Fetch updated data
      await Promise.all([fetchInitialData(), fetchArchivedLeads()]);
    } catch (error) {
      console.error("Error archiving deal:", error);
      alert(error.message);
    }
  };

  const fetchArchivedLeads = async () => {
    try {
      const response = await fetch(recycleBinApiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch archived leads");
      }

      const data = await response.json();
      const archivedLeads = data.filter((lead) => lead.stage === "Archived");
      setArchivedLeads(archivedLeads);
    } catch (error) {
      console.error("Error fetching archived leads:", error);
    }
  };

  const restoreDeal = async (dealId) => {
    try {
      const response = await fetch(`${recyclebinhai}/${dealId}`, {
        // Ensure URL matches the backend route
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to restore deal.");
      }

      const restoredDeal = await response.json();
      alert("Deal restored to 'Qualified' stage.");
      // Optionally, re-fetch the updated deal list or update UI here
    } catch (error) {
      console.error("Error restoring deal:", error);
      alert(error.message);
    }
  };

  const deleteArchivedLead = async (id) => {
    try {
      const response = await fetch(`${recycleBinApiUrl}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete archived lead.");
      }

      console.log("Archived lead deleted permanently!");

      // Optimistic UI update: Remove lead from local state
      setArchivedLeads((prevLeads) =>
        prevLeads.filter((lead) => lead.id !== id)
      );
    } catch (error) {
      console.error("Error deleting archived lead:", error);
      alert(error.message);
    }
  };

  return (
    <div className="p-4 md:pb-5 pb-15 h-screen overflow-y-auto bg-gray-100 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Leads Management
        </h2>
        <span
          className="text-2xl cursor-pointer ml-auto text-gray-800 dark:text-white"
          onClick={() => setIsOpen(true)}
        >
          ♻
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <div
            key={stage}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <h3 className="text-lg font-medium mb-4 text-center bg-blue-100 dark:bg-blue-900 text-gray-800 dark:text-white py-2 rounded">
              {stage}
            </h3>
            <div className="space-y-4">
              {deals
                .filter((deal) => deal.stage === stage)
                .map((deal) => (
                  <div
                    key={deal._id}
                    className="bg-white dark:bg-gray-700 p-4 rounded shadow-md border border-gray-200 dark:border-gray-600 cursor-pointer"
                    draggable={stage !== "Contacted" && stage !== "Qualified"}
                    onDragStart={(e) =>
                      handleDragStart(e, deal._id, deal.stage)
                    }
                  >
                    <p className="text-sm font-medium mb-1 text-gray-800 dark:text-white">
                      Deal name: {deal.name || deal.leadName}
                    </p>
                    <p className="text-sm mb-3 text-gray-700 dark:text-gray-300">
                      Client name: {deal.leadName || deal.name}
                    </p>

                    {stage === "Lead" && (
                      <button
                        className="w-full bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-800 text-sm"
                        onClick={() =>
                          handleScheduleMeeting(deal._id, deal.leadName)
                        }
                      >
                        Schedule Meeting
                      </button>
                    )}

                    {stage === "Contacted" && (
                      <button
                        className="w-full bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 text-sm"
                        onClick={() => handleRedirectToQuotes(deal)}
                      >
                        Send Quotation
                      </button>
                    )}

                    {stage === "Proposal" && (
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        Total Amount: ₹
                        {deal.totalAmount
                          ? deal.totalAmount.toFixed(2)
                          : "0.00"}
                      </p>
                    )}

                    {stage === "Qualified" && deal.amount !== undefined && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          Qualified Amount: ₹{deal.amount.toFixed(2)}
                        </p>
                        {deal.projectId && (
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            Project ID: {deal.projectId}
                          </p>
                        )}
                        {deal.projectStatus && (
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            Status: {deal.projectStatus}
                          </p>
                        )}
                        <button
                          className="w-full bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 text-sm"
                          onClick={() => handleArchive(deal._id)}
                        >
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      {/* Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Schedule a Meeting
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Date:
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Start Time:
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  End Time:
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Message:
                </label>
                <textarea
                  value={meetingNote}
                  onChange={(e) => setMeetingNote(e.target.value)}
                  rows="3"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-0.5 text-s">
                  Keyword:
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full p-1 text-s border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={submitMeeting}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-800"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Project Details Modal */}
      {showProjectModal && currentDeal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Project Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Project Name:
                </label>
                <input
                  type="text"
                  value={currentDeal.leadName}
                  readOnly
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Client Name:
                </label>
                <input
                  type="text"
                  value={currentDeal.name}
                  readOnly
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Final Amount (₹):
                </label>
                <input
                  type="number"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Project Status:
                </label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Project ID:
                </label>
                <input
                  type="text"
                  value={projectId}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password:
                </label>
                <input
                  type="text"
                  value={projectPassword}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveProject}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-800"
                >
                  Save Project
                </button>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}{" "}
      {/* Recycle Bin Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Recycle Bin</h3>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => setIsOpen(false)}
              >
                X
              </button>
            </div>

            {archivedLeads.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {archivedLeads.map((lead) => (
                  <li key={lead._id} className="border p-3 rounded">
                    <p className="mb-2">
                      {lead.name} - {lead.leadName} - {lead.stage}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => restoreDeal(lead._id)}
                        className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 text-sm"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => deleteArchivedLead(lead._id)}
                        className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 text-sm"
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4 text-gray-500">
                No archived leads found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Leadmanagement;

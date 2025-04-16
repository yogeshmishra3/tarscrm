import React, { useState, useEffect } from "react";
import { Download, Trash2, CheckSquare } from "lucide-react";
import * as XLSX from "xlsx";

function Leads() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showMultiSelectMode, setShowMultiSelectMode] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const [formData, setFormData] = useState({
    leadName: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    organization: "",
    dealStatus: "disconnected",
    message: "",
    date: new Date().toISOString().substring(0, 10),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("");
  const newLeadsApiUrl = "https://crm-brown-gamma.vercel.app/api/NewLeads";

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [searchTerm, locationFilter, organizationFilter, leads]);

  const fetchLeads = async () => {
    try {
      const response = await fetch(newLeadsApiUrl);
      const data = await response.json();
      if (data.success) {
        setLeads(data.contacts);
        setFilteredLeads(data.contacts);
      } else {
        alert("Failed to fetch leads!");
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const filterLeads = () => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const lowercasedLocationFilter = locationFilter.toLowerCase();
    const lowercasedOrganizationFilter = organizationFilter.toLowerCase();

    const filtered = leads.filter((lead) => {
      const matchesName = lead.name
        .toLowerCase()
        .includes(lowercasedSearchTerm);
      const matchesLocation = lowercasedLocationFilter
        ? lead.address.toLowerCase().includes(lowercasedLocationFilter)
        : true;
      const matchesOrganization = lowercasedOrganizationFilter
        ? lead.organization.toLowerCase().includes(lowercasedOrganizationFilter)
        : true;
      return matchesName && matchesLocation && matchesOrganization;
    });
    setFilteredLeads(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationFilterChange = (e) => {
    setLocationFilter(e.target.value);
  };

  const handleOrganizationFilterChange = (e) => {
    setOrganizationFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addNewLead = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(newLeadsApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert("New lead added successfully!");
        fetchLeads();
        setShowNewDealModal(false);
        resetFormData();
      } else {
        alert("Failed to add new lead!");
      }
    } catch (error) {
      console.error("Error adding new lead:", error);
    }
  };

  const confirmToggleStatus = (lead) => {
    setSelectedLead(lead);
    setShowConfirmModal(true);
  };

  const toggleDealStatus = async () => {
    if (!selectedLead) return;
    const updatedStatus =
      selectedLead.dealStatus === "connected" ? "disconnected" : "connected";
    try {
      await fetch(`${newLeadsApiUrl}/${selectedLead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealStatus: updatedStatus }),
      });
      fetchLeads();
    } catch (error) {
      console.error("Error updating deal status!", error);
    }
    setShowConfirmModal(false);
  };

  const resetFormData = () => {
    setFormData({
      leadName: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      organization: "",
      dealStatus: "disconnected",
      message: "",
      date: new Date().toISOString().substring(0, 10),
    });
  };

  const handleEdit = (lead) => {
    setFormData({
      leadName: lead.leadName,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      organization: lead.organization || "",
      dealStatus: lead.dealStatus,
      message: lead.message || "",
      _id: lead._id,
      date: lead.date
        ? lead.date.toString().substring(0, 10)
        : new Date().toISOString().substring(0, 10),
    });
    setShowNewDealModal(true);
  };

  const handleDelete = async (id) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this lead?"
    );
    if (confirmation) {
      try {
        await fetch(`${newLeadsApiUrl}/${id}`, {
          method: "DELETE",
        });
        fetchLeads();
      } catch (error) {
        console.error("Error deleting lead", error);
      }
    }
  };

  const updateLead = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${newLeadsApiUrl}/${formData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert("Lead updated successfully!");
        fetchLeads();
        setShowNewDealModal(false);
        resetFormData();
      } else {
        alert("Failed to update lead!");
      }
    } catch (error) {
      console.error("Error updating lead", error);
    }
  };

  const downloadExcel = () => {
    const modifiedLeads = filteredLeads.map(({ leadID, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(modifiedLeads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "LeadsData.xlsx");
  };

  // Function to toggle selection of all leads
  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead._id));
    }
  };

  // Function to toggle selection of individual lead
  const toggleSelectLead = (leadId) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter((id) => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };

  // Function to toggle multi-select mode
  const toggleMultiSelectMode = () => {
    setShowMultiSelectMode(!showMultiSelectMode);
    // Clear selections when toggling off
    if (showMultiSelectMode) {
      setSelectedLeads([]);
    }
  };

  // Function to delete multiple leads
  const deleteMultipleLeads = async () => {
    if (selectedLeads.length === 0) {
      alert("No leads selected");
      return;
    }

    try {
      // Create a promise for each delete operation
      const deletePromises = selectedLeads.map((id) =>
        fetch(`${newLeadsApiUrl}/${id}`, {
          method: "DELETE",
        })
      );

      // Wait for all deletes to complete
      await Promise.all(deletePromises);

      // Refresh the leads list
      fetchLeads();

      // Reset selections
      setSelectedLeads([]);
      setShowDeleteConfirmModal(false);

      alert(`Successfully deleted ${selectedLeads.length} leads`);
    } catch (error) {
      console.error("Error deleting multiple leads:", error);
      alert("Error occurred while deleting leads");
    }
  };

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">
      <main className="bg-white h-full w-full flex flex-col overflow-hidden">
        {/* Header Section */}
        <header className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Leads
            </h3>
            <div className="flex gap-2">
              <button
                onClick={toggleMultiSelectMode}
                className={`flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition duration-200 text-sm sm:text-base ${
                  showMultiSelectMode
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <CheckSquare size={18} />
                {showMultiSelectMode ? "Exit Selection" : "Select Mode"}
              </button>
              {showMultiSelectMode && selectedLeads.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirmModal(true)}
                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-red-600 transition duration-200 text-sm sm:text-base"
                >
                  <Trash2 size={18} />
                  Delete Selected ({selectedLeads.length})
                </button>
              )}
              <button
                onClick={() => {
                  resetFormData();
                  setShowNewDealModal(true);
                }}
                className="bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-blue-800 transition duration-200 text-sm sm:text-base"
              >
                Add New Lead +
              </button>
            </div>
          </div>

          {showMultiSelectMode && (
            <div className="mb-4 flex gap-2">
              <button
                onClick={toggleSelectAll}
                className="bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-blue-800 transition duration-200 text-sm sm:text-base"
              >
                {selectedLeads.length === filteredLeads.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <span className="flex items-center text-sm text-gray-600">
                {selectedLeads.length} of {filteredLeads.length} leads selected
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Search by Client name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className=" dark:text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={handleLocationFilterChange}
              className="w-full p-2 border dark:text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter by organization..."
                value={organizationFilter}
                onChange={handleOrganizationFilterChange}
                className=" dark:text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={downloadExcel}
                className="flex items-center justify-center bg-blue-50 p-2 rounded-md hover:bg-blue-100 transition-colors"
                title="Download as Excel"
              >
                <Download size={24} className="text-blue-600" />
              </button>
            </div>
          </div>
        </header>
        {/* Table Section */}
        <div className="flex-grow relative overflow-hidden">
          <div className="h-full overflow-y-auto">
            <table className="w-full border-collapse table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {showMultiSelectMode && (
                    <th className="p-3 text-sm font-semibold text-gray-600 text-left w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedLeads.length === filteredLeads.length &&
                          filteredLeads.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                    </th>
                  )}
                  <th className="p-3 text-sm font-semibold text-gray-600 text-left w-12">
                    #
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-left w-24">
                    Date
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-left w-32">
                    Deal Name
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-left w-32">
                    Client Name
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-left w-40">
                    Address
                  </th>
                  <th className="p-3 text-sm px-6 font-semibold text-gray-600 text-left w-40">
                    Contact
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-left w-40">
                    Message
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-left w-32">
                    Organization
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-left w-24">
                    Action
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-left w-32">
                    Connect Deal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead, index) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    {showMultiSelectMode && (
                      <td className="p-3 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead._id)}
                          onChange={() => toggleSelectLead(lead._id)}
                          className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        />
                      </td>
                    )}
                    <td className="p-3 text-sm text-gray-700">{index + 1}</td>
                    <td className="p-3 text-sm text-gray-700">
                      {(lead.date || "").toString().substring(0, 10) || "N/A"}
                    </td>
                    <td className="p-3 text-sm text-gray-700 truncate">
                      {lead.leadName}
                    </td>
                    <td className="p-3 text-sm text-gray-700 truncate">
                      {lead.name}
                    </td>
                    <td className="p-3 text-sm text-gray-700 truncate">
                      {lead.address}
                    </td>
                    <td className="p-3 text-sm text-gray-700 truncate">
                      <button
                        onClick={() => {
                          setSelectedEmail(lead.email);
                          setShowEmailModal(true);
                        }}
                        className="text-blue-600 font-semibold px-2 rounded-md"
                      >
                        ✉️
                      </button>
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-blue-500 font-semibold rounded-md hover:text-blue-700"
                      >
                        📞
                      </a>
                    </td>
                    <td className="p-3 text-sm text-gray-700 truncate">
                      {lead.message || "N/A"}
                    </td>
                    <td className="p-3 text-sm text-gray-700 truncate">
                      {lead.organization || "N/A"}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(lead)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex items-center">
                        <label className="relative inline-block w-10 h-6">
                          <input
                            type="checkbox"
                            checked={lead.dealStatus === "connected"}
                            onChange={() => confirmToggleStatus(lead)}
                            className="opacity-0 w-0 h-0 z-1"
                          />
                          <span
                            className={`absolute top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition duration-200 ${
                              lead.dealStatus === "connected"
                                ? "bg-green-500"
                                : ""
                            }`}
                          ></span>
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition duration-200 ${
                              lead.dealStatus === "connected"
                                ? "translate-x-4"
                                : ""
                            }`}
                          ></span>
                        </label>
                        <span className="ml-2 text-xs">
                          {lead.dealStatus === "connected"
                            ? "Connected"
                            : "Disconnected"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td
                      colSpan={showMultiSelectMode ? "12" : "11"}
                      className="p-4 text-center text-gray-500"
                    >
                      No leads found. Try adjusting your filters or add a new
                      lead.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
              <h2 className="text-lg font-bold mb-4">Email Details</h2>
              <p className="text-gray-700 mb-4">{selectedEmail}</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-3 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Multiple Leads Confirmation Modal */}
        {showDeleteConfirmModal && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Multiple Delete
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedLeads.length} selected
                leads? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteMultipleLeads}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200 text-sm"
                >
                  Delete {selectedLeads.length} Leads
                </button>
              </div>
            </div>
          </div>
        )}

        {showNewDealModal && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {formData._id ? "Edit Deal" : "Add New Lead"}
                </h2>
                <button
                  onClick={() => setShowNewDealModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <form
                onSubmit={formData._id ? updateLead : addNewLead}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Name*
                    </label>
                    <input
                      type="text"
                      name="leadName"
                      placeholder="Enter lead name"
                      value={formData.leadName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter client name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone*
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={10}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address*
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      name="organization"
                      placeholder="Enter organization (Optional)"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message*
                    </label>
                    <textarea
                      name="message"
                      placeholder="Add a message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
                      required
                    ></textarea>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition duration-200 text-sm font-medium"
                >
                  {formData._id ? "Update Deal" : "Add Deal"}
                </button>
              </form>
            </div>
          </div>
        )}
        {/* Confirm Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Action
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to{" "}
                {selectedLead.dealStatus === "connected"
                  ? "disconnect"
                  : "connect"}{" "}
                this deal?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={toggleDealStatus}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition duration-200 text-sm"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Leads;

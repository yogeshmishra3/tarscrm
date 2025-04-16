import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
// import EmployeeContacts from "../SettingComponents/EmployeeDetails";
// import MeetingSetting from "../SettingComponents/MeetingComponents";

// API URLs for integrations, deals, and quotations
const integrationsApiUrl =
  "https://crm-brown-gamma.vercel.app/api/integrations";
const dealManagementApiUrl =
  "https://crm-brown-gamma.vercel.app/api/dealmanagement";
const quotationsApiUrl = "https://crm-brown-gamma.vercel.app/api/newquotations";

function Settings() {
  const [deals, setDeals] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [providerName, setProviderName] = useState("");
  const [serviceInputs, setServiceInputs] = useState([]);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);
  const [activeSection, setActiveSection] = useState("deals");
  const [user, setUser] = useState(null); // Initialize user state as null
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const auth = getAuth();
  // State for deals selection
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [selectAllDeals, setSelectAllDeals] = useState(false);
  //   const navigate = useNavigate();

  // Listen for changes in the user's authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Update user state if user is logged in
      } else {
        setUser(null); // Set user state to null if user is logged out
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [auth]);

  // Fetch data when the component mounts
  useEffect(() => {
    fetchDeals();
    fetchQuotations();
    fetchIntegrations();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/login"); // Redirect to login page after logout
  };

  // Fetch Deals
  const fetchDeals = async () => {
    try {
      const response = await fetch(dealManagementApiUrl);
      if (!response.ok) throw new Error("Failed to fetch deals");
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      console.error("Error fetching deals:", error);
    }
  };

  // Fetch Quotations
  const fetchQuotations = async () => {
    try {
      const response = await fetch(quotationsApiUrl);
      if (!response.ok) throw new Error("Failed to fetch quotations");
      const data = await response.json();
      setQuotations(data);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    }
  };

  // Fetch Integrations
  const fetchIntegrations = async () => {
    try {
      const response = await fetch(integrationsApiUrl);
      if (!response.ok) throw new Error("Failed to fetch integrations");
      const data = await response.json();
      if (Array.isArray(data.data)) {
        setIntegrations(data.data);
      } else {
        console.error(
          "Expected an array of integrations in 'data', but received:",
          data.data
        );
        setIntegrations([]);
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
      setIntegrations([]);
    }
  };

  // Delete Deal
  const handleDeleteDeal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    try {
      const response = await fetch(`${dealManagementApiUrl}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete deal");
      setDeals(deals.filter((deal) => deal._id !== id));
    } catch (error) {
      console.error("Error deleting deal:", error);
    }
  };

  // Edit Quotation
  const handleEditQuotation = (id) => {
    navigate(`/edit-quotation/${id}`);
  };

  // Delete Quotation
  const handleDeleteQuotation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quotation?"))
      return;
    try {
      const response = await fetch(`${quotationsApiUrl}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete quotation");
      setQuotations(quotations.filter((quotation) => quotation._id !== id));
    } catch (error) {
      console.error("Error deleting quotation:", error);
    }
  };

  // Delete Service
  const handleDeleteService = async (integrationId, serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    const integration = integrations.find((i) => i._id === integrationId);
    if (!integration) {
      console.error("Integration not found");
      return;
    }

    const updatedServices = integration.services.filter(
      (service) => service._id !== serviceId
    );
    const updatedIntegration = {
      ...integration,
      services: updatedServices,
    };

    try {
      const response = await fetch(`${integrationsApiUrl}/${integrationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedIntegration),
      });

      if (!response.ok) throw new Error("Failed to delete service");

      setIntegrations(
        integrations.map((integration) =>
          integration._id === integrationId ? updatedIntegration : integration
        )
      );

      alert("Service deleted successfully");
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Error deleting service. Please try again.");
    }
  };

  // Delete Integration
  const handleDeleteIntegration = async (id) => {
    if (!window.confirm("Are you sure you want to delete this integration?"))
      return;
    try {
      const response = await fetch(`${integrationsApiUrl}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete integration");
      setIntegrations(
        integrations.filter((integration) => integration._id !== id)
      );
    } catch (error) {
      console.error("Error deleting integration:", error);
    }
  };

  // Edit Service
  const handleEditService = (integrationId, serviceIndex) => {
    const integration = integrations.find((i) => i._id === integrationId);
    setProviderName(integration.provider);
    setServiceInputs(
      integration.services.map((service) => ({
        name: service.name,
        dueDate: service.dueDate,
      }))
    );
    setEditingIntegration(integration);
    setEditingServiceIndex(serviceIndex);
    setShowModal(true);
  };

  // Save Services after editing
  const handleSaveServices = async () => {
    try {
      const updatedIntegration = {
        ...editingIntegration,
        provider: providerName,
        services: serviceInputs.map((input) => ({
          name: input.name,
          dueDate: input.dueDate,
        })),
      };

      const response = await fetch(
        `${integrationsApiUrl}/${editingIntegration._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedIntegration),
        }
      );

      if (!response.ok) throw new Error("Failed to update integration");

      setIntegrations(
        integrations.map((integration) =>
          integration._id === updatedIntegration._id
            ? updatedIntegration
            : integration
        )
      );

      setShowModal(false);
      setProviderName("");
      setServiceInputs([]);
      setEditingIntegration(null);
      setEditingServiceIndex(null);
    } catch (error) {
      console.error("Error saving services:", error);
    }
  };

  // Handle change for service input fields
  const handleServiceChange = (index, field, value) => {
    const updatedInputs = [...serviceInputs];
    updatedInputs[index][field] = value;
    setServiceInputs(updatedInputs);
  };

  // Sidebar Navigation
  const handleSidebarNavigation = (section) => {
    setActiveSection(section);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Modal for editing services
  const ServiceEditModal = () =>
    showModal && (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">Edit Service</h3>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Provider Name</label>
            <input
              type="text"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          {serviceInputs.map((input, index) => (
            <div key={index} className="mb-4">
              <h4 className="font-medium">Service {index + 1}</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={input.name}
                    onChange={(e) =>
                      handleServiceChange(index, "name", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={input.dueDate}
                    onChange={(e) =>
                      handleServiceChange(index, "dueDate", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveServices}
              className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );

  // First, add these state variables at the beginning of your Settings component
  const [selectedIntegrations, setSelectedIntegrations] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Add this function to handle selection of individual integrations
  const handleSelectIntegration = (integrationId) => {
    if (selectedIntegrations.includes(integrationId)) {
      setSelectedIntegrations(
        selectedIntegrations.filter((id) => id !== integrationId)
      );
    } else {
      setSelectedIntegrations([...selectedIntegrations, integrationId]);
    }
  };

  // Add this function to handle select all toggle
  const handleSelectAllIntegrations = () => {
    if (selectAll) {
      setSelectedIntegrations([]);
    } else {
      setSelectedIntegrations(
        integrations.map((integration) => integration._id)
      );
    }
    setSelectAll(!selectAll);
  };

  // Add this function to delete selected integrations
  const handleDeleteSelectedIntegrations = async () => {
    if (selectedIntegrations.length === 0) {
      alert("No integrations selected");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIntegrations.length} selected integration(s)?`
      )
    ) {
      return;
    }

    try {
      // Create an array of promises for each delete operation
      const deletePromises = selectedIntegrations.map((id) =>
        fetch(`${integrationsApiUrl}/${id}`, {
          method: "DELETE",
        })
      );

      // Wait for all delete operations to complete
      const results = await Promise.allSettled(deletePromises);

      // Check if any operations failed
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length > 0) {
        console.error("Some integrations could not be deleted", failures);
        alert(`${failures.length} integration(s) could not be deleted.`);
      }

      // Refresh the integrations list
      fetchIntegrations();

      // Clear selections
      setSelectedIntegrations([]);
      setSelectAll(false);

      alert(
        `Successfully deleted ${
          results.length - failures.length
        } integration(s).`
      );
    } catch (error) {
      console.error("Error deleting selected integrations:", error);
      alert("Error deleting selected integrations. Please try again.");
    }
  };

  // Add this function to delete all integrations
  const handleDeleteAllIntegrations = async () => {
    if (integrations.length === 0) {
      alert("No integrations to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ALL ${integrations.length} integrations? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // Create an array of promises for each delete operation
      const deletePromises = integrations.map((integration) =>
        fetch(`${integrationsApiUrl}/${integration._id}`, {
          method: "DELETE",
        })
      );

      // Wait for all delete operations to complete
      const results = await Promise.allSettled(deletePromises);

      // Check if any operations failed
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length > 0) {
        console.error("Some integrations could not be deleted", failures);
        alert(`${failures.length} integration(s) could not be deleted.`);
      }

      // Refresh the integrations list
      fetchIntegrations();

      // Clear selections
      setSelectedIntegrations([]);
      setSelectAll(false);

      alert(
        `Successfully deleted ${
          results.length - failures.length
        } integration(s).`
      );
    } catch (error) {
      console.error("Error deleting all integrations:", error);
      alert("Error deleting all integrations. Please try again.");
    }
  };

  // Handle selection of individual deals
  const handleSelectDeal = (dealId) => {
    if (selectedDeals.includes(dealId)) {
      setSelectedDeals(selectedDeals.filter((id) => id !== dealId));
    } else {
      setSelectedDeals([...selectedDeals, dealId]);
    }
  };

  // Handle select all toggle for deals
  const handleSelectAllDeals = () => {
    if (selectAllDeals) {
      setSelectedDeals([]);
    } else {
      setSelectedDeals(deals.map((deal) => deal._id));
    }
    setSelectAllDeals(!selectAllDeals);
  };

  // Delete selected deals
  const handleDeleteSelectedDeals = async () => {
    if (selectedDeals.length === 0) {
      alert("No deals selected");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedDeals.length} selected deal(s)?`
      )
    ) {
      return;
    }

    try {
      // Create an array of promises for each delete operation
      const deletePromises = selectedDeals.map((id) =>
        fetch(`${dealManagementApiUrl}/${id}`, {
          method: "DELETE",
        })
      );

      // Wait for all delete operations to complete
      const results = await Promise.allSettled(deletePromises);

      // Check if any operations failed
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length > 0) {
        console.error("Some deals could not be deleted", failures);
        alert(`${failures.length} deal(s) could not be deleted.`);
      }

      // Refresh the deals list
      fetchDeals();

      // Clear selections
      setSelectedDeals([]);
      setSelectAllDeals(false);

      alert(
        `Successfully deleted ${results.length - failures.length} deal(s).`
      );
    } catch (error) {
      console.error("Error deleting selected deals:", error);
      alert("Error deleting selected deals. Please try again.");
    }
  };

  // Delete all deals
  const handleDeleteAllDeals = async () => {
    if (deals.length === 0) {
      alert("No deals to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ALL ${deals.length} deals? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // Create an array of promises for each delete operation
      const deletePromises = deals.map((deal) =>
        fetch(`${dealManagementApiUrl}/${deal._id}`, {
          method: "DELETE",
        })
      );

      // Wait for all delete operations to complete
      const results = await Promise.allSettled(deletePromises);

      // Check if any operations failed
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length > 0) {
        console.error("Some deals could not be deleted", failures);
        alert(`${failures.length} deal(s) could not be deleted.`);
      }

      // Refresh the deals list
      fetchDeals();

      // Clear selections
      setSelectedDeals([]);
      setSelectAllDeals(false);

      alert(
        `Successfully deleted ${results.length - failures.length} deal(s).`
      );
    } catch (error) {
      console.error("Error deleting all deals:", error);
      alert("Error deleting all deals. Please try again.");
    }
  };

  // State for quotations selection
  const [selectedQuotations, setSelectedQuotations] = useState([]);
  const [selectAllQuotations, setSelectAllQuotations] = useState(false);

  // Handle selection of individual quotations
  const handleSelectQuotation = (quotationId) => {
    if (selectedQuotations.includes(quotationId)) {
      setSelectedQuotations(
        selectedQuotations.filter((id) => id !== quotationId)
      );
    } else {
      setSelectedQuotations([...selectedQuotations, quotationId]);
    }
  };

  // Handle select all toggle for quotations
  const handleSelectAllQuotations = () => {
    if (selectAllQuotations) {
      setSelectedQuotations([]);
    } else {
      setSelectedQuotations(quotations.map((quotation) => quotation._id));
    }
    setSelectAllQuotations(!selectAllQuotations);
  };

  // Delete selected quotations
  const handleDeleteSelectedQuotations = async () => {
    if (selectedQuotations.length === 0) {
      alert("No quotations selected");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedQuotations.length} selected quotation(s)?`
      )
    ) {
      return;
    }

    try {
      // Create an array of promises for each delete operation
      const deletePromises = selectedQuotations.map((id) =>
        fetch(`${quotationsApiUrl}/${id}`, {
          method: "DELETE",
        })
      );

      // Wait for all delete operations to complete
      const results = await Promise.allSettled(deletePromises);

      // Check if any operations failed
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length > 0) {
        console.error("Some quotations could not be deleted", failures);
        alert(`${failures.length} quotation(s) could not be deleted.`);
      }

      // Refresh the quotations list
      fetchQuotations();

      // Clear selections
      setSelectedQuotations([]);
      setSelectAllQuotations(false);

      alert(
        `Successfully deleted ${results.length - failures.length} quotation(s).`
      );
    } catch (error) {
      console.error("Error deleting selected quotations:", error);
      alert("Error deleting selected quotations. Please try again.");
    }
  };

  // Delete all quotations
  const handleDeleteAllQuotations = async () => {
    if (quotations.length === 0) {
      alert("No quotations to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ALL ${quotations.length} quotations? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // Create an array of promises for each delete operation
      const deletePromises = quotations.map((quotation) =>
        fetch(`${quotationsApiUrl}/${quotation._id}`, {
          method: "DELETE",
        })
      );

      // Wait for all delete operations to complete
      const results = await Promise.allSettled(deletePromises);

      // Check if any operations failed
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length > 0) {
        console.error("Some quotations could not be deleted", failures);
        alert(`${failures.length} quotation(s) could not be deleted.`);
      }

      // Refresh the quotations list
      fetchQuotations();

      // Clear selections
      setSelectedQuotations([]);
      setSelectAllQuotations(false);

      alert(
        `Successfully deleted ${results.length - failures.length} quotation(s).`
      );
    } catch (error) {
      console.error("Error deleting all quotations:", error);
      alert("Error deleting all quotations. Please try again.");
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row bg-gray-100 min-h-screen">
      {/* Mobile Header with Menu Button */}
      <div className="md:hidden bg-[#211C84] text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold"></h1>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-blue-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-hidden">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Settings
        </h2>

        {/* Deals Section */}
        {activeSection === "deals" && (
          <>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Deals</h3>

            {/* Add action buttons for deals */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={handleDeleteSelectedDeals}
                disabled={selectedDeals.length === 0}
                className={`px-4 py-2 rounded ${
                  selectedDeals.length > 0
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Delete Selected ({selectedDeals.length})
              </button>
              <button
                onClick={handleDeleteAllDeals}
                disabled={deals.length === 0}
                className={`px-4 py-2 rounded ${
                  deals.length > 0
                    ? "bg-red-700 text-white hover:bg-red-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Delete All ({deals.length})
              </button>
            </div>

            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
              <div className="max-h-[570px] overflow-y-auto">
                <table className="w-full bg-white shadow-lg rounded-lg">
                  <thead className="bg-[#211C84] text-white sticky top-0">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectAllDeals}
                          onChange={handleSelectAllDeals}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">
                        Lead Name
                      </th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">
                        Stage
                      </th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((deal) => (
                      <tr key={deal._id} className="hover:bg-gray-100 border-b">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedDeals.includes(deal._id)}
                            onChange={() => handleSelectDeal(deal._id)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-3">{deal.name}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {deal.leadName}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {deal.stage}
                        </td>
                        <td className="px-4 py-3">₹{deal.amount}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteDeal(deal._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Quotations Section */}
        {/* Quotations Section */}
        {activeSection === "quotations" && (
          <>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Quotations
            </h3>

            {/* Add action buttons for quotations */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={handleDeleteSelectedQuotations}
                disabled={selectedQuotations.length === 0}
                className={`px-4 py-2 rounded ${
                  selectedQuotations.length > 0
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Delete Selected ({selectedQuotations.length})
              </button>
              <button
                onClick={handleDeleteAllQuotations}
                disabled={quotations.length === 0}
                className={`px-4 py-2 rounded ${
                  quotations.length > 0
                    ? "bg-red-700 text-white hover:bg-red-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Delete All ({quotations.length})
              </button>
            </div>

            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
              <div className="max-h-[570px] overflow-y-auto">
                <table className="w-full bg-white shadow-lg rounded-lg">
                  <thead className="bg-[#211C84] text-white sticky top-0">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectAllQuotations}
                          onChange={handleSelectAllQuotations}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="px-4 py-3 text-left">Deal Name</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">
                        Client Name
                      </th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">
                        Quotation No
                      </th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((quotation) => (
                      <tr
                        key={quotation._id}
                        className="hover:bg-gray-100 border-b"
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedQuotations.includes(quotation._id)}
                            onChange={() =>
                              handleSelectQuotation(quotation._id)
                            }
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-3">{quotation.dealName}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {quotation.clientName}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {quotation.quotationNo}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {quotation.date}
                        </td>
                        <td className="px-4 py-3">
                          ₹
                          {quotation.items && quotation.items.length > 0
                            ? quotation.items.reduce(
                                (sum, item) =>
                                  sum + parseFloat(item.amount || 0),
                                0
                              )
                            : 0}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleEditQuotation(quotation._id)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-800 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteQuotation(quotation._id)
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Integrations Section */}
        {activeSection === "integrations" && (
          <>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Integrations
            </h3>

            {/* Add action buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={handleDeleteSelectedIntegrations}
                disabled={selectedIntegrations.length === 0}
                className={`px-4 py-2 rounded ${
                  selectedIntegrations.length > 0
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Delete Selected ({selectedIntegrations.length})
              </button>
              <button
                onClick={handleDeleteAllIntegrations}
                disabled={integrations.length === 0}
                className={`px-4 py-2 rounded ${
                  integrations.length > 0
                    ? "bg-red-700 text-white hover:bg-red-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Delete All ({integrations.length})
              </button>
            </div>

            {integrations.length === 0 ? (
              <p>No integrations available</p>
            ) : (
              <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <div className="max-h-[570px] overflow-y-auto">
                  <table className="w-full bg-white shadow-lg rounded-lg">
                    <thead className="bg-[#211C84] text-white sticky top-0">
                      <tr>
                        <th className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAllIntegrations}
                            className="w-4 h-4"
                          />
                        </th>
                        <th className="px-4 py-3 text-left">Provider</th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">
                          Service Count
                        </th>
                        <th className="px-4 py-3 text-left">Actions</th>
                        <th className="px-4 py-3 text-left">Services</th>
                      </tr>
                    </thead>
                    <tbody>
                      {integrations.map((integration) => (
                        <tr
                          key={integration._id}
                          className="hover:bg-gray-100 border-b"
                        >
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIntegrations.includes(
                                integration._id
                              )}
                              onChange={() =>
                                handleSelectIntegration(integration._id)
                              }
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="px-4 py-3">{integration.provider}</td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {integration.services.length}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                handleDeleteIntegration(integration._id)
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-2">
                              {integration.services.map((service) => (
                                <div
                                  key={service._id}
                                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2"
                                >
                                  <span className="font-medium">
                                    {service.name}
                                  </span>
                                  <div className="flex gap-2 mt-1 sm:mt-0">
                                    <button
                                      onClick={() =>
                                        handleEditService(
                                          integration._id,
                                          service._id
                                        )
                                      }
                                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-800 transition"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteService(
                                          integration._id,
                                          service._id
                                        )
                                      }
                                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Employee Contacts Section (Placeholder) */}
        {activeSection === "employeeContacts" && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Employee Contacts
            </h3>
            <p>Employee contacts content will be displayed here.</p>
          </div>
        )}

        {/* Meetings Section (Placeholder) */}
        {activeSection === "meetings" && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Meetings
            </h3>
            <p>Meetings content will be displayed here.</p>
          </div>
        )}
      </div>

      {/* Sidebar - Mobile (Overlay) and Desktop (Fixed) */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block md:w-64 lg:w-72 bg-[#211C84] text-white p-6 md:min-h-screen z-20 ${
          sidebarOpen
            ? "fixed inset-0 md:relative md:translate-x-0"
            : "md:translate-x-0"
        }`}
      >
        {/* Close button for mobile sidebar */}
        <div className="md:hidden flex justify-end mb-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-white mb-2"
          />
          {user ? (
            <>
              <h3 className="text-lg font-semibold text-center">
                Hi, Yogesh Mishra
              </h3>
              <p className="text-gray-300 text-center">Admin</p>
            </>
          ) : (
            <p className="text-center">Please log in</p>
          )}
        </div>

        {/* Navigation */}
        <ul className="space-y-3">
          {[
            { label: "Deals", key: "deals" },
            { label: "Quotations", key: "quotations" },
            { label: "Integrations", key: "integrations" },
            { label: "Employee Contacts", key: "employeeContacts" },
          ].map((item) => (
            <li
              key={item.key}
              className={`cursor-pointer text-center py-3 rounded-lg transition ${
                activeSection === item.key
                  ? "bg-white text-red-600"
                  : "bg-blue-900 hover:bg-blue-700"
              }`}
              onClick={() => handleSidebarNavigation(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Service Edit Modal */}
      <ServiceEditModal />
    </div>
  );
}

export default Settings;

import React, { useState, useEffect } from "react";
import axios from "axios";

const CRMIntegrationPage = () => {
  const [services, setServices] = useState([]);
  const [providerName, setProviderName] = useState("");
  const [serviceInputs, setServiceInputs] = useState([
    { name: "", dueDate: "", buyDate: "", serviceCost: "" },
  ]);
  // const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedExpiringService, setSelectedExpiringService] = useState(null);
  const [renewalCost, setRenewalCost] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);

  const baseURL = "https://crm-brown-gamma.vercel.app/api/integrations";

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchIntegrations();
      if (data) checkExpiringServices(data);
    };
    fetchData();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await axios.get(baseURL);
      setServices(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching integrations:", error.message);
      alert("Unable to fetch integrations. Please try again later.");
    }
  };

  const checkExpiringServices = (serviceData) => {
    const today = new Date();
    const nextFiveDays = new Date(today);
    nextFiveDays.setDate(today.getDate() + 5);

    const expiringServices = serviceData.flatMap((provider) =>
      provider.services
        .filter((service) => {
          if (!service.dueDate) return false;
          const dueDate = new Date(service.dueDate);
          return dueDate >= today && dueDate <= nextFiveDays;
        })
        .map((service) => ({
          provider: provider.provider,
          service: service.name,
          dueDate: service.dueDate,
          serviceCost: service.serviceCost,
          daysLeft: Math.ceil(
            (new Date(service.dueDate) - today) / (1000 * 60 * 60 * 24)
          ),
        }))
    );

    setNotifications(expiringServices);
  };

  const handleExpiringServiceClick = (service) => {
    setSelectedExpiringService(service);
    setRenewalCost("");
    setRenewalDate("");
    setNewDueDate("");
  };

  const handleProviderClick = (provider) => setSelectedProvider(provider);

  const handleCloseProviderDetails = () => setSelectedProvider(null);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const handleRenewService = async () => {
    if (!renewalCost || !renewalDate || !newDueDate) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.put(`${baseURL}/${selectedExpiringService.provider}`, {
        serviceName: selectedExpiringService.service,
        renewalCost,
        renewalDate,
        newDueDate,
      });

      // Remove from Expiring Services Pop-up
      setNotifications((prev) =>
        prev.filter(
          (service) => service.service !== selectedExpiringService.service
        )
      );

      setSelectedExpiringService(null);
      // Refresh data
      fetchIntegrations();
    } catch (error) {
      console.error("Error updating service:", error.message);
      alert("Failed to update service. Please try again.");
    }
  };

  // Add Provider and Service Functions
  const handleAddProviderClick = () => {
    setProviderName("");
    setServiceInputs([{ name: "", dueDate: "", buyDate: "", serviceCost: "" }]);
    setShowAddProviderModal(true);
  };

  const handleAddService = () => {
    setServiceInputs([
      ...serviceInputs,
      { name: "", dueDate: "", buyDate: "", serviceCost: "" },
    ]);
  };

  const handleRemoveService = (index) => {
    if (serviceInputs.length === 1) {
      alert("At least one service is required");
      return;
    }
    const updatedInputs = [...serviceInputs];
    updatedInputs.splice(index, 1);
    setServiceInputs(updatedInputs);
  };

  const handleServiceInputChange = (index, field, value) => {
    const updatedInputs = [...serviceInputs];

    if (field === "buyDate") {
      if (
        updatedInputs[index].dueDate &&
        new Date(value) > new Date(updatedInputs[index].dueDate)
      ) {
        alert("Buy Date cannot be later than Due Date");
        return;
      }
    }

    if (field === "dueDate") {
      if (
        updatedInputs[index].buyDate &&
        new Date(value) < new Date(updatedInputs[index].buyDate)
      ) {
        alert("Due Date cannot be earlier than Buy Date");
        return;
      }
    }

    updatedInputs[index][field] = value;
    setServiceInputs(updatedInputs);
  };

  const handleSubmitProvider = async () => {
    // Validate inputs
    if (!providerName.trim()) {
      alert("Provider name is required");
      return;
    }

    const invalidServices = serviceInputs.filter(
      (service) => !service.name.trim()
    );
    if (invalidServices.length > 0) {
      alert("All service names are required");
      return;
    }

    try {
      await axios.post(baseURL, {
        provider: providerName,
        services: serviceInputs,
      });

      setShowAddProviderModal(false);
      fetchIntegrations();
    } catch (error) {
      console.error("Error adding provider:", error.message);
      alert("Failed to add provider. Please try again.");
    }
  };

  return (
    <div className="container p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black-700">
          CRM Integration Page
        </h1>
        <button
          className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
          onClick={handleAddProviderClick}
        >
          Add Provider
        </button>
      </div>

      {notifications.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-black p-3 mb-4 w-full md:w-1/3 text-sm fixed right-4 top-4 rounded shadow-lg z-50">
          <h3 className="font-semibold text-lg mb-2">Expiring Services</h3>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification, index) => (
              <p
                key={index}
                className="cursor-pointer p-2 hover:bg-yellow-50 rounded mb-1 transition-colors"
                onClick={() => handleExpiringServiceClick(notification)}
              >
                <strong className="text-blue-700">
                  {notification.provider}
                </strong>{" "}
                - {notification.service} is expiring on{" "}
                {formatDate(notification.dueDate)} (Cost:{" "}
                {notification.serviceCost}).
              </p>
            ))}
          </div>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-2 block transition-colors"
            onClick={() => setNotifications([])}
          >
            Dismiss
          </button>
        </div>
      )}

      {selectedExpiringService && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-50">
          <div className="bg-white p-6 text-black rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">
              Renew Service: {selectedExpiringService.service}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renewal Cost
              </label>
              <input
                type="text"
                className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Renewal Cost"
                value={renewalCost}
                onChange={(e) => setRenewalCost(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renewal Date
              </label>
              <input
                type="date"
                className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Due Date
              </label>
              <input
                type="date"
                className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                onClick={() => setSelectedExpiringService(null)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                onClick={handleRenewService}
              >
                Renew Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Provider Modal */}
      {showAddProviderModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-50">
          <div className="bg-white p-6 text-black rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                Add New Provider
              </h2>
              <button
                onClick={() => setShowAddProviderModal(false)}
                className="text-gray-500 hover:text-gray-700"
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

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Name
              </label>
              <input
                type="text"
                className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Provider Name"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-700">
                  Services
                </h3>
                <button
                  className="bg-blue-500 hover:bg-blue-800 text-white px-3 py-1 rounded text-sm transition-colors"
                  onClick={handleAddService}
                >
                  Add Another Service
                </button>
              </div>

              {serviceInputs.map((service, index) => (
                <div
                  key={index}
                  className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Service {index + 1}</h4>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveService(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name
                      </label>
                      <input
                        type="text"
                        className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Service Name"
                        value={service.name}
                        onChange={(e) =>
                          handleServiceInputChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Cost
                      </label>
                      <input
                        type="number"
                        className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Service Cost"
                        value={service.serviceCost}
                        onChange={(e) =>
                          handleServiceInputChange(
                            index,
                            "serviceCost",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buy Date
                      </label>
                      <input
                        type="date"
                        className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={service.buyDate}
                        onChange={(e) =>
                          handleServiceInputChange(
                            index,
                            "buyDate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={service.dueDate}
                        onChange={(e) =>
                          handleServiceInputChange(
                            index,
                            "dueDate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                onClick={() => setShowAddProviderModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                onClick={handleSubmitProvider}
              >
                Save Provider
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {services.length > 0 ? (
          services.map((serviceGroup) => (
            <div
              key={serviceGroup._id}
              className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-r from-blue-400 to-blue-600 text-white transform hover:-translate-y-1"
              onClick={() => handleProviderClick(serviceGroup)}
            >
              <div className="text-center font-semibold text-xl">
                {serviceGroup.provider}
              </div>
              <div className="text-center text-blue-100 mt-2">
                {serviceGroup.services.length} services
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 col-span-3 text-center py-8">
            No providers added yet.
          </p>
        )}
      </div>

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                {selectedProvider.provider}
              </h2>
              <button
                onClick={handleCloseProviderDetails}
                className="text-gray-500 hover:text-gray-700"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedProvider.services &&
                selectedProvider.services.map((service, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100"
                  >
                    <h3 className="font-semibold text-lg text-blue-700 mb-3 border-b border-blue-100 pb-2">
                      {service.name}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-500">Due Date:</span>
                        <span className="font-medium">
                          {formatDate(service.dueDate)}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-500">Buy Date:</span>
                        <span className="font-medium">
                          {formatDate(service.buyDate)}
                        </span>
                      </div>

                      <div className="flex flex-col col-span-2">
                        <span className="text-gray-500">Service Cost:</span>
                        <span className="font-medium text-blue-700">
                          {service.serviceCost}
                        </span>
                      </div>
                    </div>

                    {/* Renewal History Section */}
                    {service.renewalHistory &&
                      service.renewalHistory.length > 0 && (
                        <div className="mt-4 pt-2 border-t border-blue-100">
                          <h4 className="font-semibold text-blue-600 mb-2">
                            Renewal History:
                          </h4>
                          <div className="bg-white rounded p-2 max-h-40 overflow-y-auto">
                            {service.renewalHistory.map((renewal, idx) => (
                              <div
                                key={idx}
                                className="mb-2 pb-2 border-b border-gray-100 last:border-0 text-sm"
                              >
                                <div className="grid grid-cols-3 gap-1">
                                  <div>
                                    <span className="text-gray-500">Cost:</span>
                                    <span className="font-medium ml-1">
                                      {renewal.renewalCost}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Date:</span>
                                    <span className="font-medium ml-1">
                                      {formatDate(renewal.renewalDate)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Due:</span>
                                    <span className="font-medium ml-1">
                                      {formatDate(renewal.newDueDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMIntegrationPage;

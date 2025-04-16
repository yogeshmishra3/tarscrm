import React, { useState, useEffect } from "react";

function ClientContacts() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    companyname: "",
    status: "Active",
    dob: "",
    city: "",
    industry: "",
    note: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editClientId, setEditClientId] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  // Add new state variables for selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const apiUrl = "https://crm-brown-gamma.vercel.app/api/clientDetail";

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  // Reset selected clients when selection mode is toggled off
  useEffect(() => {
    if (!selectionMode) {
      setSelectedClients([]);
      setSelectAll(false);
    }
  }, [selectionMode]);

  const fetchClients = async () => {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.success) {
        setClients(data.clients);
        setFilteredClients(data.clients);
      } else {
        showPopupMessage("Failed to fetch clients!");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      showPopupMessage("An error occurred while fetching clients.");
    }
  };

  const generateClientId = () => {
    if (clients.length === 0) {
      return "TC-101";
    }

    // Find the highest client ID number
    let highestNum = 100;
    clients.forEach((client) => {
      if (client.clientId && client.clientId.startsWith("TC-")) {
        const num = parseInt(client.clientId.split("-")[1]);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    });

    // Generate the next client ID
    return `TC-${highestNum + 1}`;
  };

  const filterClients = () => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = clients.filter((client) =>
      client.name.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredClients(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Only allow numbers
      const numericValue = value.replace(/[^\d]/g, "");

      // Limit to 10 digits
      const limitedValue = numericValue.slice(0, 10);

      setFormData({ ...formData, [name]: limitedValue });

      // Validate phone number
      if (limitedValue.length > 0 && limitedValue.length !== 10) {
        setPhoneError("Phone number must be exactly 10 digits");
      } else {
        setPhoneError("");
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addClient = async (e) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showPopupMessage("Client added successfully!");
        fetchClients();
        setShowModal(false);
        resetFormData();
      } else {
        showPopupMessage(data.message || "Failed to add client!");
      }
    } catch (error) {
      console.error("Error adding client:", error);
      showPopupMessage("An error occurred while adding the client.");
    }
  };

  const editClient = async (clientId) => {
    try {
      const response = await fetch(`${apiUrl}/${clientId}`);
      const data = await response.json();

      if (data.success) {
        setFormData(data.client);
        setShowModal(true);
        setIsEditMode(true);
        setEditClientId(clientId);
      } else {
        showPopupMessage("Error fetching client details.");
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
      showPopupMessage("An error occurred while fetching client details.");
    }
  };

  const deleteClient = async (clientId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this client?"
    );
    if (isConfirmed) {
      try {
        const response = await fetch(`${apiUrl}/${clientId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          showPopupMessage("Client deleted successfully!");
          fetchClients();
        } else {
          showPopupMessage("Failed to delete client!");
        }
      } catch (error) {
        console.error("Error deleting client:", error);
        showPopupMessage("An error occurred while deleting the client.");
      }
    }
  };

  const resetFormData = () => {
    setFormData({
      clientId: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      companyname: "",
      status: "Active",
      dob: "",
      city: "",
      industry: "",
      note: "",
    });
    setPhoneError("");
  };

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  const saveClient = async (e) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/${editClientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showPopupMessage("Client updated successfully!");
        fetchClients();
        setShowModal(false);
        resetFormData();
      } else {
        showPopupMessage("Failed to update client!");
      }
    } catch (error) {
      console.error("Error updating client:", error);
      showPopupMessage("An error occurred while updating the client.");
    }
  };

  const handleOpenModal = () => {
    if (!isEditMode) {
      // Only auto-generate client ID when adding a new client
      const newClientId = generateClientId();
      setFormData({
        ...formData,
        clientId: newClientId,
      });
    }
    setShowModal(true);
  };

  // New functions for selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
  };

  const handleCheckboxChange = (clientId) => {
    setSelectedClients((prevSelected) => {
      if (prevSelected.includes(clientId)) {
        return prevSelected.filter((id) => id !== clientId);
      } else {
        return [...prevSelected, clientId];
      }
    });
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map((client) => client._id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkAction = (action) => {
    if (selectedClients.length === 0) {
      showPopupMessage("No clients selected!");
      return;
    }

    // Implement bulk actions here, such as delete, change status, etc.
    showPopupMessage(`${action} ${selectedClients.length} clients`);
  };

  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4 md:mb-0">
            Client Contacts
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className=" dark:text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            />
            <button
              onClick={toggleSelectionMode}
              className={`px-4 py-2 rounded-lg transition duration-200 w-full md:w-auto g${
                selectionMode
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {selectionMode ? "Cancel Selection" : "Select"}
            </button>
            <button
              onClick={() => {
                setIsEditMode(false);
                handleOpenModal();
              }}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 w-full md:w-auto"
            >
              Add Client +
            </button>
          </div>
        </header>

        {/* Bulk Actions - Shown only when in selection mode */}
        {selectionMode && selectedClients.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4 flex justify-between items-center">
            <p className="text-blue-800">
              {selectedClients.length} client(s) selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction("delete")}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button
                onClick={() => handleBulkAction("export")}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Export Selected
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div
            className="overflow-x-auto"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            <table className="min-w-full">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {selectionMode && (
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                        className="w-4 h-4"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">
                    Client ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client, index) => (
                  <tr
                    key={client._id}
                    className={`hover:bg-gray-50 transition duration-200 ${
                      selectedClients.includes(client._id) ? "bg-blue-50" : ""
                    }`}
                  >
                    {selectionMode && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client._id)}
                          onChange={() => handleCheckboxChange(client._id)}
                          className="w-4 h-4"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.clientId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.companyname}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          client.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editClient(client._id)}
                          className="text-yellow-600 hover:text-yellow-800 bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteClient(client._id)}
                          className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td
                      colSpan={selectionMode ? "10" : "9"}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No clients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {isEditMode ? "Edit Client" : "Add Client"}
            </h2>
            <form
              onSubmit={isEditMode ? saveClient : addClient}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    name="clientId"
                    placeholder="Client ID"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    required
                    disabled={true}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="relative">
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone (10 digits)"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      phoneError ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                  )}
                </div>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                />
                <input
                  type="text"
                  name="companyname"
                  placeholder="Company Name"
                  value={formData.companyname}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                  title="Please enter the date in DD/MM/YYYY format."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="industry"
                  placeholder="Industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <textarea
                name="note"
                placeholder="Additional Notes"
                value={formData.note}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              ></textarea>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditMode(false);
                    resetFormData();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  {isEditMode ? "Save Changes" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Popup */}
      {showPopup && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {popupMessage}
        </div>
      )}
    </div>
  );
}

export default ClientContacts;

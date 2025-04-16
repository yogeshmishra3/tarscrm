import React, { useState, useEffect } from "react";

const dealsApiUrl = "https://crm-brown-gamma.vercel.app/api/dealmanagement";
const projectsDetailsApiUrl =
  "https://crm-brown-gamma.vercel.app/api/projectsDetails";
const employeesApiUrl = "https://crm-brown-gamma.vercel.app/api/employees";

function Projects() {
  const [qualifiedDeals, setQualifiedDeals] = useState([]);
  const [projectDetails, setProjectDetails] = useState({});
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    dueDate: "",
    team: [],
    status: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQualifiedDeals();
    fetchProjectDetails();
    fetchEmployees();
  }, []);

  const fetchQualifiedDeals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(dealsApiUrl);
      const data = await response.json();
      const qualified = data.filter((deal) => deal.stage === "Qualified");
      setQualifiedDeals(qualified);
    } catch (error) {
      console.error("Error fetching qualified deals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(projectsDetailsApiUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        const detailsMap = {};
        data.forEach((project) => {
          detailsMap[project.name] = project;
        });
        setProjectDetails(detailsMap);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(employeesApiUrl);
      const data = await response.json();
      if (Array.isArray(data.employees)) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    const existingDetails = projectDetails[deal.name] || {};
    setFormData({
      name: deal.name,
      dueDate: existingDetails.dueDate || "",
      team: existingDetails.team || [],
      status: existingDetails.status || "",
    });
    setIsModalOpen(true);
    setErrorMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTeamSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData({
      ...formData,
      team: selectedOptions,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dueDate || !formData.team.length || !formData.status) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(projectsDetailsApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save project details");
      }

      const result = await response.json();
      setProjectDetails({
        ...projectDetails,
        [formData.name]: formData,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving project details:", error);
      setErrorMessage("Error saving project details. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Running Projects
      </h1>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {isLoading ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-300">
            Loading projects...
          </div>
        ) : qualifiedDeals.length === 0 ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-300 font-medium">
            No Projects Found
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600">
                  Project Name
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600">
                  Due Date
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600">
                  Team
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600">
                  Status
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {qualifiedDeals.map((deal) => (
                <tr
                  key={deal._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
                >
                  <td className="p-3 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                    {deal.name}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                    {projectDetails[deal.name]?.dueDate || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                    {projectDetails[deal.name]?.team?.join(", ") || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-600">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        projectDetails[deal.name]?.status === "Completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                          : projectDetails[deal.name]?.status === "In Progress"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : projectDetails[deal.name]?.status === "Open"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                      }`}
                    >
                      {projectDetails[deal.name]?.status || "N/A"}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => handleEdit(deal)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Edit Project
            </h2>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Project Name:
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={formData.name}
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Due Date:
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Team:
                </label>
                <select
                  name="team"
                  multiple
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={formData.team}
                  onChange={handleTeamSelect}
                >
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Hold Ctrl/Cmd to select multiple team members
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Status:
                </label>
                <select
                  name="status"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="">Select Status</option>
                  <option value="To Do">To Do</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;

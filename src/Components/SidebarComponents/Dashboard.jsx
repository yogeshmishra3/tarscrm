import React, { useState, useEffect } from "react";
import axios from "axios";
import MeetingNotifications from "../DashboardComponents/MeetingNotification";
import TopDeals from "../DashboardComponents/TopDeals";
import TaskProgress from "../DashboardComponents/TaskProgress";
import TotalRevenue from "../DashboardComponents/TotalRevenue";

const Dashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedExpiringService, setSelectedExpiringService] = useState(null);
  const [renewalCost, setRenewalCost] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [expiringTasks, setExpiringTasks] = useState([]);
  const [isExpiringTasksPopupOpen, setIsExpiringTasksPopupOpen] =
    useState(false);

  const baseURL = "https://crm-brown-gamma.vercel.app/api/integrations";
  const apiUrl = "https://crm-brown-gamma.vercel.app/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(baseURL);
        const serviceData = response.data.data;
        checkExpiringServices(serviceData);

        const tasksResponse = await fetch(`${apiUrl}/Newtasks`);
        const tasksData = await tasksResponse.json();
        if (tasksData.success) {
          checkExpiringTasks(tasksData.tasks);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    fetchData();
  }, []);

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

  const checkExpiringTasks = (tasks) => {
    const today = new Date();
    const upcomingTasks = tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      const timeDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return timeDiff > 0 && timeDiff <= 3;
    });

    if (upcomingTasks.length > 0) {
      setExpiringTasks(upcomingTasks);
      setIsExpiringTasksPopupOpen(true);
    }
  };

  const handleExpiringServiceClick = (service) => {
    setSelectedExpiringService(service);
    setRenewalCost("");
    setRenewalDate("");
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
      setNotifications((prev) =>
        prev.filter(
          (service) => service.service !== selectedExpiringService.service
        )
      );
      setSelectedExpiringService(null);
    } catch (error) {
      console.error("Error updating service:", error.message);
      alert("Failed to update service. Please try again.");
    }
  };

  return (
    <div className="md:h-auto md:pb-0 h-screen pb-1 flex flex-col overflow-hidden">
      {/* Main container with scrolling */}
      <div className="flex-grow relative overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-100 dark:bg-gray-900 min-h-full">
          {/* Expiring Tasks Notification */}
          {isExpiringTasksPopupOpen && expiringTasks.length > 0 && (
            <div className="fixed top-4 right-120 bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 mb-4 w-64 md:w-80 lg:w-96 shadow-lg z-10">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-red-500 dark:text-red-300">
                  Expiring Tasks
                </h3>
                <button
                  className="bg-red-500 dark:bg-red-600 text-white px-2 py-1 rounded text-sm"
                  onClick={() => setIsExpiringTasksPopupOpen(false)}
                >
                  Dismiss
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {expiringTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-white dark:bg-gray-800 p-3 rounded mb-2 hover:bg-yellow-50 dark:hover:bg-yellow-700"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {task.taskName}
                    </h4>
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                      <strong>Due:</strong>{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Employee:</strong> {task.clientName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiring Services Notification */}
          {notifications.length > 0 && (
            <div className="fixed top-4 right-4 bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 mb-4 w-64 md:w-80 lg:w-96 shadow-lg z-10">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Expiring Services
                </h3>
                <button
                  className="bg-red-500 dark:bg-red-600 text-white px-2 py-1 rounded text-sm"
                  onClick={() => setNotifications([])}
                >
                  Dismiss
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <p
                    key={index}
                    className="cursor-pointer text-sm mb-1 hover:bg-yellow-200 dark:hover:bg-yellow-700 text-gray-900 dark:text-gray-100 p-1 rounded"
                    onClick={() => handleExpiringServiceClick(notification)}
                  >
                    <strong>{notification.provider}</strong> -{" "}
                    {notification.service} expires in {notification.daysLeft}{" "}
                    days (Cost: {notification.serviceCost})
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Dashboard Components */}
          <div className="col-span-1">
            <MeetingNotifications />
          </div>
          <div className="col-span-1">
            <TotalRevenue />
          </div>
          <div className="col-span-1">
            <TaskProgress />
          </div>
          <div className="col-span-1">
            <TopDeals />
          </div>
        </div>
      </div>

      {/* Service Renewal Modal */}
      {selectedExpiringService && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 dark:bg-opacity-70 z-20">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Renew Service: {selectedExpiringService.service}
            </h2>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Renewal Cost
              </label>
              <input
                className="border p-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                type="text"
                value={renewalCost}
                onChange={(e) => setRenewalCost(e.target.value)}
                placeholder="Enter renewal cost"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Renewal Date
              </label>
              <input
                className="border p-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                New Due Date
              </label>
              <input
                className="border p-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleRenewService}
              >
                Renew
              </button>
              <button
                className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded"
                onClick={() => setSelectedExpiringService(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

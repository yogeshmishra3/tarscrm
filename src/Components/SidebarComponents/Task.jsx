import React, { useState, useEffect } from "react";

const apiUrl = "https://crm-brown-gamma.vercel.app/api"; // Make sure your backend URL is correct

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [recycleBinTasks, setRecycleBinTasks] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false); // Added for edit popup
  const [expiringTasks, setExpiringTasks] = useState([]);
  const [isExpiringPopupOpen, setIsExpiringPopupOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    taskName: "",
    taskDescription: "",
    taskStatus: "Open",
    clientName: "",
    startDate: "",
    dueDate: "",
  });
  const [taskToEdit, setTaskToEdit] = useState(null); // Track the task being edited
  const [isLoading, setIsLoading] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false); // State for controlling error popup visibility

  useEffect(() => {
    fetchTasks();
    fetchRecycleBinTasks();
  }, []);

  useEffect(() => {
    checkExpiringTasks();
  }, [tasks]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/Newtasks`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      } else {
        console.error("Failed to fetch tasks:", data.message);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExpiringTasks = () => {
    const today = new Date();
    const upcomingTasks = tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      const timeDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return timeDiff > 0 && timeDiff <= 3; // Show for 3, 2, and 1 days before
    });

    if (upcomingTasks.length > 0) {
      setExpiringTasks(upcomingTasks);
      setIsExpiringPopupOpen(true);
    }
  };

  const fetchRecycleBinTasks = async () => {
    try {
      const response = await fetch(`${apiUrl}/Newrecycle-bin`);
      const data = await response.json();
      if (data.success) {
        setRecycleBinTasks(data.recycledTasks);
      } else {
        console.error("Failed to fetch recycled tasks:", data.message);
      }
    } catch (error) {
      console.error("Error fetching recycled tasks:", error);
    }
  };

  const handleAddTask = async () => {
    const {
      taskName,
      taskDescription,
      taskStatus,
      clientName,
      startDate,
      dueDate,
    } = newTask;

    // Check if the due date is greater than the start date
    if (new Date(dueDate) <= new Date(startDate)) {
      setErrorMessage("Due date should be greater than start date.");
      setIsErrorPopupOpen(true);
      return;
    }

    if (
      !taskName ||
      !taskDescription ||
      !taskStatus ||
      !clientName ||
      !startDate ||
      !dueDate
    ) {
      setErrorMessage("Please fill in all fields.");
      setIsErrorPopupOpen(true);
      return;
    }

    // Check for duplicate task names
    const isDuplicate = tasks.some(
      (task) => task.taskName.toLowerCase() === taskName.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage(
        "A task with this name already exists. Please choose a different name."
      );
      setIsErrorPopupOpen(true);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/Newtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        setIsPopupOpen(false);
        setNewTask({
          taskName: "",
          taskDescription: "",
          taskStatus: "Open",
          clientName: "",
          startDate: "",
          dueDate: "",
        });
        fetchTasks();
      } else {
        console.error("Failed to add task:", await response.text());
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleEditTask = async () => {
    const {
      taskName,
      taskDescription,
      taskStatus,
      clientName,
      startDate,
      dueDate,
    } = taskToEdit;

    // Check if the due date is greater than the start date
    if (new Date(dueDate) <= new Date(startDate)) {
      setErrorMessage("Due date should be greater than start date.");
      setIsErrorPopupOpen(true); // Show error popup
      return;
    }

    if (
      !taskName ||
      !taskDescription ||
      !taskStatus ||
      !clientName ||
      !startDate ||
      !dueDate
    ) {
      setErrorMessage("Please fill in all fields");
      setIsErrorPopupOpen(true); // Show error popup
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/Newtasks/edit/${taskToEdit._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskToEdit),
        }
      );

      if (response.ok) {
        setIsEditPopupOpen(false);
        fetchTasks();
      } else {
        console.error("Failed to edit task:", await response.text());
      }
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  const handleArchiveTask = async (taskId) => {
    try {
      const response = await fetch(`${apiUrl}/Newtasks/archive/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        fetchTasks();
        fetchRecycleBinTasks();
      } else {
        console.error("Failed to archive task:", await response.text());
      }
    } catch (error) {
      console.error("Error archiving task:", error);
    }
  };

  const handleRestoreTask = async (taskId) => {
    try {
      const response = await fetch(
        `${apiUrl}/Newrecycle-bin/restore/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        fetchTasks();
        fetchRecycleBinTasks();
      } else {
        console.error("Failed to restore task:", await response.text());
      }
    } catch (error) {
      console.error("Error restoring task:", error);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const response = await fetch(`${apiUrl}/Newrecycle-bin/${taskToDelete}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        fetchRecycleBinTasks();
      } else {
        console.error("Failed to delete task:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setTaskToDelete(null); // Close confirmation modal
    }
  };

  const handleDragStart = (event, task) => {
    event.dataTransfer.setData("taskId", task._id);
    event.dataTransfer.setData("currentStatus", task.taskStatus);
  };

  const handleDrop = async (event, newStatus) => {
    const taskId = event.dataTransfer.getData("taskId");
    const currentStatus = event.dataTransfer.getData("currentStatus");

    if (currentStatus !== newStatus) {
      try {
        const response = await fetch(`${apiUrl}/tasks/${taskId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskStatus: newStatus }),
        });

        const result = await response.json();
        if (response.ok) {
          fetchTasks();
        } else {
          console.error("Failed to update task status:", result.message);
        }
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

  const editTask = async (taskId, updatedData) => {
    try {
      const response = await fetch(`${apiUrl}/Newtasks/edit/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to edit task: ${response.statusText}`);
      }

      const updatedTask = await response.json();
      console.log("Task updated:", updatedTask);
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  const handleAllowDrop = (event) => event.preventDefault();

  const openEditPopup = (task) => {
    setTaskToEdit(task);
    setIsEditPopupOpen(true);
  };

  // Handle close of error popup
  const closeErrorPopup = () => {
    setIsErrorPopupOpen(false);
    setErrorMessage(""); // Clear error message
  };

  return (
    <div className="container mx-auto p-4 relative h-screen overflow-y-auto text-gray-800 dark:text-white">
      {/* Expiring Tasks Popup - Top Right Corner */}
      {isExpiringPopupOpen && expiringTasks.length > 0 && (
        <div className="absolute top-4 right-4 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 mb-4 w-96 shadow-lg z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-red-500 dark:text-red-400">
              Expiring Tasks
            </h3>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded text-sm"
              onClick={() => setIsExpiringPopupOpen(false)}
            >
              Dismiss
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {expiringTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white dark:bg-gray-800 p-3 rounded mb-2 hover:bg-yellow-50 dark:hover:bg-yellow-800 text-gray-800 dark:text-gray-200"
              >
                <h4 className="font-semibold">{task.taskName}</h4>
                <p className="text-sm mt-1">
                  <strong>Due:</strong>{" "}
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <strong>Employee:</strong> {task.clientName}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-900 py-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Tasks
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPopupOpen(true)}
            className="bg-blue-500 hover:bg-blue-800 text-white px-4 py-2 rounded"
          >
            Add Task +
          </button>
          <span
            className="text-2xl cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            ♻
          </span>
        </div>
      </div>

      {/* No tasks message */}
      {!isLoading && tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center my-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            No tasks assigned
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Click "Add Task +" to create a new task
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["Open", "On Review", "In Progress", "Completed"].map((status) => (
            <div
              key={status}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
              onDragOver={handleAllowDrop}
              onDrop={(event) => handleDrop(event, status)}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                {status}
              </h3>
              {tasks
                .filter((task) => task.taskStatus === status)
                .map((task) => (
                  <div
                    key={task._id}
                    className="bg-white dark:bg-gray-700 p-4 rounded-md shadow mb-4 cursor-move text-gray-800 dark:text-gray-200"
                    draggable
                    onDragStart={(event) => handleDragStart(event, task)}
                  >
                    <h4 className="text-md font-bold mb-2">{task.taskName}</h4>
                    <p className="text-sm mb-2">{task.taskDescription}</p>
                    <p className="text-sm mb-1">
                      <strong>Employee:</strong> {task.clientName}
                    </p>
                    <p className="text-sm mb-1">
                      <strong>Start Date:</strong>{" "}
                      {new Date(task.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm mb-3">
                      <strong>Due Date:</strong>{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditPopup(task)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchiveTask(task._id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* Edit Task Popup */}
      {isEditPopupOpen && taskToEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md text-gray-800 dark:text-white">
            <h3 className="text-xl font-bold mb-4">Edit Task</h3>
            <input
              type="text"
              placeholder="Task Name"
              value={taskToEdit.taskName}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, taskName: e.target.value })
              }
              className="w-full p-2 mb-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <textarea
              placeholder="Task Description"
              value={taskToEdit.taskDescription}
              onChange={(e) =>
                setTaskToEdit({
                  ...taskToEdit,
                  taskDescription: e.target.value,
                })
              }
              className="w-full p-2 mb-3 border rounded h-24 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            ></textarea>
            <select
              value={taskToEdit.taskStatus}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, taskStatus: e.target.value })
              }
              className="w-full p-2 mb-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              {["Open", "On Review", "In Progress", "Completed"].map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                )
              )}
            </select>
            <input
              type="text"
              placeholder="Employee Name"
              value={taskToEdit.clientName}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, clientName: e.target.value })
              }
              className="w-full p-2 mb-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              placeholder="Start Date"
              value={taskToEdit.startDate}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, startDate: e.target.value })
              }
              className="w-full p-2 mb-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              placeholder="Due Date"
              value={taskToEdit.dueDate}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, dueDate: e.target.value })
              }
              className="w-full p-2 mb-4 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleEditTask}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditPopupOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {taskToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm text-gray-800 dark:text-white">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this task?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteTask}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setTaskToDelete(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md text-gray-800 dark:text-white">
            <h3 className="text-xl font-bold mb-4">Add New Task</h3>
            <input
              type="text"
              placeholder="Task Name"
              value={newTask.taskName}
              onChange={(e) =>
                setNewTask({ ...newTask, taskName: e.target.value })
              }
              className="w-full p-2 mb-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <textarea
              placeholder="Task Description"
              value={newTask.taskDescription}
              onChange={(e) =>
                setNewTask({ ...newTask, taskDescription: e.target.value })
              }
              className="w-full p-2 mb-3 border rounded h-24 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            ></textarea>
            <select
              value={newTask.taskStatus}
              onChange={(e) =>
                setNewTask({ ...newTask, taskStatus: e.target.value })
              }
              className="w-full p-2 mb-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              {["Open", "On Review", "In Progress", "Completed"].map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                )
              )}
            </select>
            <input
              type="text"
              placeholder="Employee Name"
              value={newTask.clientName}
              onChange={(e) =>
                setNewTask({ ...newTask, clientName: e.target.value })
              }
              className="w-full p-2 mb-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                placeholder="Start Date"
                value={newTask.startDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, startDate: e.target.value })
                }
                className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                placeholder="Due Date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAddTask}
                className="bg-blue-500 hover:bg-blue-800 text-white px-4 py-2 rounded"
              >
                Add Task
              </button>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Popup */}
      {isErrorPopupOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm text-gray-800 dark:text-white">
            <h3 className="text-xl font-bold mb-4 text-red-500 dark:text-red-400">
              Error
            </h3>
            <p className="mb-6">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={closeErrorPopup}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recycle Bin Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[50]"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-3/4 overflow-y-auto text-gray-800 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 z-2">
              <h3 className="text-xl font-bold">Recycle Bin</h3>
              <button
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={() => setIsOpen(false)}
              >
                X
              </button>
            </div>

            {recycleBinTasks.length > 0 ? (
              <div className="space-y-4">
                {recycleBinTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md"
                  >
                    <h4 className="text-md font-bold mb-2">{task.taskName}</h4>
                    <p className="text-sm mb-2">{task.taskDescription}</p>
                    <p className="text-sm mb-1">
                      <strong>Client:</strong> {task.clientName}
                    </p>
                    <p className="text-sm mb-1">
                      <strong>Start Date:</strong>{" "}
                      {new Date(task.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm mb-3">
                      <strong>Due Date:</strong>{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRestoreTask(task._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500 dark:text-gray-400">
                No tasks in Recycle Bin.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;

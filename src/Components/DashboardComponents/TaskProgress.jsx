import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]; // Colors for different statuses

const TaskProgress = () => {
  const [taskData, setTaskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("https://crm-brown-gamma.vercel.app/api/Newtasks") // Fetch tasks from backend
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        return response.json();
      })
      .then((data) => {
        const tasks = data.tasks || [];
        console.log("Fetched tasks:", tasks);

        // Categorize tasks based on status
        const taskCounts = {
          Open: 0,
          "In Progress": 0,
          "On Review": 0,
          Completed: 0,
        };

        tasks.forEach((task) => {
          if (taskCounts.hasOwnProperty(task.taskStatus)) {
            taskCounts[task.taskStatus] += 1;
          }
        });

        // Convert task counts to chart data format
        const chartData = Object.keys(taskCounts).map((status) => ({
          name: status,
          value: taskCounts[status],
        }));

        setTaskData(chartData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Check if there are actual tasks with values greater than 0
  const hasTaskData = taskData.some((item) => item.value > 0);

  return (
    <div className="p-2 bg-gray-800 rounded-lg shadow-md w-full md:max-w-xl lg:max-w-2xl">
      {loading ? (
        <p className="text-gray-500 text-center">Loading task data...</p>
      ) : error ? (
        <p className="text-red-500 text-center">Error loading tasks: {error}</p>
      ) : !hasTaskData ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-center text-lg font-medium">
            No TASKs Assigned
          </p>
        </div>
      ) : (
        <div className="flex justify-center">
          <PieChart
            width={300}
            height={270}
            className="w-full max-w-xs md:max-w-sm"
          >
            <Pie
              data={taskData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {taskData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </div>
      )}
    </div>
  );
};

export default TaskProgress;

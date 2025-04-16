import React, { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const RevenueChart = () => {
  const [data, setData] = useState({ monthly: [], yearly: [] });
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState("yearly");
  const [selectedData, setSelectedData] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const response = await axios.get(
          "https://crm-brown-gamma.vercel.app/api/financeDetails"
        );
        const financeData = response.data;

        const monthlyRevenue = Array(12).fill(0);
        const yearlyRevenue = {};
        const monthlyClients = Array(12)
          .fill([])
          .map(() => []);
        const yearlyClients = {};

        financeData.forEach((finance) => {
          const paymentDates = [
            finance.paymentDate?.advancedPDate,
            finance.paymentDate?.midPDate,
            finance.paymentDate?.finalPDate,
          ];

          const totalPayments = [
            finance.advancePayment || 0,
            finance.midPayment || 0,
            finance.finalPayment || 0,
          ];

          paymentDates.forEach((date, index) => {
            if (!date) return;
            const parsedDate = new Date(date);
            const monthIndex = parsedDate.getMonth();
            const year = parsedDate.getFullYear();
            const paymentAmount = totalPayments[index];

            // Update monthly revenue
            monthlyRevenue[monthIndex] += paymentAmount;
            monthlyClients[monthIndex].push({
              client: finance.clientName,
              amount: paymentAmount,
              date,
            });

            // Update yearly revenue
            if (!yearlyRevenue[year]) {
              yearlyRevenue[year] = 0;
              yearlyClients[year] = [];
            }
            yearlyRevenue[year] += paymentAmount;
            yearlyClients[year].push({
              client: finance.clientName,
              amount: paymentAmount,
              date,
            });
          });
        });

        // Convert to chart data format
        const monthlyData = monthlyRevenue.map((revenue, index) => ({
          label: new Date(0, index).toLocaleString("default", {
            month: "long",
          }),
          revenue,
          clients: monthlyClients[index],
        }));

        const yearlyData = Object.keys(yearlyRevenue).map((year) => ({
          label: year,
          revenue: yearlyRevenue[year],
          clients: yearlyClients[year],
        }));

        setData({ monthly: monthlyData, yearly: yearlyData });
        setFilteredData(yearlyData);
      } catch (err) {
        console.error("Error fetching finance data:", err);
      }
    };

    fetchFinanceData();
  }, []);

  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilterType(selectedFilter);
    setFilteredData(data[selectedFilter]);
  };

  const handleBarClick = (entry) => {
    setSelectedData(entry.clients);
    setSelectedLabel(entry.label);
    setModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-2 md:p-4 rounded-lg shadow-md w-full">
      <h3 className="text-center font-semibold text-gray-800 dark:text-gray-100 text-sm md:text-base lg:text-lg">
        Yearly and Monthly Revenue Overview
      </h3>

      <div className="text-center mt-2">
        <label className="mr-2 text-gray-700 dark:text-gray-300 text-xs md:text-sm">
          Filter by:
        </label>
        <select
          className="p-1 border rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 text-xs md:text-sm"
          value={filterType}
          onChange={handleFilterChange}
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div
        className="w-full h-48 sm:h-56 md:h-64 lg:h-72 mt-2"
        ref={chartContainerRef}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "currentColor" }}
              height={30}
              stroke="currentColor"
            />
            <YAxis
              width={40}
              tick={{ fontSize: 10, fill: "currentColor" }}
              stroke="currentColor"
            />
            <Tooltip
              contentStyle={{
                fontSize: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "#333",
              }}
              itemStyle={{ padding: "2px 0" }}
            />
            <Legend
              wrapperStyle={{
                fontSize: "10px",
                paddingTop: "10px",
                color: "currentColor",
              }}
            />
            <Bar
              dataKey="revenue"
              fill="rgba(59, 130, 246, 0.7)"
              name="Total Revenue"
              onClick={handleBarClick}
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} cursor="pointer" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-70 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-3 md:p-5 rounded-md w-full max-w-xs md:max-w-sm lg:max-w-md overflow-y-auto max-h-screen">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100 text-sm md:text-base">
              Client Payment Breakdown
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm">
              <strong>Month/Year:</strong> {selectedLabel}
            </p>
            <div className="mt-2 max-h-48 md:max-h-64 overflow-y-auto">
              <ul>
                {selectedData.map((client, index) => (
                  <li
                    key={index}
                    className="text-gray-700 dark:text-gray-300 text-xs md:text-sm mb-1"
                  >
                    {client.client}: ₹{client.amount} on Date:{" "}
                    {new Date(client.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-2 text-gray-700 dark:text-gray-300 text-xs md:text-sm">
              <strong>Total Amount:</strong> ₹
              {selectedData.reduce((acc, client) => acc + client.amount, 0)}
            </p>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 px-2 py-1 md:px-3 md:py-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded text-xs md:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://crm-brown-gamma.vercel.app/api/financeDetails"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const paymentsData = await response.json();
      const validPayments = paymentsData.filter(
        (payment) =>
          payment.advancePayment > 0 ||
          payment.midPayment > 0 ||
          payment.finalPayment > 0
      );

      setPayments(validPayments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId, paymentType) => {
    try {
      if (
        !window.confirm(
          `Are you sure you want to delete this ${paymentType} entry?`
        )
      ) {
        return;
      }

      const response = await fetch(
        `https://crm-brown-gamma.vercel.app/api/financeDetails/${paymentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete payment");
      }

      // Optimistic UI update
      setPayments((prevPayments) =>
        prevPayments.filter((payment) => payment._id !== paymentId)
      );

      alert(`${paymentType} entry deleted successfully!`);
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Delete failed: ${error.message}`);
      fetchPayments(); // Refresh data if delete fails
    }
  };

  const filterPayments = () => {
    return payments.filter((payment) => {
      const paymentDates = [];

      if (payment.advancePayment > 0 && payment.paymentDate?.advancedPDate) {
        paymentDates.push(new Date(payment.paymentDate.advancedPDate));
      }

      if (payment.midPayment > 0 && payment.paymentDate?.midPDate) {
        paymentDates.push(new Date(payment.paymentDate.midPDate));
      }

      if (payment.finalPayment > 0 && payment.paymentDate?.finalPDate) {
        paymentDates.push(new Date(payment.paymentDate.finalPDate));
      }

      if (paymentDates.length === 0) return false;

      switch (filter) {
        case "Yearly":
          return paymentDates.some(
            (date) => date.getFullYear() === selectedYear
          );
        case "Monthly":
          return paymentDates.some(
            (date) =>
              date.getFullYear() === selectedYear &&
              date.getMonth() + 1 === selectedMonth
          );
        case "Custom":
          return paymentDates.some(
            (date) => date >= new Date(startDate) && date <= new Date(endDate)
          );
        default:
          return true;
      }
    });
  };

  const downloadExcel = () => {
    const filteredPayments = filterPayments();

    const data = filteredPayments.flatMap((payment) => {
      const records = [];

      if (payment.advancePayment > 0) {
        records.push({
          "Project Name": payment.dealName,
          "Client Name": payment.clientName,
          "Payment Type": "Advanced Payment",
          Amount: payment.advancePayment,
          "Payment Date": payment.paymentDate?.advancedPDate || "Not Paid",
          "Due Date": payment.dueDate,
          Status: payment.paymentDate?.advancedPDate ? "Paid" : "Pending",
        });
      }

      if (payment.midPayment > 0) {
        records.push({
          "Project Name": payment.dealName,
          "Client Name": payment.clientName,
          "Payment Type": "Mid Payment",
          Amount: payment.midPayment,
          "Payment Date": payment.paymentDate?.midPDate || "Not Paid",
          "Due Date": payment.dueDate,
          Status: payment.paymentDate?.midPDate ? "Paid" : "Pending",
        });
      }

      if (payment.finalPayment > 0) {
        records.push({
          "Project Name": payment.dealName,
          "Client Name": payment.clientName,
          "Payment Type": "Final Payment",
          Amount: payment.finalPayment,
          "Payment Date": payment.paymentDate?.finalPDate || "Not Paid",
          "Due Date": payment.dueDate,
          Status: payment.paymentDate?.finalPDate ? "Paid" : "Pending",
        });
      }

      return records;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments Data");
    XLSX.writeFile(workbook, "Payments_Data.xlsx");
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Loading payments data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-red-700">
          Error loading payments: {error}
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-yellow-700">
          No payments found. Please check your data source.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          All Received Payments
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
        >
          Back to Finance
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex mb-6 bg-white p-4 rounded-lg shadow-md">
        <label className="text-gray-700 font-medium">Filter: </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="ml-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All</option>
          <option value="Yearly">Yearly</option>
          <option value="Monthly">Monthly</option>
          <option value="Custom">Custom</option>
        </select>

        {filter === "Yearly" && (
          <div className="ml-4">
            <label className="text-gray-700 font-medium">Year: </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="ml-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {filter === "Monthly" && (
          <div className="ml-4">
            <label className="text-gray-700 font-medium">Month: </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="ml-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>

            <label className="ml-4 text-gray-700 font-medium">Year: </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="ml-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {filter === "Custom" && (
          <div className="ml-4">
            <label className="text-gray-700 font-medium">Start Date: </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="ml-4 text-gray-700 font-medium">End Date: </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <button
          onClick={downloadExcel}
          className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-800 transition duration-300"
        >
          Download Payments
        </button>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-gray-700 font-medium border border-gray-200">
                Project Name
              </th>
              <th className="p-3 text-left text-gray-700 font-medium border border-gray-200">
                Client Name
              </th>
              <th className="p-3 text-left text-gray-700 font-medium border border-gray-200">
                Payment Type
              </th>
              <th className="p-3 text-left text-gray-700 font-medium border border-gray-200">
                Amount
              </th>
              <th className="p-3 text-left text-gray-700 font-medium border border-gray-200">
                Payment Date
              </th>
              <th className="p-3 text-left text-gray-700 font-medium border border-gray-200">
                Due Date
              </th>
              <th className="p-3 text-left text-gray-700 font-medium border border-gray-200">
                Status
              </th>
              <th className="p-3 text-left text-gray-700 font-medium border border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filterPayments().flatMap((payment) => {
              const paymentRecords = [];

              if (payment.advancePayment > 0) {
                paymentRecords.push(
                  <tr
                    key={`${payment._id}-advance`}
                    className="hover:bg-gray-50"
                  >
                    <td className="p-3 border border-gray-200">
                      {payment.dealName}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.clientName}
                    </td>
                    <td className="p-3 border border-gray-200 text-blue-700 font-bold">
                      Advanced Payment
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.advancePayment}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.paymentDate?.advancedPDate || "Not Paid"}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.dueDate}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.paymentDate?.advancedPDate ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 border border-gray-200">
                      <button
                        onClick={() =>
                          handleDeletePayment(payment._id, "Advanced Payment")
                        }
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              }

              if (payment.midPayment > 0) {
                paymentRecords.push(
                  <tr key={`${payment._id}-mid`} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-200">
                      {payment.dealName}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.clientName}
                    </td>
                    <td className="p-3 border border-gray-200 text-yellow-600 font-bold">
                      Mid Payment
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.midPayment}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.paymentDate?.midPDate || "Not Paid"}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.dueDate}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.paymentDate?.midPDate ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 border border-gray-200">
                      <button
                        onClick={() =>
                          handleDeletePayment(payment._id, "Mid Payment")
                        }
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              }

              if (payment.finalPayment > 0) {
                paymentRecords.push(
                  <tr key={`${payment._id}-final`} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-200">
                      {payment.dealName}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.clientName}
                    </td>
                    <td className="p-3 border border-gray-200 text-green-700 font-bold">
                      Final Payment
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.finalPayment}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.paymentDate?.finalPDate || "Not Paid"}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.dueDate}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {payment.paymentDate?.finalPDate ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 border border-gray-200">
                      <button
                        onClick={() =>
                          handleDeletePayment(payment._id, "Final Payment")
                        }
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              }

              return paymentRecords;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;

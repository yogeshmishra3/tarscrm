import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const Finance = () => {
  // State declarations
  const [qualifiedDeals, setQualifiedDeals] = useState([]);
  const [projects, setProjects] = useState({});
  const [financeDetails, setFinanceDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [paymentType, setPaymentType] = useState("Advanced Payment");
  const [amountToPay, setAmountToPay] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [filter, setFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("deals"); // 'deals' or 'payments'
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Constants for filters
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

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch qualified deals
        const dealsResponse = await fetch(
          "https://crm-brown-gamma.vercel.app/api/dealmanagement"
        );
        if (!dealsResponse.ok) throw new Error("Failed to fetch deals.");
        const dealsData = await dealsResponse.json();

        const filteredDeals = dealsData
          .filter((deal) => deal.stage === "Qualified")
          .map((deal) => ({
            id: deal._id || deal.id,
            dealName: deal.leadName || deal.name,
            clientName: deal.name || deal.leadName,
            projectName: deal.projectName || deal.name,
            amount: deal.amount || 0,
            date: deal.date || new Date().toISOString().split("T")[0],
          }));

        setQualifiedDeals(filteredDeals);

        // Fetch project details
        const projectsResponse = await fetch(
          "https://crm-brown-gamma.vercel.app/api/projectsDetails"
        );
        if (!projectsResponse.ok)
          throw new Error("Failed to fetch project details.");
        const projectsData = await projectsResponse.json();

        const projectsMap = projectsData.reduce((acc, project) => {
          acc[project.name] = project.dueDate;
          return acc;
        }, {});

        setProjects(projectsMap);

        // Fetch finance details
        const financeResponse = await fetch(
          "https://crm-brown-gamma.vercel.app/api/financeDetails"
        );
        if (!financeResponse.ok)
          throw new Error("Failed to fetch finance details.");
        const financeData = await financeResponse.json();

        const financeMap = financeData.reduce((acc, finance) => {
          acc[finance.id] = finance;
          return acc;
        }, {});

        setFinanceDetails(financeMap);

        // Prepare all payments data
        const payments = financeData.flatMap((finance) => {
          const paymentRecords = [];

          if (finance.advancePayment > 0) {
            paymentRecords.push({
              id: finance.id,
              dealName: finance.dealName,
              clientName: finance.clientName,
              paymentType: "Advanced Payment",
              amount: finance.advancePayment,
              paymentDate: finance.paymentDate?.advancedPDate || "N/A",
              dueDate: finance.dueDate,
            });
          }

          if (finance.midPayment > 0) {
            paymentRecords.push({
              id: finance.id,
              dealName: finance.dealName,
              clientName: finance.clientName,
              paymentType: "Mid Payment",
              amount: finance.midPayment,
              paymentDate: finance.paymentDate?.midPDate || "N/A",
              dueDate: finance.dueDate,
            });
          }

          if (finance.finalPayment > 0) {
            paymentRecords.push({
              id: finance.id,
              dealName: finance.dealName,
              clientName: finance.clientName,
              paymentType: "Final Payment",
              amount: finance.finalPayment,
              paymentDate: finance.paymentDate?.finalPDate || "N/A",
              dueDate: finance.dueDate,
            });
          }

          return paymentRecords;
        });

        setAllPayments(payments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Modal functions
  const openModal = (deal) => {
    setSelectedDeal(deal);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDeal(null);
    setAmountToPay("");
    setPaymentType("Advanced Payment");
    setPaymentDate("");
  };

  const validateAmountToPay = (value) => {
    if (!selectedDeal) return value;

    const numericValue = Number(value);
    const existingFinance = financeDetails[selectedDeal.id] || {};
    const totalPaid =
      (existingFinance.advancePayment || 0) +
      (existingFinance.midPayment || 0) +
      (existingFinance.finalPayment || 0);
    const balance = selectedDeal.amount - totalPaid;

    // Ensure non-negative input
    if (numericValue < 0) {
      return "";
    }

    // Validate amount against balance
    if (numericValue > balance) {
      alert(`Payment amount cannot exceed the balance amount: ${balance}`);
      return "";
    }

    // Special validation for Final Payment
    if (paymentType === "Final Payment" && numericValue !== balance) {
      alert(`Final Payment must be exactly: ${balance}`);
      return "";
    }

    return value;
  };

  const handleSave = async () => {
    if (!selectedDeal) return;

    const { id, dealName, clientName, projectName, amount } = selectedDeal;
    const dueDate = projects[projectName] || "No due date";
    const existingFinance = financeDetails[id] || {};

    const totalPaid =
      (existingFinance.advancePayment || 0) +
      (existingFinance.midPayment || 0) +
      (existingFinance.finalPayment || 0);

    const balance = amount - totalPaid;
    const amountToPayNumber = Number(amountToPay);

    if (amountToPayNumber > balance) {
      alert(`Payment amount cannot exceed the balance amount: ${balance}`);
      return;
    }

    if (
      paymentType === "Advanced Payment" &&
      existingFinance.advancePayment > 0
    ) {
      alert(
        "Advanced Payment has already been completed and cannot be edited."
      );
      return;
    }

    if (paymentType === "Mid Payment") {
      if ((existingFinance.advancePayment || 0) === 0) {
        alert(
          "Mid Payment cannot be done until Advanced Payment is completed."
        );
        return;
      }
      if (existingFinance.midPayment > 0) {
        alert("Mid Payment has already been completed and cannot be edited.");
        return;
      }
    }

    if (paymentType === "Final Payment") {
      if ((existingFinance.midPayment || 0) === 0) {
        alert("Final Payment cannot be done until Mid Payment is completed.");
        return;
      }
      if (existingFinance.finalPayment > 0) {
        alert("Final Payment has already been completed and cannot be edited.");
        return;
      }
      if (amountToPayNumber !== balance) {
        alert(
          `Final Payment must be exactly the remaining balance: ${balance}`
        );
        return;
      }
    }

    const updatedFinance = {
      id,
      dealName,
      clientName,
      dueDate,
      amount,
      paymentDate: {
        advancedPDate:
          paymentType === "Advanced Payment"
            ? paymentDate
            : existingFinance.paymentDate?.advancedPDate,
        midPDate:
          paymentType === "Mid Payment"
            ? paymentDate
            : existingFinance.paymentDate?.midPDate,
        finalPDate:
          paymentType === "Final Payment"
            ? paymentDate
            : existingFinance.paymentDate?.finalPDate,
      },
      [paymentType === "Advanced Payment"
        ? "advancePayment"
        : paymentType === "Mid Payment"
        ? "midPayment"
        : "finalPayment"]: amountToPayNumber,
    };

    try {
      const response = await fetch(
        "https://crm-brown-gamma.vercel.app/api/financeDetails",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFinance),
        }
      );

      if (!response.ok) throw new Error("Failed to save finance details.");

      const savedData = await response.json();

      setFinanceDetails((prevFinance) => ({
        ...prevFinance,
        [savedData.id]: savedData,
      }));

      // Update allPayments state with the new payment
      const newPayment = {
        id: savedData.id,
        dealName: savedData.dealName,
        clientName: savedData.clientName,
        paymentType: paymentType,
        amount: amountToPayNumber,
        paymentDate: paymentDate,
        dueDate: savedData.dueDate,
      };

      setAllPayments((prev) => [...prev, newPayment]);

      alert("Finance details saved successfully!");
      closeModal();
    } catch (error) {
      console.error("Error saving finance details:", error);
    }
  };

  const handleDeletePayment = async (payment) => {
    if (
      !confirm(
        `Are you sure you want to delete ${payment.paymentType} for ${payment.dealName}?`
      )
    ) {
      return;
    }

    try {
      // Get existing finance details for this deal
      const existingFinance = financeDetails[payment.id];
      if (!existingFinance) {
        alert("Payment data not found.");
        return;
      }

      // Create updated finance object with the specific payment type set to 0
      const updatedFinance = {
        ...existingFinance,
        [payment.paymentType === "Advanced Payment"
          ? "advancePayment"
          : payment.paymentType === "Mid Payment"
          ? "midPayment"
          : "finalPayment"]: 0,
      };

      // If removing advanced payment, also remove mid and final payments
      if (payment.paymentType === "Advanced Payment") {
        updatedFinance.midPayment = 0;
        updatedFinance.finalPayment = 0;
      }

      // If removing mid payment, also remove final payment
      if (payment.paymentType === "Mid Payment") {
        updatedFinance.finalPayment = 0;
      }

      // Update the payment dates accordingly
      updatedFinance.paymentDate = {
        ...existingFinance.paymentDate,
        [payment.paymentType === "Advanced Payment"
          ? "advancedPDate"
          : payment.paymentType === "Mid Payment"
          ? "midPDate"
          : "finalPDate"]: null,
      };

      // Send API request to update finance details
      const response = await fetch(
        "https://crm-brown-gamma.vercel.app/api/financeDetails",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFinance),
        }
      );

      if (!response.ok) throw new Error("Failed to delete payment.");

      const updatedData = await response.json();

      // Update local state
      setFinanceDetails((prev) => ({
        ...prev,
        [payment.id]: updatedData,
      }));

      // Remove the payment from allPayments
      setAllPayments((prev) =>
        prev.filter(
          (p) => !(p.id === payment.id && p.paymentType === payment.paymentType)
        )
      );

      alert("Payment deleted successfully!");
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Error deleting payment. Please try again.");
    }
  };

  // Filter functions
  const filterDeals = (deals) => {
    return deals.filter((deal) => {
      const dealDate = new Date(deal.date);
      const dealYear = dealDate.getFullYear();
      const dealMonth = dealDate.getMonth() + 1;

      switch (filter) {
        case "Yearly":
          return dealYear === selectedYear;
        case "Monthly":
          return dealYear === selectedYear && dealMonth === selectedMonth;
        case "Custom":
          return (
            dealDate >= new Date(startDate) && dealDate <= new Date(endDate)
          );
        default:
          return true;
      }
    });
  };

  const filterPayments = () => {
    return allPayments.filter((payment) => {
      const paymentDateObj = new Date(payment.paymentDate);
      if (isNaN(paymentDateObj.getTime())) return false;

      switch (filter) {
        case "Yearly":
          return paymentDateObj.getFullYear() === selectedYear;
        case "Monthly":
          return (
            paymentDateObj.getFullYear() === selectedYear &&
            paymentDateObj.getMonth() + 1 === selectedMonth
          );
        case "Custom":
          return (
            paymentDateObj >= new Date(startDate) &&
            paymentDateObj <= new Date(endDate)
          );
        default:
          return true;
      }
    });
  };

  // Download Excel function
  const downloadExcel = () => {
    let data, fileName;

    if (viewMode === "deals") {
      const filteredDeals = filterDeals(qualifiedDeals);
      data = filteredDeals.map((deal) => {
        const finance = financeDetails[deal.id] || {};
        const balance =
          deal.amount -
          ((finance.advancePayment || 0) +
            (finance.midPayment || 0) +
            (finance.finalPayment || 0));
        return {
          "Project Name": deal.dealName,
          "Client Name": deal.clientName,
          "Due Date": projects[deal.projectName] || "No due date",
          "Advanced Payment": finance.advancePayment || 0,
          "Mid Payment": finance.midPayment || 0,
          "Final Payment": finance.finalPayment || 0,
          Amount: deal.amount,
          Balance: balance,
          Status: balance === 0 ? "Completed" : "Pending",
        };
      });
      fileName = "Finance_Data.xlsx";
    } else {
      data = filterPayments().map((payment) => ({
        "Project Name": payment.dealName,
        "Client Name": payment.clientName,
        "Payment Type": payment.paymentType,
        Amount: payment.amount,
        "Payment Date": payment.paymentDate,
        "Due Date": payment.dueDate,
      }));
      fileName = "Payments_Data.xlsx";
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, fileName);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Loading data...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        {viewMode === "deals" ? "Finance Details" : "All Received Payments"}
      </h1>

      {/* View Toggle and Download Buttons */}
      <div className="flex justify-between mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("deals")}
            className={`px-4 py-2 rounded-lg transition duration-300 ${
              viewMode === "deals"
                ? "bg-blue-500 dark:bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
            }`}
          >
            View Deals
          </button>
          <button
            onClick={() => setViewMode("payments")}
            className={`px-4 py-2 rounded-lg transition duration-300 ${
              viewMode === "payments"
                ? "bg-blue-500 dark:bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
            }`}
          >
            View Payments
          </button>
        </div>
        <button
          onClick={downloadExcel}
          className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition duration-300"
        >
          Download as Excel
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center">
          <label className="text-gray-700 dark:text-gray-300 font-medium mr-2">
            Filter:{" "}
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="All">All</option>
            <option value="Yearly">Yearly</option>
            <option value="Monthly">Monthly</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        {/* Yearly Filter */}
        {filter === "Yearly" && (
          <div className="flex items-center">
            <label className="text-gray-700 dark:text-gray-300 font-medium mr-2">
              Year:{" "}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Monthly Filter */}
        {filter === "Monthly" && (
          <>
            <div className="flex items-center">
              <label className="text-gray-700 dark:text-gray-300 font-medium mr-2">
                Month:{" "}
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="text-gray-700 dark:text-gray-300 font-medium mr-2">
                Year:{" "}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Custom Date Filter */}
        {filter === "Custom" && (
          <>
            <div className="flex items-center">
              <label className="text-gray-700 dark:text-gray-300 font-medium mr-2">
                Start Date:{" "}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center">
              <label className="text-gray-700 dark:text-gray-300 font-medium mr-2">
                End Date:{" "}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </>
        )}
      </div>

      {/* Content based on view mode */}
      {viewMode === "deals" ? (
        /* Deals Table */
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Project Name
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Client Name
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Due Date
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Advanced Payment
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Mid Payment
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Final Payment
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Amount
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Balance
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Status
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filterDeals(qualifiedDeals).map((deal) => {
                const finance = financeDetails[deal.id] || {};
                const balance =
                  deal.amount -
                  ((finance.advancePayment || 0) +
                    (finance.midPayment || 0) +
                    (finance.finalPayment || 0));

                return (
                  <tr
                    key={deal.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      {deal.dealName}
                    </td>
                    <td className="p-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      {deal.clientName}
                    </td>
                    <td className="p-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      {projects[deal.projectName] || "No due date"}
                    </td>
                    <td className="p-3 border border-gray-200 dark:border-gray-700 text-blue-700 dark:text-blue-300 font-bold">
                      {finance.advancePayment || 0}
                    </td>
                    <td className="p-3 border border-gray-200 dark:border-gray-700 text-yellow-600 dark:text-yellow-300 font-bold">
                      {finance.midPayment || 0}
                    </td>
                    <td className="p-3 border border-gray-200 dark:border-gray-700 text-green-700 dark:text-green-300 font-bold">
                      {finance.finalPayment || 0}
                    </td>
                    <td className="p-3 border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300">
                      {deal.amount}
                    </td>
                    <td className="p-3 border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 font-bold">
                      {balance}
                    </td>
                    <td className="p-3 border border-gray-200 dark:border-gray-700">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          balance === 0
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {balance === 0 ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td className="p-3 border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => openModal(deal)}
                        className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-300"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Payments Table */
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Project Name
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Client Name
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Payment Type
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Amount
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Payment Date
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Due Date
                </th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filterPayments().map((payment, index) => (
                <tr
                  key={`${payment.id}-${index}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="p-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {payment.dealName}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {payment.clientName}
                  </td>
                  <td
                    className={`p-3 border border-gray-200 dark:border-gray-700 font-bold ${
                      payment.paymentType === "Advanced Payment"
                        ? "text-blue-700 dark:text-blue-300"
                        : payment.paymentType === "Mid Payment"
                        ? "text-yellow-600 dark:text-yellow-300"
                        : "text-green-700 dark:text-green-300"
                    }`}
                  >
                    {payment.paymentType}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {payment.amount}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {payment.paymentDate}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {payment.dueDate}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleDeletePayment(payment)}
                      className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {showModal && selectedDeal && (
        <div className="fixed inset-0 bg-black dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Edit Finance Details
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Project Name:</strong> {selectedDeal.dealName}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Client Name:</strong> {selectedDeal.clientName}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Due Date:</strong>{" "}
                  {projects[selectedDeal.projectName] || "No due date"}
                </p>
              </div>

              {financeDetails[selectedDeal.id] && (
                <>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Balance Amount:</strong>{" "}
                      {selectedDeal.amount -
                        ((financeDetails[selectedDeal.id].advancePayment || 0) +
                          (financeDetails[selectedDeal.id].midPayment || 0) +
                          (financeDetails[selectedDeal.id].finalPayment || 0))}
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium">
                      Amount to Pay:
                    </label>
                    <input
                      type="number"
                      value={amountToPay}
                      onChange={(e) => {
                        const validatedValue = validateAmountToPay(
                          e.target.value
                        );
                        setAmountToPay(validatedValue);
                      }}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium">
                      Payment Date:
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        const today = new Date().toISOString().split("T")[0];
                        if (selectedDate > today) {
                          alert("Payment date cannot be in the future.");
                          return;
                        }
                        setPaymentDate(selectedDate);
                      }}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium">
                      Payment Type:
                    </label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      <option
                        value="Advanced Payment"
                        disabled={
                          financeDetails[selectedDeal.id]?.advancePayment > 0
                        }
                      >
                        Advanced Payment{" "}
                        {financeDetails[selectedDeal.id]?.advancePayment > 0
                          ? "(Paid)"
                          : ""}
                      </option>
                      <option
                        value="Mid Payment"
                        disabled={
                          financeDetails[selectedDeal.id]?.midPayment > 0 ||
                          (financeDetails[selectedDeal.id]?.advancePayment ||
                            0) === 0
                        }
                      >
                        Mid Payment{" "}
                        {financeDetails[selectedDeal.id]?.midPayment > 0
                          ? "(Paid)"
                          : ""}
                      </option>
                      <option
                        value="Final Payment"
                        disabled={
                          financeDetails[selectedDeal.id]?.finalPayment > 0 ||
                          (financeDetails[selectedDeal.id]?.midPayment || 0) ===
                            0
                        }
                      >
                        Final Payment{" "}
                        {financeDetails[selectedDeal.id]?.finalPayment > 0
                          ? "(Paid)"
                          : ""}
                      </option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-300"
              >
                Save
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition duration-300"
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

export default Finance;

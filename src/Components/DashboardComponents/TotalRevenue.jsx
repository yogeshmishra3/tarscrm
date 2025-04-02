import React, { useEffect, useState } from "react";
import axios from "axios";
import RevenueChart from "./RevenueChart";
import EmpSalary from "./EmpSalary";

const TotalRevenue = () => {
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    profitPercentage: 0,
    loading: true,
    error: null,
  });
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [availableYears, setAvailableYears] = useState([]);
  const [showRevenueChart, setShowRevenueChart] = useState(false); // State for revenue chart popup
  const [showExpensesChart, setShowExpensesChart] = useState(false); // State for expenses popup

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch revenue data
        const revenueResponse = await axios.get(
          "https://crm-mu-sooty.vercel.app/api/financeDetails"
        );
        const revenueData = revenueResponse.data;

        const serviceResponse = await fetch(
          "https://crm-mu-sooty.vercel.app/api/integrations"
        );
        const serviceData = await serviceResponse.json();
        const services = serviceData.data || [];

        // Extract all available years from both datasets
        const revenueYears = [
          ...new Set(
            revenueData.flatMap((finance) => {
              const years = [];
              const paymentDates = [
                finance.paymentDate?.advancedPDate,
                finance.paymentDate?.midPDate,
                finance.paymentDate?.finalPDate,
              ];

              paymentDates.forEach((date) => {
                if (date) {
                  years.push(new Date(date).getFullYear());
                }
              });

              return years;
            })
          ),
        ];

        const expenseYears = [
          ...new Set([
            ...services.flatMap((provider) =>
              provider.services.map((service) =>
                new Date(service.buyDate).getFullYear()
              )
            ),
            ...services.flatMap((provider) =>
              provider.services.flatMap((service) =>
                service.renewalHistory.map((renewal) =>
                  new Date(renewal.renewalDate).getFullYear()
                )
              )
            ),
          ]),
        ].filter(Boolean);

        const allYears = [...new Set([...revenueYears, ...expenseYears])].sort(
          (a, b) => b - a
        );
        setAvailableYears(allYears);

        // If no year is selected yet, set to most recent year
        if (!selectedYear && allYears.length > 0) {
          setSelectedYear(allYears[0].toString());
        }

        calculateFinancials(revenueData, services, selectedYear);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFinancialData((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load financial data",
        }));
      }
    };

    fetchData();
  }, [selectedYear]);

  const calculateFinancials = (revenueData, services, year) => {
    const yearNumber = parseInt(year);

    // Calculate total revenue for selected year
    let totalRevenue = 0;
    revenueData.forEach((finance) => {
      const paymentDates = [
        finance.paymentDate?.advancedPDate,
        finance.paymentDate?.midPDate,
        finance.paymentDate?.finalPDate,
      ];

      const payments = [
        finance.advancePayment || 0,
        finance.midPayment || 0,
        finance.finalPayment || 0,
      ];

      paymentDates.forEach((date, index) => {
        if (date && new Date(date).getFullYear() === yearNumber) {
          totalRevenue += payments[index];
        }
      });
    });

    // Calculate total expenses for selected year
    // 1. Service purchases
    const totalServiceCost = services
      .flatMap((provider) =>
        provider.services.filter(
          (service) => new Date(service.buyDate).getFullYear() === yearNumber
        )
      )
      .reduce((sum, service) => sum + service.serviceCost, 0);

    // 2. Service renewals
    const totalRenewalCost = services
      .flatMap((provider) =>
        provider.services.flatMap((service) =>
          service.renewalHistory.filter(
            (renewal) =>
              new Date(renewal.renewalDate).getFullYear() === yearNumber
          )
        )
      )
      .reduce((sum, renewal) => sum + renewal.renewalCost, 0);

    const totalExpenses = totalServiceCost + totalRenewalCost;
    const profit = totalRevenue - totalExpenses;
    const profitPercentage =
      totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0;

    setFinancialData({
      totalRevenue,
      totalExpenses,
      profit,
      profitPercentage,
      loading: false,
      error: null,
    });
  };

  const getStatusColor = (profit) => {
    return profit >= 0 ? "#4CAF50" : "#F44336";
  };

  // Function to handle opening/closing the revenue chart popup
  const handleOpenRevenueChart = () => {
    setShowRevenueChart(true);
  };

  const handleCloseRevenueChart = () => {
    setShowRevenueChart(false);
  };

  // Function to handle opening/closing the expenses popup
  const handleOpenExpensesChart = () => {
    setShowExpensesChart(true);
  };

  const handleCloseExpensesChart = () => {
    setShowExpensesChart(false);
  };

  if (financialData.loading) {
    return (
      <div style={styles.container}>
        <p>Loading financial data...</p>
      </div>
    );
  }

  if (financialData.error) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>{financialData.error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Financial Performance Summary</h2>

      <div style={styles.yearSelector}>
        <label style={styles.label}>Select Year: </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={styles.select}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.cardContainer}>
        {/* Revenue card with click handler */}
        <div
          style={{ ...styles.card, cursor: "pointer" }}
          onClick={handleOpenRevenueChart}
          title="Click to view detailed revenue chart"
        >
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Total Revenue</h3>
          </div>
          <div style={{ ...styles.cardBody, backgroundColor: "#E3F2FD" }}>
            <p style={styles.cardValue}>
              ₹{financialData.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Expenses card with click handler */}
        <div
          style={{ ...styles.card, cursor: "pointer" }}
          onClick={handleOpenExpensesChart}
          title="Click to view detailed expense breakdown"
        >
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Total Expenses</h3>
          </div>
          <div style={{ ...styles.cardBody, backgroundColor: "#FFF3E0" }}>
            <p style={styles.cardValue}>
              ₹{financialData.totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              {financialData.profit >= 0 ? "Profit" : "Loss"}
            </h3>
          </div>
          <div
            style={{
              ...styles.cardBody,
              backgroundColor:
                financialData.profit >= 0 ? "#E8F5E9" : "#FFEBEE",
            }}
          >
            <p
              style={{
                ...styles.cardValue,
                color: getStatusColor(financialData.profit),
              }}
            >
              ₹{Math.abs(financialData.profit).toLocaleString()}
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Profit Margin</h3>
          </div>
          <div
            style={{
              ...styles.cardBody,
              backgroundColor:
                financialData.profit >= 0 ? "#E8F5E9" : "#FFEBEE",
            }}
          >
            <p
              style={{
                ...styles.cardValue,
                color: getStatusColor(financialData.profit),
              }}
            >
              {financialData.profitPercentage}%
            </p>
          </div>
        </div>
      </div>

      <div style={styles.summary}>
        <h3 style={styles.summaryTitle}>
          Financial Summary for {selectedYear}
        </h3>
        <p style={styles.summaryText}>
          In {selectedYear}, the total revenue generated was{" "}
          <strong>₹{financialData.totalRevenue.toLocaleString()}</strong>{" "}
          against total expenses of{" "}
          <strong>₹{financialData.totalExpenses.toLocaleString()}</strong>,
          resulting in a {financialData.profit >= 0 ? "profit" : "loss"} of{" "}
          <strong style={{ color: getStatusColor(financialData.profit) }}>
            ₹{Math.abs(financialData.profit).toLocaleString()}
          </strong>{" "}
          with a profit margin of
          <strong style={{ color: getStatusColor(financialData.profit) }}>
            {" "}
            {financialData.profitPercentage}%
          </strong>
          .
        </p>
      </div>

      {/* Revenue Chart Popup Modal */}
      {showRevenueChart && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <span style={styles.closeButton} onClick={handleCloseRevenueChart}>
              &times;
            </span>
            <h2 style={styles.modalTitle}>Revenue Details</h2>
            <div style={styles.chartContainer}>
              <RevenueChart />
            </div>
          </div>
        </div>
      )}

      {/* Expenses Popup Modal */}
      {showExpensesChart && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <span style={styles.closeButton} onClick={handleCloseExpensesChart}>
              &times;
            </span>
            <h2 style={styles.modalTitle}>Expense Details</h2>
            <div style={styles.chartContainer}>
              <EmpSalary />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: "#fff",
    padding: "13px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    maxWidth: "670px",
    margin: "0 auto",
    marginBottom: "25px",
  },
  title: {
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "600",
  },
  yearSelector: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  label: {
    marginRight: "5px",
  },
  select: {
    padding: "2px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  cardContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "15px",
  },
  card: {
    flex: "1 1 150px",
    borderRadius: "6px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  cardHeader: {
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  },
  cardTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "500",
  },
  cardBody: {
    padding: "12px",
  },
  cardValue: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  summary: {
    marginTop: "20px",
    padding: "9px",
    borderTop: "1px solid #eee",
  },
  summaryTitle: {
    fontSize: "16px",
    fontWeight: "500",
  },
  summaryText: {
    fontSize: "14px",
    lineHeight: "1.5",
  },
  error: {
    color: "#F44336",
    fontWeight: "bold",
  },
  // Modal styles
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    width: "90%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "15px",
    fontSize: "24px",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#aaa",
  },
  modalTitle: {
    marginTop: "0",
    marginBottom: "15px",
    textAlign: "center",
  },
  chartContainer: {
    width: "100%",
    height: "auto",
  },
};

export default TotalRevenue;

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
  const [showRevenueChart, setShowRevenueChart] = useState(false);
  const [showExpensesChart, setShowExpensesChart] = useState(false);

  // Add dark mode detection
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    const handler = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addListener(handler);
    return () => darkModeMediaQuery.removeListener(handler);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const revenueResponse = await axios.get(
          "https://crm-brown-gamma.vercel.app/api/financeDetails"
        );
        const revenueData = revenueResponse.data;

        const serviceResponse = await fetch(
          "https://crm-brown-gamma.vercel.app/api/integrations"
        );
        const serviceData = await serviceResponse.json();
        const services = serviceData.data || [];

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

    const totalServiceCost = services
      .flatMap((provider) =>
        provider.services.filter(
          (service) => new Date(service.buyDate).getFullYear() === yearNumber
        )
      )
      .reduce((sum, service) => sum + service.serviceCost, 0);

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

  const handleOpenRevenueChart = () => {
    setShowRevenueChart(true);
  };

  const handleCloseRevenueChart = () => {
    setShowRevenueChart(false);
  };

  const handleOpenExpensesChart = () => {
    setShowExpensesChart(true);
  };

  const handleCloseExpensesChart = () => {
    setShowExpensesChart(false);
  };

  if (financialData.loading) {
    return (
      <div style={styles.container(isDarkMode)}>
        <p style={styles.text(isDarkMode)}>Loading financial data...</p>
      </div>
    );
  }

  if (financialData.error) {
    return (
      <div style={styles.container(isDarkMode)}>
        <p style={styles.error}>{financialData.error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container(isDarkMode)}>
      <h2 style={styles.title(isDarkMode)}>Financial Performance Summary</h2>

      <div style={styles.yearSelector}>
        <label style={styles.label(isDarkMode)}>Select Year: </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={styles.select(isDarkMode)}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.cardContainer}>
        <div
          style={{ ...styles.card, cursor: "pointer" }}
          onClick={handleOpenRevenueChart}
          title="Click to view detailed revenue chart"
        >
          <div style={styles.cardHeader(isDarkMode)}>
            <h3 style={styles.cardTitle(isDarkMode)}>Total Revenue</h3>
          </div>
          <div
            style={{
              ...styles.cardBody,
              backgroundColor: isDarkMode ? "#1E3A8A" : "#E3F2FD",
            }}
          >
            <p style={styles.cardValue(isDarkMode)}>
              ₹{financialData.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div
          style={{ ...styles.card, cursor: "pointer" }}
          onClick={handleOpenExpensesChart}
          title="Click to view detailed expense breakdown"
        >
          <div style={styles.cardHeader(isDarkMode)}>
            <h3 style={styles.cardTitle(isDarkMode)}>Total Expenses</h3>
          </div>
          <div
            style={{
              ...styles.cardBody,
              backgroundColor: isDarkMode ? "#7C2D12" : "#FFF3E0",
            }}
          >
            <p style={styles.cardValue(isDarkMode)}>
              ₹{financialData.totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader(isDarkMode)}>
            <h3 style={styles.cardTitle(isDarkMode)}>
              {financialData.profit >= 0 ? "Profit" : "Loss"}
            </h3>
          </div>
          <div
            style={{
              ...styles.cardBody,
              backgroundColor:
                financialData.profit >= 0
                  ? isDarkMode
                    ? "#14532D"
                    : "#E8F5E9"
                  : isDarkMode
                  ? "#7F1D1D"
                  : "#FFEBEE",
            }}
          >
            <p
              style={{
                ...styles.cardValue(isDarkMode),
                color: getStatusColor(financialData.profit),
              }}
            >
              ₹{Math.abs(financialData.profit).toLocaleString()}
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader(isDarkMode)}>
            <h3 style={styles.cardTitle(isDarkMode)}>Profit Margin</h3>
          </div>
          <div
            style={{
              ...styles.cardBody,
              backgroundColor:
                financialData.profit >= 0
                  ? isDarkMode
                    ? "#14532D"
                    : "#E8F5E9"
                  : isDarkMode
                  ? "#7F1D1D"
                  : "#FFEBEE",
            }}
          >
            <p
              style={{
                ...styles.cardValue(isDarkMode),
                color: getStatusColor(financialData.profit),
              }}
            >
              {financialData.profitPercentage}%
            </p>
          </div>
        </div>
      </div>

      <div style={styles.summary}>
        <h3 style={styles.summaryTitle(isDarkMode)}>
          Financial Summary for {selectedYear}
        </h3>
        <p style={styles.summaryText(isDarkMode)}>
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

      {showRevenueChart && (
        <div style={styles.modal}>
          <div style={styles.modalContent(isDarkMode)}>
            <span
              style={styles.closeButton(isDarkMode)}
              onClick={handleCloseRevenueChart}
            >
              &times;
            </span>
            <h2 style={styles.modalTitle(isDarkMode)}>Revenue Details</h2>
            <div style={styles.chartContainer}>
              <RevenueChart darkMode={isDarkMode} />
            </div>
          </div>
        </div>
      )}

      {showExpensesChart && (
        <div style={styles.modal}>
          <div style={styles.modalContent(isDarkMode)}>
            <span
              style={styles.closeButton(isDarkMode)}
              onClick={handleCloseExpensesChart}
            >
              &times;
            </span>
            <h2 style={styles.modalTitle(isDarkMode)}>Expense Details</h2>
            <div style={styles.chartContainer}>
              <EmpSalary darkMode={isDarkMode} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Updated styles with dark mode support
const styles = {
  container: (isDarkMode) => ({
    background: isDarkMode ? "#1E1E1E" : "#fff",
    padding: "13px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    maxWidth: "670px",
    margin: "0 auto",
    marginBottom: "25px",
    color: isDarkMode ? "#E0E0E0" : "#333",
  }),
  title: (isDarkMode) => ({
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "600",
    color: isDarkMode ? "#FFFFFF" : "#333",
  }),
  yearSelector: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  label: (isDarkMode) => ({
    marginRight: "5px",
    color: isDarkMode ? "#E0E0E0" : "#333",
  }),
  select: (isDarkMode) => ({
    padding: "2px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: isDarkMode ? "#333" : "#fff",
    color: isDarkMode ? "#E0E0E0" : "#333",
  }),
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
  cardHeader: (isDarkMode) => ({
    padding: "8px 0",
    borderBottom: "1px solid #eee",
    backgroundColor: isDarkMode ? "#2D2D2D" : "#f5f5f5",
  }),
  cardTitle: (isDarkMode) => ({
    margin: 0,
    fontSize: "16px",
    fontWeight: "500",
    color: isDarkMode ? "#FFFFFF" : "#333",
  }),
  cardBody: {
    padding: "12px",
  },
  cardValue: (isDarkMode) => ({
    fontSize: "18px",
    fontWeight: "bold",
    color: isDarkMode ? "#FFFFFF" : "#333",
  }),
  summary: {
    marginTop: "20px",
    padding: "9px",
    borderTop: "1px solid #eee",
  },
  summaryTitle: (isDarkMode) => ({
    fontSize: "16px",
    fontWeight: "500",
    color: isDarkMode ? "#FFFFFF" : "#333",
  }),
  summaryText: (isDarkMode) => ({
    fontSize: "14px",
    lineHeight: "1.5",
    color: isDarkMode ? "#E0E0E0" : "#333",
  }),
  text: (isDarkMode) => ({
    color: isDarkMode ? "#E0E0E0" : "#333",
  }),
  error: {
    color: "#F44336",
    fontWeight: "bold",
  },
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
  modalContent: (isDarkMode) => ({
    position: "relative",
    backgroundColor: isDarkMode ? "#2D2D2D" : "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    width: "90%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflow: "auto",
  }),
  closeButton: (isDarkMode) => ({
    position: "absolute",
    top: "10px",
    right: "15px",
    fontSize: "24px",
    fontWeight: "bold",
    cursor: "pointer",
    color: isDarkMode ? "#E0E0E0" : "#aaa",
  }),
  modalTitle: (isDarkMode) => ({
    marginTop: "0",
    marginBottom: "15px",
    textAlign: "center",
    color: isDarkMode ? "#FFFFFF" : "#333",
  }),
  chartContainer: {
    width: "100%",
    height: "auto",
  },
};

export default TotalRevenue;

import React, { useEffect, useState } from "react";

const EmpSalary = () => {
  const currentYear = new Date().getFullYear();
  const [salaries, setSalaries] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salaryResponse = await fetch(
          "https://crm-mu-sooty.vercel.app/get-all-salaries"
        );
        const salaryData = await salaryResponse.json();
        setSalaries(salaryData);

        const serviceResponse = await fetch(
          "https://crm-brown-gamma.vercel.app/api/integrations"
        );
        const serviceData = await serviceResponse.json();
        setServices(serviceData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const monthNames = [
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

  const filteredSalaries = salaries.filter(
    (salary) => salary.year === Number(selectedYear)
  );

  const filteredServices = services.flatMap((provider) =>
    provider.services.filter(
      (service) =>
        new Date(service.buyDate).getFullYear() === Number(selectedYear)
    )
  );

  const renewalData = services.flatMap((provider) =>
    provider.services.flatMap((service) =>
      service.renewalHistory.filter(
        (renewal) =>
          new Date(renewal.renewalDate).getFullYear() === Number(selectedYear)
      )
    )
  );

  const monthlyData = monthNames.map((month, index) => {
    const monthNumber = index + 1;

    const totalSalary = filteredSalaries
      .filter(
        (salary) =>
          new Date(`${salary.month} 1, ${salary.year}`).getMonth() + 1 ===
          monthNumber
      )
      .reduce((sum, salary) => sum + salary.amount, 0);

    const totalServiceCost = filteredServices
      .filter(
        (service) => new Date(service.buyDate).getMonth() + 1 === monthNumber
      )
      .reduce((sum, service) => sum + service.serviceCost, 0);

    const totalRenewalCost = renewalData
      .filter(
        (renewal) =>
          new Date(renewal.renewalDate).getMonth() + 1 === monthNumber
      )
      .reduce((sum, renewal) => sum + renewal.renewalCost, 0);

    const total = totalSalary + totalServiceCost + totalRenewalCost;

    return {
      month,
      totalSalary,
      totalServiceCost,
      totalRenewalCost,
      total,
    };
  });

  return (
    <div
      style={{
        padding: "20px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 6px 6px rgba(0,0,0,0.1)",
        marginLeft: "19%",
        width: "500px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Employee Salary & Service Records</h2>

      <div style={{ marginBottom: "15px", textAlign: "center" }}>
        <label style={{ fontWeight: "bold", marginRight: "10px" }}>
          Filter by Year:
        </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ddd",
          }}
        >
          {[
            ...new Set([
              ...salaries.map((s) => s.year),
              ...services.map((s) => new Date(s.buyDate).getFullYear()),
            ]),
          ]
            .filter(Boolean)
            .sort((a, b) => b - a)
            .map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
        </select>
      </div>

      {selectedYear && (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
              marginLeft: "0",
            }}
          >
            <thead>
              <tr style={{ background: "#f4f4f4" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Month
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Total Salary Paid
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Service Cost
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Renewal Cost
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(
                ({
                  month,
                  totalSalary,
                  totalServiceCost,
                  totalRenewalCost,
                  total,
                }) => (
                  <tr key={month}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {month}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      ₹{totalSalary}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      ₹{totalServiceCost}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      ₹{totalRenewalCost}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      ₹{total}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {/* Summary */}
          <div
            style={{
              marginTop: "15px",
              fontWeight: "bold",
              textAlign: "center",
              fontSize: "18px",
            }}
          >
            Total Salary Paid in {selectedYear}: ₹
            {monthlyData.reduce((sum, { totalSalary }) => sum + totalSalary, 0)}
          </div>
          <div
            style={{
              fontWeight: "bold",
              textAlign: "center",
              fontSize: "18px",
            }}
          >
            Total Service Cost in {selectedYear}: ₹
            {monthlyData.reduce(
              (sum, { totalServiceCost }) => sum + totalServiceCost,
              0
            )}
          </div>
          <div
            style={{
              fontWeight: "bold",
              textAlign: "center",
              fontSize: "18px",
            }}
          >
            Total Renewal Cost in {selectedYear}: ₹
            {monthlyData.reduce(
              (sum, { totalRenewalCost }) => sum + totalRenewalCost,
              0
            )}
          </div>
          <div
            style={{
              fontWeight: "bold",
              textAlign: "center",
              fontSize: "18px",
            }}
          >
            Total Expense in {selectedYear}: ₹
            {monthlyData.reduce((sum, { total }) => sum + total, 0)}
          </div>
        </>
      )}
    </div>
  );
};

export default EmpSalary;

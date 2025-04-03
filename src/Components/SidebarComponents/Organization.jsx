import React, { useEffect, useState } from "react";

const OrganizationsInCards = () => {
  const [leads, setLeads] = useState([]);
  const [financeDetails, setFinanceDetails] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsResponse, financeResponse] = await Promise.all([
        fetch("https://crm-brown-gamma.vercel.app/api/NewLeads"),
        fetch("https://crm-brown-gamma.vercel.app/api/financeDetails"),
      ]);

      const leadsData = await leadsResponse.json();
      const financeData = await financeResponse.json();

      if (leadsData.success) {
        const financeProjectNames = financeData.map((item) => item.clientName);

        // Filter leads: Keep only those whose project name exists in finance details
        const filteredLeads = leadsData.contacts.filter(
          (lead) =>
            lead.organization &&
            lead.organization !== "N/A" &&
            financeProjectNames.includes(lead.leadName) // Ensure leadName exists in finance details
        );

        setLeads(filteredLeads);
        setFinanceDetails(financeData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getFinanceData = (lead) => {
    const finance = financeDetails.find(
      (fin) =>
        fin.clientName === lead.leadName || fin.clientName === lead.organization
    );
    if (!finance) {
      return { total: 0, balance: 0 };
    }

    const totalAmount = finance.amount || 0;
    const paidAmount =
      (finance.advancePayment || 0) +
      (finance.midPayment || 0) +
      (finance.finalPayment || 0);
    const balanceAmount = totalAmount - paidAmount;

    return { total: totalAmount, balance: balanceAmount };
  };

  const handleEmail = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="mt-8 px-2 sm:px-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        Organizations Leads
      </h2>
      <div className="overflow-x-auto rounded-lg shadow-sm">
        {/* Desktop Table */}
        <table className="hidden sm:table w-full bg-white border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">
                Organization Name
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">
                Project Name
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">
                Total
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">
                Balance
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">
                Status
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {leads.length > 0 ? (
              leads.map((lead) => {
                const { total, balance } = getFinanceData(lead);
                return (
                  <tr
                    key={lead._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-sm text-gray-700 border-b">
                      {lead.organization}
                    </td>
                    <td className="p-3 text-sm text-gray-700 border-b">
                      {lead.leadName}
                    </td>
                    <td className="p-3 text-sm text-gray-700 border-b">
                      ${total.toFixed(2)}
                    </td>
                    <td className="p-3 text-sm text-gray-700 border-b">
                      ${balance.toFixed(2)}
                    </td>
                    <td className="p-3 text-sm border-b">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          balance === 0
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {balance === 0 ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td className="p-3 text-sm border-b">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-blue-800 transition-colors text-xs sm:text-sm"
                        onClick={() => handleEmail(lead.email)}
                      >
                        Email
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No organization leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4 p-2">
          {leads.length > 0 ? (
            leads.map((lead) => {
              const { total, balance } = getFinanceData(lead);
              return (
                <div key={lead._id} className="bg-white p-4 rounded-lg shadow">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Organization</p>
                      <p className="text-sm font-medium">{lead.organization}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Project</p>
                      <p className="text-sm font-medium">{lead.leadName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-medium">${total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Balance</p>
                      <p className="text-sm font-medium">
                        ${balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        balance === 0
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {balance === 0 ? "Completed" : "Pending"}
                    </span>
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-800 transition-colors text-xs"
                      onClick={() => handleEmail(lead.email)}
                    >
                      Email
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-500">
              No organization leads found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationsInCards;

import React, { useEffect, useState } from "react";
import axios from "axios";

const TopDeals = () => {
  const [topDeals, setTopDeals] = useState([]);
  const [dealsStats, setDealsStats] = useState({
    totalDeals: 0,
    contactedDeals: 0,
    qualifiedDeals: 0,
    proposalsAccepted: 0,
  });
  const [savedQuotations, setSavedQuotations] = useState([]);

  useEffect(() => {
    const fetchTopDeals = async () => {
      try {
        const response = await axios.get(
          "https://crm-brown-gamma.vercel.app/api/dealmanagement"
        ); // Update with your deployed backend URL
        setTopDeals(response.data);
      } catch (error) {
        console.error("Error fetching top deals:", error);
      }
    };

    const fetchDealsStats = async () => {
      try {
        // Fetch deals from dealmanagement API
        const dealsResponse = await axios.get(
          "https://crm-brown-gamma.vercel.app/api/dealmanagement"
        ); // Replace with your backend URL
        const deals = dealsResponse.data;

        // Exclude deals with stage 'Proposal' from the total count
        const filteredDeals = deals.filter((deal) => deal.stage !== "Proposal");

        // Calculate statistics based on the filtered deals
        const contactedDeals = filteredDeals.filter(
          (deal) => deal.stage === "Contacted"
        ).length;
        const qualifiedDeals = filteredDeals.filter(
          (deal) => deal.stage === "Qualified"
        ).length;

        // Fetch all the leads from the newquotations API
        const quotationsResponse = await axios.get(
          "https://crm-brown-gamma.vercel.app/api/newquotations"
        ); // Replace with your quotations API URL
        const quotations = quotationsResponse.data;

        // Calculate total deals by combining filtered deals from 'dealmanagement' and all leads from 'newquotations'
        const totalDeals = filteredDeals.length + quotations.length;

        // Count all the leads present in the quotations data
        const proposalsAccepted = quotations.length; // All leads in the quotations count as "proposals accepted"

        setDealsStats({
          totalDeals,
          contactedDeals,
          qualifiedDeals,
          proposalsAccepted,
        });
      } catch (error) {
        console.error("Error fetching deals statistics:", error);
      }
    };

    const fetchSavedQuotations = async () => {
      try {
        const response = await axios.get(
          "https://crm-brown-gamma.vercel.app/api/newquotations"
        ); // Replace with your quotations API URL
        setSavedQuotations(response.data);
      } catch (error) {
        console.error("Error fetching saved quotations:", error);
      }
    };

    fetchTopDeals();
    fetchDealsStats();
    fetchSavedQuotations();
  }, []);

  return (
    <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
      {/* Deals Statistics Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-[400px] overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
          Deals Statistics
        </h3>
        <div className="overflow-y-auto">
          <table className="w-full min-w-[200px] border-collapse border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                  Category
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  Total Deals
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  {dealsStats.totalDeals}
                </td>
              </tr>
              <tr className="dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  Contacted Deals
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  {dealsStats.contactedDeals}
                </td>
              </tr>
              <tr className="dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  Qualified Deals
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  {dealsStats.qualifiedDeals}
                </td>
              </tr>
              <tr className="dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  Proposals Accepted
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  {dealsStats.proposalsAccepted}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Quotations Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
          Saved Quotations
        </h3>
        {savedQuotations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No saved quotations available
          </p>
        ) : (
          <div className="max-h-[200px] overflow-y-auto">
            <table className="w-full min-w-[200px] border-collapse border border-gray-200 dark:border-gray-700">
              <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                    Client Name
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {savedQuotations.map((quotation, index) => (
                  <tr
                    key={index}
                    className="dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                      {quotation.clientName}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                      ₹{quotation.Totalamount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopDeals;

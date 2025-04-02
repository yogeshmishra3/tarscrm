import React, { useState, useEffect } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import { useLocation, useNavigate } from "react-router-dom";

// PDF Styles remain unchanged
const styles = StyleSheet.create({
  // ... your existing PDF styles
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  companyInfo: {
    textAlign: "right",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: "#0047AB",
    fontWeight: "bold",
  },
  details: {
    marginBottom: 20,
  },
  clientInfo: {
    marginBottom: 10,
  },
  table: {
    display: "flex",
    width: "100%",
    borderWidth: 1,
    borderColor: "#0047AB",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    padding: 5,
  },
  tableHeader: {
    fontWeight: "bold",
    color: "#0047AB",
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 10,
    color: "#555",
  },
  section: {
    margin: 10,
    fontSize: 12,
  },
  bulletPoint: {
    fontSize: 12,
    marginBottom: 5,
  },
  boldText: {
    fontFamily: "Helvetica-Bold",
  },

  Introtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 5,
  },
  text: { marginBottom: 5 },

  tableCell: {
    flex: 1,
    textAlign: "left",
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 4,
  },
  ptableCell: {
    flex: 1,
    textAlign: "center",
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 4,
  },

  hrline: { marginBottom: 25 },
  shrline: { marginBottom: 70 },
  subtext: {
    width: 515,
    display: "flex",
    textAlign: "justify",
    fontSize: 13,
    marginBottom: 20,
  },
  subbtext: { marginBottom: "5" },
});

// PDF Document Component remains unchanged
// KEY FIX: The PDF document ONLY receives filtered data without any event handlers
const QuotationDocument = ({
  data,
  details,
  scopeOfWork,
  pricing,
  totalAmount,
  projectTimeline,
  paymentTerms,
  totalDays,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Quotation for Digital Marketing</Text>
      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Quotation Details</Text>
        <Text>
          <Text style={styles.boldText}>From:</Text>
          <Text> TARS TECHNOLOGIES</Text>
        </Text>
        <Text>
          <Text style={styles.boldText}>To:</Text>
          <Text> {data.clientName}</Text>
        </Text>
        <Text>
          <Text style={styles.boldText}>Company Name:</Text>
          <Text> {data.dealName}</Text>
        </Text>
        <Text>
          <Text style={styles.boldText}>Date:</Text>
          <Text>
            {" "}
            {data.date ? new Date(data.date).toLocaleDateString() : "N/A"}
          </Text>
        </Text>
        <Text>
          <Text style={styles.boldText}>Subject:</Text>
          <Text> Proposal for Digital Marketing</Text>
        </Text>
      </View>

      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Introduction</Text>
        <Text style={styles.subtext}>
          Our digital marketing services with a focus on Search Engine
          Optimization (SEO) are designed to enhance online visibility and drive
          organic traffic to your website.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>SEO Audit</Text>
        <Text style={styles.subtext}>
          {" "}
          We conduct a Comprehensive SEO Services including keyword research,
          on-page SEO, technical SEO, content creation, and monthly performance
          report. audit of your website to assess its current performance,
          identify strengths, weaknesses, and opportunities for improvement.
        </Text>
        <Text style={styles.subbtext}>
          Key areas evaluated include website structure, metadata, keyword
          usage, backlink profile, site speed, and mobile-friendliness.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Keyword Research</Text>
        <Text style={styles.subtext}>
          Utilizing advanced keyword research tools and techniques, we identify
          relevant keywords and phrases with high search volume and low
          competition.
        </Text>
        <Text style={styles.subbtext}>
          Keywords are strategically incorporated into website content, meta
          tags, headers, and URLs to improve search engine visibility.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>On-Page Optimization</Text>
        <Text style={styles.subtext}>
          We optimize on-page elements such as title tags, meta descriptions,
          headings, and image alt attributes to align with targeted keywords and
          improve search engine crawlability.
        </Text>
        <Text style={styles.subbtext}>
          Content optimization involves creating high-quality, engaging content
          that resonates with your target audience while incorporating relevant
          keywords naturally.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Off-Page Optimization</Text>
        <Text style={styles.subtext}>
          Off-page optimization strategies focus on building high-quality
          backlinks from authoritative websites to improve domain authority and
          increase search engine rankings.
        </Text>
        <Text style={styles.subbtext}>
          We employ ethical link-building tactics such as guest blogging,
          influencer outreach, and social media promotion to enhance your
          website's credibility and visibility.
        </Text>
      </View>

      <Text style={styles.shrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Services</Text>
      </View>

      {/* Dynamically Render Bullet Points */}
      {scopeOfWork
        .filter((item) => item.title.trim() !== "")
        .map((item, index) => (
          <View key={index} style={{ flexDirection: "row", marginBottom: 5 }}>
            <Text style={{ marginRight: 5 }}>•</Text>
            <Text>
              <Text style={styles.boldText}>{item.title}</Text>
            </Text>
          </View>
        ))}

      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Pricing & Packages</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Package</Text>
            <Text style={styles.tableHeader}>Service Type</Text>
            <Text style={styles.tableHeader}>Frequency</Text>
            <Text style={styles.tableHeader}>PRICING per Month in ₹</Text>
          </View>
          {pricing.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{item.service}</Text>
              <Text style={styles.tableCell}>{item.servicetype}</Text>
              <Text style={styles.tableCell}>{item.frequency}</Text>
              <Text style={styles.ptableCell}>{item.price}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text>Total Estimated Cost: {totalAmount} INR</Text>
      </View>

      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <Text style={styles.title}>Payment Terms</Text>
      {paymentTerms
        .filter((term) => term.trim() !== "")
        .map((term, index) => (
          <Text key={index} style={styles.bulletPoint}>
            • {term}
          </Text>
        ))}

      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Acceptance & Confirmation</Text>
        <Text>
          We look forward to working with you on this project. Kindly confirm
          your acceptance of this quotation by signing below.
        </Text>
      </View>

      <View style={styles.section}>
        <Text>Client Signature: _______________</Text>
        <Text>Date: _______________</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.title}>Contact Information</Text>
        <Text>
          <Text style={styles.boldText}>Phone:</Text>
          <Text> +91 XXXXX XXXXX</Text>
        </Text>
        <Text>
          <Text style={styles.boldText}>Email:</Text>
          <Text> info@tarstechnologies.co</Text>
        </Text>
        <Text>
          <Text style={styles.boldText}>Website:</Text>
          <Text> www.tarstechnologies.com</Text>
        </Text>
      </View>
    </Page>
  </Document>
);

// Quotation Generator Component with Tailwind CSS
const DigitalMQ = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { clientName, dealName } = state?.dealData || {};
  // ... existing state declarations
  const [isSaving, setIsSaving] = useState(false);

  // Your existing state declarations
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    clientName: clientName || "",
    dealName: dealName || "",
  });

  const [currentItem, setCurrentItem] = useState({
    description: "",
    amount: "",
  });
  const [savedQuotations, setSavedQuotations] = useState([]);
  const [details, setDetails] = useState({
    date: "",
    clientName: "",
    companyName: "",
    project: "",
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [projectTimeline, setProjectTimeline] = useState([
    { phase: "UI/UX Design & Approval:", duration: "7 Days" },
    { phase: "Development & Testing:", duration: "20-25 Days" },
    { phase: "Final Review & Deployment:", duration: "5 Days" },
  ]);

  // Payment Terms State
  const [paymentTerms, setPaymentTerms] = useState([
    "Paid ads at Meta or Google will be at actual and separate from the above amount.",
    "Any extra service from above will incur extra charges.",
    "Services would start within a couple of days from receiving of 50% advance payment.",
  ]);

  const [pricing, setPricing] = useState([
    {
      service: "Silver",
      servicetype:
        "Basic SEO Services including keyword research, on-page SEO, and monthly performance report.",
      frequency: "Monthly performance report and optimization",
      price: "19,999/-",
    },
    {
      service: "Gold",
      servicetype:
        "Comprehensive SEO Services including keyword research, on-page SEO, technical SEO, content creation, and monthly performance report.",
      frequency: "Weekly performance updates and content optimization",
      price: "34,999/-",
    },
    {
      service: "Platinum",
      servicetype:
        "Advanced SEO Services including keyword research, on-page SEO, technical SEO, content creation, link building, local SEO, and monthly performance report.",
      frequency:
        "Weekly performance updates, daily content optimization, and monthly strategy review",
      price: "49,999/-",
    },
  ]);

  const [scopeOfWork, setScopeOfWork] = useState([
    { title: "" },
    { title: "" },
    { title: "" },
    { title: "" },
  ]);

  // Handler functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddItem = () => {
    if (currentItem.description && currentItem.amount >= 1) {
      setFormData((prevData) => ({
        ...prevData,
        items: [...prevData.items, currentItem],
      }));
      setCurrentItem({ description: "", amount: "" });
    } else {
      alert("Please enter valid item details.");
    }
  };

  // Save quotation function
  const handleSaveQuotation = async () => {
    // Disable the button and show saving state
    setIsSaving(true);
    calculateTotal();
    try {
      const response = await fetch(
        "https://crm-brown-gamma.vercel.app/api/newquotations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientName: formData.clientName,
            dealName: formData.dealName,
            Totalamount: totalAmount,
            date: formData.date
              ? formData.date.split("T")[0]
              : new Date().toISOString().split("T")[0],
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save quotation");

      const savedQuotation = await response.json();
      setSavedQuotations((prevQuotations) => [
        ...prevQuotations,
        savedQuotation,
      ]);
      alert("Quotation saved successfully!");

      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        clientName: clientName || "",
        dealName: dealName || "",
        Totalamount: "",
      });
    } catch (error) {
      console.error("Error saving quotation:", error);
      alert("Error saving quotation: " + error.message);
    } finally {
      // Re-enable the button
      setIsSaving(false);
    }
  };

  const calculateTotalDays = () => {
    let minTotal = 0,
      maxTotal = 0;

    projectTimeline.forEach(({ duration }) => {
      const matches = duration.match(/\d+/g);
      if (matches) {
        const [min, max] = matches.map(Number);
        minTotal += min;
        maxTotal += max || min;
      }
    });

    return `${minTotal}-${maxTotal} Days`;
  };

  // FIXED: Payment term handlers
  const handlePaymentChange = (index, value) => {
    setPaymentTerms((prevTerms) => {
      const updatedTerms = [...prevTerms];
      updatedTerms[index] = value;
      return updatedTerms;
    });
  };

  // FIXED: Timeline handlers
  const handleTimelineChange = (index, field, value) => {
    const updatedTimeline = [...projectTimeline];
    updatedTimeline[index][field] = value;
    setProjectTimeline(updatedTimeline);
  };

  const addTimelineRow = () => {
    setProjectTimeline([...projectTimeline, { phase: "", duration: "" }]);
  };

  // Calculate total amount
  const calculateTotal = () => {
    const total = pricing.reduce((sum, item) => {
      const numericPrice = parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
      return sum + numericPrice;
    }, 0);
    setTotalAmount(total);
  };

  // FIXED: Add payment term function
  const addPaymentTerm = () => {
    setPaymentTerms([...paymentTerms, ""]);
  };

  // FIXED: Table change handler
  const handleTableChange = (index, field, value) => {
    const updatedPricing = [...pricing];
    updatedPricing[index][field] = value;
    setPricing(updatedPricing);
    calculateTotal();
  };

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  // FIXED: Scope handlers
  const addScopeRow = () => {
    setScopeOfWork([...scopeOfWork, { title: "" }]);
  };

  const addRow = () => {
    setPricing([
      ...pricing,
      { service: "", servicetype: "", frequency: "", price: "" },
    ]);
  };

  // FIXED: Scope change handler
  const handleScopeChange = (index, field, value) => {
    const updatedScope = [...scopeOfWork];
    updatedScope[index][field] = value;
    setScopeOfWork(updatedScope);
  };

  // FIXED: Remove row handlers - these were causing the issues
  const removeScopeRow = (index) => {
    setScopeOfWork((prevScope) => {
      const updatedScope = [...prevScope];
      updatedScope.splice(index, 1);
      return updatedScope;
    });
  };

  const removeTimelineRow = (index) => {
    setProjectTimeline((prevTimeline) => {
      const updatedTimeline = [...prevTimeline];
      updatedTimeline.splice(index, 1);
      return updatedTimeline;
    });
  };

  const removePaymentTerm = (index) => {
    console.log("Removing Payment Term at Index:", index);
    setPaymentTerms((prevTerms) => prevTerms.filter((_, i) => i !== index));
  };

  const removePricingRow = (index) => {
    setPricing((prevPricing) => prevPricing.filter((_, i) => i !== index));
  };

  // Calculate total on pricing change
  useEffect(() => {
    calculateTotal();
  }, [pricing]);

  // Fetch saved quotations
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await fetch(
          "https://crm-brown-gamma.vercel.app/api/newquotations"
        );
        const data = await response.json();
        setSavedQuotations(data);
      } catch (error) {
        console.error("Error fetching quotations:", error);
      }
    };
    fetchQuotations();
  }, []);

  // Render component
  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold text-indigo-800 mb-6">
          Quotation for Digital Marketing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date:
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Client Name:
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Company Name:
            </label>
            <input
              type="text"
              name="dealName"
              value={formData.dealName}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Scope of Work Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">
            Scope of Work
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scopeOfWork.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) =>
                          handleScopeChange(index, "title", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeScopeRow(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addScopeRow}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Add Row
          </button>
        </div>

        {/* Payment Terms Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">
            Payment Terms
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Terms
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentTerms.map((term, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={term}
                        onChange={(e) =>
                          handlePaymentChange(index, e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removePaymentTerm(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addPaymentTerm}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Add Row
          </button>
        </div>

        {/* Quotation & Pricing Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">
            Quotation & Pricing
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Package
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Service Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Frequency
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    PRICING per Month in ₹
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pricing.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.service}
                        onChange={(e) =>
                          handleTableChange(index, "service", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.servicetype}
                        onChange={(e) =>
                          handleTableChange(
                            index,
                            "servicetype",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.frequency}
                        onChange={(e) =>
                          handleTableChange(index, "frequency", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.price}
                        onChange={(e) =>
                          handleTableChange(index, "price", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removePricingRow(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={addRow}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Add Row
            </button>

            <div className="text-xl font-bold text-indigo-800">
              Total: ₹{totalAmount}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleSaveQuotation}
            disabled={isSaving}
            className={`px-6 py-3 text-white font-medium rounded-md transition-colors flex items-center ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-700 hover:bg-indigo-800"
            }`}
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  ></path>
                </svg>
                Save Quotation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Saved Quotations Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">
          Saved Quotations
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Deal Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {savedQuotations.map((quotation, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {quotation.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {quotation.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {quotation.dealName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <PDFDownloadLink
                      document={
                        <QuotationDocument
                          data={quotation}
                          details={details}
                          scopeOfWork={scopeOfWork}
                          pricing={pricing}
                          totalAmount={totalAmount}
                          projectTimeline={projectTimeline}
                          paymentTerms={paymentTerms}
                          totalDays={calculateTotalDays()}
                        />
                      }
                      fileName={`quotation_${quotation.quotationNo}.pdf`}
                    >
                      {({ loading }) =>
                        loading ? "Loading PDF..." : "Download PDF"
                      }
                    </PDFDownloadLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DigitalMQ;

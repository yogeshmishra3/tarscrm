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
      <Text style={styles.header}>
        Quotation for Dynamic Website Development
      </Text>
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
          <Text> Proposal for Dynamic Website Development</Text>
        </Text>
      </View>

      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Introduction</Text>
        <Text style={styles.subtext}>
          TARS TECHNOLOGIES specializes in developing dynamic websites that are
          interactive, scalable, and user-friendly. Our websites allow
          businesses to update content easily without technical knowledge.
        </Text>
      </View>

      <Text style={styles.shrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Scope of Work</Text>
      </View>

      {/* Dynamically Render Bullet Points */}
      {scopeOfWork.map((item, index) => (
        <View key={index} style={{ flexDirection: "row", marginBottom: 5 }}>
          <Text style={{ marginRight: 5 }}>•</Text>
          <Text>
            <Text style={styles.boldText}>{item.title}: </Text>
            {item.description}
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
            <Text style={styles.tableHeader}>Features</Text>
            <Text style={styles.tableHeader}>Price (INR/USD)</Text>
          </View>
          {pricing.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{item.service}</Text>
              <Text style={styles.tableCell}>{item.description}</Text>
              <Text style={styles.ptableCell}>{item.price}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text>Total Estimated Cost: {totalAmount} INR</Text>
        <Text>
          Note: Domain & Hosting charges are separate if not provided by the
          client.
        </Text>
      </View>

      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Project Timeline & Deliverables</Text>
        {projectTimeline.map((item, index) => (
          <Text key={index} style={styles.bulletPoint}>
            • {item.phase} - {item.duration}
          </Text>
        ))}
      </View>

      <Text>Estimated Total Duration: {totalDays} Days</Text>

      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <Text style={styles.title}>Payment Terms</Text>
      {paymentTerms.map((term, index) => (
        <Text key={index} style={styles.bulletPoint}>
          • {term}
        </Text>
      ))}

      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text>
          • The quoted price does not include domain and hosting charges.
        </Text>
        <Text>
          • Maximum 3 revisions are included in the package. Additional
          revisions may be chargeable.
        </Text>
        <Text>
          • Website content (text, images, logos) should be provided by the
          client.
        </Text>
      </View>

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
const DWQ = () => {
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
    { phase: "UI/UX Design & Approval:", duration: "5 Days" },
    { phase: "Development & Testing:", duration: "10-12 Days" },
    { phase: "Final Review & Deployment:", duration: "3 Days" },
  ]);

  // **New: Payment Terms State**
  const [paymentTerms, setPaymentTerms] = useState([
    "50% advance payment before project initiation.",
    "50% upon completion & client approval.",
  ]);

  const [pricing, setPricing] = useState([
    {
      service: "Basic",
      description: "5-7 Pages, CMS, Contact Form",
      price: "2000/-",
    },
    {
      service: "Standard",
      description: "10-15 Pages, Blog, SEO",
      price: "3100/-",
    },
    {
      service: "Premium",
      description: "15+ Pages, Advanced Features, Custom CMS",
      price: "2500/-",
    },
  ]);

  const [scopeOfWork, setScopeOfWork] = useState([
    { title: "✅ Custom Design & Development" },
    { title: "✅ CMS Integration (WordPress / Custom CMS)" },
    { title: "✅ User Management System" },
    { title: "✅ Blog / News Section" },
    { title: "✅ Contact Forms & Live Chat Integration" },
    { title: "✅ SEO Optimization & Mobile Responsiveness" },
    { title: "✅ Admin Dashboard for Content Updates" },
    { title: "✅ Database Integration" },
    { title: "✅ Social Media Integration" },
  ]);

  // Your existing handler functions
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

  const handlePaymentChange = (index, value) => {
    const updatedTerms = [...paymentTerms];
    updatedTerms[index] = value;
    setPaymentTerms(updatedTerms);
  };

  const handleTimelineChange = (index, field, value) => {
    const updatedTimeline = [...projectTimeline];
    updatedTimeline[index][field] = value;
    setProjectTimeline(updatedTimeline);
  };

  const addTimelineRow = () => {
    setProjectTimeline([...projectTimeline, { phase: "", duration: "" }]);
  };

  const calculateTotal = () => {
    const total = pricing.reduce((sum, item) => {
      const numericPrice = parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
      return sum + numericPrice;
    }, 0);
    setTotalAmount(total);
  };

  const addPaymentTerm = () => {
    setPaymentTerms([...paymentTerms, ""]);
  };

  const handleTableChange = (index, field, value) => {
    const updatedPricing = [...pricing];
    updatedPricing[index][field] = value;
    setPricing(updatedPricing);
    calculateTotal();
  };

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const addScopeRow = () => {
    setScopeOfWork([...scopeOfWork, { title: "", description: "" }]);
  };

  const addRow = () => {
    setPricing([...pricing, { service: "", description: "", price: "" }]);
  };

  const handleScopeChange = (index, field, value) => {
    const updatedScope = [...scopeOfWork];
    updatedScope[index][field] = value;
    setScopeOfWork(updatedScope);
  };

  const removeScopeRow = (index) => {
    const updatedScope = [...scopeOfWork];
    updatedScope.splice(index, 1);
    setScopeOfWork(updatedScope);
  };

  const removeTimelineRow = (index) => {
    const updatedTimeline = [...projectTimeline];
    updatedTimeline.splice(index, 1);
    setProjectTimeline(updatedTimeline);
  };

  const removePaymentTerm = (index) => {
    const updatedTerms = [...paymentTerms];
    updatedTerms.splice(index, 1);
    setPaymentTerms(updatedTerms);
  };

  const removePricingRow = (index) => {
    const updatedPricing = [...pricing];
    updatedPricing.splice(index, 1);
    setPricing(updatedPricing);
    calculateTotal();
  };

  useEffect(() => {
    calculateTotal();
  }, [pricing]);

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

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-indigo-800 mb-6">
          Quotation for Dynamic Website Development
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
            onClick={(e) => {
              e.preventDefault();
              addScopeRow();
            }}
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

        {/* Project Timeline Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">
            Project Timeline
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Phase
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectTimeline.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.phase}
                        onChange={(e) =>
                          handleTimelineChange(index, "phase", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.duration}
                        onChange={(e) =>
                          handleTimelineChange(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeTimelineRow(index)}
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
            onClick={(e) => {
              e.preventDefault();
              addTimelineRow();
            }}
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
            onClick={(e) => {
              e.preventDefault();
              addPaymentTerm();
            }}
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
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Price (INR)
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
                        value={row.description}
                        onChange={(e) =>
                          handleTableChange(
                            index,
                            "description",
                            e.target.value
                          )
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
              onClick={(e) => {
                e.preventDefault();
                addRow();
              }}
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
    </>
  );
};

export default DWQ;

import React, { useState, useEffect } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { pdf } from "@react-pdf/renderer";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    marginBottom: 5,
  },
  section: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  Introtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 5,
  },
  text: {
    marginBottom: 5,
  },
  table: {
    display: "flex",
    width: "100%",
    borderWidth: 0.5,
    borderColor: "#000",
    marginBottom: 10,
    textAlign: "left",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.1,
    borderColor: "#000",
    borderWidth: 0.1,
  },
  tableHeader: {
    fontFamily: "Helvetica-Bold",
    flex: 1,
    textAlign: "center",
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 4,
  },
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
  footer: {
    textAlign: "left",
    fontSize: 10,
    marginTop: 20,
  },
  hrline: {
    marginBottom: 25,
  },
  shrline: {
    marginBottom: 70,
  },
  subtext: {
    width: 515,
    display: "flex",
    textAlign: "justify",
    fontSize: 13,
    marginBottom: 20,
  },
  subbtext: {
    marginBottom: "5",
  },
  boldText: {
    fontFamily: "Helvetica-Bold",
  },
});

// PDF Document Component
const QuotationDocument = ({
  data,
  scopeOfWork,
  pricing,
  totalAmount,
  projectTimeline,
  paymentTerms,
  totalDays,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>SMS Services Quotation</Text>
      <Text style={styles.text}>TARS TECHNOLOGIES</Text>
      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Quotation Details</Text>
        <Text>
          Date: {data.date ? new Date(data.date).toLocaleDateString() : "N/A"}
        </Text>
        <Text>Client Name: {data.clientName}</Text>
        <Text>Company Name: {data.dealName}</Text>
        <Text>Prepared By: TARS Technologies</Text>
        <Text>Contact Email: contact@tarstechnologies.com</Text>
        <Text>Website: https://tars.co.in/</Text>
      </View>

      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Introduction</Text>
        <Text style={styles.subtext}>
          At TARS Technologies, we believe in the power of innovation and the
          impact it can have on the digital landscape. Since our inception, our
          goal has been to create digital solutions that not only meet the needs
          of our clients but also exceed their expectations. We are passionate
          about helping businesses navigate the complexities of the digital
          world, and we are committed to delivering excellence in everything we
          do. Our journey has been one of growth, learning, and constant
          evolution, and We are incredibly proud of the team we have built and
          the milestones we have achieved. As we continue to expand our services
          and capabilities, our focus remains on driving success for our clients
          and making a meaningful difference in their digital presence.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Vision</Text>
        <Text style={styles.subtext}>
          Our vision is to be a global leader in innovative sustainable
          technology solutions, driving progress and transformation across
          industries. We aspire to create a future where technology seamlessly
          integrates into everyday life, empowering businesses and individuals
          to reach their full potential. By fostering a culture of continuous
          learning and excellence, we aim to inspire change, enhance
          connectivity, and contribute to a more sustainable, equitable, and
          connected world.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Mission</Text>
        <Text style={styles.subtext}>
          We at TARS strive hard to harness the power of technology to deliver
          sustainable solutions that contribute to the preservation of mankind
          and the planet. We are dedicated to partnering with clients who share
          our commitment to the betterment of the world. By pushing the
          boundaries of innovation, we aim to surprise, support, and empower
          humanity, providing every individual with technological companions
          that ease their lives in the physical world.
        </Text>
      </View>

      <Text style={styles.shrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Scope of Work</Text>
        <Text style={styles.subbtext}>
          TARS TECHNOLOGIES will provide reliable and efficient SMS services
          tailored to your business communication needs. The key features of the
          SMS service will include:
        </Text>
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
        <Text style={styles.title}>Quotation & Pricing</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Service</Text>
            <Text style={styles.tableHeader}>Description</Text>
            <Text style={styles.tableHeader}>Price (INR)</Text>
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
          Note: Final pricing may vary based on specific requirements.
        </Text>
      </View>

      <Text style={styles.hrline}>
        _____________________________________________________________________________
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Project Timeline</Text>
        {projectTimeline.map((item, index) => (
          <Text key={index} style={styles.bulletPoint}>
            • {item.phase} - {item.duration}
          </Text>
        ))}
      </View>

      <Text>Estimated Total Duration: {totalDays}</Text>

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
        <Text style={styles.title}>Why Choose TARS TECHNOLOGIES?</Text>
        <Text>• Reliable and secure SMS delivery.</Text>
        <Text>• Scalable solutions for businesses of all sizes.</Text>
        <Text>• Competitive pricing with high-quality service.</Text>
        <Text>• 24/7 customer support and assistance.</Text>
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
const SmsQuotation = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { clientName, dealName } = state?.dealData || {};
  // ... existing state declarations
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    clientName: clientName || "",
    dealName: dealName || "",
  });

  const [savedQuotations, setSavedQuotations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [projectTimeline, setProjectTimeline] = useState([
    { phase: "Requirement Gathering & Planning", duration: "1-2 Days" },
    { phase: "System Setup & Configuration", duration: "2-3 Days" },
    { phase: "Testing & Review", duration: "1 Day" },
    { phase: "Final Deployment", duration: "1 Day" },
  ]);
  const [paymentTerms, setPaymentTerms] = useState([
    "50% Advance Payment – To initiate the project.",
    "20% After System Configuration – Upon completion of setup.",
    "30% Upon Completion – Before final deployment.",
  ]);
  const [pricing, setPricing] = useState([
    {
      service: "Bulk SMS (Transactional)",
      description: "Secure and instant message delivery",
      price: "2000/-",
    },
    {
      service: "Bulk SMS (Promotional)",
      description: "Marketing and promotional messaging",
      price: "3100/-",
    },
    {
      service: "API Integration (Optional)",
      description: "Seamless API setup for automation",
      price: "2500/-",
    },
    {
      service: "Sender ID Customization",
      description: "Custom sender name for branding",
      price: "6000/-",
    },
  ]);
  const [scopeOfWork, setScopeOfWork] = useState([
    {
      title: "Bulk SMS Service",
      description: "Send bulk SMS to customers and clients instantly.",
    },
    {
      title: "Transactional SMS",
      description: "Send important alerts, OTPs, and notifications.",
    },
    {
      title: "Promotional SMS",
      description:
        "Reach out to customers with marketing and promotional messages.",
    },
    {
      title: "API Integration",
      description:
        "Seamless integration with your existing software and applications.",
    },
    {
      title: "Delivery Reports",
      description: "Real-time tracking and reporting of message delivery.",
    },
    {
      title: "Sender ID Customization",
      description: "Custom sender name for brand recognition.",
    },
    {
      title: "DND & Non-DND Support",
      description: "Smart routing to ensure maximum delivery.",
    },
    {
      title: "Multi-Language Support",
      description: "Send SMS in multiple languages.",
    },
  ]);

  // Function to upload PDF to Cloudinary
  const uploadPDFToCloudinary = async (pdfBlob) => {
    try {
      const formData = new FormData();
      formData.append("file", pdfBlob);
      formData.append("upload_preset", "tars_quotations");
      formData.append("folder", "quotations");

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/ddvfsfsas/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading PDF to Cloudinary:", error);
      throw error;
    }
  };

  // Function to generate PDF blob
  const generatePDFBlob = async () => {
    const pdfDocument = (
      <QuotationDocument
        data={{
          ...formData,
          date: formData.date
            ? formData.date.split("T")[0]
            : new Date().toISOString().split("T")[0],
        }}
        scopeOfWork={scopeOfWork}
        pricing={pricing}
        totalAmount={totalAmount}
        projectTimeline={projectTimeline}
        paymentTerms={paymentTerms}
        totalDays={calculateTotalDays()}
      />
    );

    const pdfBlob = await pdf(pdfDocument).toBlob();
    return pdfBlob;
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

  const handleSaveQuotation = async () => {
    try {
      // Disable the button and show saving state
      setIsSaving(true);

      // Calculate total amount
      calculateTotal();

      // Generate PDF blob
      const pdfBlob = await generatePDFBlob();

      // Create a File object from the Blob
      const pdfFile = new File(
        [pdfBlob],
        `quotation_${formData.clientName}_${Date.now()}.pdf`,
        {
          type: "application/pdf",
        }
      );

      // Upload PDF to Cloudinary
      const cloudinaryUrl = await uploadPDFToCloudinary(pdfFile);

      // Save quotation to backend with Cloudinary URL
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
            pdfUrl: cloudinaryUrl,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save quotation");

      const savedQuotation = await response.json();
      setSavedQuotations((prevQuotations) => [
        ...prevQuotations,
        savedQuotation,
      ]);

      alert("Quotation saved successfully with PDF!");

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
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-indigo-800 mb-6">
          SMS Quotation Generator
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Description
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
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) =>
                          handleScopeChange(
                            index,
                            "description",
                            e.target.value
                          )
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
                  Amount
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ₹{quotation.Totalamount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <PDFDownloadLink
                      document={
                        <QuotationDocument
                          data={quotation}
                          scopeOfWork={scopeOfWork}
                          pricing={pricing}
                          totalAmount={quotation.Totalamount}
                          projectTimeline={projectTimeline}
                          paymentTerms={paymentTerms}
                          totalDays={calculateTotalDays()}
                        />
                      }
                      fileName={`quotation_${quotation.clientName}_${quotation.date}.pdf`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {({ loading }) =>
                        loading ? "Loading..." : "Download PDF"
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

export default SmsQuotation;

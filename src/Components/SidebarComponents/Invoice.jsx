import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const InvoiceForm = () => {
  const API_BASE_URL = "https://crm-brown-gamma.vercel.app/api";

  const [formData, setFormData] = useState({
    companyName: "TARS TECH",
    streetAddress: "123 Tech Avenue",
    cityStateZip: "NAGPUR, 440010",
    phone: "9111833838",
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    billTo: "",
    customerId: "",
    terms: "Net 30",
    items: [{ description: "", quantity: 0, unitPrice: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 18,
    tax: 0,
    total: 0,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [clients, setClients] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [previousInvoices, setPreviousInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("createInvoice");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clientDetail`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setClients(data.clients);
      } else {
        throw new Error(data.message || "Failed to fetch clients");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setErrorMessage(`Failed to load clients: ${error.message}`);
    }
  };

  const fetchPreviousInvoices = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const invoicesArray = Array.isArray(data)
        ? data
        : data && Array.isArray(data.invoices)
        ? data.invoices
        : [];
      setPreviousInvoices(invoicesArray);
      setFilteredInvoices(invoicesArray);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setErrorMessage(`Failed to load invoices: ${error.message}`);
      setPreviousInvoices([]);
      setFilteredInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextInvoiceNumber = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/latest-number`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success && data.latestInvoiceNumber) {
        const latestNumberMatch = data.latestInvoiceNumber.match(/TTINV-(\d+)/);
        if (latestNumberMatch && latestNumberMatch[1]) {
          return `TTINV-${parseInt(latestNumberMatch[1], 10) + 1}`;
        }
      }
      return "TTINV-25001";
    } catch (error) {
      console.error("Error fetching latest invoice number:", error);
      return "TTINV-25001";
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const invoiceNumber = await getNextInvoiceNumber();
      setFormData((prev) => ({ ...prev, invoiceNumber }));
      await fetchClients();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (activeTab === "previousInvoices") {
      fetchPreviousInvoices();
    }
  }, [activeTab]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilteredInvoices(
      query.trim() === ""
        ? previousInvoices
        : previousInvoices.filter((invoice) =>
            invoice.invoiceNumber.toLowerCase().includes(query.toLowerCase())
          )
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "billTo") {
      if (value.trim() === "") {
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        const filtered = clients.filter(
          (client) =>
            client.name.toLowerCase().includes(value.toLowerCase()) ||
            (client.companyname &&
              client.companyname.toLowerCase().includes(value.toLowerCase()))
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [name]:
        name === "quantity" || name === "unitPrice"
          ? parseFloat(value) || 0
          : value,
    };
    newItems[index].amount =
      newItems[index].quantity * newItems[index].unitPrice;
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (formData.taxRate / 100);
    const total = subtotal + tax;
    setFormData((prev) => ({
      ...prev,
      items: newItems,
      subtotal,
      tax,
      total,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", quantity: 0, unitPrice: 0, amount: 0 },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (formData.taxRate / 100);
    const total = subtotal + tax;
    setFormData((prev) => ({
      ...prev,
      items: newItems,
      subtotal,
      tax,
      total,
    }));
  };

  const handleTaxRateChange = (e) => {
    const taxRate = parseFloat(e.target.value) || 0;
    const tax = formData.subtotal * (taxRate / 100);
    const total = formData.subtotal + tax;
    setFormData((prev) => ({
      ...prev,
      taxRate,
      tax,
      total,
    }));
  };

  const handleSelectClient = (client) => {
    setFormData((prev) => ({
      ...prev,
      billTo: client.companyname || client.name,
      customerId: client.clientId,
      contactName: client.name,
      contactPhone: client.phone,
      contactEmail: client.email,
    }));
    setShowSuggestions(false);
  };

  const validateForm = () => {
    if (!formData.billTo.trim()) {
      alert("Please enter a client name in the 'Bill To' field");
      return false;
    }
    for (const item of formData.items) {
      if (!item.description.trim()) {
        alert("Please enter a description for all items");
        return false;
      }
      if (item.quantity <= 0) {
        alert("Please enter a valid quantity (greater than 0) for all items");
        return false;
      }
      if (item.unitPrice < 0) {
        alert("Please enter a valid unit price for all items");
        return false;
      }
    }
    return true;
  };

  const generatePDF = async () => {
    if (!validateForm()) return;
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica");
      doc.setFontSize(20);
      doc.text(formData.companyName, 105, 20, { align: "center" });
      doc.setFontSize(10);
      doc.text(formData.streetAddress, 105, 25, { align: "center" });
      doc.text(formData.cityStateZip, 105, 30, { align: "center" });
      doc.text(`Phone: ${formData.phone}`, 105, 35, { align: "center" });
      doc.setFontSize(16);
      doc.text("INVOICE", 105, 45, { align: "center" });
      doc.setFontSize(10);
      doc.text(`Invoice Number: ${formData.invoiceNumber}`, 15, 60);
      doc.text(`Date: ${formData.date}`, 15, 65);
      doc.text(`Terms: ${formData.terms}`, 15, 70);
      doc.setFontSize(12);
      doc.text("Bill To:", 15, 85);
      doc.setFontSize(10);
      doc.text(formData.billTo || "N/A", 15, 90);
      doc.text(`Customer ID: ${formData.customerId || "N/A"}`, 15, 95);
      doc.text(`Contact: ${formData.contactName || "N/A"}`, 15, 100);
      doc.text(`Phone: ${formData.contactPhone || "N/A"}`, 15, 105);
      doc.text(`Email: ${formData.contactEmail || "N/A"}`, 15, 110);
      const tableColumn = ["Description", "Quantity", "Unit Price", "Amount"];
      const tableRows = formData.items.map((item) => [
        item.description || "Item",
        item.quantity || 0,
        `Rs.${(item.unitPrice || 0).toFixed(2)}`,
        `Rs.${(item.amount || 0).toFixed(2)}`,
      ]);
      autoTable(doc, {
        startY: 120,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        styles: { font: "helvetica", fontSize: 10 },
        didDrawPage: function (data) {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Page ${
              doc.internal.getCurrentPageInfo().pageNumber
            } of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
          );
        },
      });
      let finalY = doc.lastAutoTable.finalY + 10;
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }
      doc.text(`Subtotal: Rs.${formData.subtotal.toFixed(2)}`, 140, finalY);
      doc.text(
        `GST (${formData.taxRate}%): Rs.${formData.tax.toFixed(2)}`,
        140,
        finalY + 5
      );
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: Rs.${formData.total.toFixed(2)}`, 140, finalY + 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setFontSize(8);
      const pageHeight = doc.internal.pageSize.height;
      doc.text("Thank you for your business!", 105, pageHeight - 20, {
        align: "center",
      });
      const fileName = `Invoice_${formData.invoiceNumber.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}.pdf`;
      doc.save(fileName);
      await saveInvoiceToBackend();
      if (activeTab === "previousInvoices") {
        fetchPreviousInvoices();
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveInvoiceToBackend = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          invoiceNumber: formData.invoiceNumber,
          billTo: formData.billTo,
          contactPhone: formData.contactPhone,
          date: formData.date,
          contactEmail: formData.contactEmail,
          customerId: formData.customerId,
          contactName: formData.contactName,
          items: formData.items,
          subtotal: formData.subtotal,
          taxRate: formData.taxRate,
          tax: formData.tax,
          total: formData.total,
        }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error saving invoice:", error);
      throw error;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const loadInvoice = (invoice) => {
    setFormData({
      ...formData,
      invoiceNumber: invoice.invoiceNumber,
      date: new Date(invoice.date).toISOString().split("T")[0],
      billTo: invoice.billTo,
      customerId: invoice.customerId || "",
      contactName: invoice.contactName || "",
      contactPhone: invoice.contactPhone || "",
      contactEmail: invoice.contactEmail || "",
      items: Array.isArray(invoice.items)
        ? invoice.items
        : [{ description: "", quantity: 0, unitPrice: 0, amount: 0 }],
      subtotal: invoice.subtotal || 0,
      taxRate: invoice.taxRate || 18,
      tax: invoice.tax || 0,
      total: invoice.total || 0,
    });
    setActiveTab("createInvoice");
  };

  const deleteInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      fetchPreviousInvoices();
      alert("Invoice deleted successfully!");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert(`Error deleting invoice: ${error.message}`);
    }
  };

  const regeneratePDF = (invoice) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica");
      doc.setFontSize(20);
      doc.text(formData.companyName, 105, 20, { align: "center" });
      doc.setFontSize(10);
      doc.text(formData.streetAddress, 105, 25, { align: "center" });
      doc.text(formData.cityStateZip, 105, 30, { align: "center" });
      doc.text(`Phone: ${formData.phone}`, 105, 35, { align: "center" });
      doc.setFontSize(16);
      doc.text("INVOICE", 105, 45, { align: "center" });
      doc.setFontSize(10);
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 15, 60);
      doc.text(`Date: ${formatDate(invoice.date)}`, 15, 65);
      doc.text(`Terms: ${formData.terms}`, 15, 70);
      doc.setFontSize(12);
      doc.text("Bill To:", 15, 85);
      doc.setFontSize(10);
      doc.text(invoice.billTo || "N/A", 15, 90);
      doc.text(`Customer ID: ${invoice.customerId || "N/A"}`, 15, 95);
      doc.text(`Contact: ${invoice.contactName || "N/A"}`, 15, 100);
      doc.text(`Phone: ${invoice.contactPhone || "N/A"}`, 15, 105);
      doc.text(`Email: ${invoice.contactEmail || "N/A"}`, 15, 110);
      const tableColumn = ["Description", "Quantity", "Unit Price", "Amount"];
      const tableRows = invoice.items.map((item) => [
        item.description || "Item",
        item.quantity || 0,
        `Rs.${(item.unitPrice || 0).toFixed(2)}`,
        `Rs.${(item.amount || 0).toFixed(2)}`,
      ]);
      autoTable(doc, {
        startY: 120,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        styles: { font: "helvetica", fontSize: 10 },
        didDrawPage: function (data) {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Page ${
              doc.internal.getCurrentPageInfo().pageNumber
            } of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
          );
        },
      });
      let finalY = doc.lastAutoTable.finalY + 10;
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }
      doc.text(`Subtotal: Rs.${invoice.subtotal.toFixed(2)}`, 140, finalY);
      doc.text(
        `GST (${invoice.taxRate}%): Rs.${invoice.tax.toFixed(2)}`,
        140,
        finalY + 5
      );
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: Rs.${invoice.total.toFixed(2)}`, 140, finalY + 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setFontSize(8);
      const pageHeight = doc.internal.pageSize.height;
      doc.text("Thank you for your business!", 105, pageHeight - 20, {
        align: "center",
      });
      const fileName = `Invoice_${invoice.invoiceNumber.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generatePDF();
  };

  const createNewInvoice = async () => {
    const invoiceNumber = await getNextInvoiceNumber();
    setFormData({
      ...formData,
      invoiceNumber,
      billTo: "",
      customerId: "",
      items: [{ description: "", quantity: 0, unitPrice: 0, amount: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
      contactName: "",
      contactPhone: "",
      contactEmail: "",
    });
    setActiveTab("createInvoice");
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Invoice Management System
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("createInvoice")}
              className={`px-4 py-2 rounded font-bold ${
                activeTab === "createInvoice"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Create Invoice
            </button>
            <button
              onClick={() => setActiveTab("previousInvoices")}
              className={`px-4 py-2 rounded font-bold ${
                activeTab === "previousInvoices"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Previous Invoices
            </button>
          </div>
        </div>

        {activeTab === "createInvoice" ? (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Invoice Generator
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                    Invoice Number:
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    readOnly
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-600"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                    Bill To: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="billTo"
                    value={formData.billTo}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Client/Company Name"
                    required
                    autoComplete="off"
                  />
                  {showSuggestions && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md overflow-auto">
                      <ul className="py-1">
                        {suggestions.map((client) => (
                          <li
                            key={client._id}
                            onClick={() => handleSelectClient(client)}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex flex-col"
                          >
                            <span className="font-medium text-gray-800 dark:text-white">
                              {client.name}
                            </span>
                            {client.companyname && (
                              <span className="text-gray-600 dark:text-gray-300 text-sm">
                                {client.companyname}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                    Invoice Date: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                    Customer ID:
                  </label>
                  <input
                    type="text"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-600"
                    placeholder="Customer ID"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                    Contact Name:
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-600"
                    placeholder="Contact Person"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                    Contact Email:
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-600"
                    placeholder="Email Address"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                    Contact Phone:
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-600"
                    placeholder="Phone Number"
                    readOnly
                  />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800 dark:text-white">
                Invoice Items
              </h2>
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 mb-3 items-center"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      name="description"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, e)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      name="quantity"
                      placeholder="Qty"
                      value={item.quantity || ""}
                      onChange={(e) => handleItemChange(index, e)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      min="1"
                      step="1"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      name="unitPrice"
                      placeholder="Price"
                      value={item.unitPrice || ""}
                      onChange={(e) => handleItemChange(index, e)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={`Rs.${item.amount.toFixed(2)}`}
                      readOnly
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline disabled:opacity-50"
                      disabled={formData.items.length <= 1}
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  + Add Item
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                  Tax Rate (%):
                </label>
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleTaxRateChange}
                  className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div className="flex justify-end mb-6">
                <div className="w-full md:w-1/3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-bold text-gray-800 dark:text-white">
                      Subtotal:
                    </span>
                    <span className="text-gray-800 dark:text-white">
                      Rs.{formData.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2 pt-2">
                    <span className="font-bold text-gray-800 dark:text-white">
                      Tax ({formData.taxRate}%):
                    </span>
                    <span className="text-gray-800 dark:text-white">
                      Rs.{formData.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 font-bold text-lg text-gray-800 dark:text-white">
                    <span>Total:</span>
                    <span>Rs.{formData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Generate Invoice PDF"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Previous Invoices
            </h2>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-300"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  className="block w-full p-3 pl-10 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by Invoice Number..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={fetchPreviousInvoices}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {isLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
            {errorMessage && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{errorMessage}</span>
                <span className="block mt-2">
                  Please check your server connection and API endpoints.
                </span>
              </div>
            )}
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? "No invoices match your search criteria."
                  : "No invoices found."}
                {!errorMessage && (
                  <p className="mt-2">
                    {searchQuery
                      ? "Try a different search term."
                      : "Click 'Create New Invoice' to generate your first invoice."}
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700 dark:text-gray-200">
                        Invoice Number
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700 dark:text-gray-200">
                        Date
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700 dark:text-gray-200">
                        Client
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700 dark:text-gray-200">
                        Total
                      </th>
                      <th className="py-3 px-4 border-b text-center font-semibold text-gray-700 dark:text-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr
                        key={invoice._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4 border-b text-gray-800 dark:text-white">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 border-b text-gray-800 dark:text-white">
                          {formatDate(invoice.date)}
                        </td>
                        <td className="py-3 px-4 border-b text-gray-800 dark:text-white">
                          {invoice.billTo}
                        </td>
                        <td className="py-3 px-4 border-b text-gray-800 dark:text-white">
                          Rs.{invoice.total ? invoice.total.toFixed(2) : "0.00"}
                        </td>
                        <td className="py-3 px-4 border-b text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => regeneratePDF(invoice)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm"
                              title="Download PDF"
                            >
                              PDF
                            </button>
                            <button
                              onClick={() => loadInvoice(invoice)}
                              className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-3 rounded text-sm"
                              title="Edit Invoice"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteInvoice(invoice._id)}
                              className="bg-red-500 hover:bg-red-700 text-white font-medium py-1 px-3 rounded text-sm"
                              title="Delete Invoice"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-6 flex justify-center">
              <button
                onClick={createNewInvoice}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Create New Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceForm;

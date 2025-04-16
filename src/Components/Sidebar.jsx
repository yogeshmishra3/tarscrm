import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faTasks,
  faAddressBook,
  faBullhorn,
  faCalendarAlt,
  faProjectDiagram,
  faCog,
  faFileInvoiceDollar,
  faHandshake,
  faExchangeAlt,
  faFileContract,
  faBars,
  faTimes,
  faEnvelope,
  faUsers,
  faExclamationCircle,
  faMoneyBillAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import ClientContacts from "./SidebarComponents/ClientContact";
import Deals from "./SidebarComponents/LeadManagement";
import CustomerComplaintsDashboard from "./SidebarComponents/CustomerComplaint";
import Finance from "./SidebarComponents/Finance";
import Tasks from "./SidebarComponents/Task";
import Calendar from "./SidebarComponents/Schedule";
import CRMIntegrationPage from "./SidebarComponents/Integration";
import Projects from "./SidebarComponents/Projects";
import InvoiceForm from "./SidebarComponents/Invoice";
import Dashboard from "./SidebarComponents/Dashboard";
import Leads from "./SidebarComponents/Lead";
import EmailManagement from "./SidebarComponents/Email";
import OrganizationsInCards from "./SidebarComponents/Organization";
import Quotation from "./SidebarComponents/Quotations";
import Settings from "./SidebarComponents/Settings";

// Custom Logout Confirmation Modal Component
const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg p-6 w-80 shadow-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Confirm Logout
        </h3>
        <p className="text-gray-700 mb-5">Are you sure you want to logout?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [activeContent, setActiveContent] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isMobile, setIsMobile] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();

  // Check if viewport is mobile and set initial sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setIsSidebarOpen(!isMobileView); // Open by default on desktop, closed on mobile
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set activeContent based on URL path
  useEffect(() => {
    if (location.pathname === "/quotation") {
      setActiveContent("quotation");
    }
  }, [location]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle menu item click
  const handleMenuClick = (content) => {
    setActiveContent(content);
    // Close sidebar on mobile when a menu item is clicked
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    console.log("Logging out...");
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const renderComponent = () => {
    switch (activeContent) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
        return <Tasks />;
      case "contacts":
        return <ClientContacts />;
      case "leads":
        return <Leads />;
      case "leadmanagement":
        return <Deals />;
      case "schedule":
        return <Calendar />;
      case "complaints":
        return <CustomerComplaintsDashboard />;
      case "finance":
        return <Finance />;
      case "organization":
        return <OrganizationsInCards />;
      case "email":
        return <EmailManagement />;
      case "integration":
        return <CRMIntegrationPage />;
      case "project":
        return <Projects />;
      case "invoice":
        return <InvoiceForm />;
      case "quotation":
        return <Quotation />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const menuItems = [
    { name: "Dashboard", content: "dashboard", icon: faTachometerAlt },
    { name: "Leads", content: "leads", icon: faBullhorn },
    { name: "Lead Management", content: "leadmanagement", icon: faBullhorn },
    { name: "Client Contacts", content: "contacts", icon: faAddressBook },
    { name: "Schedule", content: "schedule", icon: faCalendarAlt },
    { name: "Tasks", content: "tasks", icon: faTasks },
    { name: "Email", content: "email", icon: faEnvelope },
    { name: "Project", content: "project", icon: faProjectDiagram },
    { name: "Complaints", content: "complaints", icon: faExclamationCircle },
    { name: "Organization", content: "organization", icon: faUsers },
    { name: "Finance", content: "finance", icon: faMoneyBillAlt },
    { name: "Integration", content: "integration", icon: faExchangeAlt },
    { name: "Invoice", content: "invoice", icon: faFileInvoiceDollar },
    { name: "Quotation", content: "quotation", icon: faFileContract },
    { name: "Settings", content: "settings", icon: faCog },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Hamburger menu for mobile - always visible */}
      <button
        className="fixed top-4 left-4 z-20 md:hidden bg-[#211C84] text-white p-2 rounded-md"
        onClick={toggleSidebar}
      >
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} size="lg" />
      </button>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-100 bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-[#211C84] text-white transition-all duration-300 ease-in-out z-20
          fixed md:relative h-full
          ${
            isSidebarOpen
              ? "w-64 translate-x-0"
              : "w-0 -translate-x-full md:w-16 md:translate-x-0"
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2
            className={`text-lg  font-bold transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100 " : "opacity-0 md:hidden"
            }
              ${!isSidebarOpen && isMobile ? "ml-8 mt-1.5" : ""}`}
          >
            <span className="bg-gradient-to-r from-yellow-500 to-gray-400 bg-clip-text  text-lg  font-bold text-transparent">
              TARS
            </span>{" "}
            CRM
          </h2>
          <button
            className="focus:outline-none p-1 rounded hidden md:block"
            onClick={toggleSidebar}
          >
            <FontAwesomeIcon
              icon={isSidebarOpen ? faTimes : faBars}
              size="lg"
            />
          </button>
        </div>

        {/* Menu */}
        <ul className="mt-4">
          {menuItems.map((item) => (
            <li
              key={item.content}
              className={`flex items-center cursor-pointer px-3 py-2 rounded-md mx-1 mb-1 transition whitespace-nowrap
      ${activeContent === item.content ? "bg-blue-700" : "hover:bg-blue-800"}
      ${!isSidebarOpen && isMobile ? "hidden" : ""}
    `}
              onClick={() => handleMenuClick(item.content)}
            >
              <FontAwesomeIcon icon={item.icon} className="text-sm" />
              <span
                className={`ml-3 text-sm transition-opacity duration-300 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0 md:hidden"
                }
      ${!isSidebarOpen && isMobile ? "hidden" : ""}`}
              >
                {item.name}
              </span>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className=" px-1  mt-auto">
          <button
            onClick={handleLogoutClick}
            className={`flex items-center w-full text-amber-500 hover:bg-red-700 px-3 py-2 rounded-md transition ${
              !isSidebarOpen && "justify-center md:justify-start"
            }
              ${!isSidebarOpen && isMobile ? " text-transparent hidden" : ""}`}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-sm" />
            <span
              className={`ml-2 text-sm transition-opacity duration-300 ${
                isSidebarOpen ? "opacity-100" : "opacity-0 md:hidden"
              }
              `}
            >
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div
        className={`transition-all duration-300 ease-in-out h-screen overflow-auto 
          w-full relative`}
      >
        {/* Main Content */}
        <div className="p-4 md:p-6 pt-16 md:pt-6">{renderComponent()}</div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

export default Sidebar;

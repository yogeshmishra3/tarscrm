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
  faVideo,
  faExchangeAlt,
  faFileContract,
  faBars,
  faTimes,
  faEnvelope,
  faUsers,
  faExclamationCircle,
  faMoneyBillAlt,
  faSignOutAlt,
  faVideoSlash,
  faPhoneAlt,
  faExpand,
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
import VideoCall from "./SidebarComponents/CreateMeeting";
import Settings from "./SidebarComponents/Settings";
import { useMeeting } from "./MeetingComponent/MeetingContext";

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

// Enhanced Mini Meeting Control Component
const MiniMeetingControl = () => {
  const {
    activeMeetingUrl,
    endMeeting,
    maximizeMeeting,
    isMeetingMinimized,
    meetingTitle,
    participantCount,
  } = useMeeting();

  if (!isMeetingMinimized || !activeMeetingUrl) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden z-40 w-72 border border-blue-200">
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faVideo} className="text-white" />
          <span className="text-sm font-medium truncate max-w-[160px]">
            {meetingTitle || "Active Meeting"}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={maximizeMeeting}
            className="text-white hover:text-blue-200 transition"
            title="Maximize meeting"
          >
            <FontAwesomeIcon icon={faExpand} />
          </button>
          <button
            onClick={endMeeting}
            className="text-white hover:text-red-300 transition"
            title="End meeting"
          >
            <FontAwesomeIcon icon={faVideoSlash} />
          </button>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faUsers} className="text-gray-500 text-xs" />
            <span className="text-xs text-gray-700">
              {participantCount} participant{participantCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <FontAwesomeIcon icon={faPhoneAlt} />
            <span>Meeting Active</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 truncate w-40">
            {activeMeetingUrl}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(activeMeetingUrl);
              alert("Meeting link copied!");
            }}
            className="text-blue-500 hover:text-blue-700 text-xs"
            title="Copy meeting link"
          >
            <FontAwesomeIcon icon={faExchangeAlt} />
          </button>
        </div>
      </div>
      <div className="bg-blue-50 p-2 flex justify-center">
        <button
          onClick={maximizeMeeting}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          <FontAwesomeIcon icon={faVideo} className="mr-2" />
          Return to Meeting
        </button>
      </div>
    </div>
  );
};

// Floating Meeting Button Component
const FloatingMeetingButton = ({ onClick }) => {
  const { isMeetingActive } = useMeeting();

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition z-30 flex items-center justify-center ${
        isMeetingActive
          ? "bg-green-600 hover:bg-green-700"
          : "bg-blue-600 hover:bg-blue-700"
      } text-white`}
      title={isMeetingActive ? "Return to meeting" : "Start a meeting"}
    >
      <FontAwesomeIcon icon={isMeetingActive ? faVideo : faVideo} size="lg" />
      {isMeetingActive && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
      )}
    </button>
  );
};

// Meeting Modal Component
const MeetingModal = ({ isOpen, onClose }) => {
  const modalRef = useRef();
  const { isMeetingActive } = useMeeting();

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-3xl h-3/4 shadow-lg overflow-hidden"
      >
        <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
          <h3 className="text-lg font-medium">Create Meeting</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-red-300 transition"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="p-0 overflow-auto h-full">
          <VideoCall />
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [activeContent, setActiveContent] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const location = useLocation();
  const {
    isMeetingActive,
    endMeeting,
    minimizeMeeting,
    maximizeMeeting,
    isMeetingMinimized,
  } = useMeeting();

  // Check if viewport is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
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

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    // End any active meetings before logging out
    if (isMeetingActive) {
      endMeeting();
    }
    console.log("Logging out...");
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const handleMenuClick = (content) => {
    // If going to meeting component and there's an active meeting, maximize it
    if (content === "meeting" && isMeetingActive) {
      maximizeMeeting();
    }

    // If leaving meeting component and there's an active meeting, minimize it
    if (
      activeContent === "meeting" &&
      content !== "meeting" &&
      isMeetingActive
    ) {
      minimizeMeeting();
    }

    setActiveContent(content);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleFloatingMeetingClick = () => {
    // If there's an active meeting, maximize it, otherwise open the meeting modal
    if (isMeetingActive) {
      if (isMeetingMinimized) {
        maximizeMeeting();
      } else {
        // If already in meeting view, do nothing
        if (activeContent !== "meeting") {
          setActiveContent("meeting");
        }
      }
    } else {
      setIsMeetingModalOpen(true);
    }
  };

  const closeMeetingModal = () => {
    setIsMeetingModalOpen(false);
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
      case "meeting":
        return <VideoCall />;
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
    { name: "Create Meeting", content: "meeting", icon: faVideo },
    { name: "Organization", content: "organization", icon: faUsers },
    { name: "Finance", content: "finance", icon: faMoneyBillAlt },
    { name: "Integration", content: "integration", icon: faExchangeAlt },
    { name: "Invoice", content: "invoice", icon: faFileInvoiceDollar },
    { name: "Settings", content: "settings", icon: faCog },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-[#211C84] text-white transition-all duration-300 ease-in-out z-30
          ${isSidebarOpen ? "w-64" : "w-16"} 
          fixed md:static h-full`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2
            className={`text-lg font-bold ${
              isSidebarOpen ? "block" : "hidden"
            }`}
          >
            CRM
          </h2>
          <button
            className="focus:outline-none p-1 rounded"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
              className={`flex items-center cursor-pointer px-3 py-1 rounded-md mx-2 mb-2 transition 
                ${
                  activeContent === item.content
                    ? "bg-blue-700"
                    : "hover:bg-blue-600"
                }`}
              onClick={() => handleMenuClick(item.content)}
            >
              <FontAwesomeIcon icon={item.icon} className="text-xl" />
              <span
                className={`ml-2 text-sm ${isSidebarOpen ? "block" : "hidden"}`}
              >
                {item.name}
              </span>
              {/* Add indicator for active meeting */}
              {item.content === "meeting" && isMeetingActive && (
                <span className="w-2 h-2 rounded-full bg-green-500 ml-auto animate-pulse"></span>
              )}
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="px-3 pb-3 mt-auto">
          <button
            onClick={handleLogoutClick}
            className="flex items-center w-full text-amber-500 hover:bg-red-700 px-3 py-2 rounded-md transition"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
            <span
              className={`ml-2 text-sm ${isSidebarOpen ? "inline" : "hidden"}`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div
        className={`transition-all duration-300 ease-in-out h-screen overflow-auto 
          ${isSidebarOpen ? "" : "ml-16"} w-full relative`}
      >
        {/* Main Content */}
        <div className="p-4">{renderComponent()}</div>

        {/* Enhanced Mini Meeting Control */}
        <MiniMeetingControl />

        {/* Floating Meeting Button - Only show when meeting is not minimized or there's no active meeting */}
        {(!isMeetingMinimized || !isMeetingActive) && (
          <FloatingMeetingButton onClick={handleFloatingMeetingClick} />
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />

      {/* Meeting Modal */}
      <MeetingModal isOpen={isMeetingModalOpen} onClose={closeMeetingModal} />
    </div>
  );
};

export default Sidebar;

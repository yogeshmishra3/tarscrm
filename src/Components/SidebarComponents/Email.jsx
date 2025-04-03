import React, { useState, useEffect } from "react";
import Sidebar from "../EmailComponent/Sidebar";
import EmailList from "../EmailComponent/EmailList";
import ComposeEmail from "../EmailComponent/ComposeEmail";
import ViewEmail from "../EmailComponent/ViewEmail";
import DraftsList from "../EmailComponent/DraftsList";
import Header from "../EmailComponent/Header";
import { PanelLeft } from "lucide-react";

// Define API URL
const API_URL = "https://crm-brown-gamma.vercel.app/api";

const EmailDashboard = () => {
  // States
  const [activeView, setActiveView] = useState("inbox"); // inbox, sent, drafts, compose, view
  const [emails, setEmails] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState("yogibaba1207@gmail.com");
  const [showCompose, setShowCompose] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fetch emails based on active view
  useEffect(() => {
    if (activeView === "inbox") {
      fetchInboxEmails();
    } else if (activeView === "sent") {
      fetchSentEmails();
    } else if (activeView === "drafts") {
      fetchDrafts();
    }
    // Close mobile sidebar when view changes
    setMobileSidebarOpen(false);
  }, [activeView]);

  // Fetch inbox emails
  const fetchInboxEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/fetch-inbox-emails?email=${currentUser}`
      );
      const data = await response.json();
      if (data.success) {
        setEmails(data.emails || []);
      }
    } catch (error) {
      console.error("Error fetching inbox:", error);
      // Using mock data when server is not running
      setEmails([
        {
          id: "mock1",
          from: "demo@example.com",
          to: currentUser,
          subject: "Welcome to Email Client",
          date: new Date().toISOString(),
          body: "This is a mock email for demonstration purposes.",
          isRead: false,
        },
        {
          id: "mock2",
          from: "support@example.com",
          to: currentUser,
          subject: "Your account setup",
          date: new Date().toISOString(),
          body: "Thank you for trying our email client application.",
          isRead: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sent emails
  const fetchSentEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/fetch-sent-emails?email=${currentUser}`
      );
      const data = await response.json();
      if (data.success) {
        setEmails(data.emails || []);
      }
    } catch (error) {
      console.error("Error fetching sent emails:", error);
      // Mock data for sent emails
      setEmails([
        {
          id: "mock-sent1",
          from: currentUser,
          to: "recipient@example.com",
          subject: "Regarding our meeting",
          date: new Date().toISOString(),
          body: "Looking forward to our meeting tomorrow.",
          isRead: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch drafts
  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/get-drafts?fromEmail=${currentUser}`
      );
      const data = await response.json();
      if (data.success) {
        setDrafts(data.drafts || []);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
      // Mock data for drafts
      setDrafts([
        {
          id: "mock-draft1",
          fromEmail: currentUser,
          toEmail: "draft-recipient@example.com",
          subject: "Draft email",
          message: "This is a draft email message.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hasAttachment: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mark email as read
  const markAsRead = async (emailId) => {
    try {
      const response = await fetch(`${API_URL}/mark-as-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser,
          messageId: emailId,
          folder: "INBOX",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEmails(
          emails.map((email) =>
            email.id === emailId ? { ...email, isRead: true } : email
          )
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Handle email selection
  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
    setActiveView("view");
    if (!email.isRead) {
      markAsRead(email.id);
    }
  };

  // Handle draft selection
  const handleDraftSelect = (draft) => {
    setSelectedDraft(draft);
    setShowCompose(true);
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      if (activeView === "inbox") {
        fetchInboxEmails();
      } else if (activeView === "sent") {
        fetchSentEmails();
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/search-emails?email=${currentUser}&query=${searchQuery}&folder=${
          activeView === "inbox" ? "INBOX" : "[Gmail]/Sent Mail"
        }`
      );

      const data = await response.json();
      if (data.success) {
        setEmails(data.emails || []);
      }
    } catch (error) {
      console.error("Error searching emails:", error);
      // Filter mock data
      const filtered = emails.filter(
        (email) =>
          email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.from.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setEmails(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Handle send email
  const handleSendEmail = async (emailData, attachment) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fromEmail", currentUser);
      formData.append("toEmail", emailData.to);
      formData.append("subject", emailData.subject);
      formData.append("message", emailData.message);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      const response = await fetch(`${API_URL}/send-email`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setShowCompose(false);
        setActiveView("sent");
        fetchSentEmails();
      }
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save draft
  const handleSaveDraft = async (draftData, attachment, draftId = null) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fromEmail", currentUser);
      formData.append("toEmail", draftData.to || "");
      formData.append("subject", draftData.subject || "");
      formData.append("message", draftData.message || "");

      if (attachment) {
        formData.append("attachment", attachment);
      }

      let response;
      if (draftId) {
        // Update existing draft
        response = await fetch(`${API_URL}/update-draft/${draftId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        // Save new draft
        response = await fetch(`${API_URL}/save-draft`, {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();
      if (data.success) {
        setShowCompose(false);
        setActiveView("drafts");
        fetchDrafts();
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete draft
  const handleDeleteDraft = async (draftId) => {
    try {
      const response = await fetch(
        `${API_URL}/delete-draft/${draftId}?fromEmail=${currentUser}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (data.success) {
        setDrafts(drafts.filter((draft) => draft.id !== draftId));
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      // Remove from UI anyway for better UX
      setDrafts(drafts.filter((draft) => draft.id !== draftId));
    }
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        currentUser={currentUser}
        toggleMobileSidebar={toggleMobileSidebar}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar toggle button */}

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Desktop sidebar - always visible on md+ screens */}
        <div className="hidden md:block w-48 lg:w-56 border-r shrink-0">
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            setShowCompose={setShowCompose}
          />
        </div>

        {/* Mobile sidebar - conditionally visible with overlay */}
        <div
          className={`fixed left-0 top-0 h-full z-40  bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            setShowCompose={setShowCompose}
            isMobile={true}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto px-2 sm:px-4">
          {activeView === "inbox" && (
            <EmailList
              emails={emails}
              loading={loading}
              onSelect={handleEmailSelect}
              type="inbox"
            />
          )}

          {activeView === "sent" && (
            <EmailList
              emails={emails}
              loading={loading}
              onSelect={handleEmailSelect}
              type="sent"
            />
          )}

          {activeView === "drafts" && (
            <DraftsList
              drafts={drafts}
              loading={loading}
              onSelect={handleDraftSelect}
              onDelete={handleDeleteDraft}
            />
          )}

          {activeView === "view" && selectedEmail && (
            <ViewEmail
              email={selectedEmail}
              onBack={() =>
                setActiveView(
                  selectedEmail.from === currentUser ? "sent" : "inbox"
                )
              }
            />
          )}
        </div>
      </div>

      {/* Compose email modal */}
      {showCompose && (
        <ComposeEmail
          draft={selectedDraft}
          onSend={handleSendEmail}
          onSaveDraft={handleSaveDraft}
          onClose={() => {
            setShowCompose(false);
            setSelectedDraft(null);
          }}
        />
      )}

      {/* Mobile compose button - fixed at bottom right */}
      <div className="md:hidden fixed right-4 bottom-4 z-20">
        <button
          className="bg-blue-800 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
          onClick={() => setShowCompose(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 14l-3 -3l-3 3" />
            <path d="M14 11v7.5c0 1.5 -.5 2.5 -2 2.5h-7c-1.5 0 -2 -1 -2 -2.5v-10.5c0 -1.5 .5 -2.5 2 -2.5h4" />
            <path d="M3 9h6" />
            <path d="M3 13h3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EmailDashboard;

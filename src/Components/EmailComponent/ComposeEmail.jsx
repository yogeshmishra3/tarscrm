import React, { useState, useEffect, useRef } from "react";
import { X, Paperclip, Trash } from "lucide-react";

const Button = ({ children, variant, size, onClick, disabled, className }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "ghost":
        return "bg-transparent hover:bg-gray-100";
      case "outline":
        return "bg-transparent border border-gray-300 hover:bg-gray-50";
      default:
        return "bg-blue-800 text-white hover:bg-blue-700";
    }
  };

  const getSizeClasses = () => {
    if (size === "icon") {
      return "p-2";
    }
    return "px-4 py-2";
  };

  return (
    <button
      className={`rounded font-medium transition-colors ${getVariantClasses()} ${getSizeClasses()} ${
        className || ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ type, name, placeholder, value, onChange, className }) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full p-2 rounded outline-none focus:ring-2 focus:ring-blue-500 ${
        className || ""
      }`}
    />
  );
};

const Textarea = ({ name, placeholder, value, onChange, className }) => {
  return (
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full p-2 rounded outline-none focus:ring-2 focus:ring-blue-500 ${
        className || ""
      }`}
    />
  );
};

const ComposeEmail = ({ draft = null, onSend, onSaveDraft, onClose }) => {
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: "",
  });

  const [attachment, setAttachment] = useState(null);
  const [isEdited, setIsEdited] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Close modal when clicking outside (for larger screens only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !isSmallScreen
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, isSmallScreen]);

  // Simple toast implementation
  const showToast = ({ title, description, variant }) => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3000);
  };

  // Initialize with draft data if available
  useEffect(() => {
    if (draft) {
      setEmailData({
        to: draft.toEmail || "",
        subject: draft.subject || "",
        message: draft.message || "",
      });
      // We can't restore the actual attachment data from the backend
      // but we can show that there was one
      setIsEdited(false);
    }
  }, [draft]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
    setIsEdited(true);
  };

  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast({
        title: "Error",
        description: "File size exceeds 5MB limit",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      showToast({
        title: "Error",
        description: "Only JPEG, PNG, PDF, and TXT files are allowed",
        variant: "destructive",
      });
      return;
    }

    setAttachment(file);
    setIsEdited(true);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsEdited(true);
  };

  const handleSend = () => {
    // Simple validation
    if (!emailData.to) {
      showToast({
        title: "Error",
        description: "Recipient email is required",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.to)) {
      showToast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    onSend(emailData, attachment);
  };

  const handleSaveDraft = () => {
    // Don't save if nothing has changed
    if (!isEdited && draft) {
      onClose();
      return;
    }

    // Only save if at least one field has data
    if (
      !emailData.to &&
      !emailData.subject &&
      !emailData.message &&
      !attachment
    ) {
      showToast({
        title: "Warning",
        description: "Cannot save empty draft",
      });
      return;
    }

    onSaveDraft(emailData, attachment, draft?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      {toast && (
        <div
          className={`fixed top-4 right-4 p-4 rounded shadow-lg max-w-xs z-50 ${
            toast.variant === "destructive"
              ? "bg-red-500 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          <div className="font-bold">{toast.title}</div>
          <div>{toast.description}</div>
        </div>
      )}

      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full flex flex-col ${
          isSmallScreen ? "h-full max-h-full" : "max-w-2xl max-h-[90vh]"
        }`}
      >
        <div className="p-3 sm:p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium">
            {draft ? "Edit Draft" : "New Message"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3 sm:p-4 flex-1 overflow-auto">
          <div className="space-y-4">
            <div className="border-b pb-2">
              <Input
                type="email"
                name="to"
                placeholder="To"
                value={emailData.to}
                onChange={handleInputChange}
                className="border-none"
              />
            </div>

            <div className="border-b pb-2">
              <Input
                type="text"
                name="subject"
                placeholder="Subject"
                value={emailData.subject}
                onChange={handleInputChange}
                className="border-none"
              />
            </div>

            <Textarea
              name="message"
              placeholder="Compose your message..."
              value={emailData.message}
              onChange={handleInputChange}
              className={`${
                isSmallScreen ? "min-h-[40vh]" : "min-h-[200px]"
              } border-none resize-none`}
            />

            {attachment && (
              <div className="flex items-center p-2 bg-gray-100 rounded">
                <span className="text-sm truncate flex-1">
                  {attachment.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeAttachment}
                  className="h-8 w-8 shrink-0"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4 border-t flex flex-wrap gap-2 sm:gap-0 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSend}>Send</Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <div>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleAttachment}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachment !== null}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="sm:ml-auto"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;

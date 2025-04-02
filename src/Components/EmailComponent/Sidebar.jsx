import React from "react";
import { Pencil, Inbox, Send, File, Trash, Mail } from "lucide-react";

const Sidebar = ({ activeView, setActiveView, setShowCompose }) => {
  const menuItems = [
    { id: "inbox", label: "Inbox", icon: Inbox, count: 12 },
    { id: "sent", label: "Sent", icon: Send },
    { id: "drafts", label: "Drafts", icon: File, count: 3 },
    { id: "trash", label: "Trash", icon: Trash },
  ];

  return (
    <div className="h-full bg-gray-50 border-r border-gray-200 w-50 flex flex-col">
      {/* Gmail logo */}
      {/* <div className="p-4 flex items-center gap-2 mb-4">
        <Mail className="h-6 w-6 text-red-500" />
        <span className="text-xl font-semibold text-gray-800">Gmail</span>
      </div> */}

      {/* Compose button */}
      <button
        onClick={() => setShowCompose(true)}
        className="mx-4 mb-6 gap-2 flex items-center justify-center p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 hover:shadow-md transition-all duration-200"
      >
        <Pencil className="h-4 w-4" />
        <span className="font-medium">Compose</span>
      </button>

      {/* Navigation */}
      <nav className="space-y-1 flex-1 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              className={`w-full justify-between px-4 py-3 rounded-2xl flex items-center group ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveView(item.id)}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-blue-700" : "text-gray-500"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.count && (
                <span
                  className={`text-sm ${
                    isActive ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 text-xs text-gray-500">
        <div className="flex justify-between mb-2">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Program Policies</span>
        </div>
        <div className="text-center">Last account activity: 2 minutes ago</div>
      </div>
    </div>
  );
};

export default Sidebar;

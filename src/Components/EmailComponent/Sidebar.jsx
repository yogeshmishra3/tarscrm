import React from "react";
import { Pencil, Inbox, Send, File, Trash } from "lucide-react";

const Sidebar = ({ activeView, setActiveView, setShowCompose }) => {
  const menuItems = [
    { id: "inbox", label: "Inbox", icon: Inbox, count: 12 },
    { id: "sent", label: "Sent", icon: Send },
    { id: "drafts", label: "Drafts", icon: File, count: 3 },
    { id: "trash", label: "Trash", icon: Trash },
  ];

  return (
    <div className="h-full bg-gray-50 border-r border-gray-200 w-16 md:w-full flex flex-col overflow-hidden transition-all duration-300">
      {/* Compose button */}
      <button
        onClick={() => setShowCompose(true)}
        className="mx-2 md:mx-4 mt-4 mb-4 md:mb-6 gap-1 md:gap-2 flex items-center justify-center p-2 md:p-3 bg-blue-800 text-white rounded-full md:rounded-2xl hover:bg-blue-700 hover:shadow-md transition-all duration-200"
      >
        <Pencil className="h-4 w-4" />
        <span className="font-medium hidden md:inline">Compose</span>
      </button>

      {/* Navigation */}
      <nav className="space-y-1 flex-1 px-1 md:px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              className={`w-full relative flex items-center ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-200"
              } rounded-full md:rounded-2xl px-0 md:px-4 py-3 transition-all duration-200`}
              onClick={() => setActiveView(item.id)}
            >
              {/* Icon - always visible */}
              <div className="flex items-center justify-center w-full md:w-auto md:justify-start md:flex-1">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-blue-700" : "text-gray-500"
                  }`}
                />

                {/* Label - hidden on mobile */}
                <span className="hidden md:inline text-sm md:ml-3">
                  {item.label}
                </span>
              </div>

              {/* Count - different styling for mobile vs desktop */}
              {item.count && (
                <>
                  {/* Desktop count */}
                  <span
                    className={`text-sm hidden md:inline ${
                      isActive ? "text-blue-700" : "text-gray-500"
                    }`}
                  >
                    {item.count}
                  </span>

                  {/* Mobile count badge */}
                  <span
                    className={`absolute top-0 right-0 text-xs bg-blue-800 text-white rounded-full h-4 w-4 flex items-center justify-center md:hidden`}
                  >
                    {item.count}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer - hidden on small screens */}
      <div className="p-2 md:p-4 text-xs text-gray-500 hidden md:block">
        <div className="flex justify-between mb-2 text-xs">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Program Policies</span>
        </div>
        <div className="text-center text-xs">Last activity: 2m ago</div>
      </div>
    </div>
  );
};

export default Sidebar;

import React from "react";
import { Mail, Search, User, Bell, Settings, Grid } from "lucide-react";
import { PanelLeft } from "lucide-react";

const Header = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  currentUser,
  toggleMobileSidebar,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between p-2">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2 ml-1 sm:ml-2">
          <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 max-w-xs sm:max-w-lg md:max-w-2xl mx-2 sm:mx-4"
        >
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search mail"
              className="w-full bg-gray-100 pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5 rounded-lg border border-transparent hover:bg-gray-200 focus:bg-white focus:border-blue-200 focus:shadow-md focus:outline-none transition-all duration-200 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Actions and Profile */}
        <div className="flex items-center space-x-1 mr-1 sm:mr-2">
          {/* Mobile-hidden buttons */}
          {/* <div className="hidden sm:flex items-center space-x-1">
            <button className="rounded-full p-2 hover:bg-gray-100 text-gray-600">
              <Settings className="h-5 w-5" />
            </button>
          </div> */}

          <div className="flex items-center ml-1 sm:ml-2">
            <span className="text-xs sm:text-sm text-gray-700 font-medium hidden md:block mr-2">
              {currentUser || "user@gmail.com"}
            </span>
            <button className="rounded-full ml-0
             p-1 bg-blue-100 hover:bg-blue-200 transition-colors">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-800" />
            </button>
            <button
              className="md:hidden absolute p-1 bg-blue-100 hover:bg-blue-200 transition-colors"
              onClick={toggleMobileSidebar}
              aria-label="Toggle menu"
            >
              <PanelLeft className="h-5 w-5 sm:h-6 sm:w-6 text-blue-800" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

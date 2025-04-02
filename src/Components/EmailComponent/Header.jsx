import React from "react";
import { Mail, Search, User, Bell, Settings, Grid } from "lucide-react";

const Header = ({ searchQuery, setSearchQuery, handleSearch, currentUser }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0">
      <div className="flex items-center justify-between p-2">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2 ml-2">
          <Mail className="h-6 w-6 text-red-500" />
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search mail"
              className="w-full bg-gray-100 pl-12 pr-4 py-2.5 rounded-lg border border-transparent hover:bg-gray-200 focus:bg-white focus:border-blue-200 focus:shadow-md focus:outline-none transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Actions and Profile */}
        <div className="flex items-center space-x-1 mr-2">
          {/* <button className="rounded-full p-2 hover:bg-gray-100 text-gray-600">
            <Settings className="h-5 w-5" />
          </button> */}
          {/* <button className="rounded-full p-2 hover:bg-gray-100 text-gray-600">
            <Grid className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 hover:bg-gray-100 text-gray-600 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
          </button> */}
          <div className="flex items-center ml-2">
            <span className="text-sm text-gray-700 font-medium hidden md:block mr-2">
              {currentUser || "user@gmail.com"}
            </span>
            <button className="rounded-full p-1 bg-blue-100 hover:bg-blue-200 transition-colors">
              <User className="h-6 w-6 text-blue-800" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

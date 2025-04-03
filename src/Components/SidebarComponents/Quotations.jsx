import React, { useState } from "react";
import SmsQuotation from "../Quotations/SmsQuotation";
import SVECommerce from "../Quotations/SVECommerce";
import OMSQ from "../Quotations/OMSQ";
import LMSQ from "../Quotations/LMSQ";
import IMSQ from "../Quotations/IMSQ";
import Quotes from "../Quotations/StaticQuotes";
import MVECQ from "../Quotations/MVECQ";
import MAPQ from "../Quotations/MAPQ";
import DigitalMQ from "../Quotations/DigitalMQ";

const Quotations = () => {
  const [activeComponent, setActiveComponent] = useState("static"); // Default to StaticQuote

  return (
    <div className=" h-screen  overflow-y-auto">
      <h1>All Quotations</h1>
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg mb-6">
        <button
          onClick={() => setActiveComponent("static")}
          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          Static Quotation Format
        </button>
        <button
          onClick={() => setActiveComponent("sms")}
          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          SMS Quotation Format
        </button>
        <button
          onClick={() => setActiveComponent("SVE")}
          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          Single Vendor E-Commerce
        </button>
        <button
          onClick={() => setActiveComponent("OMS")}
          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          OMS Quotation Format
        </button>
        <button
          onClick={() => setActiveComponent("LMS")}
          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          LMS Quotation Format
        </button>
        <button
          onClick={() => setActiveComponent("IMS")}
          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          IMS Quotation Format
        </button>
        <button
          onClick={() => setActiveComponent("MAP")}
          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          Mobile App Development
        </button>
        <button
          onClick={() => setActiveComponent("MVEC")}
          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          Multi-Vendor E-Commerce
        </button>
        <button
          onClick={() => setActiveComponent("DMQ")}
          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          Digital Marketing Format
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeComponent === "static" && <Quotes />}
      {activeComponent === "sms" && <SmsQuotation />}
      {activeComponent === "SVE" && <SVECommerce />}
      {activeComponent === "OMS" && <OMSQ />}
      {activeComponent === "LMS" && <LMSQ />}
      {activeComponent === "IMS" && <IMSQ />}
      {activeComponent === "MAP" && <MAPQ />}
      {activeComponent === "MVEC" && <MVECQ />}
      {activeComponent === "DMQ" && <DigitalMQ />}
    </div>
  );
};

export default Quotations;

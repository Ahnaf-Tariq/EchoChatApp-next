import React from "react";

const Navbar = () => {
  return (
    <div className="bg-[#14b8a6]">
      <div className="flex justify-between items-center max-w-7xl mx-auto p-4">
        <h1 className="text-white text-2xl sm:text-3xl font-semibold">
          Chat App
        </h1>
        <div>
          <button className="text-white bg-[#0f766e] rounded-xl px-2 sm:px-4 py-1 sm:py-2 cursor-pointer">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

import React from "react";

function Logo({ width = "100px" }) {
  return (
    <div className="flex items-center flex-col">
      <div
        className="border-b-2 "
        style={{
          backgroundColor: "#7963fc",
          borderBlockColor: "#7963fc",
          width: "30px", // Adjust the width as needed
        }}
      ></div>
      <div className="text-white text-4xl">MERN</div>
      <div
        className="text-white "
        style={{
          fontSize: "8px",
        }}
      >
        think creative
      </div>
    </div>
  );
}

export default Logo;
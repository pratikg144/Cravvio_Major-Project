import React from "react";

// Simple placeholder routes file — the main routing is handled in `main.jsx`.
// This file exports a no-op component to avoid accidental import errors.
// const Approutes = () => {
//   return null;
// };

// export default Approutes;

import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import App from "../App";
import OrderTracking from "../pages/OrderTracking";

const Approutes = () => {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<App />} />

      {/* Order Tracking Page */}
      <Route path="/tracking/:id" element={<OrderTracking />} />
    </Routes>
  );
};

export default Approutes;

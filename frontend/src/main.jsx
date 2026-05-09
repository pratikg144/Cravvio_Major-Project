import "leaflet/dist/leaflet.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Vendor from "./Vendor";
import Admin from "./admin";
import User from "./user";
import PaymentSimple from "./PaymentSimplest";
import "./index.css";
import Login from "./login";
import Usermenu from "./usermenu";
import Payments from "./Payments";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword"; 
import NotificationsPage from "./notification";
import ViewPage from "./ViewPage";
import SettingsPage from "./SettingsPage";
import ReviewPage from "./ReviewPage";
import FullReportPage from "./FullReportPage";
import Register from "./register";  
import AdminStats from "./AdminStats";
import AdminUsers from "./AdminUsers"; 
import AdminOrders from "./AdminOrders";
import AdminPayments from "./AdminPayments";
import AdminSubscriptions from "./AdminSubscriptions";
import AddFood from "./addfood";
import VendorMenu from "./VendorMenu";
import OrderTracking from "./OrderTracking";
import SupportRequests from "./SupportRequests";
import UserSupport from "./UserSupport";
import VendorSupport from "./VendorSupport";
import About from "./About";


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vendor" element={<Vendor />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/user" element={<User />} />
        <Route path="/usermenu" element={<Usermenu />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/admin-orders" element={<AdminOrders />} />
        <Route path="/support-requests" element={<SupportRequests />} />
        <Route path="/support" element={<UserSupport />} />
        <Route path="/vendor-support" element={<VendorSupport />} />
        
        
        <Route path="/admin-stats" element={<AdminStats />} />
        <Route path="/admin-payments" element={<AdminPayments />} />
        <Route path="/admin-subscriptions" element={<AdminSubscriptions />} />
        
       
        <Route path="/addfood" element={<AddFood />} />
        <Route path="/vendor-menu" element={<VendorMenu />} />
       <Route path="/payment-simple" element={<PaymentSimple />} />

       
        <Route path="/payments" element={<Payments />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/notification" element={<NotificationsPage />} />
        <Route path="/SettingsPage" element={<SettingsPage />} />
        <Route path="/ReviewPage" element={<ReviewPage />} />
        <Route path="/ViewPage" element={<ViewPage />} />
        <Route path="/FullReportPage" element={<FullReportPage />} />
        <Route path="/about" element={<About />} />

        <Route path="/tracking/:id" element={<OrderTracking />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

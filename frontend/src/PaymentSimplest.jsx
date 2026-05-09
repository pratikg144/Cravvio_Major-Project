import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from './config/api';

export default function PaymentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get order details from location state (passed from placeOrder in UserMenu)
  // Now supports both single order (legacy) and multiple orders from different vendors
  const stateData = location.state || {};
  const orders = stateData.orders || (stateData.orderId ? [{
    orderId: stateData.orderId,
    vendorId: stateData.vendorId,
    vendorName: stateData.vendorName || 'Vendor',
    amount: stateData.amount,
    items: stateData.items
  }] : []);
  const subscription = stateData.subscription || null;
  const totalAmount = stateData.totalAmount || stateData.amount || 0;
  
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  const paymentOptions = [
    { id: "upi", label: "UPI", desc: "Google Pay, PhonePe, Paytm" },
    { id: "card", label: "Credit/Debit Card", desc: "Visa, Mastercard, RuPay" },
    { id: "wallet", label: "Wallet", desc: "PayTM, MobiKwik" },
    { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
  ];

  const handlePayment = async () => {
    if (orders.length === 0 && !subscription) {
      alert("No orders found. Please place an order first.");
      navigate("/usermenu");
      return;
    }

    if (!selected) {
      alert("Please select a payment method");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Process payment for each order
      for (const order of orders) {
        const paymentData = {
          orderId: order.orderId,
          vendorId: order.vendorId,
          amount: order.amount || 0,
          paymentMethod: selected,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentDetails: {}
        };

        if (selected === "upi" && upiId) {
          paymentData.paymentDetails.upiId = upiId;
        } else if (selected === "card" && cardNumber) {
          paymentData.paymentDetails.cardLast4 = cardNumber.slice(-4);
          paymentData.paymentDetails.cardNetwork = "Visa"; // Simplified
        }

        // Call backend to save payment
        const response = await apiClient.post('/api/payment/create', paymentData);
      }

      // If subscription present, process subscription payment
      if (subscription) {
        const subPayment = {
          subscriptionId: subscription._id,
          amount: subscription.price || totalAmount,
          paymentMethod: selected,
          transactionId: `TXN_SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentDetails: { plan: subscription.plan }
        };
        if (selected === 'upi' && upiId) subPayment.paymentDetails.upiId = upiId;
        if (selected === 'card' && cardNumber) subPayment.paymentDetails.cardLast4 = cardNumber.slice(-4);
        await apiClient.post('/api/payment/create', subPayment);
      }
      
      setMessage(`Payment successful for all ${orders.length} order(s)!`);
      
      // Redirect to order tracking after 2 seconds
      setTimeout(() => {
        navigate("/usermenu");
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      setMessage(error.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-emerald-700 mb-4">No Orders Found</h2>
          <p className="text-gray-600 mb-6">Please place an order first before making a payment.</p>
          <button
            onClick={() => navigate("/usermenu")}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700">Payment</h1>
          <p className="text-gray-600 mt-2">Complete your order by selecting a payment method</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-emerald-700 mb-4">Order Summary</h3>
          {/* Subscription Summary (if any) */}
          {subscription && (
            <div className="border rounded-lg p-4 bg-gray-50 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="text-sm text-emerald-600 font-semibold">Subscription</div>
                  <div className="text-lg font-bold">{subscription.plan} Plan</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Duration: {subscription.months || 1} month(s)</div>
                  <div className="text-xl font-bold">₹{subscription.price}</div>
                </div>
              </div>
            </div>
          )}
          {/* Multiple Orders */}
          <div className="space-y-4 mb-6">
            {orders.map((order, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-emerald-600">{order.vendorName}</span>
                  <span className="text-xs text-gray-500">Order #{order.orderId?.slice(-6)}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {order.items?.length || 0} item(s)
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Amount:</span>
                  <span className="text-emerald-700">₹{order.amount || 0}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total for {orders.length} order(s):</span>
              <span className="text-emerald-700 font-bold">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-emerald-700 mb-4">Select Payment Method</h3>
          <div className="space-y-3">
            {paymentOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                  selected === option.id
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-300 hover:border-emerald-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={selected === option.id}
                    onChange={() => setSelected(option.id)}
                    className="w-5 h-5 text-emerald-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Details Form */}
        {selected === "upi" && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">UPI ID</label>
            <input
              type="text"
              placeholder="e.g., yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-600 focus:outline-none"
            />
          </div>
        )}

        {selected === "card" && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
            <input
              type="text"
              placeholder="16-digit card number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-600 focus:outline-none"
            />
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes("successful")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/usermenu")}
            className="flex-1 bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || !selected}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : `Pay ₹${amount || 0}`}
          </button>
        </div>
      </div>
    </div>
  );
}

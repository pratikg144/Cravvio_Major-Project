import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from './config/api';
import CravvioChatbot from './Chatbot';

/* --- Image imports (adjust paths if needed) --- */
import userImg from "./images/user.png";
import profileIcon from "./images/profile.png";
import settingIcon from "./images/setting.png";
import helpIcon from "./images/help.png";
import logoutIcon from "./images/logout.png";

import pastaImg from "./images/red_Sauce_PASTA.jpg";
import burgerImg from "./images/cheese_Burger.jpg";
import pizzaImg from "./images/Pizza_Photo.jpg";
import saladImg from "./images/Greek_Salad.jpg";
import curryImg from "./images/Indian_Curry.jpg";
import chickenTikkaImg from "./images/chicken_Tikka.jpg";
import paneerImg from "./images/paneer_Butter_Masala.jpg";
import biryaniImg from "./images/veg_biryani.jpg";

/* ---------- Food Data (fallback if API empty) ---------- */
const foodsSeed = [];

export default function UserMenuPage() {
  const navigate = useNavigate();

  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [foods, setFoods] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const profileRef = useRef(null);
  const cartRef = useRef(null);

  const cartTotal = cart.reduce((s, it) => s + it.price * it.qty, 0);

  /* ---------- Fetch User Profile ---------- */
  useEffect(() => {
    let mounted = true;
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get('/api/auth/user/profile');
        if (mounted) {
          setUser(response.data.user);
          setUserLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch user profile', err);
        if (err.response?.status === 401) navigate('/login');
        setUserLoading(false);
      }
    };
    fetchUserProfile();
    return () => { mounted = false; };
  }, [navigate]);

  /* ---------- Outside Click Handling ---------- */
  useEffect(() => {
    function docClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (cartRef.current && !cartRef.current.contains(e.target)) setCartOpen(false);
    }
    document.addEventListener("click", docClick);
    return () => document.removeEventListener("click", docClick);
  }, []);


  useEffect(() => {
    const spotlight = document.querySelector(".spotlight");
    const handleMouseMove = (e) => {
      if (spotlight) {
        spotlight.style.setProperty("--x", `${e.clientX}px`);
        spotlight.style.setProperty("--y", `${e.clientY}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  /* ---------- Fetch Foods ---------- */
  useEffect(() => {
    let mounted = true;
    apiClient.get('/api/food')
      .then(res => {
        if (mounted) setFoods(res.data.foodItems || []);
      })
      .catch(err => console.error('Failed to fetch foods', err));

    return () => { mounted = false; };
  }, []);

  /* ---------- Cart Logic ---------- */
  const addToCart = (food) => {
    const normalized = {
      id: food.id || food._id,
      name: food.name || food.desc || 'Item',
      price: food.price || 0,
      vendorId: food.vendorId?._id || food.vendorId || null,
      vendorName: food.vendorId?.CompanyName || 'Unknown Vendor',
    };

    setCart((prev) => {
      const found = prev.find((x) => x.id === normalized.id);
      if (found) {
        return prev.map((x) => (x.id === normalized.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...prev, { ...normalized, qty: 1 }];
    });
    setCartOpen(true);
  };

  const increaseQty = (id) =>
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x))
    );

  const decreaseQty = (id) =>
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
          .filter((x) => x.qty > 0)
    );

  /* ---------- Navigation (FINAL VERSION — FIXED) ---------- */
  const navTo = (path) => {
    if (path === "/logout") {
      handleLogout();
    } else {
      navigate(path);
      setProfileOpen(false);
    }
  };

  /* ---------- Logout ---------- */
  const handleLogout = async () => {
    try {
      await apiClient.get('/api/auth/user/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('auth');
      navigate('/login');
    }
  };

  /* ---------- Payment + Order ---------- */
  const placeOrder = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    try {
      const ordersByVendor = {};

      cart.forEach(item => {
        const vendorId = item.vendorId;
        if (!ordersByVendor[vendorId]) {
          ordersByVendor[vendorId] = {
            vendorId,
            vendorName: item.vendorName,
            items: [],
            total: 0
          };
        }
        ordersByVendor[vendorId].items.push({
          foodId: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty
        });
        ordersByVendor[vendorId].total += item.price * item.qty;
      });

      const createdOrders = [];
      for (const vendorId in ordersByVendor) {
        const order = ordersByVendor[vendorId];
        const res = await apiClient.post('/api/food/order', {
          vendorId: order.vendorId,
          items: order.items,
          total: order.total
        });
        createdOrders.push({
          orderId: res.data.order._id,
          vendorId: order.vendorId,
          vendorName: order.vendorName,
          amount: order.total,
          items: order.items
        });
      }

      if (createdOrders.length === 1) {
        const single = createdOrders[0];
        navigate('/payments', {
          state: {
            orderId: single.orderId,
            vendorId: single.vendorId,
            vendorName: single.vendorName,
            amount: single.amount,
            items: single.items,
            totalAmount: cartTotal,
            itemCount: cart.length
          }
        });
      } else {
        navigate('/payments', {
          state: {
            orders: createdOrders,
            totalAmount: cartTotal,
            itemCount: cart.length
          }
        });
      }

      setCart([]);
      setCartOpen(false);
    } catch (err) {
      console.error('Order error', err);
      alert(err.response?.data?.message || 'Failed to place order');
    }
  };

  /* ---------- Subscriptions (create + navigate to payment) ---------- */
  const handleBuyPlan = async (plan, price, months = 1) => {
    try {
      const res = await apiClient.post('/api/payment/subscription/create', { plan, price, months });
      const subscription = res.data.subscription;
      // Navigate to payments page with subscription data
      navigate('/payments', { state: { subscription, totalAmount: price } });
    } catch (err) {
      console.error('Subscription create error', err);
      alert(err.response?.data?.message || 'Failed to create subscription');
    }
  };

  /* ---------- Flip Logic ---------- */
  const toggleFlip = (id) => setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="bg-gradient-to-r from-[#f3f8ea] to-[#e9f5d0] text-gray-800 font-poppins ">
        
       <div className="spotlight"></div>


      {/* Flip Styles */}
      <style>{`
        .flip-card { perspective: 1000px; }
        .flip-inner { transition: transform 0.75s; transform-style: preserve-3d; }
        .flipped { transform: rotateY(180deg); }
        .flip-face { backface-visibility: hidden; position: absolute; inset: 0; }
        .flip-back { transform: rotateY(180deg); }
      `}</style>

      {/* -------- HEADER -------- */}
      <header className="bg-emerald-100 items-center bg-white shadow-md px-4 sm:px-10 py-4 py-4 shadow sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-emerald-700">Cravvio</h1>
          </div>

          <nav className="flex flex-wrap gap-3 md:gap-6 font-medium items-center">
            <button onClick={() => navTo("/")} className="hover:text-emerald-600 text-sm sm:text-base whitespace-nowrap">Home</button>
            <button onClick={() => navTo("/feature")} className="hover:text-emerald-600 text-sm sm:text-base whitespace-nowrap">Features</button>
            <button onClick={() => navTo("/about")} className="hover:text-emerald-600 text-sm sm:text-base whitespace-nowrap">About</button>
            <button onClick={() => navTo("/support")} className="hover:text-emerald-600 text-sm sm:text-base whitespace-nowrap">Contact</button>
          </nav>

          {/* PROFILE + CART */}
          <div className="flex gap-4 items-center">

            {/* CART BUTTON */}
            <button
              onClick={() => setCartOpen(!isCartOpen)}
              className="relative px-4 py-2 bg-gradient-to-br from-lime-700 to-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center gap-2"
            >
              🛒 Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>

            {/* PROFILE MENU */}
            <div ref={profileRef} className="relative">
              <button onClick={(e) => { e.stopPropagation(); setProfileOpen(!isProfileOpen); }}>
                <img src={userImg} className="h-10 w-10 rounded-full" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
                  <div className="flex items-center gap-3">
                    <img src={userImg} className="h-12 w-12 rounded-full" />
                    <div>
                      <div className="font-bold">{user?.username || "User"}</div>
                      <div className="text-xs text-slate-500">{user?.email || ""}</div>
                      {user?.role === 'admin' && <div className="text-xs text-emerald-600 font-semibold">👑 Admin</div>}
                    </div>
                  </div>
                  <hr className="my-3" />
                  <button onClick={() => navTo("/user")} className="flex items-center gap-2 p-2 hover:bg-emerald-50 w-full rounded text-sm"><img src={profileIcon} className="h-7" />Edit Profile</button>
                  {user?.role === 'admin' && (
                    <>
                      <button onClick={() => navTo("/admin-subscriptions")} className="flex items-center gap-2 p-2 hover:bg-blue-50 w-full rounded text-sm text-blue-700 font-semibold">
                        🔧 Admin Panel
                      </button>
                      <hr className="my-2" />
                    </>
                  )}
                  <button onClick={() => navTo("/settings")} className="flex items-center gap-2 p-2 hover:bg-emerald-50 w-full rounded text-sm"><img src={settingIcon} className="h-7" />Settings</button>
                  <button onClick={() => navTo("/help")} className="flex items-center gap-2 p-2 hover:bg-emerald-50 w-full rounded text-sm"><img src={helpIcon} className="h-7" />Help</button>
                  <button onClick={() => navTo("/logout")} className="flex items-center gap-2 p-2 hover:bg-red-50 w-full rounded text-sm text-red-600"><img src={logoutIcon} className="h-7" />Logout</button>
                </div>
              )}
            </div>

            {/* CART DRAWER */}
            {isCartOpen && (
              <div className="fixed inset-0 z-50">

                <div onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/40"></div>

                <div className="absolute right-0 top-0 h-full w-[360px] bg-white shadow-xl flex flex-col">

                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold text-emerald-700">Your Cart</h2>
                    <button onClick={() => setCartOpen(false)} className="text-xl">✖</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center mt-10">Your cart is empty</p>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{item.name}</h3>
                              <p className="text-xs text-emerald-600 font-medium">{item.vendorName}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                ₹{item.price} × {item.qty} = ₹{(item.price * item.qty).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => decreaseQty(item.id)}
                              className="px-2 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
                            >
                              -
                            </button>

                            <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>

                            <button
                              onClick={() => increaseQty(item.id)}
                              className="px-2 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                  </div>

                  <div className="p-4 border-t">
                    <div className="flex justify-between font-bold mb-3">
                      <span>Total</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={placeOrder}
                      className="w-full bg-gradient-to-br from-lime-500 to-emerald-700 text-white py-2 rounded font-semibold hover:bg-emerald-800 transition"
                    >
                      Place Order
                    </button>
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      </header>

      {/* -------- MENU GRID -------- */}
      <main className="max-w-6xl mx-auto px-4 py-10">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(foods.length ? foods : foodsSeed).map((food) => (
            <div
              key={food._id || food.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col"
            >
              <img
                src={food.image || food.img}
                alt={food.name}
                className="w-full h-40 object-cover bg-gray-200"
              />

              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-emerald-700">{food.name}</h3>

                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  {food.vendorId?.CompanyName || 'Unknown Vendor'}
                </p>

                <p className="text-sm text-gray-500 mt-1 flex-grow">
                  {food.description || food.desc || 'Delicious food'}
                </p>

                {(food.calories || food.rating) && (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    {food.calories && <div>🔥 Calories: {food.calories}</div>}
                    {food.rating && <div>💚 Rating: {food.rating}</div>}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-extrabold text-gray-800">₹{food.price || 0}</span>

                  <button
                    onClick={() => {
                      addToCart(food);
                      setCartOpen(true);
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-emerald-700 transition"
                  >
                    Add
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* -------- SUBSCRIPTIONS -------- */}
<section className="mt-16 bg-gradient-to-b from-lime-500 rounded-2xl p-10">
  <div className="text-center mb-10">
    <h2 className="text-3xl font-extrabold text-white">
      Hungry Every Day? Choose Your Plan
    </h2>
    <p className="text-gray-100 mt-2">
      Get unlimited meals every month with Cravvio.
    </p>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

    {/* BASIC */}
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col hover:scale-[1.03] transition-transform">
      <h3 className="text-2xl font-bold">Basic Plan</h3>
      <p className="text-3xl font-extrabold mt-2">₹1299</p>

      <ul className="mt-4 space-y-2 text-sm text-gray-600 flex-grow">
        <li>✅ 20 meals</li>
        <li>✅ Free delivery</li>
        <li>✅ Full menu access</li>
      </ul>

      <button
        onClick={() => handleBuyPlan('Basic', 1299, 1)}
        className="mt-6 w-full bg-emerald-600 text-white py-2 rounded-lg"
      >
        Buy Now
      </button>
    </div>

    {/* STANDARD (Highlight) */}
    <div className="bg-green-600 text-white rounded-2xl shadow-2xl p-6 flex flex-col relative hover:scale-[1.03] transition-transform">
      <span className="absolute -top-3 right-4 bg-yellow-400 text-black px-3 py-1 rounded text-sm font-bold">
        MOST POPULAR
      </span>

      <h3 className="text-2xl font-bold">Standard Plan</h3>
      <p className="text-3xl font-extrabold mt-2">₹1999</p>

      <ul className="mt-4 space-y-2 text-sm flex-grow">
        <li>✅ 50 meals</li>
        <li>✅ Priority delivery</li>
        <li>✅ Weekly offers</li>
      </ul>

      <button
        onClick={() => handleBuyPlan('Standard', 1999, 1)}
        className="mt-6 w-full bg-white text-emerald-700 py-2 rounded-lg font-bold"
      >
        Buy Now
      </button>
    </div>

    {/* PREMIUM */}
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col hover:scale-[1.03] transition-transform">
      <h3 className="text-2xl font-bold">Premium Plan</h3>
      <p className="text-3xl font-extrabold mt-2">₹2999</p>

      <ul className="mt-4 space-y-2 text-sm text-gray-600 flex-grow">
        <li>✅ Unlimited meals</li>
        <li>✅ VIP support</li>
        <li>✅ Chef specials</li>
      </ul>

      <button
        onClick={() => handleBuyPlan('Premium', 2999, 1)}
        className="mt-6 w-full bg-emerald-600 text-white py-2 rounded-lg"
      >
        Buy Now
      </button>
    </div>

     {/* GOLD */}
    <div className="bg-yellow-300 rounded-2xl shadow-xl p-6 flex flex-col hover:scale-[1.03] transition-transform">
      <h3 className="text-2xl font-bold">GOLD Plan</h3>
      <p className="text-3xl font-extrabold mt-2">₹3999</p>

      <ul className="mt-4 space-y-2 text-sm text-gray-600 flex-grow">
        <li>✅ Unlimited meals</li>
        <li>✅ VIP support</li>
        <li>✅ Chef specials</li>
        <li>✅ Free dessert every week</li>
        <li>✅ Exclusive GOLD badge</li>

      </ul>

      <button
        onClick={() => handleBuyPlan('Gold', 3999, 1)}
        className="mt-6 w-full bg-emerald-600 text-white py-2 rounded-lg"
      >
        Buy Now
      </button>
    </div>
    

  </div>
</section>


      </main>

      {/* -------- FOOTER -------- */}
      <footer className="bg-emerald-900 text-white mt-16 py-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 px-4">
          <div><p className="text-2xl font-extrabold text-emerald-700">© 2027 Cravvio</p></div>
          <div><b>Contact</b><p className="text-sm">623 Harrison St, SF</p></div>
          <div><b>Account</b><p className="text-sm">Create | Login</p></div>
          <div><b>Company</b><p className="text-sm">About | Careers</p></div>
        </div>
      </footer>

      <CravvioChatbot />
    </div>
  );
}

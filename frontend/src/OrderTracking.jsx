// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// export default function OrderTracking() {
//   const { id } = useParams();
//   const [order, setOrder] = useState(null);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       axios
//         .get(`http://localhost:3000/api/payment/tracking/${id}`)
//         .then((res) => setOrder(res.data))
//         .catch((err) => console.error(err));
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [id]);

//   if (!order) return <h2>Loading...</h2>;

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial" }}>
//       <h2>🚚 Order Tracking</h2>

//       <div style={{ marginTop: "20px" }}>
//         <p>
//           <b>Status:</b> {order.status}
//         </p>
//         <p>
//           <b>ETA:</b> {order.eta} mins
//         </p>
//       </div>

//       <h3 style={{ marginTop: "30px" }}>Order Progress</h3>

//       <ul style={{ listStyle: "none", padding: 0 }}>
//         {[
//           "paid",
//           "preparing",
//           "agent_arrived",
//           "picked_up",
//           "on_the_way",
//           "delivered",
//         ].map((step, index) => (
//           <li
//             key={index}
//             style={{
//               padding: "10px",
//               margin: "5px 0",
//               borderRadius: "8px",
//               background:
//                 order.status === step ? "#4caf50"
//                 : (
//                   index <
//                   [
//                     "paid",
//                     "preparing",
//                     "agent_arrived",
//                     "picked_up",
//                     "on_the_way",
//                     "delivered",
//                   ].indexOf(order.status)
//                 ) ?
//                   "#a5d6a7"
//                 : "#eee",
//               color: order.status === step ? "white" : "black",
//             }}
//           >
//             {step.replaceAll("_", " ").toUpperCase()}
//           </li>
//         ))}
//       </ul>

//       <h3 style={{ marginTop: "30px" }}>📍 Delivery Location</h3>
//       <p>Lat: {order.deliveryLocation?.lat}</p>
//       <p>Lng: {order.deliveryLocation?.lng}</p>
//       <h3 style={{ marginTop: "30px" }}>📍 Delivery Location</h3>
//       <p>Lat: {order.deliveryLocation?.lat}</p>
//       <p>Lng: {order.deliveryLocation?.lng}</p>

//       {/* 🔥 PASTE MAP HERE */}
//       <h3 style={{ marginTop: "30px" }}>🗺️ Live Map</h3>

//       <MapContainer
//         center={[
//           order.deliveryLocation?.lat || 26.45,
//           order.deliveryLocation?.lng || 80.33,
//         ]}
//         zoom={15}
//         style={{ height: "300px", width: "100%", marginTop: "10px" }}
//       >
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//         <Marker
//           position={[order.deliveryLocation?.lat, order.deliveryLocation?.lng]}
//         >
//           <Popup>🚚 Delivery Agent</Popup>
//         </Marker>
//       </MapContainer>
//     </div>
//   );
// }

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// 🔥 Custom delivery icon (bike style)
// const deliveryIcon = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png",
//   iconSize: [45, 45],
// });

const deliveryIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
  iconSize: [45, 45],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// 🏠 User icon
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946436.png",
  iconSize: [35, 35],
});

// 🍽️ Vendor icon
const vendorIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
  iconSize: [35, 35],
});

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [animatedPosition, setAnimatedPosition] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get(`http://localhost:3000/api/payment/tracking/${id}`)
        .then((res) => setOrder(res.data))
        .catch((err) => console.error(err));
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    // 🔁 API CALL
  }, [id]);

  // 🔥 ADD THIS NEW ONE BELOW
  useEffect(() => {
    if (!order?.deliveryLocation) return;

    const target = order.deliveryLocation;

    if (!animatedPosition) {
      setAnimatedPosition(target);
      return;
    }

    const duration = 1000;
    const steps = 20;
    let currentStep = 0;

    const latDiff = (target.lat - animatedPosition.lat) / steps;
    const lngDiff = (target.lng - animatedPosition.lng) / steps;

    const interval = setInterval(() => {
      currentStep++;

      setAnimatedPosition((prev) => ({
        lat: prev.lat + latDiff,
        lng: prev.lng + lngDiff,
      }));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [order]);

  if (!order) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>🚚 Order Tracking</h2>

      <div style={{ marginTop: "20px" }}>
        <p>
          <b>Status:</b> {order.status}
        </p>
        <p>
          <b>ETA:</b> {order.eta} mins
        </p>
      </div>

      {/* 🔥 TIMELINE */}
      <h3 style={{ marginTop: "30px" }}>Order Progress</h3>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {[
          "paid",
          "preparing",
          "agent_arrived",
          "picked_up",
          "on_the_way",
          "delivered",
        ].map((step, index) => (
          <li
            key={index}
            style={{
              padding: "10px",
              margin: "6px 0",
              borderRadius: "8px",
              background:
                order.status === step ? "#4caf50"
                : (
                  index <
                  [
                    "paid",
                    "preparing",
                    "agent_arrived",
                    "picked_up",
                    "on_the_way",
                    "delivered",
                  ].indexOf(order.status)
                ) ?
                  "#a5d6a7"
                : "#eee",
              color: order.status === step ? "white" : "black",
            }}
          >
            {step.replaceAll("_", " ").toUpperCase()}
          </li>
        ))}
      </ul>

      {/* 🔥 MAP */}
      <h3 style={{ marginTop: "30px" }}>🗺️ Live Delivery Map</h3>

      <MapContainer
        center={[
          order.deliveryLocation?.lat || 26.45,
          order.deliveryLocation?.lng || 80.33,
        ]}
        zoom={14}
        style={{
          height: "380px",
          width: "100%",
          marginTop: "15px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 🍽️ Vendor */}
        {order.vendorLocation && (
          <Marker
            position={[order.vendorLocation.lat, order.vendorLocation.lng]}
            icon={vendorIcon}
          >
            <Popup>🍽️ Restaurant</Popup>
          </Marker>
        )}

        {/* 🏠 User */}
        {order.userLocation && (
          <Marker
            position={[order.userLocation.lat, order.userLocation.lng]}
            icon={userIcon}
          >
            <Popup>🏠 Your Location</Popup>
          </Marker>
        )}

        {/* 🚚 Delivery Agent (ONLY AFTER ARRIVAL) */}
        {order.deliveryLocation &&
          ["agent_arrived", "picked_up", "on_the_way", "delivered"].includes(
            order.status,
          ) && (
            <Marker
              position={[animatedPosition?.lat, animatedPosition?.lng]}
              icon={deliveryIcon}
            >
              <Popup>🛵 Delivery Agent</Popup>
            </Marker>
          )}

        {/* 🔥 ROUTE LINE */}
        {order.userLocation &&
          order.vendorLocation &&
          order.deliveryLocation && (
            <Polyline
              positions={[
                [order.vendorLocation.lat, order.vendorLocation.lng],
                [order.deliveryLocation.lat, order.deliveryLocation.lng],
                [order.userLocation.lat, order.userLocation.lng],
              ]}
              pathOptions={{ color: "blue", weight: 4 }}
            />
          )}
      </MapContainer>

      {/* 🔥 SPACE BELOW MAP */}
      <div style={{ height: "50px" }}></div>
    </div>
  );
}

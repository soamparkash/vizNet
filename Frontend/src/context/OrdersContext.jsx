import React, { createContext, useContext, useEffect, useState } from "react";

const OrdersContext = createContext();
const API_URL = "http://localhost:5000/api/orders";

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  // ================= USER ORDERS =================
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE ORDER =================
  const addOrder = async (orderData) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setOrders(prev => [data, ...prev]);
  };

  // ================= ADMIN =================
  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/all`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setOrders(prev =>
      prev.map(o => (o._id === id ? data : o))
    );
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        error,
        fetchOrders,
        fetchAllOrders,
        addOrder,
        updateOrderStatus
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);

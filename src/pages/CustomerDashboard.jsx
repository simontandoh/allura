import React from "react";
import { useAuth } from "../context/AuthContext";

const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-burgundy text-gold flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-elegant mb-4">Welcome, {user?.email}</h1>
      <p className="opacity-80 mb-8">
        This will soon display your orders, profile, and account settings.
      </p>
      <div className="grid gap-4">
        <button className="btn-gold w-64">View Orders</button>
        <button className="btn-gold w-64">Edit Profile</button>
        <button className="btn-outline-gold w-64">Logout</button>
      </div>
    </div>
  );
};

export default CustomerDashboard;

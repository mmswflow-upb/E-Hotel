import { useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export function useCustomer(customerId) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role } = useAuth();

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) {
        setLoading(false);
        return;
      }

      // Only fetch customer details if the user is a staff member
      const isStaff = ["Receptionist", "HotelManager", "SystemAdmin"].includes(
        role
      );
      if (!isStaff) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/customers/${customerId}`);
        setCustomer(response.data);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to fetch customer details"
        );
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, role]);

  return { customer, loading, error };
}

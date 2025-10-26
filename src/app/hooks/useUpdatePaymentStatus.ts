import { useState, useEffect } from "react";
import axios from "axios";

const useUpdatePaymentStatus = (session_id: string | null) => {
  const [loading, setLoading] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const updatePaymentStatus = async (session_id: string) => {
      try {
        await axios.put("/api/payment/verify", {
          stripePaymentId: session_id,
          status: "SUCCESS",
        });
        console.log("Payment status updated successfully");
      } catch (error) {
        console.error("Error updating payment status:", error);
      }
    };

    if (session_id && !isUpdated) {
      updatePaymentStatus(session_id).then(() => {
        if (isMounted) {
          setIsUpdated(true);
          setLoading(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [session_id, isUpdated]);

  return { loading, isUpdated };
};

export default useUpdatePaymentStatus;

"use client";

import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import CheckoutForm from "./checkout-form";
import Button from "../components/button";

const CheckoutClient = () => {
  const router = useRouter();
  const { cartProducts, paymentIntent, handleSetPaymentIntent, handleClearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const hasRunOnce = useRef(false);
  const [orderId, setOrderId] = useState<string | null>(null);


  useEffect(() => {
    if (hasRunOnce.current) return;
    hasRunOnce.current = true;

      if (cartProducts && cartProducts.length > 0) {
      setLoading(true);
        setError(null);
      // Always create a fresh order (don't pass old payment_intent_id)
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartProducts,
          payment_intent_id: null,
        }),
      })
          .then(async (res) => {
              setLoading(false);
              if (res.status === 401) {
                return router.push("/login");
              }

              const json = await res.json().catch(() => ({}));

              if (!res.ok) {
                const message = json?.error || `HTTP ${res.status}`;
                // If stock issue, redirect to cart so user can adjust quantities
                if (res.status === 400) {
                  setError(message);
                  toast.error(message);
                  router.push("/cart");
                  return Promise.reject(new Error(message));
                }

                return Promise.reject(new Error(message));
              }

              // Log response for debugging in case orderId is missing
              console.debug("create-payment-intent response json:", json);

              return json;
            })
          .then((data) => {
            if (data?.orderId) {
              setOrderId(data.orderId);
              console.log("Order ID:", data.orderId);
              handleSetPaymentIntent(data.orderId);
            } else {
              throw new Error("No orderId in response");
            }
          })
          .catch((error: any) => {
            const message = error?.message || "Something went wrong. Please try again.";
            setError(message);
            console.error("Checkout error:", error);
            toast.error(message);
          });
    }
  }, []);

  const handleSetPaymentSuccess = useCallback(
    (value: boolean) => {
      setPaymentSuccess(value);
      if (value) {
        // Show success notification with payment instructions
        toast.success(
          (t) => (
            <div className="text-sm">
              <p className="font-semibold mb-2">Order placed successfully!</p>
              <p className="mb-2">Kindly pay to the account details provided.</p>
              <p className="mb-2">Then tick "I have paid" on your order when done.</p>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="mt-3 px-3 py-1 bg-white text-teal-600 rounded font-medium text-xs"
              >
                Dismiss
              </button>
            </div>
          ),
          { duration: 8000 }
        );
        // Reset payment state after successful checkout
        handleClearCart();
        handleSetPaymentIntent(null);
      }
    },
    [cartProducts, paymentIntent, handleClearCart, handleSetPaymentIntent]
  );

  return (
    <div className="w-full">
      {loading && <div className="text-center">Loading Checkout...</div>}
      {error && (
        <div className="text-center text-rose-500">Something went wrong...</div>
      )}
      {paymentSuccess && (
        <div className="flex items-center flex-col gap-4">
          <div className="text-teal-500 text-center">Order Placed Successfully</div>
          <div className="max-w-[220px] w-full">
            <Button
              label={`View Your Order`}
              onClick={() => router.push(`/order/${orderId}`)}
            />
          </div>
        </div>
      )}
      {cartProducts && (
        <CheckoutForm
          handleSetPaymentSuccess={handleSetPaymentSuccess}
        />
      )}
    </div>
  );
};

export default CheckoutClient;

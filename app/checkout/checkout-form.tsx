"use client";

import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/utils/format-price";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Heading from "../components/heading";
import Button from "../components/button";

interface CheckoutFormProps {
  handleSetPaymentSuccess: (value: boolean) => void;
}

interface BankDetails {
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  handleSetPaymentSuccess,
}) => {
  const { cartTotalAmount, handleClearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const formattedPrice = formatPrice(cartTotalAmount);

  // Fetch bank details on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setBankDetails(data))
      .catch((error) => {
        console.error("Failed to fetch bank details:", error);
        toast.error("Failed to load payment details");
      });
  }, []);
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Order made successfully!");
      handleClearCart();
      handleSetPaymentSuccess(true);
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6">
        <Heading title="Enter your details to complete checkout" />
      </div>

      <div className="space-y-6">
        {/* Delivery Information */}
        <div>
          <h2 className="font-semibold mb-4">Delivery Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Bank Payment Information */}
        <div>
          <h2 className="font-semibold mb-4">Payment Details</h2>
          {bankDetails ? (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="text-lg font-semibold text-gray-800">{bankDetails.bankName || "Not configured"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Holder</p>
                <p className="text-lg font-semibold text-gray-800">{bankDetails.accountHolderName || "Not configured"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="text-lg font-semibold text-gray-800">{bankDetails.bankAccountNumber || "Not configured"}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              Loading payment details...
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="py-4 text-center text-slate-700 text-xl font-bold">
        Total Amount: {formattedPrice}
      </div>

      {/* Submit Button */}
      <Button
        label={isLoading ? "Processing..." : "Confirm Order"}
        isLoading={isLoading}
        disabled={isLoading}
        type="submit"
      />

      <p className="text-xs text-gray-500 mt-4 text-center">
        Clicking this link will redirect you to full details of your order
      </p>
    </form>
  );
};

export default CheckoutForm;

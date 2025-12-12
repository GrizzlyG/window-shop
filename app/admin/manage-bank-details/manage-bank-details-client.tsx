"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/app/components/button";
import Heading from "@/app/components/heading";

interface BankDetails {
  id?: string;
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
  updatedAt?: string;
}

export default function ManageBankDetailsClient() {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: "",
    bankAccountNumber: "",
    accountHolderName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch current bank details
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          if (data && data.bankName) {
            setBankDetails(data);
          }
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchBankDetails();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankDetails),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update bank details");
      }

      const updatedData = await response.json();
      setBankDetails(updatedData);
      toast.success("Bank details updated successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
      console.error("Error updating bank details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Heading title="Manage Bank Details" />
      <p className="text-gray-600 mb-6">
        These are the bank account details customers will see during checkout.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Name *
          </label>
          <input
            type="text"
            name="bankName"
            value={bankDetails.bankName}
            onChange={handleInputChange}
            placeholder="e.g., Chase Bank"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Holder Name *
          </label>
          <input
            type="text"
            name="accountHolderName"
            value={bankDetails.accountHolderName}
            onChange={handleInputChange}
            placeholder="e.g., John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Account Number *
          </label>
          <input
            type="text"
            name="bankAccountNumber"
            value={bankDetails.bankAccountNumber}
            onChange={handleInputChange}
            placeholder="e.g., 123456789"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex gap-4">
          <Button
            label={isLoading ? "Saving..." : "Save Bank Details"}
            disabled={isLoading}
            type="submit"
          />
        </div>

        {bankDetails.updatedAt && (
          <p className="text-sm text-gray-500">
            Last updated: {new Date(bankDetails.updatedAt).toLocaleString()}
          </p>
        )}
      </form>

      {/* Preview Section */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-lg mb-4">Preview (As seen by customers)</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Bank Name</p>
            <p className="text-lg font-semibold text-gray-800">
              {bankDetails.bankName || "Not configured"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Account Holder</p>
            <p className="text-lg font-semibold text-gray-800">
              {bankDetails.accountHolderName || "Not configured"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Account Number</p>
            <p className="text-lg font-semibold text-gray-800">
              {bankDetails.bankAccountNumber || "Not configured"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

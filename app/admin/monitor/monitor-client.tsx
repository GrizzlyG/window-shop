
"use client";

import { Order, Settings } from "@prisma/client";
import { useEffect, useState } from "react";
import Heading from "@/app/components/heading";
import { formatPrice } from "@/utils/format-price";
import Button from "@/app/components/button";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import Input from "@/app/components/inputs/input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

interface MonitorClientProps {
  orders: Order[];
  settings: Settings | null;
}

const MonitorClient: React.FC<MonitorClientProps> = ({ orders, settings }) => {
  const router = useRouter();
  const [toReimburse, setToReimburse] = useState(0);
  const [totalReimbursed, setTotalReimbursed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingSpf, setIsUpdatingSpf] = useState(false);
  const [isUpdatingDeliveryTime, setIsUpdatingDeliveryTime] = useState(false);
  const [isUpdatingWhatsapp, setIsUpdatingWhatsapp] = useState(false);

  // SPF Form
  const spfForm = useForm<FieldValues>({
    defaultValues: {
      spf: settings?.spf || 100,
    },
  });

  // Helper to format ISO date to 'YYYY-MM-DDTHH:mm' for datetime-local
  function formatDateTimeLocal(dateString?: string | null) {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Pad with zeros
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  // Delivery Time Form
  const deliveryForm = useForm<FieldValues>({
    defaultValues: {
      deliveryTime: formatDateTimeLocal(settings?.nextDeliveryTime),
    },
  });

  // Keep form value in sync if settings change
  useEffect(() => {
    deliveryForm.setValue("deliveryTime", formatDateTimeLocal(settings?.nextDeliveryTime));
  }, [settings?.nextDeliveryTime]);

  // WhatsApp Form
  const whatsappForm = useForm<FieldValues>({
    defaultValues: {
      whatsappNumber: (settings as any)?.whatsappNumber || "",
    },
  });

  useEffect(() => {
    if (settings?.spf) {
      spfForm.setValue("spf", settings.spf);
    }
    if ((settings as any)?.whatsappNumber) {
      whatsappForm.setValue("whatsappNumber", (settings as any).whatsappNumber);
    }
  }, [settings]);

  useEffect(() => {
    // Calculate total sale, DMC, and SPF from non-reimbursed orders only
    const totalSale = orders.reduce((acc, order) => {
      if (order.paymentConfirmed && !(order as any).reimbursed) {
        return acc + order.amount;
      }
      return acc;
    }, 0);

    const totalDmc = orders.reduce((acc, order) => {
      if (order.paymentConfirmed && !(order as any).reimbursed) {
        const orderDmc = (order as any).totalDmc ?? 
          ((order.products as any[])?.reduce((dmcAcc, product) => {
            return dmcAcc + ((product.dmc || 0) * (product.quantity || 0));
          }, 0) || 0);
        return acc + orderDmc;
      }
      return acc;
    }, 0);

    const totalSpf = orders.reduce((acc, order) => {
      if (order.paymentConfirmed && !(order as any).reimbursed) {
        const orderSpf = (order as any).spf ?? 
          ((order.products as any[])?.reduce((spfAcc, product) => {
            return spfAcc + ((product.spf || 0) * (product.quantity || 0));
          }, 0) || 0);
        return acc + orderSpf;
      }
      return acc;
    }, 0);
    setToReimburse(totalSale - totalDmc - totalSpf);
  }, [orders]);

  useEffect(() => {
    // Fetch total reimbursed from API
    const fetchTotalReimbursed = async () => {
      try {
        const response = await axios.get("/api/reimbursement/total");
        setTotalReimbursed(response.data.total || 0);
      } catch (error) {
        console.error("Error fetching total reimbursed:", error);
      }
    };

    fetchTotalReimbursed();
  }, []);

  const handleConfirmReimbursement = async () => {
    if (toReimburse <= 0) {
      toast.error("No amount to reimburse");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/reimbursement/confirm", {
        amount: toReimburse,
      });
      
      setTotalReimbursed(response.data.totalReimbursed);
      setToReimburse(0);
      toast.success(`Reimbursement of ${formatPrice(toReimburse)} confirmed!`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to confirm reimbursement");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitSpf: SubmitHandler<FieldValues> = async (data) => {
    setIsUpdatingSpf(true);
    try {
      await axios.put("/api/settings/spf", {
        spf: parseFloat(data.spf),
      });
      toast.success("SPF updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update SPF");
      console.error(error);
    } finally {
      setIsUpdatingSpf(false);
    }
  };

  const onSubmitDeliveryTime: SubmitHandler<FieldValues> = async (data) => {
    if (!data.deliveryTime) {
      toast.error("Please select a delivery date and time");
      return;
    }

    // Parse the datetime-local string (YYYY-MM-DDTHH:mm)
    const selectedTime = new Date(data.deliveryTime);

    // Validate time range (10 minutes to 7 days from now)
    const now = new Date();
    const diffMinutes = (selectedTime.getTime() - now.getTime()) / (1000 * 60);

    if (diffMinutes < 10) {
      toast.error("Delivery time must be at least 10 minutes from now");
      return;
    }

    if (diffMinutes > 10080) { // 7 days = 10080 minutes
      toast.error("Delivery time cannot be more than 7 days from now");
      return;
    }

    setIsUpdatingDeliveryTime(true);
    try {
      await axios.put("/api/settings/delivery-time", {
        nextDeliveryTime: selectedTime.toISOString(),
      });
      toast.success("Next delivery time set successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to set delivery time");
      console.error(error);
    } finally {
      setIsUpdatingDeliveryTime(false);
    }
  };

  const onSubmitWhatsapp: SubmitHandler<FieldValues> = async (data) => {
    if (!data.whatsappNumber) {
      toast.error("Please enter a WhatsApp number");
      return;
    }

    setIsUpdatingWhatsapp(true);
    try {
      await axios.put("/api/settings/whatsapp", {
        whatsappNumber: data.whatsappNumber,
      });
      toast.success("WhatsApp number updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update WhatsApp number");
      console.error(error);
    } finally {
      setIsUpdatingWhatsapp(false);
    }
  };

  return (
    <div className="max-w-[800px] m-auto">
      <div className="mb-6 mt-6">
        <Heading title="Reimbursement Monitor" center />
        <p className="text-center text-slate-500 mt-2">
          Track and confirm seller reimbursements
        </p>
      </div>

      {/* SPF Settings Card */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📦</span>
          <div className="text-slate-700 text-lg font-semibold">
            Sorting & Packaging Fee (SPF)
          </div>
        </div>
        <form onSubmit={spfForm.handleSubmit(onSubmitSpf)} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              id="spf"
              label="SPF Amount (₦)"
              type="number"
              disabled={isUpdatingSpf}
              register={spfForm.register}
              errors={spfForm.formState.errors}
              required
            />
          </div>
          <div className="w-full sm:w-auto">
            <Button
              label={isUpdatingSpf ? "Updating..." : "Update SPF"}
              disabled={isUpdatingSpf}
              type="submit"
            />
          </div>
        </form>
        <p className="text-slate-500 text-sm mt-3">
          This fee will be added to customer&apos;s total at checkout
        </p>
      </div>

      {/* Next Delivery Time Card */}
      <div className="bg-amber-50 rounded-lg p-6 border border-amber-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🚚</span>
          <div className="text-slate-700 text-lg font-semibold">
            Next Delivery Time
          </div>
        </div>
        {settings?.nextDeliveryTime && (
          <div className="mb-4 p-3 bg-white rounded border border-amber-300">
            <p className="text-sm text-slate-600 mb-1">Current Delivery Time:</p>
            <p className="text-lg font-semibold text-amber-700">
              {new Date(settings.nextDeliveryTime as any).toLocaleString()}
            </p>
          </div>
        )}
        <form onSubmit={deliveryForm.handleSubmit(onSubmitDeliveryTime)} className="flex flex-col gap-4">
          <div className="flex-1 w-full">
            <label className="font-medium text-sm text-slate-700 mb-2 block">
              Set Delivery Date & Time (10 min - 7 days from now)
            </label>
            <input
              id="deliveryTime"
              type="datetime-local"
              {...deliveryForm.register("deliveryTime", { required: true })}
              disabled={isUpdatingDeliveryTime}
              className="w-full p-3 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              // Set value explicitly to keep in sync
              value={deliveryForm.watch("deliveryTime")}
              onChange={e => deliveryForm.setValue("deliveryTime", e.target.value)}
            />
            <p className="text-slate-500 text-xs mt-2">
              Select a date and time up to 7 days ahead
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <Button
              label={isUpdatingDeliveryTime ? "Setting..." : "Set Delivery Time"}
              disabled={isUpdatingDeliveryTime}
              type="submit"
            />
          </div>
        </form>
        <p className="text-slate-500 text-sm mt-3">
          Customers will see a countdown to this time in the navbar
        </p>
      </div>

      {/* WhatsApp Number Card */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💬</span>
          <div className="text-slate-700 text-lg font-semibold">
            WhatsApp Contact Number
          </div>
        </div>
        {(settings as any)?.whatsappNumber && (
          <div className="mb-4 p-3 bg-white rounded border border-green-300 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600 mb-1">Current WhatsApp:</p>
              <p className="text-lg font-semibold text-green-700">
                {(settings as any).whatsappNumber}
              </p>
            </div>
            <button
              onClick={async () => {
                if (confirm("Are you sure you want to remove the WhatsApp number?")) {
                  setIsUpdatingWhatsapp(true);
                  try {
                    await axios.put("/api/settings/whatsapp", {
                      whatsappNumber: "",
                    });
                    whatsappForm.setValue("whatsappNumber", "");
                    toast.success("WhatsApp number removed");
                    router.refresh();
                  } catch (error) {
                    toast.error("Failed to remove WhatsApp number");
                  } finally {
                    setIsUpdatingWhatsapp(false);
                  }
                }
              }}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition"
            >
              Remove
            </button>
          </div>
        )}
        <form onSubmit={whatsappForm.handleSubmit(onSubmitWhatsapp)} className="flex flex-col gap-4">
          <div className="flex-1 w-full">
            <label className="font-medium text-sm text-slate-700 mb-2 block">
              WhatsApp Number (with country code)
            </label>
            <input
              id="whatsappNumber"
              type="text"
              placeholder="e.g., 2348012345678"
              {...whatsappForm.register("whatsappNumber", { required: true })}
              disabled={isUpdatingWhatsapp}
              className="w-full p-3 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            />
            <p className="text-slate-500 text-xs mt-2">
              Enter number with country code (e.g., 234 for Nigeria)
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <Button
              label={isUpdatingWhatsapp ? "Updating..." : "Update WhatsApp"}
              disabled={isUpdatingWhatsapp}
              type="submit"
            />
          </div>
        </form>
        <p className="text-slate-500 text-sm mt-3">
          This number will be used for the &quot;Chat on WhatsApp&quot; button in the footer
        </p>
      </div>

      {/* To Reimburse Card */}
      <div className="bg-teal-50 rounded-lg p-6 border border-teal-200 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">💵</span>
          <div className="text-slate-600 text-sm font-medium uppercase tracking-wide">
            To Reimburse
          </div>
        </div>
        <div className="text-teal-600 text-5xl font-bold mb-4">
          {formatPrice(toReimburse)}
        </div>
        
        {totalReimbursed > 0 && (
          <div className="mt-4 pt-4 border-t border-teal-200">
            <div className="flex items-center justify-between">
              <span className="text-teal-500 text-sm font-medium">Total Reimbursed:</span>
              <span className="text-teal-600 text-xl font-semibold">
                {formatPrice(totalReimbursed)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      <div className="flex justify-center">
        <Button
          label={isLoading ? "Processing..." : "Click to Confirm Reimbursement"}
          onClick={handleConfirmReimbursement}
          disabled={isLoading || toReimburse <= 0}
        />
      </div>

      {toReimburse <= 0 && (
        <p className="text-center text-slate-500 mt-4 text-sm">
          No pending reimbursements at this time
        </p>
      )}
    </div>
  );
};

export default MonitorClient;

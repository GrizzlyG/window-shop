"use client";

import { Order, User } from "@prisma/client";
import { formatPrice } from "@/utils/format-price";
import Heading from "@/app/components/heading";
import Status from "@/app/components/status";
import {
  Clock,
  Trash2,
  Truck,
  Check,
  RefreshCw,
  Eye,
  ShoppingBag,
  X,
} from "lucide-react";
import ActionButton from "@/app/components/action-button";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import moment from "moment";
import { useCart } from "@/context/cart-context";
import AlertDialog from "../components/alert-dialog";
import Button from "@/app/components/button";

type ExtendedOrder = Order & {
  user: User;
};

interface OrdersClient {
  orders: ExtendedOrder[];
}

const OrdersClient: React.FC<OrdersClient> = ({ orders }) => {
  const router = useRouter();
  const { handleRemovePaymentIntent } = useCart();
  const [open, setOpen] = useState(false);
  const [nameToDelete, setNameToDelete] = useState("");
  const [orderToDelete, setOrderToDelete] = useState("");
  const [hiddenOrders, setHiddenOrders] = useState<Set<string>>(new Set());

  const handleDeleteOrder = useCallback((row: string) => {
    axios
      .put("/api/delete-order", {
        row,
      })
      .then((res) => {
        handleRemovePaymentIntent();
        toast.success("Order Deleted.");
        router.refresh();
      })
      .catch((error) => {
        toast.error("Oops! Something went wrong.");
        console.log(error);
      });
  }, []);

  const handleHideOrder = (orderId: string) => {
    setHiddenOrders(prev => {
      const newSet = new Set(prev);
      newSet.add(orderId);
      return newSet;
    });
    toast.success("Order removed from view");
  };

  const getPaymentStatusColor = (claimed: boolean) => {
    return claimed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "dispatched":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="max-w-[1200px] m-auto px-4">
      <div className="mb-6 mt-8">
        <Heading title="My Orders" center />
        <p className="text-center text-slate-500 text-sm mt-2">
          Track and manage your orders
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-blue-600 text-2xl" />
            <div>
              <p className="text-xs text-slate-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-600 text-2xl" />
            <div>
              <p className="text-xs text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {orders.filter(o => !o.paymentClaimed).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2">
            <Truck className="text-purple-600 text-2xl" />
            <div>
              <p className="text-xs text-slate-600">Dispatched</p>
              <p className="text-2xl font-bold text-purple-600">
                {orders.filter(o => o.deliveryStatus === "dispatched").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2">
            <Check className="text-green-600 text-2xl" />
            <div>
              <p className="text-xs text-slate-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.deliveryStatus === "delivered").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.filter(o => !hiddenOrders.has(o.id)).length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg">
          <ShoppingBag className="text-6xl text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No orders yet</p>
          <p className="text-slate-400 text-sm mt-2">Your orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.filter(o => !hiddenOrders.has(o.id)).map((order) => {
            const isCancelled = (order as any).cancelled;
            const totalItems = (order.products as any[])?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
            
            return (
              <div
                key={order.id}
                className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition relative ${
                  isCancelled ? "opacity-60 border-red-200" : "border-slate-300"
                }`}
              >
                {/* Hide button for delivered orders */}
                {order.deliveryStatus === "delivered" && (
                  <button
                    onClick={() => handleHideOrder(order.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition active:scale-95 z-10"
                    title="Remove from view"
                  >
                    <X size={18} />
                  </button>
                )}

                <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-slate-100 rounded-lg px-3 py-1">
                        <p className="text-xs text-slate-500">Order ID</p>
                        <p className="font-mono font-semibold text-slate-700">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      {isCancelled && (
                        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-semibold">
                          CANCELLED
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Amount</p>
                        <p className="font-bold text-lg text-slate-800">
                          {formatPrice(order.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Items</p>
                        <p className="font-semibold text-slate-700">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Date</p>
                        <p className="font-semibold text-slate-700">
                          {moment(order.createDate).format("MMM DD, YYYY")}
                        </p>
                        <p className="text-xs text-slate-400">
                          {moment(order.createDate).fromNow()}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t pt-3">
                      <p className="text-xs text-slate-500 mb-2 font-semibold">Order Items:</p>
                      <div className="space-y-2">
                        {(order.products as any[])?.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 bg-slate-50 rounded-lg p-2">
                            <img
                              src={item.selectedImg?.image || "/placeholder.png"}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-slate-800 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {item.selectedImg?.color} • Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm text-slate-700">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col gap-3 md:items-end">
                    <div className="flex flex-wrap gap-2">
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getPaymentStatusColor(order.paymentClaimed)}`}>
                        {order.paymentClaimed ? "✓ Paid" : "⏳ Pending Payment"}
                      </div>
                      {!isCancelled && (
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                          {order.deliveryStatus === "delivered" && "✓ "}
                          {order.deliveryStatus === "dispatched" && "🚚 "}
                          {order.deliveryStatus === "pending" && "⏳ "}
                          {order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <ActionButton
                        icon={Eye}
                        onClick={() => router.push(`/order/${order.id}`)}
                        label="View"
                      />
                    </div>
                  </div>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Refresh Button */}
      {orders.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.refresh()}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition active:scale-95"
          >
            <RefreshCw className="text-xl" />
            <span>Refresh Orders</span>
          </button>
        </div>
      )}

      <AlertDialog
        open={open}
        setOpen={setOpen}
        action={"delete your order "}
        name={nameToDelete}
        handleOK={() => handleDeleteOrder(orderToDelete)}
      />
    </div>
  );
};

export default OrdersClient;

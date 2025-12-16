"use client";

import { Order, Product, User } from "@prisma/client";
import { useEffect, useState } from "react";
import Heading from "../components/heading";
import { formatPrice } from "@/utils/format-price";
import { formatNumber } from "@/utils/formatNumber";
import axios from "axios";

interface SummaryProps {
  products: Product[];
  orders: Order[];
  users: User[];
  userRole?: string;
}

type SummaryDataType = {
  [key: string]: {
    label: string;
    digit: number;
  };
};

const Summary: React.FC<SummaryProps> = ({ products, orders, users, userRole }) => {
  const isManager = userRole === "MANAGER";
  const [summaryData, setSummaryData] = useState<SummaryDataType>({
    sale: {
      label: "Total Sale",
      digit: 0,
    },
    dmc: {
      label: "Total DMC",
      digit: 0,
    },
    products: {
      label: "Total Products",
      digit: 0,
    },
    orders: {
      label: "Total Orders",
      digit: 0,
    },
    paidOrders: {
      label: "Paid Orders",
      digit: 0,
    },
    unpaidOrders: {
      label: "Unpaid Orders",
      digit: 0,
    },
    users: {
      label: "Total Users",
      digit: 0,
    },
    refunds: {
      label: "Total Refunds",
      digit: 0,
    },
    refundDmc: {
      label: "Refund DMC",
      digit: 0,
    },
    reimburse: {
      label: "To Reimburse",
      digit: 0,
    },
    totalReimbursed: {
      label: "Total Reimbursed",
      digit: 0,
    },
    totalSpf: {
      label: "Total SPF",
      digit: 0,
    },
    currentSpf: {
      label: "Current SPF",
      digit: 0,
    },
  });

  useEffect(() => {
    // Fetch total reimbursed and current SPF
    const fetchData = async () => {
      try {
        const [reimbursedRes, settingsRes] = await Promise.all([
          axios.get("/api/reimbursement/total"),
          axios.get("/api/settings")
        ]);
        
        setSummaryData((prev) => ({
          ...prev,
          totalReimbursed: {
            ...prev.totalReimbursed,
            digit: reimbursedRes.data.total || 0,
          },
          currentSpf: {
            ...prev.currentSpf,
            digit: settingsRes.data.spf || 100,
          },
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setSummaryData((prev) => {
      let tempData = { ...prev };

      const totalSale = orders.reduce((acc, item) => {
        if (item.paymentConfirmed) {
          return acc + item.amount;
        } else return acc;
      }, 0);

      const totalDmc = orders.reduce((acc, order) => {
        if (order.paymentConfirmed) {
          // Use the totalDmc field if available (new orders)
          // Otherwise fall back to calculating from products (old orders)
          const orderDmc = (order as any).totalDmc ?? 
            ((order.products as any[])?.reduce((dmcAcc, product) => {
              return dmcAcc + ((product.dmc || 0) * (product.quantity || 0));
            }, 0) || 0);
          return acc + orderDmc;
        }
        return acc;
      }, 0);
      


      // To Reimburse: sum of all paid, non-reimbursed order totals minus their DMC and SPF
      const toReimburse = orders.reduce((acc, item) => {
        if (item.paymentConfirmed && !(item as any).reimbursed) {
          const dmc = (item as any).totalDmc ?? ((item.products as any[])?.reduce((dmcAcc, product) => dmcAcc + ((product.dmc || 0) * (product.quantity || 0)), 0) || 0);
          const spf = (item as any).spf ?? 0;
          return acc + (item.amount - dmc - spf);
        }
        return acc;
      }, 0);

      const paidOrders = orders.filter((order) => {
        return order.paymentConfirmed;
      });

      const unpaidOrders = orders.filter((order) => {
        return !order.paymentConfirmed;
      });

      const totalRefunds = orders.reduce((acc, order) => {
        if ((order as any).cancelled && (order as any).refundAmount) {
          return acc + (order as any).refundAmount;
        }
        return acc;
      }, 0);

      const refundDmc = orders.reduce((acc, order) => {
        if ((order as any).cancelled) {
          const orderDmc = (order as any).totalDmc ?? 
            ((order.products as any[])?.reduce((dmcAcc, product) => {
              return dmcAcc + ((product.dmc || 0) * (product.quantity || 0));
            }, 0) || 0);
          return acc + orderDmc;
        }
        return acc;
      }, 0);

      // Calculate total SPF collected from all paid orders (do NOT add DMC)
      const totalSpf = orders.reduce((acc, order) => {
        if (order.paymentConfirmed) {
          if ((order as any).spf !== undefined) {
            return acc + (order as any).spf;
          } else {
            const productTotal = (order.products as any[])?.reduce((sum, product) => {
              return sum + ((product.price + (product.dmc || 0)) * product.quantity);
            }, 0) || 0;
            const calculatedSpf = order.amount - productTotal;
            return acc + calculatedSpf;
          }
        }
        return acc;
      }, 0);

      tempData.sale.digit = totalSale;
      tempData.dmc.digit = totalDmc;
      tempData.orders.digit = orders.length;
      tempData.paidOrders.digit = paidOrders.length;
      tempData.unpaidOrders.digit = unpaidOrders.length;
      tempData.products.digit = products.length;
      tempData.users.digit = users.length;
      tempData.refunds.digit = totalRefunds;
      tempData.refundDmc.digit = refundDmc;
      // To Reimburse: total sale minus (total DMC + total SPF)
      tempData.reimburse.digit = totalSale - (totalDmc + totalSpf);
      tempData.totalSpf.digit = totalSpf;

      // DMC + SPF (for subtext): sum of all DMC + sum of all SPF
      tempData.dmcSpfCombined = {
        label: 'DMC + SPF',
        digit: tempData.totalSpf.digit + totalDmc,
      };

      return tempData;
    });
  }, [orders, products, users]);

  const summaryKeys = Object.keys(summaryData);

  // Define colors and icons for each metric
  const metricStyles: { [key: string]: { bg: string; text: string; icon: string } } = {
    sale: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: '💰' },
    dmc: { bg: 'bg-blue-50', text: 'text-blue-600', icon: '⚙️' },
    products: { bg: 'bg-purple-50', text: 'text-purple-600', icon: '📦' },
    orders: { bg: 'bg-orange-50', text: 'text-orange-600', icon: '📋' },
    paidOrders: { bg: 'bg-green-50', text: 'text-green-600', icon: '✅' },
    unpaidOrders: { bg: 'bg-red-50', text: 'text-red-600', icon: '⏳' },
    users: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: '👥' },
    refunds: { bg: 'bg-rose-50', text: 'text-rose-600', icon: '💸' },
    reimburse: { bg: 'bg-teal-50', text: 'text-teal-600', icon: '💵' },
    currentSpf: { bg: 'bg-amber-50', text: 'text-amber-600', icon: '🏷️' },
  };

  return (
    <div className="max-w-[1150px] m-auto px-4">
      <div className="mb-6 mt-6">
        <Heading title="Dashboard" center />
        {isManager && (
          <p className="text-center text-slate-500 text-sm mt-2">Manager View - Limited Access</p>
        )}
      </div>
      
      {/* All Metrics - Uniform Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(isManager 
          ? ['sale', 'reimburse', 'refunds', 'orders', 'paidOrders', 'unpaidOrders']
          : ['sale', 'dmc', 'reimburse', 'refunds', 'currentSpf', 'orders', 'products', 'paidOrders', 'unpaidOrders', 'users']
        ).map((key) => {
          const metric = summaryData[key];
          const style = metricStyles[key];
          const isMonetary = key === 'sale' || key === 'dmc' || key === 'refunds' || key === 'reimburse' || key === 'currentSpf';
          
          return (
            <div
              key={key}
              className={`${style.bg} rounded-lg p-4 border border-slate-300 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{style.icon}</span>
                <div className="text-slate-600 text-xs font-medium uppercase tracking-wide">
                  {metric.label}
                </div>
              </div>
              <div className={`${style.text} text-2xl font-bold`}>
                {isMonetary ? formatPrice(metric.digit) : formatNumber(metric.digit)}
              </div>
              {key === 'sale' && (summaryData.dmc.digit > 0 || summaryData.totalSpf.digit > 0) && (
                <div className="mt-2 pt-2 border-t border-emerald-200">
                  <div className="text-xs text-emerald-500">
                    DMC + SPF: {formatPrice(summaryData.dmcSpfCombined?.digit || 0)}
                  </div>
                </div>
              )}
              {key === 'refunds' && summaryData.refundDmc.digit > 0 && (
                <div className="mt-2 pt-2 border-t border-rose-200">
                  <div className="text-xs text-rose-500">
                    DMC: {formatPrice(summaryData.refundDmc.digit)}
                  </div>
                </div>
              )}
              {key === 'dmc' && summaryData.totalSpf.digit > 0 && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className="text-xs text-blue-500">
                    Total SPF: {formatPrice(summaryData.totalSpf.digit)}
                  </div>
                </div>
              )}
              {key === 'reimburse' && summaryData.totalReimbursed.digit > 0 && (
                <div className="mt-2 pt-2 border-t border-teal-200">
                  <div className="text-xs text-teal-500">
                    Reimbursed: {formatPrice(summaryData.totalReimbursed.digit)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Summary;

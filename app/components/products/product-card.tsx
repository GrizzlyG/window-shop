"use client";

import { truncateText } from "@/utils/truncate-text";
import { formatPrice } from "@/utils/format-price";
import { Rating } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { productRating } from "@/utils/product-rating";
import { IoChevronDown } from "react-icons/io5";
import Status from "../status";
import { MdDone, MdOutlineClose } from "react-icons/md";
import { useCart } from "@/context/cart-context";
import { CartProductType } from "@/app/product/[productId]/product-details";
import Button from "../button";
import toast from "react-hot-toast";

interface ProductCardProps {
  data: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const { handleAddProductToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const remaining = data.remainingStock ?? data.stock ?? 0;

  const getStockText = () => {
    if (!data.inStock || remaining === 0) return "Out of stock";
    if (remaining > 20) return "20+ in stock";
    if (remaining > 10) return "10+ in stock";
    return `${remaining} in stock`;
  };

  const handleQuantityIncrease = () => {
    if (quantity >= remaining) {
      return toast.error(`Only ${remaining} left in stock`);
    }
    setQuantity((prev) => prev + 1);
  };

  const handleQuantityDecrease = () => {
    if (quantity === 1) return;
    setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    if (!data.inStock || remaining === 0) {
      toast.error("Out of stock");
      return;
    }

    const cartProduct: CartProductType = {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      brand: data.brand,
      selectedImg: { ...data.images[0] },
      quantity,
      price: data.price,
      remainingStock: remaining,
    };

    handleAddProductToCart(cartProduct);
    toast.success(`${quantity}x ${truncateText(data.name)} added to cart`);
    setQuantity(1);
  };

  return (
    <div className="col-span-1 border-[1.2px] border-slate-200 bg-slate-50 rounded-md p-2 transition hover:bg-slate-100 text-center text-sm flex flex-col h-full">
      <div className="flex flex-col items-center w-full gap-1 flex-1">
        {/* Product Image & Name Link */}
        <Link href={`/product/${data.id}`}>
          <div className="aspect-square overflow-hidden relative w-full mt-2 cursor-pointer hover:opacity-80 transition">
            <Image
              src={data.images[0].image}
              alt={data.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-contain"
            />
          </div>
        </Link>

        <Link href={`/product/${data.id}`}>
          <div className="font-medium text-[1.04rem] mt-3 mb-1 hover:text-slate-700 cursor-pointer transition">
            {truncateText(data.name)}
          </div>
        </Link>

        <div className="flex items-center gap-[1.5px] pb-1">
          <Rating
            value={productRating(data.reviews)}
            readOnly
            size="small"
            precision={0.5}
          />
          <IoChevronDown size={12} className="opacity-60" />
          <div className="opacity-60 font-bold">{data.reviews.length}</div>
        </div>

        {data.list !== data.price && (
          <div className="flex flex-wrap justify-center font-normal text-sm text-slate-400 gap-2 mb-1">
            <span className="line-through">{formatPrice(data.list)}</span>
            <Status
              text={
                Math.round(((data.price - data.list) / data.price) * 100) +
                "% OFF"
              }
              icon={MdDone}
              bg="bg-pink-600"
              color="text-white font-medium"
            />
          </div>
        )}

        {/* Price */}
        <div
          className={`flex items-center gap-1 ${
            data.list === data.price && "mt-3"
          }`}
        >
          <div className="font-semibold text-[1.3rem]">
            {formatPrice(data.price)}
          </div>
        </div>

        <div className={`${data.list === data.price && "mt-3"}`}>
          free shipping
        </div>

        {/* Stock Status */}
        <div className="mt-3 mb-2 flex gap-2 items-center justify-center">
          <span className="text-xs font-medium">STOCK:</span>
          <Status
            text={getStockText()}
            icon={data.inStock && remaining > 0 ? MdDone : MdOutlineClose}
            bg={data.inStock && remaining > 0 ? "bg-teal-600" : "bg-pink-600"}
            color="text-white font-normal text-xs flex justify-center h-6"
          />
        </div>
      </div>

      {/* Quantity & Add to Cart Controls (sticky to bottom) */}
      {data.inStock && remaining > 0 ? (
        <div className="flex flex-col gap-2 mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleQuantityDecrease}
              disabled={quantity === 1}
              className="border-[1px] border-slate-300 flex items-center justify-center w-6 h-6 rounded transition active:scale-[0.9] hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="pb-[1px] text-sm">−</span>
            </button>
            <div className="font-semibold text-sm w-4 text-center">{quantity}</div>
            <button
              onClick={handleQuantityIncrease}
              disabled={quantity >= remaining}
              className="border-[1px] border-slate-300 flex items-center justify-center w-6 h-6 rounded transition active:scale-[0.9] hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="pb-[1px] text-sm">+</span>
            </button>
          </div>

          {/* Add to Cart Button */}
          <div className="w-full">
            <Button
              label="Add to Cart"
              onClick={handleAddToCart}
              small
            />
          </div>
        </div>
      ) : (
        <div className="mt-2 py-2 text-pink-600 font-semibold text-sm">
          Out of Stock
        </div>
      )}
    </div>
  );
};

export default ProductCard;

"use client";

import React from "react";
import Container from "../container";
import FooterList from "./footer-list";
import Link from "next/link";
import { categories } from "@/utils/categories";
import Categories from "./categories";
import { MessageCircle } from "lucide-react";

interface FooterProps {
  whatsappNumber?: string | null;
}

const Footer: React.FC<FooterProps> = ({ whatsappNumber = null }) => {
  const highlight = "hover:text-slate-50 transition";

  const handleWhatsAppClick = () => {
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}`, "_blank");
    }
  };

  return (
    <footer className="bg-zinc-900 text-slate-200 text-sm mt-16">
      <Container>
        <div className="px-8 flex flex-col md:flex-row justify-between pt-10 pb-4">
          <FooterList>
            <h3 className="font-bold text-base mb-2">Shop Categories</h3>
            {categories.map((item) => (
              <Categories key={item.label} label={item.label} />
            ))}
          </FooterList>

          <FooterList>
            <h3 className="font-bold text-base mb-2">Customer Service</h3>
            {whatsappNumber ? (
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition font-medium mb-2"
              >
                <MessageCircle size={20} />
                Chat on WhatsApp
              </button>
            ) : (
              <Link href="#" className={highlight}>
                Contact Us
              </Link>
            )}
            <Link href="#" className={highlight}>
              Shipping Policy
            </Link>
            <Link href="/faq" className={highlight}>
              FAQs
            </Link>
          </FooterList>

          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-base font-bold mb-2">About Us</h3>
            <p className="mb-2">
              The Easiest, Cheapest, Shop On Campus.
            </p>
            <p>
              &copy; {new Date().getFullYear()} EasyByFar. All rights
              reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

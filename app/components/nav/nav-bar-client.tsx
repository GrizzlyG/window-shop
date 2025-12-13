"use client";

import Link from "next/link";
import Container from "../container";
import React, { useState } from "react";
import { Monoton } from "next/font/google";
import CartCount from "./cart-count";
import UserMenu from "./user-menu";
import Categories from "./categories";
import SearchBar from "./search-bar";
import { Search } from "lucide-react";
import { SafeUser } from "@/types";
import { ChevronLeft, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import DeliveryCountdown from "../delivery-countdown";
import NotificationButton from "../notification-button";

const exo = Monoton({ subsets: ["latin"], weight: ["400"] });

interface NavBarPros {
  currentUser?: SafeUser | null;
  nextDeliveryTime?: string | null;
}

const ClientNavBar: React.FC<NavBarPros> = ({ currentUser = null, nextDeliveryTime = null }) => {
  const [searchBar, setSearchBar] = useState<boolean>(false);
  const router = useRouter();
  const path = usePathname();

  const resetSearch = () => {
    router.push("/");
  };

  return (
    <div className="sticky top-0 w-full bg-zinc-900 z-30 shadow-xl">
      <div className="py-4 border-b-[1px] border-slate-500">
        <Container>
          <div className="flex items-center justify-between sm:px-2 xl:px-0">
            <Link
              href="/"
              className="relative flex items-center text-white font-semibold text-[1.1rem] sm:text-[1.8rem] hover:scale-105 active:scale-100 transition"
            >
              {path && path.includes("/product") && (
                <ChevronLeft className="text-[1rem] sm:text-[1.25rem] mb-1 sm:mb-[1.75px]" />
              )}
              <span className="text-emerald-400">Window</span>
              <span className="text-slate-200 ml-1">Chop</span>
              <span className="text-emerald-400">.</span>
              <span className="absolute -top-1 -right-8 sm:-right-12 bg-emerald-500 text-white text-[0.6rem] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                Store
              </span>
            </Link>

            <div className="flex items-center gap-4 md:gap-8 xl:gap-12">
              <DeliveryCountdown deliveryTime={nextDeliveryTime || null} />
              {currentUser && (
                <NotificationButton userId={currentUser.id} />
              )}
              <div className="flex items-center gap-4">
                <div
                  className={`hidden md:block opacity-0 transition 
                    ${searchBar ? "opacity-100" : "opacity-0"}
                  `}
                >
                  <SearchBar searchBar={searchBar} />
                </div>
                {searchBar ? (
                  <X
                    className="text-[1.9rem] text-gray-200 pb-[0.1rem] cursor-pointer hidden md:block hover:scale-110 active:scale-[0.9] transition"
                    onClick={() => {
                      setSearchBar(false);
                      resetSearch();
                    }}
                  />
                ) : (
                  <Search
                    className="text-[1.9rem] text-white pb-[0.1rem] cursor-pointer hidden md:block hover:scale-110 active:scale-[0.9] transition"
                    onClick={() => setSearchBar(true)}
                  />
                )}
              </div>
              <CartCount />
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
        </Container>
      </div>
      <Categories />
    </div>
  );
};

export default ClientNavBar;
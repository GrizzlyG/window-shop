"use client";

import { useEffect, useState } from "react";
import { MdNotifications } from "react-icons/md";
import Link from "next/link";

const AdminNotifications = () => {
  const [count, setCount] = useState<number>(0);

  const fetchUnread = async () => {
    try {
      const res = await fetch("/api/notifications/unread");
      if (!res.ok) return;
      const json = await res.json();
      setCount(Array.isArray(json) ? json.length : 0);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Link href="/admin/manage-orders" className="relative">
        <MdNotifications size={22} />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </Link>
    </div>
  );
};

export default AdminNotifications;


"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCart, getCartCount } from "@/app/lib/cart";
import { isLoggedIn } from "@/app/lib/auth";

type User = {
  name: string;
  email: string;
  role?: string;
};

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const handleCartClick = () => {
    if (!user && !isLoggedIn()) {
      router.push("/login?redirect=/cart");
      return;
    }
    window.dispatchEvent(new Event("zaa-open-cart"));
  };

  useEffect(() => {
    const updateCount = () => {
      setCartCount(getCartCount(getCart()));
    };

    updateCount();
    window.addEventListener("zaa-cart-updated", updateCount);

    return () => {
      window.removeEventListener("zaa-cart-updated", updateCount);
    };
  }, []);

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("zaa_user");

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("zaa_user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    
    window.addEventListener("zaa-user-updated", loadUser);

    return () => {
      window.removeEventListener("zaa-user-updated", loadUser);
    };
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  
  const logout = () => {
    localStorage.removeItem("zaa_user");

    setUser(null);
    setIsProfileOpen(false);
    setIsMenuOpen(false);

    window.location.href = "/";
  };

  
  const initial = user?.name?.charAt(0).toUpperCase() || "U";
  const isAdmin =
    user?.role === "admin" ||
    user?.email?.toLowerCase() === "admin@zaa.com" ||
    user?.email?.toLowerCase().startsWith("admin@");

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">

       
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg transition duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Image
              src="/image/zaa.jpg"
              alt="ZAA Logo"
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-wide">
              <span className="text-red-500">Z</span>
              <span className="text-black">AA</span>
            </h1>

            <p className="hidden text-xs font-medium tracking-widest text-gray-500 sm:block">
              ZERO AUTHORITY ARTISTS
            </p>
          </div>
        </Link>

        
        <div className="hidden items-center gap-10 rounded-full border border-gray-100 bg-gray-50 px-10 py-1 shadow-sm md:flex">
          <Link
            href="/"
            className="rounded-full px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-black hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="rounded-full px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-black hover:text-white"
          >
            About
          </Link>

          <Link
            href="/products"
            className="rounded-full px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-black hover:text-white"
          >
            Products
          </Link>

          <Link
            href="/orders"
            className="rounded-full px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-black hover:text-white"
          >
            Orders
          </Link>

          <Link
            href="/contact"
            className="rounded-full px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-black hover:text-white"
          >
            Contact
          </Link>
        </div>

        
        <div className="hidden items-center gap-3 md:flex">
        
          <button
            type="button"
            onClick={handleCartClick}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm transition hover:border-black hover:scale-105"
            aria-label="View Shopping Cart"
            title="Shopping Cart"
          >
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label="Open profile menu"
                title={user.name}
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gradient-to-br from-red-500 to-orange-500 text-lg font-bold text-white shadow-md transition-all duration-300 hover:scale-110 hover:border-red-500 hover:shadow-lg"
              >
                {initial}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="font-bold text-gray-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="mt-1 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 font-bold text-red-600 border border-red-200 transition hover:bg-red-100"
                    >
                      <span className="text-lg">🛡️</span>
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    <span className="text-lg">👤</span>
                    Profile
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    <span className="text-lg">📦</span>
                    My Orders
                  </Link>

                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <span className="text-lg">↪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-black px-6 py-3 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Login
            </Link>
          )}
        </div>

        
        <div className="flex items-center gap-2 md:hidden">
         
          <button
            type="button"
            onClick={handleCartClick}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-800 shadow-sm transition hover:bg-black hover:text-white"
            aria-label="Shopping Cart"
          >
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-2xl text-gray-800 shadow-sm transition hover:bg-black hover:text-white"
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>

          
          {isMenuOpen && (
            <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl">

              <div className="flex flex-col gap-1">

                
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 font-semibold text-gray-700 transition hover:bg-black hover:text-white"
                >
                  Home
                </Link>

                
                <Link
                  href="/about"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 font-semibold text-gray-700 transition hover:bg-black hover:text-white"
                >
                  About
                </Link>

                <Link
                  href="/products"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 font-semibold text-gray-700 transition hover:bg-black hover:text-white"
                >
                  Products
                </Link>

                <Link
                  href="/cart"
                  onClick={closeMenu}
                  className="flex items-center justify-between rounded-xl px-4 py-3 font-semibold text-gray-700 transition hover:bg-black hover:text-white"
                >
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/orders"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 font-semibold text-gray-700 transition hover:bg-black hover:text-white"
                >
                  Orders
                </Link>

                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 font-semibold text-gray-700 transition hover:bg-black hover:text-white"
                >
                  Contact
                </Link>

                <div className="my-2 border-t border-gray-100" />

               
                {user ? (
                  <>
                    
                    <Link
                      href="/profile"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 font-bold text-white">
                        {initial}
                      </span>

                      <div>
                        <p className="font-bold">
                          {user.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          View Profile
                        </p>
                      </div>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 font-bold text-red-600 transition hover:bg-red-100"
                      >
                        <span className="text-lg">🛡️</span>
                        Admin Dashboard
                      </Link>
                    )}

                   
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <span className="text-lg">↪</span>
                      Logout
                    </button>
                  </>
                ) : (
                  
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="rounded-xl bg-black px-5 py-3 text-center font-bold text-white shadow-lg transition hover:scale-[1.02]"
                  >
                    Login →
                  </Link>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </nav>
  );
}


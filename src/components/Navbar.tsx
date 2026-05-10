"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-bg-beige border-b border-accent-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-primary tracking-tight"
            >
              每日英文教練
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/"
              className="text-text-main/70 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
            >
              首頁
            </Link>
            <Link
              href="/dashboard"
              className="text-text-main/70 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
            >
              控制面板
            </Link>
            <Link
              href="/vocabulary"
              className="text-text-main/70 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
            >
              我的單字庫
            </Link>
            <Link
              href="/settings"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              開始使用
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-main/50 hover:text-primary hover:bg-accent-soft focus:outline-none transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${isOpen ? "block" : "hidden"} md:hidden bg-bg-beige border-b border-accent-soft`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className="text-text-main/70 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            首頁
          </Link>
          <Link
            href="/dashboard"
            className="text-text-main/70 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            控制面板
          </Link>
          <Link
            href="/vocabulary"
            className="text-text-main/70 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            我的單字庫
          </Link>
          <Link
            href="/settings"
            className="text-primary font-semibold block px-3 py-2 rounded-md text-base"
            onClick={() => setIsOpen(false)}
          >
            開始使用
          </Link>
        </div>
      </div>
    </nav>
  );
}

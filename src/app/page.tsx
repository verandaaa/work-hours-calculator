"use client";

import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { routes } from "@/lib/routes";
import Link from "next/link";
import { useState, useEffect } from "react";

dayjs.extend(weekOfYear);

function StorageModal({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<{ key: string; value: string }[]>([]);

  const loadItems = () => {
    const entries = Object.keys(localStorage).map((key) => ({
      key,
      value: localStorage.getItem(key) ?? "",
    }));
    setItems(entries);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleRemove = (key: string) => {
    localStorage.removeItem(key);
    loadItems();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-bold text-gray-900">
            저장된 데이터 관리
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              저장된 데이터가 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map(({ key, value }) => (
                <li
                  key={key}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">
                      {key}
                    </p>
                    <p
                      className="text-xs text-gray-400 mt-0.5 truncate"
                      title={value}
                    >
                      {value.length > 80 ? value.slice(0, 80) + "..." : value}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(key)}
                    className="mt-0.5 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [showStorage, setShowStorage] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 w-full max-w-md">
      <main>
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            근무 시간 계산기
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            원하는 계산 유형을 선택하세요
          </p>
        </div>

        {/* Nav Cards */}
        <nav className="flex flex-col gap-3">
          {routes.map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold group-hover:bg-indigo-100 transition-colors">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {label}
                </span>
              </div>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="https://github.com/verandaaa/work-hours-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <img src="/github.svg" alt="github" className="w-4 h-4" />
            <span>GitHub</span>
          </Link>
          <button
            onClick={() => setShowStorage(true)}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-gray-500 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M10 11h4"
              />
            </svg>
            <span>데이터 관리</span>
          </button>
        </div>
      </main>

      {showStorage && <StorageModal onClose={() => setShowStorage(false)} />}
    </div>
  );
}

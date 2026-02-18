"use client";

import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { routes } from "@/lib/routes";
import Link from "next/link";

dayjs.extend(weekOfYear);

export default function Home() {
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
        <div className="mt-10 flex justify-center">
          <Link
            href="https://github.com/verandaaa/work-hours-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <img src="/github.svg" alt="github" className="w-4 h-4" />
            <span>GitHub</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

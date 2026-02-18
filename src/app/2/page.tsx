"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Select,
  MenuItem,
  LinearProgress,
  SelectChangeEvent,
  IconButton,
} from "@mui/material";
import { TimeField } from "@mui/x-date-pickers/TimeField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const WORK_TYPES = [
  { value: "work", label: "근무", bonus: 0 },
  { value: "annual", label: "연차", bonus: 480 },
  { value: "half", label: "반차", bonus: 240 },
  { value: "quarter", label: "반반차", bonus: 120 },
  { value: "holiday", label: "휴일", bonus: 480 },
] as const;

type WorkTypeValue = (typeof WORK_TYPES)[number]["value"];

interface BreakTime {
  id: number;
  start: string;
  end: string;
}

interface DayRecord {
  start?: string;
  end?: string;
  type?: WorkTypeValue;
  breaks?: BreakTime[];
}

type MonthRecords = Record<number, DayRecord>;

const PREFIX = "2_";
const STORAGE_KEY = `${PREFIX}result`;
const DEFAULT_BREAKS: BreakTime[] = [{ id: 1, start: "12:00", end: "13:00" }];

function getDefaultRecord(): Partial<DayRecord> {
  return { type: "work", breaks: DEFAULT_BREAKS.map((b) => ({ ...b })) };
}

// ─── 유틸 ────────────────────────────────────────────────────────────────────

const storageKey = (y: number, m: number) =>
  `${STORAGE_KEY}-${y}-${String(m + 1).padStart(2, "0")}`;

function loadRecords(y: number, m: number): MonthRecords {
  try {
    const raw = localStorage.getItem(storageKey(y, m));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRecords(y: number, m: number, records: MonthRecords) {
  try {
    localStorage.setItem(storageKey(y, m), JSON.stringify(records));
  } catch {}
}

function cleanOldRecords(currentKey: string) {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_KEY) && k !== currentKey)
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

function getRequiredHours(y: number, m: number) {
  return Math.floor((40 * getDaysInMonth(y, m)) / 7);
}

function timeToMinutes(t?: string) {
  if (!t) return null;
  const [h, min] = t.split(":").map(Number);
  if (isNaN(h) || isNaN(min)) return null;
  return h * 60 + min;
}

function minutesToHHMM(min: number): string {
  if (min < 0) return `-${minutesToHHMM(-min)}`;
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(
    min % 60
  ).padStart(2, "0")}`;
}

function getDayLabel(y: number, m: number, d: number) {
  return ["일", "월", "화", "수", "목", "금", "토"][new Date(y, m, d).getDay()];
}

function isWeekend(y: number, m: number, d: number) {
  const day = new Date(y, m, d).getDay();
  return day === 0 || day === 6;
}

function dayjsToStr(v: Dayjs | null): string | undefined {
  if (!v || !v.isValid()) return undefined;
  return v.format("HH:mm");
}

function strToDayjs(t?: string): Dayjs | null {
  if (!t) return null;
  const parsed = dayjs(`2000-01-01 ${t}`);
  return parsed.isValid() ? parsed : null;
}

function calcBreakMinutes(
  start: string,
  end: string,
  breaks: BreakTime[]
): number {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  if (s === null || e === null || e <= s) return 0;
  return breaks.reduce((sum, b) => {
    const bs = timeToMinutes(b.start);
    const be = timeToMinutes(b.end);
    if (bs === null || be === null || be <= bs) return sum;
    return sum + Math.max(0, Math.min(e, be) - Math.max(s, bs));
  }, 0);
}

// ─── 스타일 상수 ──────────────────────────────────────────────────────────────

const timeFieldSx = {
  width: 64,
  "& .MuiInputBase-root": { padding: 0, borderRadius: "6px" },
  "& input": { fontSize: 13, padding: "4px 6px", textAlign: "center" },
};

const breakTimeFieldSx = {
  width: 68,
  "& .MuiInputBase-root": { padding: 0, borderRadius: "6px" },
  "& input": { fontSize: 12, padding: "3px 6px", textAlign: "center" },
};

const SELECT_TYPE_STYLES: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  work: { color: "#374151", bg: "transparent", border: "" },
  annual: { color: "#0369a1", bg: "#f8fbff", border: "#93c5fd" },
  half: { color: "#0369a1", bg: "#f8fbff", border: "#93c5fd" },
  quarter: { color: "#0369a1", bg: "#f8fbff", border: "#93c5fd" },
  holiday: { color: "#0369a1", bg: "#f8fbff", border: "#93c5fd" },
};

const getSelectSx = (type: string) => {
  const s = SELECT_TYPE_STYLES[type] ?? SELECT_TYPE_STYLES.work;
  return {
    width: 68,
    fontSize: 13,
    fontWeight: 500,
    borderRadius: "6px",
    color: s.color,
    bgcolor: s.bg,
    "& .MuiSelect-select": { padding: "5px 8px" },
    "& .MuiSelect-icon": { right: 2, color: s.color },
    "& .MuiOutlinedInput-notchedOutline": s.border
      ? { borderColor: s.border }
      : {},
    "&:hover .MuiOutlinedInput-notchedOutline": s.border
      ? { borderColor: s.border }
      : {},
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": s.border
      ? { borderColor: s.border }
      : {},
  };
};

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

const GUIDE_CONTENT = {
  usage: [
    {
      title: "출퇴근 시간 입력",
      desc: "각 날짜의 출근/퇴근 시간을 직접 입력하세요.",
    },
    {
      title: "근무 유형 선택",
      desc: "연차·반차·반반차·휴일 선택 시 자동으로 시간이 처리됩니다.",
    },
    {
      title: "휴게시간 관리",
      desc: "▼ 버튼으로 휴게시간을 펼쳐 추가/수정/삭제할 수 있어요. 기본값과 다를 경우 파란 점으로 표시됩니다.",
    },
    {
      title: "합산 기준",
      desc: "실근로 + 연차 등 보너스 시간을 합산해 월 기준 시간 달성 여부를 계산합니다.",
    },
    {
      title: "데이터 저장",
      desc: "입력한 데이터는 브라우저에 자동 저장되며, 이전 달 데이터는 자동으로 삭제됩니다.",
    },
  ],
  patches: [
    //위로 추가
    {
      version: "v1.0",
      date: "2026-02-18",
      changes: ["최초 출시", "월별 근무시간 계산 기본 기능"],
    },
  ],
};

const LATEST_PATCH_DATE = GUIDE_CONTENT.patches[0].date;
const PATCH_SEEN_KEY = `${PREFIX}patchSeenDate`;

function NewPatchModal({ onClose }: { onClose: () => void }) {
  const [doNotShow, setDoNotShow] = useState(false);
  const handleClose = () => {
    if (doNotShow) {
      try {
        localStorage.setItem(PATCH_SEEN_KEY, LATEST_PATCH_DATE);
      } catch {}
    }
    onClose();
  };
  const latest = GUIDE_CONTENT.patches[0];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-sm font-bold text-gray-700">
            🔧 새 업데이트가 있어요!
          </p>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-gray-500 text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <div className="px-5 pb-2 flex flex-col gap-3">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {latest.version}
              </span>
              <span className="text-xs text-gray-400">{latest.date}</span>
            </div>
            <ul className="flex flex-col gap-0.5">
              {latest.changes.map((c, i) => (
                <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                  <span className="text-gray-300">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={doNotShow}
              onChange={(e) => setDoNotShow(e.target.checked)}
              className="accent-blue-600"
            />
            <span className="text-xs text-gray-400">다시 표시하지 않음</span>
          </label>
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function BaseModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[70vh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-sm font-bold text-gray-700">{title}</p>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-6 flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}

function UsageModal({ onClose }: { onClose: () => void }) {
  return (
    <BaseModal title="📋 사용 설명서" onClose={onClose}>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-amber-600 mb-1">⚠️ 주의사항</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          본 페이지는 근무 시간 계산을 보조하기 위한 도구입니다. 실제 근태
          기록은 반드시 네이버웍스 시스템과 대조하여 확인해 주세요.
        </p>
      </div>
      {GUIDE_CONTENT.usage.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-gray-700 mb-0.5">
            {item.title}
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </BaseModal>
  );
}

function PatchModal({ onClose }: { onClose: () => void }) {
  return (
    <BaseModal title="🚀 업데이트" onClose={onClose}>
      {GUIDE_CONTENT.patches.map((p) => (
        <div key={p.version} className="bg-gray-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {p.version}
            </span>
            <span className="text-xs text-gray-400">{p.date}</span>
          </div>
          <ul className="flex flex-col gap-0.5">
            {p.changes.map((c, i) => (
              <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                <span className="text-gray-300">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </BaseModal>
  );
}

export default function WorkHoursTracker() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const [records, setRecords] = useState<MonthRecords>({});
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showInfo, setShowInfo] = useState<"usage" | "patch" | null>(null);
  const [showNewPatch, setShowNewPatch] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(PATCH_SEEN_KEY);
      if (!seen || seen < LATEST_PATCH_DATE) setShowNewPatch(true);
    } catch {}
  }, []);

  useEffect(() => {
    const key = storageKey(year, month);
    cleanOldRecords(key);
    setRecords(loadRecords(year, month));
    setMounted(true);
  }, [year, month]);

  useEffect(() => {
    if (!mounted) return;
    saveRecords(year, month, records);
  }, [records, year, month, mounted]);

  const days = getDaysInMonth(year, month);
  const requiredHours = getRequiredHours(year, month);

  const setField = (
    day: number,
    field: keyof DayRecord,
    value: string | undefined
  ) => {
    setRecords((prev) => ({
      ...prev,
      [day]: { ...getDefaultRecord(), ...prev[day], [field]: value },
    }));
  };

  const addBreak = (day: number) => {
    setRecords((prev) => {
      const rec = prev[day] ?? getDefaultRecord();
      return {
        ...prev,
        [day]: {
          ...rec,
          breaks: [
            ...(rec.breaks ?? []),
            { id: Date.now(), start: "", end: "" },
          ],
        },
      };
    });
  };

  const removeBreak = (day: number, id: number) => {
    setRecords((prev) => {
      const rec = prev[day] || {};
      return {
        ...prev,
        [day]: {
          ...rec,
          breaks: (rec.breaks ?? []).filter((b) => b.id !== id),
        },
      };
    });
  };

  const updateBreak = (
    day: number,
    id: number,
    field: "start" | "end",
    value: string | undefined
  ) => {
    setRecords((prev) => {
      const rec = prev[day] || {};
      return {
        ...prev,
        [day]: {
          ...rec,
          breaks: (rec.breaks ?? []).map((b) =>
            b.id === id ? { ...b, [field]: value ?? "" } : b
          ),
        },
      };
    });
  };

  const dayStats = useMemo(() => {
    const stats: Record<
      number,
      { worked: number; bonus: number; total: number }
    > = {};
    for (let d = 1; d <= days; d++) {
      const rec = records[d] ?? getDefaultRecord();
      const typeInfo = WORK_TYPES.find(
        (t) => t.value === (rec.type ?? "work")
      )!;
      const start = timeToMinutes(rec.start);
      const end = timeToMinutes(rec.end);
      const rawWorked =
        start !== null && end !== null && end > start ? end - start : 0;
      const breakMins =
        rawWorked > 0 && rec.start && rec.end
          ? calcBreakMinutes(rec.start, rec.end, rec.breaks ?? [])
          : 0;
      const worked = Math.max(0, rawWorked - breakMins);
      stats[d] = {
        worked,
        bonus: typeInfo.bonus,
        total: worked + typeInfo.bonus,
      };
    }
    return stats;
  }, [records, days]);

  const totalMinutes = useMemo(
    () => Object.values(dayStats).reduce((s, v) => s + v.total, 0),
    [dayStats]
  );
  const actualWorkedMinutes = useMemo(
    () => Object.values(dayStats).reduce((s, v) => s + v.worked, 0),
    [dayStats]
  );
  const bonusMinutes = useMemo(
    () => Object.values(dayStats).reduce((s, v) => s + v.bonus, 0),
    [dayStats]
  );
  const diffMinutes = useMemo(
    () =>
      Object.values(dayStats).reduce(
        (s, v) => (v.total > 0 ? s + (v.total - 480) : s),
        0
      ),
    [dayStats]
  );

  const totalHours = totalMinutes / 60;
  const remainMinutes = requiredHours * 60 - totalMinutes;
  const isDone = totalHours >= requiredHours;
  const progressPct = Math.min(
    (totalMinutes / (requiredHours * 60)) * 100,
    100
  );

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  if (!mounted) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gray-100 px-4 py-5">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          {/* 헤더 */}
          <div className="bg-blue-600 rounded-2xl px-7 py-6 text-white shadow-lg">
            <p className="text-center text-xl font-bold">
              {year}년 {monthNames[month]}
            </p>
            <p className="text-center text-sm opacity-85 mt-1 mb-4">
              기준 시간: {requiredHours}시간 ({days}일 기준)
            </p>
            <LinearProgress
              variant="determinate"
              value={progressPct}
              sx={{
                height: 10,
                borderRadius: 5,
                mb: 1.5,
                bgcolor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: isDone ? "#a5d6a7" : "#fff",
                },
              }}
            />
            <div className="flex justify-between text-sm mt-1.5">
              <span>✅ 합산시간 : {minutesToHHMM(totalMinutes)}</span>
              <span>
                {isDone
                  ? "🎉 달성 완료!"
                  : `⏳ 남은시간 : ${minutesToHHMM(remainMinutes)}`}
              </span>
            </div>
            <div className="text-center text-sm mt-1">
              <span>
                {diffMinutes >= 0 ? "📈" : "📉"} 8h 기준 초과/부족 누적 :{" "}
                {diffMinutes >= 0 ? "+" : "-"}
                {minutesToHHMM(Math.abs(diffMinutes))}
              </span>
            </div>
          </div>

          {/* 테이블 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-[44px_1fr_1fr_1fr_34px_48px] px-2 py-3 bg-gray-50 border-b border-gray-200">
              {["날짜", "출근", "퇴근", "유형", "휴게", "합산"].map((h, i) => (
                <span
                  key={i}
                  className={`text-xs font-bold text-gray-500 ${
                    i === 0 ? "text-left" : "text-center"
                  }`}
                >
                  {h}
                </span>
              ))}
            </div>

            {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
              const label = getDayLabel(year, month, day);
              const weekend = isWeekend(year, month, day);
              const rec = records[day] ?? getDefaultRecord();
              const stat = dayStats[day];
              const isToday = today.getDate() === day;
              const type = rec.type ?? "work";
              const isFullDay = type === "annual" || type === "holiday";
              const isHoliday = type === "holiday";
              const isExpanded = expandedDay === day;
              const dayBreaks = rec.breaks ?? DEFAULT_BREAKS;
              const dayTextCn =
                label === "일"
                  ? "text-red-600"
                  : label === "토"
                  ? "text-blue-600"
                  : "text-gray-900";
              const rowBg = isToday
                ? "bg-blue-50"
                : weekend
                ? "bg-gray-50"
                : "bg-white";

              return (
                <div key={day} className={`border-b border-gray-200 ${rowBg}`}>
                  <div className="grid grid-cols-[44px_1fr_1fr_1fr_34px_48px] items-center px-2 py-[6px]">
                    <div className="flex items-center gap-0.5">
                      <span
                        className={`text-sm ${
                          isToday ? "font-bold" : "font-medium"
                        } ${dayTextCn}`}
                      >
                        {day}
                      </span>
                      <span className={`text-[11px] ${dayTextCn}`}>
                        ({label})
                      </span>
                    </div>
                    <div className="flex justify-center">
                      {weekend || isFullDay ? (
                        <span className="text-xs text-gray-400">-</span>
                      ) : (
                        <TimeField
                          value={strToDayjs(rec.start)}
                          onChange={(v) =>
                            setField(day, "start", dayjsToStr(v))
                          }
                          format="HH:mm"
                          size="small"
                          slotProps={{ textField: { sx: timeFieldSx } }}
                        />
                      )}
                    </div>
                    <div className="flex justify-center">
                      {weekend || isFullDay ? (
                        <span className="text-xs text-gray-400">-</span>
                      ) : (
                        <TimeField
                          value={strToDayjs(rec.end)}
                          onChange={(v) => setField(day, "end", dayjsToStr(v))}
                          format="HH:mm"
                          size="small"
                          slotProps={{ textField: { sx: timeFieldSx } }}
                        />
                      )}
                    </div>
                    <div className="flex justify-center">
                      {weekend ? (
                        <span className="text-xs text-gray-400">-</span>
                      ) : (
                        <Select
                          value={type}
                          onChange={(e: SelectChangeEvent) => {
                            const newType = e.target.value as WorkTypeValue;
                            const newIsFullDay =
                              newType === "annual" || newType === "holiday";
                            if (newIsFullDay) setExpandedDay(null);
                            setRecords((prev) => ({
                              ...prev,
                              [day]: {
                                ...getDefaultRecord(),
                                ...prev[day],
                                type: newType,
                                ...(newIsFullDay
                                  ? {
                                      start: undefined,
                                      end: undefined,
                                      breaks: DEFAULT_BREAKS.map((b) => ({
                                        ...b,
                                      })),
                                    }
                                  : {}),
                              },
                            }));
                          }}
                          size="small"
                          sx={getSelectSx(type)}
                        >
                          {WORK_TYPES.map((t) => (
                            <MenuItem key={t.value} value={t.value}>
                              {t.label}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    </div>
                    <div className="flex justify-center">
                      {!weekend && !isFullDay ? (
                        <button
                          onClick={() =>
                            setExpandedDay(isExpanded ? null : day)
                          }
                          className="relative text-[10px] text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? "▲" : "▼"}
                          {(() => {
                            const isModified =
                              dayBreaks.length !== DEFAULT_BREAKS.length ||
                              dayBreaks.some((b, i) =>
                                DEFAULT_BREAKS[i]
                                  ? b.start !== DEFAULT_BREAKS[i].start ||
                                    b.end !== DEFAULT_BREAKS[i].end
                                  : true
                              );
                            return isModified ? (
                              <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            ) : null;
                          })()}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                    <div className="flex justify-center items-center">
                      {stat.total === 0 || weekend || isHoliday ? (
                        <span className="text-xs text-gray-400">-</span>
                      ) : (
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded-lg ${
                            stat.total >= 480
                              ? "text-green-800 bg-green-50"
                              : "text-red-600 bg-red-50"
                          }`}
                        >
                          {minutesToHHMM(stat.total)}
                        </span>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-2 bg-gray-50 border-t border-dashed border-gray-200">
                      <p className="text-[11px] font-semibold text-gray-400 mb-2 mt-1">
                        ☕ 휴게시간
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {dayBreaks.map((b) => (
                          <div key={b.id} className="flex items-center gap-2">
                            <TimeField
                              value={strToDayjs(b.start)}
                              onChange={(v) =>
                                updateBreak(day, b.id, "start", dayjsToStr(v))
                              }
                              format="HH:mm"
                              size="small"
                              slotProps={{
                                textField: { sx: breakTimeFieldSx },
                              }}
                            />
                            <span className="text-gray-400 text-xs">~</span>
                            <TimeField
                              value={strToDayjs(b.end)}
                              onChange={(v) =>
                                updateBreak(day, b.id, "end", dayjsToStr(v))
                              }
                              format="HH:mm"
                              size="small"
                              slotProps={{
                                textField: { sx: breakTimeFieldSx },
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => removeBreak(day, b.id)}
                              sx={{
                                color: "#d1d5db",
                                "&:hover": { color: "#ef4444" },
                                p: 0.5,
                                fontSize: 12,
                              }}
                            >
                              ✕
                            </IconButton>
                          </div>
                        ))}
                        <button
                          onClick={() => addBreak(day)}
                          className="self-start text-xs text-blue-400 hover:text-blue-600 font-medium mt-0.5"
                        >
                          + 추가
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 대시보드 */}
          <div className="bg-white rounded-2xl px-6 py-5 shadow-sm flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "기준 시간",
                  value: minutesToHHMM(requiredHours * 60),
                  cn: "text-blue-600",
                },
                {
                  label: remainMinutes > 0 ? "남은 시간" : "초과 시간",
                  value: minutesToHHMM(Math.abs(remainMinutes)),
                  cn: "text-red-600",
                },
              ].map(({ label, value, cn }) => (
                <div
                  key={label}
                  className="bg-gray-100 rounded-xl p-3 text-center"
                >
                  <p className="text-[11px] text-gray-500 mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${cn}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "실근로 시간",
                  value: minutesToHHMM(actualWorkedMinutes),
                  cn: "text-green-600",
                },
                {
                  label: "기타 시간",
                  value: minutesToHHMM(bonusMinutes),
                  cn: "text-purple-700",
                },
                {
                  label: "합산 시간",
                  value: minutesToHHMM(totalMinutes),
                  cn: "text-orange-600",
                },
              ].map(({ label, value, cn }) => (
                <div
                  key={label}
                  className="bg-gray-100 rounded-xl p-3 text-center"
                >
                  <p className="text-[11px] text-gray-500 mb-1">{label}</p>
                  <p className={`text-xl font-bold ${cn}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <p className="text-[11px] text-gray-500 mb-1">
                8h 기준 초과/부족 누적
              </p>
              <p
                className={`text-xl font-bold ${
                  diffMinutes > 0
                    ? "text-green-600"
                    : diffMinutes < 0
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {diffMinutes >= 0 ? "+" : "-"}
                {minutesToHHMM(Math.abs(diffMinutes))}
              </p>
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="bg-white rounded-2xl px-6 py-4 shadow-sm flex gap-3 mt-4">
          {[
            { label: "📋 사용법", tab: "usage" },
            { label: "🚀 업데이트", tab: "patch" },
          ].map(({ label, tab }) => (
            <button
              key={tab}
              onClick={() => setShowInfo(tab as "usage" | "patch")}
              className="flex-1 text-sm font-medium text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-xl py-2.5 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
        {showNewPatch && (
          <NewPatchModal onClose={() => setShowNewPatch(false)} />
        )}
        {showInfo === "usage" && (
          <UsageModal onClose={() => setShowInfo(null)} />
        )}
        {showInfo === "patch" && (
          <PatchModal onClose={() => setShowInfo(null)} />
        )}
      </div>
    </LocalizationProvider>
  );
}

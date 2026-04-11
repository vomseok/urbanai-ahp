// 경북형 Urban AI AHP 플랫폼 - 쌍대비교 슬라이더
// 디자인: 9점 척도를 직관적인 슬라이더 UI로 표현
// 중앙(0) = 동등, 좌측 양수 = 좌측 우세, 우측 음수 = 우측 우세

import { useState, useCallback } from "react";
import { sliderToScale, scaleToSlider, getSliderLabel } from "@/lib/ahp";
import { cn } from "@/lib/utils";

interface PairwiseSliderProps {
  leftLabel: string;
  rightLabel: string;
  value: number; // AHP 척도 (1/9 ~ 9)
  onChange: (value: number) => void;
  pairIndex: number;
  totalPairs: number;
}

const SCALE_MARKS = [-8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const SCALE_LABELS_DISPLAY = [
  "9", "", "7", "", "5", "", "3", "", "1", "", "3", "", "5", "", "7", "", "9",
];

export default function PairwiseSlider({
  leftLabel,
  rightLabel,
  value,
  onChange,
  pairIndex,
  totalPairs,
}: PairwiseSliderProps) {
  const sliderValue = Math.round(scaleToSlider(value));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sv = parseInt(e.target.value);
      onChange(sliderToScale(sv));
    },
    [onChange]
  );

  const label = getSliderLabel(sliderValue, leftLabel, rightLabel);
  const absVal = Math.abs(sliderValue);

  // 슬라이더 배경 그라데이션 계산
  const percent = ((sliderValue + 8) / 16) * 100;
  const leftColor = sliderValue > 0 ? "oklch(0.26 0.08 255)" : "oklch(0.88 0.008 255)";
  const rightColor = sliderValue < 0 ? "oklch(0.26 0.08 255)" : "oklch(0.88 0.008 255)";

  return (
    <div className="bg-white border border-border rounded-lg p-5 mb-4 animate-fade-up">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground font-medium">
          비교 {pairIndex + 1} / {totalPairs}
        </span>
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            sliderValue === 0
              ? "bg-gray-100 text-gray-600"
              : "text-white"
          )}
          style={
            sliderValue !== 0
              ? { background: "oklch(0.26 0.08 255)" }
              : {}
          }
        >
          {sliderValue === 0 ? "동등 (1)" : `${absVal + 1}배 중요`}
        </span>
      </div>

      {/* 비교 레이블 */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-5">
        <div
          className={cn(
            "text-right p-3 rounded-md transition-all duration-200",
            sliderValue > 0
              ? "font-bold text-white"
              : "text-foreground/70"
          )}
          style={sliderValue > 0 ? { background: "oklch(0.26 0.08 255)" } : { background: "oklch(0.96 0.005 255)" }}
        >
          <p className="text-sm leading-tight">{leftLabel}</p>
        </div>

        <div className="text-center">
          <span className="text-xs text-muted-foreground font-medium">vs</span>
        </div>

        <div
          className={cn(
            "text-left p-3 rounded-md transition-all duration-200",
            sliderValue < 0
              ? "font-bold text-white"
              : "text-foreground/70"
          )}
          style={sliderValue < 0 ? { background: "oklch(0.26 0.08 255)" } : { background: "oklch(0.96 0.005 255)" }}
        >
          <p className="text-sm leading-tight">{rightLabel}</p>
        </div>
      </div>

      {/* 슬라이더 */}
      <div className="px-2">
        <input
          type="range"
          min="-8"
          max="8"
          step="1"
          value={sliderValue}
          onChange={handleChange}
          className="w-full pairwise-slider"
          style={{
            background: `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${percent}%, ${rightColor} ${percent}%, ${rightColor} 100%)`,
          }}
        />

        {/* 척도 눈금 */}
        <div className="flex justify-between mt-1.5 px-0">
          {SCALE_LABELS_DISPLAY.map((label, i) => (
            <div key={i} className="flex flex-col items-center" style={{ width: "6.25%" }}>
              <div
                className="h-1.5 w-px mb-0.5"
                style={{
                  background:
                    i === 8
                      ? "oklch(0.26 0.08 255)"
                      : "oklch(0.75 0.008 255)",
                }}
              />
              <span
                className="text-xs"
                style={{
                  color:
                    i === 8
                      ? "oklch(0.26 0.08 255)"
                      : "oklch(0.6 0.008 255)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.65rem",
                  fontWeight: i === 8 ? "600" : "400",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* 방향 레이블 */}
        <div className="flex justify-between mt-2">
          <span className="text-xs font-medium" style={{ color: "oklch(0.45 0.08 255)" }}>
            ← {leftLabel} 중요
          </span>
          <span className="text-xs font-medium" style={{ color: "oklch(0.45 0.08 255)" }}>
            {rightLabel} 중요 →
          </span>
        </div>
      </div>

      {/* 현재 판단 레이블 */}
      <div
        className="mt-4 text-center py-2 rounded-md"
        style={{ background: "oklch(0.96 0.005 255)" }}
      >
        <p className="text-sm font-medium text-foreground">{label}</p>
      </div>
    </div>
  );
}

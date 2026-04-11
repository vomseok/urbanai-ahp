// 경북형 Urban AI AHP 플랫폼 - 좌측 사이드바
// 디자인: 한국 행정문서 미니멀리즘 — 경북연구원 진한 파란 배경, 세로 단계 타임라인

import { useSurvey } from "@/contexts/SurveyContext";
import { CRITERIA } from "@/lib/ahp";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 0, label: "소개", sub: "연구 배경 및 방법론" },
  { id: 1, label: "전문가 정보", sub: "응답자 기본 정보 입력" },
  { id: 2, label: "대분류 비교", sub: "4개 평가 기준 중요도 비교" },
  ...CRITERIA.map((c, i) => ({
    id: 3 + i,
    label: `${c.label} 세부 비교`,
    sub: `${c.subCriteria.length}개 세부 지표 비교`,
  })),
  { id: 7, label: "결과 확인", sub: "가중치 산출 및 보고서 출력" },
];

export default function Sidebar() {
  const { currentStep, goToStep, state } = useSurvey();

  const isStepAccessible = (stepId: number) => {
    if (stepId === 0) return true;
    if (stepId === 1) return true;
    if (stepId === 2) return state.expert.name.trim().length > 0;
    if (stepId >= 3 && stepId <= 6) return state.expert.name.trim().length > 0;
    if (stepId === 7) return state.completed;
    return false;
  };

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: "oklch(0.26 0.08 255)" }}>
      {/* 로고 영역 */}
      <div className="px-6 py-6 border-b" style={{ borderColor: "oklch(0.35 0.06 255)" }}>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-1 h-8 rounded-full"
            style={{ background: "oklch(0.72 0.14 70)" }}
          />
          <div>
            <p className="text-xs font-medium" style={{ color: "oklch(0.72 0.14 70)" }}>
              경상북도연구원
            </p>
            <p className="text-sm font-bold text-white leading-tight">
              Urban AI
            </p>
          </div>
        </div>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: "oklch(0.75 0.04 255)" }}>
          생활SOC 시설 유지 가치<br />AHP 전문가 설문
        </p>
      </div>

      {/* 단계 목록 */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-3">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            const isAccessible = isStepAccessible(step.id);

            return (
              <li key={step.id}>
                <button
                  onClick={() => isAccessible && goToStep(step.id)}
                  disabled={!isAccessible}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-all duration-200",
                    isActive && "ahp-step-active",
                    isDone && !isActive && "ahp-step-done hover:opacity-90",
                    !isActive && !isDone && isAccessible && "hover:bg-white/10",
                    !isAccessible && "opacity-30 cursor-not-allowed"
                  )}
                  style={
                    isActive
                      ? {
                          background: "oklch(0.32 0.07 255)",
                          borderLeft: "3px solid oklch(0.72 0.14 70)",
                        }
                      : {}
                  }
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isDone ? (
                      <CheckCircle2
                        size={16}
                        style={{ color: "oklch(0.72 0.14 70)" }}
                      />
                    ) : isActive ? (
                      <ChevronRight
                        size={16}
                        style={{ color: "oklch(0.72 0.14 70)" }}
                      />
                    ) : (
                      <Circle size={16} style={{ color: "oklch(0.6 0.04 255)" }} />
                    )}
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium leading-tight",
                        isActive ? "text-white" : "text-white/80"
                      )}
                    >
                      {step.label}
                    </p>
                    <p
                      className="text-xs mt-0.5 leading-tight"
                      style={{ color: "oklch(0.65 0.04 255)" }}
                    >
                      {step.sub}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 하단 정보 */}
      <div className="px-6 py-4 border-t" style={{ borderColor: "oklch(0.35 0.06 255)" }}>
        <p className="text-xs" style={{ color: "oklch(0.55 0.04 255)" }}>
          경북연구원 기본과제
        </p>
        <p className="text-xs font-medium text-white/70 mt-0.5">
          지방소멸 UrbanAI 도입방안 연구
        </p>
        <p className="text-xs mt-2" style={{ color: "oklch(0.5 0.04 255)" }}>
          © 2026 경상북도연구원
        </p>
      </div>
    </aside>
  );
}

// 경북형 Urban AI AHP 플랫폼 - 메인 레이아웃
// 디자인: 한국 행정문서 미니멀리즘
// 좌측 사이드바(진행 단계) + 우측 메인 콘텐츠

import { SurveyProvider, useSurvey } from "@/contexts/SurveyContext";
import { CRITERIA } from "@/lib/ahp";
import Sidebar from "@/components/Sidebar";
import StepIntro from "@/pages/steps/StepIntro";
import StepExpert from "@/pages/steps/StepExpert";
import StepPairwise from "@/pages/steps/StepPairwise";
import StepResult from "@/pages/steps/StepResult";

function SurveyContent() {
  const { currentStep } = useSurvey();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepIntro />;
      case 1:
        return <StepExpert />;
      case 2:
        return <StepPairwise criterionId="root" />;
      case 3:
        return <StepPairwise criterionId={CRITERIA[0].id} />;
      case 4:
        return <StepPairwise criterionId={CRITERIA[1].id} />;
      case 5:
        return <StepPairwise criterionId={CRITERIA[2].id} />;
      case 6:
        return <StepPairwise criterionId={CRITERIA[3].id} />;
      case 7:
        return <StepResult />;
      default:
        return <StepIntro />;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* 좌측 사이드바 */}
      <Sidebar />

      {/* 우측 메인 콘텐츠 */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ background: "oklch(0.985 0.002 255)" }}
      >
        {/* 상단 헤더 바 */}
        <div
          className="sticky top-0 z-10 px-8 py-3 border-b flex items-center justify-between no-print"
          style={{
            background: "oklch(1 0 0)",
            borderColor: "oklch(0.88 0.008 255)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              경북형 Urban AI — 생활SOC 시설 AHP 평가 플랫폼
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "oklch(0.92 0.01 255)",
                color: "oklch(0.26 0.08 255)",
              }}
            >
              v1.0 · 2026
            </span>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="px-8 py-8">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <SurveyProvider>
      <SurveyContent />
    </SurveyProvider>
  );
}

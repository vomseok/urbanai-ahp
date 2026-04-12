// 0단계: 소개 페이지
import { useSurvey } from "@/contexts/SurveyContext";
import { CRITERIA } from "@/lib/ahp";
import { ArrowRight, BookOpen, BarChart3, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function StepIntro() {
  const { nextStep } = useSurvey();

  return (
    <div className="max-w-3xl mx-auto animate-slide-in">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 rounded-full" style={{ background: "oklch(0.26 0.08 255)" }} />
          <span className="text-sm font-medium" style={{ color: "oklch(0.45 0.08 255)" }}>
            경북연구원 기본과제 | 지방소멸 UrbanAI 도입방안 연구
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground leading-tight">
          생활SOC 시설 유지 가치 평가를 위한<br />
          <span style={{ color: "oklch(0.26 0.08 255)" }}>전문가 AHP 설문</span>
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed serif-body">
          본 설문은 경상북도 인구감소지역 내 보건의료 및 돌봄복지 시설의 종합적인 유지 가치를
          평가하기 위한 지표 간 상대적 중요도(가중치)를 산출하는 것을 목적으로 합니다.
          귀하의 응답은 '경북형 Urban AI 의사결정 모형'의 핵심 데이터로 활용됩니다.
        </p>
      </div>

      {/* 설문 개요 카드 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          {
            icon: Users,
            title: "조사 대상",
            content: "도시계획·보건복지·공간정보 분야 전문가 및 지자체 담당 공무원",
          },
          {
            icon: BookOpen,
            title: "평가 방법",
            content: "계층화 분석법(AHP) — 1:1 쌍대비교 방식으로 지표 간 중요도 판단",
          },
          {
            icon: BarChart3,
            title: "소요 시간",
            content: "약 15~20분 (대분류 6쌍 + 소분류 10쌍 = 총 16개 비교 문항)",
          },
          {
            icon: FileText,
            title: "결과 활용",
            content: "시설별 SCORE 지수 산출 및 최적 정책 대안(유지·통합·전환·폐지) 도출",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="result-card flex items-start gap-3"
          >
            <div
              className="p-2 rounded-md flex-shrink-0"
              style={{ background: "oklch(0.92 0.01 255)" }}
            >
              <item.icon size={18} style={{ color: "oklch(0.26 0.08 255)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 평가 지표 체계 */}
      <div className="result-card mb-8">
        <h2 className="text-base font-bold text-foreground mb-4">평가 지표 체계</h2>
        <div className="grid grid-cols-2 gap-3">
          {CRITERIA.map((criterion, i) => (
            <div
              key={criterion.id}
              className="p-3 rounded-md"
              style={{ background: "oklch(0.97 0.003 255)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
                  style={{ background: "oklch(0.26 0.08 255)" }}
                >
                  C{i + 1}
                </span>
                <span className="text-sm font-semibold text-foreground">{criterion.label}</span>
              </div>
              <ul className="space-y-1">
                {criterion.subCriteria.map((sub) => (
                  <li key={sub.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: "oklch(0.45 0.08 255)" }}
                    />
                    {sub.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* AHP 방법론 안내 */}
      <div
        className="p-4 rounded-lg mb-8 border-l-4"
        style={{
          background: "oklch(0.97 0.003 255)",
          borderLeftColor: "oklch(0.72 0.14 70)",
        }}
      >
        <h3 className="text-sm font-bold text-foreground mb-2">AHP 쌍대비교 방법 안내</h3>
        <p className="text-xs text-muted-foreground leading-relaxed serif-body">
          두 지표를 비교하여 어느 쪽이 더 중요한지, 그 정도를 1~9점 척도로 판단합니다.
          슬라이더를 중앙(동등)에서 중요하다고 생각하는 방향으로 이동하면 됩니다.
          1=동등, 3=약간 중요, 5=강하게 중요, 7=매우 강하게 중요, 9=절대적으로 중요.
          응답 완료 후 일관성 비율(CR)이 자동으로 계산되며, CR {'<'} 0.1이면 일관성이 양호합니다.
        </p>
      </div>

      <Button
        onClick={nextStep}
        size="lg"
        className="w-full text-white font-semibold"
        style={{ background: "oklch(0.26 0.08 255)" }}
      >
        설문 시작하기
        <ArrowRight size={18} className="ml-2" />
      </Button>

      <Link href="/aggregate">
        <Button
          variant="outline"
          size="lg"
          className="w-full font-semibold mt-3"
          style={{
            borderColor: "oklch(0.26 0.08 255)",
            color: "oklch(0.26 0.08 255)",
          }}
        >
          <Users size={18} className="mr-2" />
          전문가 응답 집계 분석으로 이동
        </Button>
      </Link>
    </div>
  );
}

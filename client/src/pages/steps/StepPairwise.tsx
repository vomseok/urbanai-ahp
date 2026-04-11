// 2단계 이후: 쌍대비교 설문 (대분류 + 소분류)
import { useMemo } from "react";
import { useSurvey } from "@/contexts/SurveyContext";
import { CRITERIA, analyzeAHP, sliderToScale, scaleToSlider } from "@/lib/ahp";
import PairwiseSlider from "@/components/PairwiseSlider";
import CRBadge from "@/components/CRBadge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface StepPairwiseProps {
  criterionId: "root" | string; // "root" = 대분류, 나머지 = 소분류
}

export default function StepPairwise({ criterionId }: StepPairwiseProps) {
  const { state, updateRootMatrix, updateSubMatrix, nextStep, prevStep } = useSurvey();

  // 현재 행렬 데이터 가져오기
  const pairwiseData = useMemo(() => {
    if (criterionId === "root") return state.rootMatrix;
    return state.subMatrices.find((sm) => sm.criterionId === criterionId)!;
  }, [criterionId, state.rootMatrix, state.subMatrices]);

  // 쌍대비교 쌍 목록 생성
  const pairs = useMemo(() => {
    const result: { row: number; col: number; leftLabel: string; rightLabel: string }[] = [];
    const labels = pairwiseData.labels;
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        result.push({ row: i, col: j, leftLabel: labels[i], rightLabel: labels[j] });
      }
    }
    return result;
  }, [pairwiseData.labels]);

  // AHP 분석 실시간 계산
  const ahpResult = useMemo(() => {
    return analyzeAHP(pairwiseData);
  }, [pairwiseData]);

  // 슬라이더 변경 핸들러
  const handleChange = (row: number, col: number, value: number) => {
    if (criterionId === "root") {
      updateRootMatrix(row, col, value);
    } else {
      updateSubMatrix(criterionId, row, col, value);
    }
  };

  // 헤더 정보
  const isRoot = criterionId === "root";
  const criterion = isRoot ? null : CRITERIA.find((c) => c.id === criterionId);
  const stepTitle = isRoot ? "대분류 지표 간 중요도 비교" : `${criterion?.label} — 세부 지표 비교`;
  const stepDesc = isRoot
    ? "4개 대분류 평가 기준 간의 상대적 중요도를 비교해 주세요."
    : `'${criterion?.label}' 항목의 세부 지표 간 상대적 중요도를 비교해 주세요.`;

  return (
    <div className="max-w-2xl mx-auto animate-slide-in">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 rounded-full" style={{ background: "oklch(0.26 0.08 255)" }} />
          <span className="text-sm font-medium" style={{ color: "oklch(0.45 0.08 255)" }}>
            {isRoot ? "2단계" : `${3 + CRITERIA.findIndex((c) => c.id === criterionId)}단계`} / 쌍대비교
          </span>
        </div>
        <h2 className="text-xl font-bold text-foreground">{stepTitle}</h2>
        <p className="text-sm text-muted-foreground mt-1 serif-body">{stepDesc}</p>
      </div>

      {/* 실시간 CR 표시 */}
      <CRBadge
        cr={ahpResult.cr}
        ci={ahpResult.ci}
        lambdaMax={ahpResult.lambdaMax}
        n={pairwiseData.size}
        showDetail={true}
        className="mb-6"
      />

      {/* 쌍대비교 슬라이더 목록 */}
      <div>
        {pairs.map((pair, idx) => (
          <PairwiseSlider
            key={`${pair.row}-${pair.col}`}
            leftLabel={pair.leftLabel}
            rightLabel={pair.rightLabel}
            value={pairwiseData.matrix[pair.row][pair.col]}
            onChange={(value) => handleChange(pair.row, pair.col, value)}
            pairIndex={idx}
            totalPairs={pairs.length}
          />
        ))}
      </div>

      {/* 현재 가중치 미리보기 */}
      <div className="result-card mt-6 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">현재 산출 가중치 (미리보기)</h3>
        <div className="space-y-2">
          {pairwiseData.labels.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-28 flex-shrink-0 truncate">{label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{
                    width: `${Math.max(ahpResult.weights[i] * 100, 3)}%`,
                    background: "oklch(0.26 0.08 255)",
                  }}
                />
              </div>
              <span
                className="text-xs font-bold w-12 text-right mono-data"
                style={{ color: "oklch(0.26 0.08 255)" }}
              >
                {(ahpResult.weights[i] * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          <ArrowLeft size={16} className="mr-2" />
          이전
        </Button>
        <Button
          onClick={nextStep}
          className="flex-[2] text-white font-semibold"
          style={{ background: "oklch(0.26 0.08 255)" }}
        >
          다음 단계
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

// 7단계: 결과 확인 및 보고서 출력
import { useMemo } from "react";
import { useSurvey } from "@/contexts/SurveyContext";
import {
  CRITERIA,
  analyzeAHP,
  calculateGlobalWeights,
  toPercent,
  getCRStatus,
  exportSurveyResult,
} from "@/lib/ahp";
import CRBadge from "@/components/CRBadge";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Printer, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function StepResult() {
  const { state, resetSurvey } = useSurvey();

  // 모든 AHP 분석 결과 계산
  const rootResult = useMemo(() => analyzeAHP(state.rootMatrix), [state.rootMatrix]);
  const subResults = useMemo(
    () => state.subMatrices.map((sm) => analyzeAHP(sm)),
    [state.subMatrices]
  );

  // 종합 가중치 계산
  const globalWeights = useMemo(
    () => calculateGlobalWeights(rootResult, subResults),
    [rootResult, subResults]
  );

  // 레이더 차트 데이터
  const radarData = CRITERIA.map((c, i) => ({
    subject: c.label,
    weight: Math.round(rootResult.weights[i] * 100 * 10) / 10,
    fullMark: 100,
  }));

  // 종합 가중치 바 차트 데이터
  const barData = globalWeights
    .sort((a, b) => b.globalWeight - a.globalWeight)
    .map((gw) => ({
      name: gw.label,
      parent: gw.parentLabel,
      value: Math.round(gw.globalWeight * 100 * 100) / 100,
    }));

  // 일관성 전체 검토
  const allConsistent = rootResult.isConsistent && subResults.every((r) => r.isConsistent);
  const inconsistentCount = [rootResult, ...subResults].filter((r) => !r.isConsistent).length;

  // JSON 내보내기
  const handleExport = () => {
    const json = exportSurveyResult(state, [rootResult, ...subResults]);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AHP_결과_${state.expert.name}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON 파일이 다운로드되었습니다.");
  };

  // 인쇄
  const handlePrint = () => {
    window.print();
  };

  const COLORS = [
    "oklch(0.26 0.08 255)",
    "oklch(0.38 0.10 255)",
    "oklch(0.50 0.11 255)",
    "oklch(0.62 0.10 255)",
    "oklch(0.45 0.08 200)",
    "oklch(0.55 0.10 200)",
    "oklch(0.65 0.09 200)",
    "oklch(0.72 0.14 70)",
    "oklch(0.62 0.12 70)",
    "oklch(0.52 0.10 70)",
    "oklch(0.42 0.08 70)",
  ];

  return (
    <div className="max-w-4xl mx-auto animate-slide-in">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 rounded-full" style={{ background: "oklch(0.26 0.08 255)" }} />
          <span className="text-sm font-medium" style={{ color: "oklch(0.45 0.08 255)" }}>
            7단계 / 결과 확인
          </span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">AHP 분석 결과</h2>
            <p className="text-sm text-muted-foreground mt-1">
              응답자: {state.expert.name} ({state.expert.organization} / {state.expert.position})
            </p>
          </div>
          <div className="flex gap-2 no-print">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer size={14} className="mr-1.5" />
              인쇄
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={14} className="mr-1.5" />
              JSON 저장
            </Button>
            <Link href="/aggregate">
              <Button
                size="sm"
                style={{ background: "oklch(0.26 0.08 255)", color: "white" }}
              >
                <Users size={14} className="mr-1.5" />
                전문가 집계 분석
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSurvey}
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              <RefreshCw size={14} className="mr-1.5" />
              재설문
            </Button>
          </div>
        </div>
      </div>

      {/* 일관성 종합 요약 */}
      <div
        className="p-4 rounded-lg mb-6 flex items-center gap-3"
        style={{
          background: allConsistent ? "oklch(0.95 0.05 145)" : "oklch(0.97 0.05 70)",
          border: `1px solid ${allConsistent ? "oklch(0.75 0.12 145)" : "oklch(0.85 0.12 70)"}`,
        }}
      >
        {allConsistent ? (
          <CheckCircle2 size={20} style={{ color: "oklch(0.55 0.15 145)" }} />
        ) : (
          <AlertTriangle size={20} style={{ color: "oklch(0.65 0.14 70)" }} />
        )}
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: allConsistent ? "oklch(0.35 0.12 145)" : "oklch(0.45 0.12 70)" }}
          >
            {allConsistent
              ? "모든 비교 판단의 일관성이 양호합니다 (CR < 0.1)"
              : `${inconsistentCount}개 비교 그룹의 일관성 검토가 필요합니다 (CR ≥ 0.1)`}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: allConsistent ? "oklch(0.5 0.10 145)" : "oklch(0.55 0.10 70)" }}
          >
            {allConsistent
              ? "분석 결과를 신뢰할 수 있습니다."
              : "일관성이 낮은 항목을 재검토하면 더 신뢰할 수 있는 결과를 얻을 수 있습니다."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* 대분류 가중치 레이더 차트 */}
        <div className="result-card">
          <h3 className="text-sm font-bold text-foreground mb-1">대분류 가중치 분포</h3>
          <p className="text-xs text-muted-foreground mb-4">4개 평가 기준의 상대적 중요도</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="oklch(0.88 0.008 255)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: "oklch(0.4 0.02 255)", fontFamily: "'Noto Sans KR', sans-serif" }}
              />
              <Radar
                name="가중치"
                dataKey="weight"
                stroke="oklch(0.26 0.08 255)"
                fill="oklch(0.26 0.08 255)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 대분류 가중치 상세 */}
        <div className="result-card">
          <h3 className="text-sm font-bold text-foreground mb-1">대분류 가중치 상세</h3>
          <CRBadge
            cr={rootResult.cr}
            ci={rootResult.ci}
            lambdaMax={rootResult.lambdaMax}
            showDetail={true}
            className="mb-4"
          />
          <div className="space-y-3">
            {CRITERIA.map((c, i) => (
              <div key={c.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-foreground">{c.label}</span>
                  <span
                    className="text-xs font-bold mono-data"
                    style={{ color: "oklch(0.26 0.08 255)" }}
                  >
                    {toPercent(rootResult.weights[i])}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${rootResult.weights[i] * 100}%`,
                      background: COLORS[i],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 종합 가중치 바 차트 */}
      <div className="result-card mb-6">
        <h3 className="text-sm font-bold text-foreground mb-1">종합 가중치 (전체 지표)</h3>
        <p className="text-xs text-muted-foreground mb-4">
          대분류 가중치 × 소분류 가중치로 산출된 최종 종합 가중치
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 0, right: 60, left: 100, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(0.92 0.004 255)" />
            <XAxis
              type="number"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fontFamily: "'Noto Sans KR', sans-serif", fill: "oklch(0.35 0.02 255)" }}
              width={95}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "종합 가중치"]}
              contentStyle={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "12px",
                border: "1px solid oklch(0.88 0.008 255)",
              }}
            />
            <Bar dataKey="value" radius={[0, 3, 3, 0]}>
              {barData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 소분류 상세 결과 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {CRITERIA.map((criterion, cIdx) => {
          const subResult = subResults[cIdx];
          return (
            <div key={criterion.id} className="result-card">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
                  style={{ background: "oklch(0.26 0.08 255)" }}
                >
                  C{cIdx + 1}
                </span>
                <h4 className="text-sm font-semibold text-foreground">{criterion.label}</h4>
              </div>
              <CRBadge cr={subResult.cr} className="mb-3" />
              <div className="space-y-2">
                {criterion.subCriteria.map((sub, sIdx) => (
                  <div key={sub.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex-1 truncate">{sub.label}</span>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${subResult.weights[sIdx] * 100}%`,
                          background: COLORS[cIdx],
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold w-10 text-right mono-data"
                      style={{ color: "oklch(0.26 0.08 255)" }}
                    >
                      {toPercent(subResult.weights[sIdx])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 쌍대비교 행렬 요약 */}
      <div className="result-card mb-6">
        <h3 className="text-sm font-bold text-foreground mb-3">대분류 쌍대비교 행렬</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 font-medium text-muted-foreground"></th>
                {CRITERIA.map((c) => (
                  <th
                    key={c.id}
                    className="p-2 font-medium text-center"
                    style={{ color: "oklch(0.26 0.08 255)" }}
                  >
                    {c.label}
                  </th>
                ))}
                <th className="p-2 font-bold text-center" style={{ color: "oklch(0.26 0.08 255)" }}>
                  가중치
                </th>
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? "bg-gray-50/50" : ""}>
                  <td className="p-2 font-medium text-foreground">{c.label}</td>
                  {state.rootMatrix.matrix[i].map((val, j) => (
                    <td
                      key={j}
                      className="p-2 text-center mono-data"
                      style={{
                        color: i === j ? "oklch(0.5 0.02 255)" : "oklch(0.3 0.04 255)",
                        fontWeight: i === j ? "400" : "500",
                      }}
                    >
                      {i === j ? "1" : val >= 1 ? val.toFixed(2) : `1/${Math.round(1 / val)}`}
                    </td>
                  ))}
                  <td
                    className="p-2 text-center font-bold mono-data"
                    style={{ color: "oklch(0.26 0.08 255)" }}
                  >
                    {toPercent(rootResult.weights[i])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-3 no-print">
        <Button variant="outline" onClick={handlePrint} className="flex-1">
          <Printer size={16} className="mr-2" />
          결과 인쇄
        </Button>
        <Button
          onClick={handleExport}
          className="flex-[2] text-white font-semibold"
          style={{ background: "oklch(0.26 0.08 255)" }}
        >
          <Download size={16} className="mr-2" />
          JSON 파일로 저장
        </Button>
      </div>
    </div>
  );
}

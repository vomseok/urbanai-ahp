// 다중 전문가 AHP 집계 페이지
// 디자인: 한국 행정문서 미니멀리즘 — 경북연구원 색상 체계 (#1A3A6B)
import { useState, useCallback, useMemo } from "react";
import { Link } from "wouter";
import {
  CRITERIA,
  parseExpertJSON,
  aggregateAllCriteria,
  calculateAggregatedGlobalWeights,
  toPercent,
  getCRStatus,
  ParsedExpertResult,
  AggregatedResult,
} from "@/lib/ahp";
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowLeft,
  Users,
  FileJson,
  BarChart2,
  Info,
  RefreshCw,
  Loader2,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import CRBadge from "@/components/CRBadge";

// ▶ Google Apps Script 웹앱 URL (VITE_APPS_SCRIPT_URL 환경변수로 설정)
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "";

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

const EXPERT_COLORS = [
  "#1a3a6b", "#2563eb", "#0891b2", "#059669",
  "#d97706", "#dc2626", "#7c3aed", "#db2777",
  "#65a30d", "#0f766e",
];

interface UploadedFile {
  name: string;
  parsed: ParsedExpertResult;
  error?: string;
}

export default function Aggregate() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "result">("upload");
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsError, setSheetsError] = useState("");
  const [sheetsLoaded, setSheetsLoaded] = useState(false);

  // Google Sheets에서 응답 불러오기
  const handleLoadFromSheets = useCallback(async () => {
    if (!APPS_SCRIPT_URL) {
      toast.error("Google Sheets URL이 설정되지 않았습니다.");
      return;
    }
    setSheetsLoading(true);
    setSheetsError("");
    try {
      const res = await fetch(APPS_SCRIPT_URL, { method: "GET" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "불러오기 실패");
      const responses: ParsedExpertResult[] = data.responses
        .filter((r: any) => r.ahp_results_json)
        .map((r: any) => {
          const raw = typeof r.ahp_results === "object" ? r.ahp_results : JSON.parse(r.ahp_results_json);
          return {
            expert: raw.expertInfo || raw.metadata?.expert || {},
            timestamp: raw.timestamp || raw.metadata?.timestamp || "",
            results: raw.results || [],
          } as ParsedExpertResult;
        });
      if (responses.length === 0) {
        toast.warning("Google Sheets에 저장된 응답이 없습니다.");
        setSheetsLoading(false);
        return;
      }
      setUploadedFiles(responses.map((p, i) => ({
        name: `sheets_응답_${i + 1}_${p.expert.name || "전문가"}.json`,
        parsed: p,
      })));
      setSheetsLoaded(true);
      toast.success(`Google Sheets에서 ${responses.length}명의 응답을 불러왔습니다.`);
    } catch (err) {
      setSheetsError(String(err));
      toast.error(`불러오기 실패: ${err}`);
    } finally {
      setSheetsLoading(false);
    }
  }, []);

  // 파일 파싱 처리
  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const jsonFiles = fileArray.filter((f) => f.name.endsWith(".json"));

    if (jsonFiles.length === 0) {
      toast.error("JSON 파일만 업로드할 수 있습니다.");
      return;
    }

    jsonFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = e.target?.result as string;
        try {
          const parsed = parseExpertJSON(raw);
          setUploadedFiles((prev) => {
            // 중복 파일 방지
            if (prev.some((f) => f.name === file.name)) {
              toast.warning(`"${file.name}"은 이미 업로드된 파일입니다.`);
              return prev;
            }
            toast.success(`"${parsed.expert.name}" 전문가 응답이 추가되었습니다.`);
            return [...prev, { name: file.name, parsed }];
          });
        } catch {
          toast.error(`"${file.name}" 파일 형식이 올바르지 않습니다.`);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  // 드래그 앤 드롭
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // 파일 선택
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  };

  // 파일 제거
  const removeFile = (name: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== name));
    toast.info("파일이 제거되었습니다.");
  };

  // 집계 계산
  const aggregatedResults = useMemo<AggregatedResult[] | null>(() => {
    if (uploadedFiles.length < 2) return null;
    try {
      return aggregateAllCriteria(uploadedFiles.map((f) => f.parsed));
    } catch {
      return null;
    }
  }, [uploadedFiles]);

  const globalWeights = useMemo(() => {
    if (!aggregatedResults) return [];
    return calculateAggregatedGlobalWeights(aggregatedResults);
  }, [aggregatedResults]);

  const rootAggResult = aggregatedResults?.find((r) => r.criterionId === "root");

  // 레이더 차트 데이터
  const radarData = useMemo(() => {
    if (!rootAggResult) return [];
    return CRITERIA.map((c, i) => ({
      subject: c.label,
      weight: Math.round(rootAggResult.aggregatedWeights[i] * 100 * 10) / 10,
      fullMark: 100,
    }));
  }, [rootAggResult]);

  // 바 차트 데이터
  const barData = useMemo(() => {
    return globalWeights
      .sort((a, b) => b.globalWeight - a.globalWeight)
      .map((gw) => ({
        name: gw.label,
        parent: gw.parentLabel,
        value: Math.round(gw.globalWeight * 100 * 100) / 100,
      }));
  }, [globalWeights]);

  // 전문가별 대분류 가중치 비교 (라인 차트)
  const expertCompareData = useMemo(() => {
    if (!rootAggResult) return [];
    return CRITERIA.map((c, cIdx) => {
      const point: Record<string, number | string> = { name: c.label };
      uploadedFiles.forEach((f, eIdx) => {
        const r = f.parsed.results.find((r) => r.criterionId === "root");
        if (r) point[`전문가${eIdx + 1}`] = Math.round(r.weights[cIdx] * 100 * 10) / 10;
      });
      if (rootAggResult) {
        point["집계(기하평균)"] = Math.round(rootAggResult.aggregatedWeights[cIdx] * 100 * 10) / 10;
      }
      return point;
    });
  }, [uploadedFiles, rootAggResult]);

  // JSON 내보내기
  const handleExportJSON = () => {
    if (!aggregatedResults) return;
    const output = {
      metadata: {
        title: "경북형 Urban AI 생활SOC 시설 AHP 집계 결과",
        version: "1.0",
        timestamp: new Date().toISOString(),
        expertCount: uploadedFiles.length,
        experts: uploadedFiles.map((f) => ({
          name: f.parsed.expert.name,
          organization: f.parsed.expert.organization,
          position: f.parsed.expert.position,
        })),
        method: "기하평균(Geometric Mean) 통합",
      },
      aggregatedResults: aggregatedResults.map((r) => ({
        criterionId: r.criterionId,
        labels: r.labels,
        aggregatedWeights: r.aggregatedWeights.map((w) => Math.round(w * 10000) / 10000),
        individualWeights: r.individualWeights,
        crValues: r.crValues,
        inconsistentCount: r.inconsistentCount,
      })),
      globalWeights: globalWeights.map((gw) => ({
        id: gw.id,
        label: gw.label,
        parentLabel: gw.parentLabel,
        globalWeight: Math.round(gw.globalWeight * 10000) / 10000,
      })),
    };
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AHP_집계결과_${uploadedFiles.length}명_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("집계 결과 JSON이 다운로드되었습니다.");
  };

  const canAggregate = uploadedFiles.length >= 2;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.005 255)" }}>
      {/* 상단 헤더 */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b"
        style={{
          background: "white",
          borderColor: "oklch(0.90 0.008 255)",
          boxShadow: "0 1px 4px oklch(0.26 0.08 255 / 0.08)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link href="/">
            <button
              className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
              style={{ color: "oklch(0.45 0.08 255)" }}
            >
              <ArrowLeft size={15} />
              <span>설문으로 돌아가기</span>
            </button>
          </Link>
          <div
            className="h-4 w-px"
            style={{ background: "oklch(0.85 0.008 255)" }}
          />
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-5 rounded-full"
              style={{ background: "oklch(0.26 0.08 255)" }}
            />
            <span className="text-sm font-bold text-foreground">
              전문가 응답 집계 분석
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{
              background: "oklch(0.92 0.05 255)",
              color: "oklch(0.26 0.08 255)",
            }}
          >
            경북연구원 기본과제 | 지방소멸 UrbanAI 도입방안 연구
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            다중 전문가 AHP 집계 분석
          </h1>
          <p className="text-sm text-muted-foreground">
            여러 전문가의 AHP 설문 결과(JSON)를 업로드하면 기하평균(Geometric Mean) 방식으로
            가중치를 통합하여 합의된 최종 가중치를 산출합니다.
          </p>
        </div>

        {/* 탭 */}
        <div
          className="flex gap-1 mb-6 p-1 rounded-lg w-fit"
          style={{ background: "oklch(0.92 0.008 255)" }}
        >
          {[
            { key: "upload", label: "파일 업로드", icon: <Upload size={14} /> },
            {
              key: "result",
              label: "집계 결과",
              icon: <BarChart2 size={14} />,
              disabled: !canAggregate,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && setActiveTab(tab.key as "upload" | "result")}
              disabled={tab.disabled}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.key ? "white" : "transparent",
                color:
                  tab.disabled
                    ? "oklch(0.70 0.008 255)"
                    : activeTab === tab.key
                    ? "oklch(0.26 0.08 255)"
                    : "oklch(0.50 0.02 255)",
                boxShadow:
                  activeTab === tab.key
                    ? "0 1px 3px oklch(0.26 0.08 255 / 0.12)"
                    : "none",
                cursor: tab.disabled ? "not-allowed" : "pointer",
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.key === "upload" && uploadedFiles.length > 0 && (
                <span
                  className="ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: "oklch(0.26 0.08 255)",
                    color: "white",
                  }}
                >
                  {uploadedFiles.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── 업로드 탭 ─── */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            {/* Google Sheets 불러오기 */}
            {APPS_SCRIPT_URL && (
              <div
                className="rounded-xl border p-5 flex items-center justify-between"
                style={{
                  background: sheetsLoaded ? "oklch(0.95 0.05 145)" : "white",
                  borderColor: sheetsLoaded ? "oklch(0.75 0.12 145)" : "oklch(0.82 0.015 255)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: sheetsLoaded ? "oklch(0.88 0.10 145)" : "oklch(0.92 0.05 255)" }}
                  >
                    <Database size={20} style={{ color: sheetsLoaded ? "oklch(0.35 0.15 145)" : "oklch(0.26 0.08 255)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Google Sheets에서 자동 불러오기
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sheetsLoaded
                        ? `${uploadedFiles.length}명의 응답을 불러왔습니다.`
                        : "설문 응답이 자동 저장된 Google Sheets에서 직접 불러옵니다."}
                    </p>
                    {sheetsError && (
                      <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.15 25)" }}>{sheetsError}</p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleLoadFromSheets}
                  disabled={sheetsLoading}
                  size="sm"
                  style={{
                    background: sheetsLoaded ? "oklch(0.45 0.15 145)" : "oklch(0.26 0.08 255)",
                    color: "white",
                  }}
                >
                  {sheetsLoading ? (
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                  ) : (
                    <RefreshCw size={14} className="mr-1.5" />
                  )}
                  {sheetsLoaded ? "새로고침" : "불러오기"}
                </Button>
              </div>
            )}

            {/* 구분선 */}
            {APPS_SCRIPT_URL && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "oklch(0.88 0.008 255)" }} />
                <span className="text-xs text-muted-foreground">또는 JSON 파일 직접 업로드</span>
                <div className="flex-1 h-px" style={{ background: "oklch(0.88 0.008 255)" }} />
              </div>
            )}

            {/* 드래그 앤 드롭 영역 */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="rounded-xl border-2 border-dashed transition-all"
              style={{
                borderColor: isDragging
                  ? "oklch(0.26 0.08 255)"
                  : "oklch(0.82 0.015 255)",
                background: isDragging
                  ? "oklch(0.94 0.04 255)"
                  : "white",
                padding: "3rem 2rem",
                textAlign: "center",
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "oklch(0.92 0.05 255)" }}
                >
                  <FileJson size={32} style={{ color: "oklch(0.26 0.08 255)" }} />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground mb-1">
                    JSON 파일을 이곳에 끌어다 놓으세요
                  </p>
                  <p className="text-sm text-muted-foreground">
                    또는 아래 버튼을 클릭하여 파일을 선택하세요
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AHP 설문 결과 페이지에서 "JSON 저장" 버튼으로 내보낸 파일만 지원됩니다
                  </p>
                </div>
                <label>
                  <input
                    type="file"
                    multiple
                    accept=".json"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    style={{
                      borderColor: "oklch(0.26 0.08 255)",
                      color: "oklch(0.26 0.08 255)",
                    }}
                    asChild
                  >
                    <span>
                      <Upload size={14} className="mr-1.5" />
                      파일 선택
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* 업로드된 파일 목록 */}
            {uploadedFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Users size={15} style={{ color: "oklch(0.26 0.08 255)" }} />
                    업로드된 전문가 응답 ({uploadedFiles.length}명)
                  </h3>
                  {canAggregate && (
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("result")}
                      style={{
                        background: "oklch(0.26 0.08 255)",
                        color: "white",
                      }}
                    >
                      <BarChart2 size={14} className="mr-1.5" />
                      집계 결과 보기
                    </Button>
                  )}
                </div>

                {!canAggregate && (
                  <div
                    className="flex items-center gap-2 p-3 rounded-lg mb-3 text-sm"
                    style={{
                      background: "oklch(0.97 0.04 70)",
                      border: "1px solid oklch(0.88 0.08 70)",
                      color: "oklch(0.45 0.10 70)",
                    }}
                  >
                    <Info size={15} />
                    집계를 위해 최소 2명 이상의 전문가 응답이 필요합니다.
                    현재 {uploadedFiles.length}명 업로드됨.
                  </div>
                )}

                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => {
                    const inconsistentCount = file.parsed.results.filter(
                      (r) => !r.isConsistent
                    ).length;
                    return (
                      <div
                        key={file.name}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                        style={{
                          background: "white",
                          borderColor: "oklch(0.90 0.008 255)",
                        }}
                      >
                        {/* 전문가 번호 배지 */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: EXPERT_COLORS[idx % EXPERT_COLORS.length] }}
                        >
                          {idx + 1}
                        </div>

                        {/* 전문가 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {file.parsed.expert.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {file.parsed.expert.organization} ·{" "}
                              {file.parsed.expert.position}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {file.parsed.expert.expertise} · 경력{" "}
                              {file.parsed.expert.experience}
                            </span>
                            {inconsistentCount > 0 ? (
                              <span
                                className="flex items-center gap-1 text-xs"
                                style={{ color: "oklch(0.55 0.14 70)" }}
                              >
                                <AlertTriangle size={11} />
                                일관성 미달 {inconsistentCount}건
                              </span>
                            ) : (
                              <span
                                className="flex items-center gap-1 text-xs"
                                style={{ color: "oklch(0.45 0.14 145)" }}
                              >
                                <CheckCircle2 size={11} />
                                일관성 양호
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 파일명 */}
                        <span className="text-xs text-muted-foreground hidden md:block truncate max-w-32">
                          {file.name}
                        </span>

                        {/* 제거 버튼 */}
                        <button
                          onClick={() => removeFile(file.name)}
                          className="p-1.5 rounded-md transition-colors hover:bg-gray-100 flex-shrink-0"
                          style={{ color: "oklch(0.60 0.02 255)" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 안내 박스 */}
            <div
              className="rounded-lg p-4"
              style={{
                background: "oklch(0.95 0.03 255)",
                border: "1px solid oklch(0.88 0.05 255)",
              }}
            >
              <h4
                className="text-xs font-bold mb-2"
                style={{ color: "oklch(0.26 0.08 255)" }}
              >
                기하평균 통합 방법론 안내
              </h4>
              <ul className="space-y-1">
                {[
                  "각 전문가의 지표별 가중치를 기하평균으로 통합합니다: w̄ᵢ = (w₁ᵢ × w₂ᵢ × ... × wₙᵢ)^(1/n)",
                  "통합 후 합이 1이 되도록 정규화합니다.",
                  "일관성 비율(CR)이 0.1 이상인 응답은 집계에 포함되지만 경고가 표시됩니다.",
                  "최소 2명 이상의 응답이 있어야 집계가 가능합니다.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span
                      className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{
                        background: "oklch(0.38 0.08 255)",
                        fontSize: "9px",
                      }}
                    >
                      {i + 1}
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ─── 결과 탭 ─── */}
        {activeTab === "result" && aggregatedResults && rootAggResult && (
          <div className="space-y-6 animate-slide-in">
            {/* 요약 헤더 */}
            <div
              className="flex items-center justify-between p-4 rounded-xl border"
              style={{
                background: "white",
                borderColor: "oklch(0.88 0.008 255)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "oklch(0.92 0.05 255)" }}
                >
                  <Users size={20} style={{ color: "oklch(0.26 0.08 255)" }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {uploadedFiles.length}명 전문가 응답 기하평균 집계 결과
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedFiles.map((f) => f.parsed.expert.name).join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="no-print"
                >
                  인쇄
                </Button>
                <Button
                  size="sm"
                  onClick={handleExportJSON}
                  className="no-print"
                  style={{ background: "oklch(0.26 0.08 255)", color: "white" }}
                >
                  <Download size={14} className="mr-1.5" />
                  JSON 저장
                </Button>
              </div>
            </div>

            {/* 대분류 가중치 — 레이더 + 상세 */}
            <div className="grid grid-cols-2 gap-6">
              <div
                className="rounded-xl border p-5"
                style={{ background: "white", borderColor: "oklch(0.90 0.008 255)" }}
              >
                <h3 className="text-sm font-bold text-foreground mb-1">
                  대분류 집계 가중치 분포
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {uploadedFiles.length}명 전문가 기하평균
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="oklch(0.88 0.008 255)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{
                        fontSize: 11,
                        fill: "oklch(0.4 0.02 255)",
                        fontFamily: "'Noto Sans KR', sans-serif",
                      }}
                    />
                    <Radar
                      name="집계 가중치"
                      dataKey="weight"
                      stroke="oklch(0.26 0.08 255)"
                      fill="oklch(0.26 0.08 255)"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div
                className="rounded-xl border p-5"
                style={{ background: "white", borderColor: "oklch(0.90 0.008 255)" }}
              >
                <h3 className="text-sm font-bold text-foreground mb-3">
                  대분류 집계 가중치 상세
                </h3>
                <div className="space-y-3">
                  {CRITERIA.map((c, i) => (
                    <div key={c.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-foreground">
                          {c.label}
                        </span>
                        <span
                          className="text-xs font-bold mono-data"
                          style={{ color: "oklch(0.26 0.08 255)" }}
                        >
                          {toPercent(rootAggResult.aggregatedWeights[i])}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${rootAggResult.aggregatedWeights[i] * 100}%`,
                            background: COLORS[i],
                          }}
                        />
                      </div>
                      {/* 전문가별 개별 가중치 미니 바 */}
                      <div className="flex gap-0.5 mt-1">
                        {rootAggResult.individualWeights.map((w, eIdx) => (
                          <div
                            key={eIdx}
                            className="h-1 rounded-full flex-1 opacity-50"
                            style={{
                              background: EXPERT_COLORS[eIdx % EXPERT_COLORS.length],
                              width: `${w[i] * 100}%`,
                            }}
                            title={`${uploadedFiles[eIdx]?.parsed.expert.name}: ${toPercent(w[i])}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * 하단 작은 막대: 전문가별 개별 가중치
                </p>
              </div>
            </div>

            {/* 전문가별 비교 라인 차트 */}
            <div
              className="rounded-xl border p-5"
              style={{ background: "white", borderColor: "oklch(0.90 0.008 255)" }}
            >
              <h3 className="text-sm font-bold text-foreground mb-1">
                전문가별 대분류 가중치 비교
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                개별 전문가 응답과 기하평균 집계 결과 비교
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={expertCompareData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.004 255)" />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fill: "oklch(0.4 0.02 255)",
                    }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`]}
                    contentStyle={{
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fontSize: "11px",
                    }}
                  />
                  {uploadedFiles.map((f, eIdx) => (
                    <Line
                      key={eIdx}
                      type="monotone"
                      dataKey={`전문가${eIdx + 1}`}
                      stroke={EXPERT_COLORS[eIdx % EXPERT_COLORS.length]}
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      dot={{ r: 3 }}
                      name={f.parsed.expert.name}
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="집계(기하평균)"
                    stroke="oklch(0.26 0.08 255)"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: "oklch(0.26 0.08 255)" }}
                    name="집계(기하평균)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 종합 가중치 바 차트 */}
            <div
              className="rounded-xl border p-5"
              style={{ background: "white", borderColor: "oklch(0.90 0.008 255)" }}
            >
              <h3 className="text-sm font-bold text-foreground mb-1">
                종합 집계 가중치 (전체 지표)
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                대분류 × 소분류 집계 가중치로 산출된 최종 종합 가중치
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 0, right: 60, left: 110, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="oklch(0.92 0.004 255)"
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fill: "oklch(0.35 0.02 255)",
                    }}
                    width={105}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "종합 가중치"]}
                    contentStyle={{
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fontSize: "12px",
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

            {/* 소분류 집계 상세 */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">
                소분류 집계 가중치 상세
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {CRITERIA.map((criterion, cIdx) => {
                  const subAgg = aggregatedResults.find(
                    (r) => r.criterionId === criterion.id
                  );
                  if (!subAgg) return null;
                  const inconsistentExperts = subAgg.crValues.filter(
                    (cr) => cr >= 0.1
                  ).length;
                  return (
                    <div
                      key={criterion.id}
                      className="rounded-xl border p-4"
                      style={{
                        background: "white",
                        borderColor: "oklch(0.90 0.008 255)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
                          style={{ background: "oklch(0.26 0.08 255)" }}
                        >
                          C{cIdx + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-foreground">
                          {criterion.label}
                        </h4>
                        {inconsistentExperts > 0 && (
                          <span
                            className="text-xs flex items-center gap-0.5 ml-auto"
                            style={{ color: "oklch(0.55 0.14 70)" }}
                          >
                            <AlertTriangle size={11} />
                            {inconsistentExperts}명 CR 미달
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {criterion.subCriteria.map((sub, sIdx) => (
                          <div key={sub.id}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs text-muted-foreground flex-1 truncate">
                                {sub.label}
                              </span>
                              <span
                                className="text-xs font-bold mono-data"
                                style={{ color: "oklch(0.26 0.08 255)" }}
                              >
                                {toPercent(subAgg.aggregatedWeights[sIdx])}
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${subAgg.aggregatedWeights[sIdx] * 100}%`,
                                  background: COLORS[cIdx],
                                }}
                              />
                            </div>
                            {/* 전문가별 개별 가중치 */}
                            <div className="flex gap-0.5 mt-0.5">
                              {subAgg.individualWeights.map((w, eIdx) => (
                                <div
                                  key={eIdx}
                                  className="h-0.5 rounded-full opacity-40"
                                  style={{
                                    background:
                                      EXPERT_COLORS[eIdx % EXPERT_COLORS.length],
                                    width: `${w[sIdx] * 100}%`,
                                    flex: "1",
                                  }}
                                  title={`${uploadedFiles[eIdx]?.parsed.expert.name}: ${toPercent(w[sIdx])}`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* CR 요약 */}
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: "oklch(0.93 0.008 255)" }}>
                        <div className="flex flex-wrap gap-1">
                          {subAgg.crValues.map((cr, eIdx) => {
                            const status = getCRStatus(cr);
                            return (
                              <span
                                key={eIdx}
                                className="text-xs px-1.5 py-0.5 rounded font-mono"
                                style={{
                                  background:
                                    status === "good"
                                      ? "oklch(0.93 0.05 145)"
                                      : "oklch(0.95 0.06 70)",
                                  color:
                                    status === "good"
                                      ? "oklch(0.35 0.12 145)"
                                      : "oklch(0.45 0.12 70)",
                                }}
                                title={uploadedFiles[eIdx]?.parsed.expert.name}
                              >
                                E{eIdx + 1}: CR={cr.toFixed(3)}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 전문가 목록 테이블 */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "oklch(0.90 0.008 255)" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "oklch(0.26 0.08 255)" }}>
                    {["번호", "성명", "소속", "직위", "전문 분야", "경력", "일관성"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-white"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.map((f, idx) => {
                    const inconsistentCount = f.parsed.results.filter(
                      (r) => !r.isConsistent
                    ).length;
                    return (
                      <tr
                        key={f.name}
                        style={{
                          background:
                            idx % 2 === 0 ? "white" : "oklch(0.97 0.003 255)",
                          borderBottom: "1px solid oklch(0.93 0.004 255)",
                        }}
                      >
                        <td className="px-4 py-2.5 text-xs font-bold" style={{ color: "oklch(0.26 0.08 255)" }}>
                          E{idx + 1}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-medium text-foreground">
                          {f.parsed.expert.name}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {f.parsed.expert.organization}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {f.parsed.expert.position}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {f.parsed.expert.expertise}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {f.parsed.expert.experience}
                        </td>
                        <td className="px-4 py-2.5">
                          {inconsistentCount === 0 ? (
                            <span
                              className="flex items-center gap-1 text-xs"
                              style={{ color: "oklch(0.45 0.14 145)" }}
                            >
                              <CheckCircle2 size={12} />
                              양호
                            </span>
                          ) : (
                            <span
                              className="flex items-center gap-1 text-xs"
                              style={{ color: "oklch(0.55 0.14 70)" }}
                            >
                              <AlertTriangle size={12} />
                              {inconsistentCount}건 미달
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 결과 탭인데 파일이 부족한 경우 */}
        {activeTab === "result" && !canAggregate && (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            style={{ color: "oklch(0.55 0.02 255)" }}
          >
            <Users size={48} className="mb-4 opacity-30" />
            <p className="text-base font-medium mb-2">
              집계를 위해 최소 2명의 전문가 응답이 필요합니다
            </p>
            <p className="text-sm opacity-70 mb-6">
              파일 업로드 탭에서 JSON 파일을 추가해 주세요
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("upload")}
            >
              파일 업로드로 이동
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

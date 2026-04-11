// ============================================================
// 경북형 Urban AI AHP 분석 엔진
// 설계 철학: 한국 행정문서 미니멀리즘 — 투명한 계산 과정 공개
// ============================================================

// AHP 랜덤 일관성 지수 (RI) - Saaty(1980) 기준
export const RI_TABLE: Record<number, number> = {
  1: 0.00,
  2: 0.00,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

// AHP 척도 레이블 (Saaty 9점 척도)
export const SCALE_LABELS: Record<number, string> = {
  9: "절대적으로 중요",
  8: "",
  7: "매우 강하게 중요",
  6: "",
  5: "강하게 중요",
  4: "",
  3: "약간 중요",
  2: "",
  1: "동등하게 중요",
};

// 평가 지표 계층 구조
export interface Criterion {
  id: string;
  label: string;
  description: string;
  subCriteria: SubCriterion[];
}

export interface SubCriterion {
  id: string;
  label: string;
  description: string;
  unit?: string;
  dataSource?: string;
}

// 경북형 Urban AI 생활SOC 시설 평가 지표 체계
export const CRITERIA: Criterion[] = [
  {
    id: "C1",
    label: "시설 노후도",
    description: "시설의 물리적 상태 및 안전성을 평가하는 지표",
    subCriteria: [
      {
        id: "C1_1",
        label: "건축 연한",
        description: "시설 건축 후 경과 연수",
        unit: "년",
        dataSource: "건축물대장",
      },
      {
        id: "C1_2",
        label: "안전 등급",
        description: "정기 안전점검 결과 등급 (A~E)",
        unit: "등급",
        dataSource: "시설안전점검 결과",
      },
      {
        id: "C1_3",
        label: "개보수 이력",
        description: "최근 5년 내 주요 개보수 실시 여부 및 투자액",
        unit: "백만원",
        dataSource: "지자체 예산 집행 내역",
      },
    ],
  },
  {
    id: "C2",
    label: "운영 효율성",
    description: "시설의 운영 실태 및 서비스 제공 효율성을 평가하는 지표",
    subCriteria: [
      {
        id: "C2_1",
        label: "연간 이용자 수",
        description: "최근 1년간 실제 시설 이용자 수",
        unit: "명/년",
        dataSource: "시설 운영 대장",
      },
      {
        id: "C2_2",
        label: "운영 수지율",
        description: "운영 수입 / 운영 비용 × 100",
        unit: "%",
        dataSource: "세입세출 결산서",
      },
      {
        id: "C2_3",
        label: "종사자 1인당 서비스 인원",
        description: "이용자 수 / 종사자 수",
        unit: "명/인",
        dataSource: "인력 현황 자료",
      },
    ],
  },
  {
    id: "C3",
    label: "지역사회 기여도",
    description: "시설이 지역 취약계층과 주민 생활에 미치는 영향을 평가하는 지표",
    subCriteria: [
      {
        id: "C3_1",
        label: "취약계층 이용 비율",
        description: "65세 이상 고령자, 기초생활수급자, 장애인 이용 비율",
        unit: "%",
        dataSource: "이용자 현황 자료",
      },
      {
        id: "C3_2",
        label: "지역 행사 활용도",
        description: "연간 지역 행사·프로그램 운영 횟수",
        unit: "회/년",
        dataSource: "프로그램 운영 실적",
      },
      {
        id: "C3_3",
        label: "주민 만족도",
        description: "주민 설문조사 결과 만족도 점수",
        unit: "점 (100점 만점)",
        dataSource: "주민 만족도 조사",
      },
    ],
  },
  {
    id: "C4",
    label: "대체 시설 유무",
    description: "시설 폐지 시 대안적 서비스 접근 가능성을 평가하는 지표",
    subCriteria: [
      {
        id: "C4_1",
        label: "반경 5km 내 유사 시설 수",
        description: "동일 기능을 수행하는 대체 시설 수",
        unit: "개소",
        dataSource: "공공데이터포털 시설 현황",
      },
      {
        id: "C4_2",
        label: "대중교통 접근성",
        description: "가장 가까운 버스 정류장까지의 도보 시간",
        unit: "분",
        dataSource: "국토교통부 TAGO API",
      },
    ],
  },
];

// 쌍대비교 결과 타입
export interface PairwiseMatrix {
  criterionId: string; // 부모 기준 ID (대분류 비교 시 'root')
  size: number;
  matrix: number[][];
  labels: string[];
}

// AHP 계산 결과 타입
export interface AHPResult {
  criterionId: string;
  labels: string[];
  weights: number[];
  lambdaMax: number;
  ci: number;
  cr: number;
  isConsistent: boolean;
  matrix: number[][];
}

// 전문가 정보 타입
export interface ExpertInfo {
  name: string;
  organization: string;
  position: string;
  expertise: string;
  experience: string;
  email?: string;
}

// 전체 설문 상태 타입
export interface SurveyState {
  expert: ExpertInfo;
  rootMatrix: PairwiseMatrix;         // 대분류 간 쌍대비교
  subMatrices: PairwiseMatrix[];      // 소분류 간 쌍대비교 (대분류별)
  completed: boolean;
  timestamp?: string;
}

// ============================================================
// AHP 계산 함수
// ============================================================

/**
 * 쌍대비교 행렬에서 기하평균 방법으로 가중치 산출
 */
export function calculateWeights(matrix: number[][]): number[] {
  const n = matrix.length;
  const geometricMeans: number[] = [];

  for (let i = 0; i < n; i++) {
    let product = 1;
    for (let j = 0; j < n; j++) {
      product *= matrix[i][j];
    }
    geometricMeans.push(Math.pow(product, 1 / n));
  }

  const sum = geometricMeans.reduce((a, b) => a + b, 0);
  return geometricMeans.map((gm) => gm / sum);
}

/**
 * 최대 고유값(λmax) 계산
 */
export function calculateLambdaMax(matrix: number[][], weights: number[]): number {
  const n = matrix.length;
  let lambdaMax = 0;

  for (let i = 0; i < n; i++) {
    let weightedSum = 0;
    for (let j = 0; j < n; j++) {
      weightedSum += matrix[i][j] * weights[j];
    }
    lambdaMax += weightedSum / weights[i];
  }

  return lambdaMax / n;
}

/**
 * 일관성 지수(CI) 계산
 */
export function calculateCI(lambdaMax: number, n: number): number {
  if (n <= 1) return 0;
  return (lambdaMax - n) / (n - 1);
}

/**
 * 일관성 비율(CR) 계산
 */
export function calculateCR(ci: number, n: number): number {
  const ri = RI_TABLE[n] || 1.49;
  if (ri === 0) return 0;
  return ci / ri;
}

/**
 * 전체 AHP 분석 수행
 */
export function analyzeAHP(pairwise: PairwiseMatrix): AHPResult {
  const { matrix, labels, criterionId } = pairwise;
  const n = matrix.length;

  const weights = calculateWeights(matrix);
  const lambdaMax = calculateLambdaMax(matrix, weights);
  const ci = calculateCI(lambdaMax, n);
  const cr = calculateCR(ci, n);

  return {
    criterionId,
    labels,
    weights,
    lambdaMax,
    ci,
    cr,
    isConsistent: cr < 0.1,
    matrix,
  };
}

/**
 * 초기 단위 행렬 생성 (모든 비교값 = 1)
 */
export function createIdentityMatrix(size: number): number[][] {
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 1))
  );
}

/**
 * 쌍대비교 행렬 업데이트 (대칭성 자동 유지)
 */
export function updateMatrix(
  matrix: number[][],
  row: number,
  col: number,
  value: number
): number[][] {
  const newMatrix = matrix.map((r) => [...r]);
  newMatrix[row][col] = value;
  newMatrix[col][row] = 1 / value;
  return newMatrix;
}

/**
 * 슬라이더 값(-8 ~ 8)을 AHP 척도(1/9 ~ 9)로 변환
 * 0 = 동등(1), 양수 = 좌측 우세, 음수 = 우측 우세
 */
export function sliderToScale(sliderValue: number): number {
  if (sliderValue === 0) return 1;
  if (sliderValue > 0) return sliderValue + 1;
  return 1 / (Math.abs(sliderValue) + 1);
}

/**
 * AHP 척도를 슬라이더 값으로 역변환
 */
export function scaleToSlider(scale: number): number {
  if (scale === 1) return 0;
  if (scale > 1) return scale - 1;
  return -(1 / scale - 1);
}

/**
 * 슬라이더 값에 해당하는 레이블 반환
 */
export function getSliderLabel(sliderValue: number, leftLabel: string, rightLabel: string): string {
  const abs = Math.abs(sliderValue);
  if (sliderValue === 0) return "동등하게 중요";
  const side = sliderValue > 0 ? leftLabel : rightLabel;
  if (abs === 1) return `${side}이(가) 조금 더 중요`;
  if (abs === 2) return `${side}이(가) 약간 중요`;
  if (abs === 3) return `${side}이(가) 약간 중요`;
  if (abs === 4) return `${side}이(가) 강하게 중요`;
  if (abs === 5) return `${side}이(가) 강하게 중요`;
  if (abs === 6) return `${side}이(가) 매우 강하게 중요`;
  if (abs === 7) return `${side}이(가) 매우 강하게 중요`;
  return `${side}이(가) 절대적으로 중요`;
}

/**
 * 종합 가중치 계산 (대분류 가중치 × 소분류 가중치)
 */
export function calculateGlobalWeights(
  rootResult: AHPResult,
  subResults: AHPResult[]
): { id: string; label: string; parentLabel: string; localWeight: number; globalWeight: number }[] {
  const globalWeights: { id: string; label: string; parentLabel: string; localWeight: number; globalWeight: number }[] = [];

  CRITERIA.forEach((criterion, cIdx) => {
    const parentWeight = rootResult.weights[cIdx];
    const subResult = subResults.find((r) => r.criterionId === criterion.id);

    if (subResult) {
      criterion.subCriteria.forEach((sub, sIdx) => {
        globalWeights.push({
          id: sub.id,
          label: sub.label,
          parentLabel: criterion.label,
          localWeight: subResult.weights[sIdx],
          globalWeight: parentWeight * subResult.weights[sIdx],
        });
      });
    }
  });

  return globalWeights;
}

/**
 * 가중치를 백분율로 변환
 */
export function toPercent(weight: number): string {
  return (weight * 100).toFixed(1) + "%";
}

/**
 * CR 상태 분류
 */
export function getCRStatus(cr: number): "good" | "warning" | "bad" {
  if (cr < 0.1) return "good";
  if (cr < 0.2) return "warning";
  return "bad";
}

/**
 * 설문 결과를 JSON으로 내보내기
 */
export function exportSurveyResult(state: SurveyState, results: AHPResult[]): string {
  return JSON.stringify(
    {
      metadata: {
        title: "경북형 Urban AI 생활SOC 시설 AHP 평가 결과",
        version: "1.0",
        timestamp: new Date().toISOString(),
        expert: state.expert,
      },
      results: results.map((r) => ({
        criterionId: r.criterionId,
        labels: r.labels,
        weights: r.weights.map((w) => Math.round(w * 10000) / 10000),
        cr: Math.round(r.cr * 10000) / 10000,
        isConsistent: r.isConsistent,
      })),
    },
    null,
    2
  );
}

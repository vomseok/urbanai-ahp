# 경북형 Urban AI AHP 플랫폼 디자인 아이디어

## 배경 및 목적
경상북도 지방소멸지역 생활SOC 시설의 유지 가치를 평가하는 전문가 설문 도구.
사용자: 도시계획·보건복지·공간정보 분야 전문가 및 지자체 공무원.
핵심 기능: 쌍대비교 설문 → CR 자동 계산 → 가중치 산출 → 결과 시각화 → 보고서 출력

---

<response>
<text>
## 아이디어 A: 한국 행정문서 미니멀리즘 (Korean Administrative Minimalism)

**Design Movement:** 한국 공공기관 문서 디자인의 정제된 버전 — 신뢰감과 권위를 주되, 딱딱하지 않게.

**Core Principles:**
1. 데이터 우선주의 — 시각적 장식보다 정보 전달 최우선
2. 계층적 명확성 — 설문 단계, 진행 상태, 결과가 항상 명확히 구분됨
3. 전문가 신뢰감 — 학술 논문과 정책 보고서에서 영감을 받은 타이포그래피
4. 절제된 색채 — 경북 상징색(파란색 계열)을 포인트로만 사용

**Color Philosophy:**
- 배경: #F8F9FA (밝은 회백색) — 종이 질감
- 주색: #1A3A6B (경북연구원 진한 파란) — 신뢰·권위
- 보조색: #4A7BC5 (중간 파란) — 인터랙션
- 강조: #E8A020 (황금색) — 중요 결과·경고
- 텍스트: #2C3E50 (진한 회색)

**Layout Paradigm:**
- 좌측 고정 사이드바(진행 단계 표시) + 우측 메인 콘텐츠 영역
- 설문 단계별 전체 화면 전환 (Wizard 패턴)
- 결과 페이지: 대시보드 그리드 레이아웃

**Signature Elements:**
1. 진행 단계 표시기: 좌측 세로 타임라인 (경북연구원 보고서 장 표지 모티프)
2. 쌍대비교 슬라이더: 9점 척도를 직관적인 슬라이더 UI로 표현
3. 결과 레이더 차트: 4개 대분류 가중치를 레이더/방사형 차트로 시각화

**Interaction Philosophy:**
- 각 쌍대비교 완료 시 즉각적인 CR 업데이트 피드백
- 일관성 위반 시 빨간 경고 배지 표시
- 설문 완료 시 애니메이션 체크마크

**Animation:**
- 페이지 전환: 슬라이드 인 (왼쪽→오른쪽)
- 차트 등장: 0.8초 ease-out 애니메이션
- 슬라이더: 실시간 숫자 업데이트

**Typography System:**
- 제목: Noto Sans KR Bold 24px
- 소제목: Noto Sans KR SemiBold 16px
- 본문: Noto Serif KR Regular 14px (보고서 느낌)
- 숫자/데이터: Roboto Mono 14px
</text>
<probability>0.08</probability>
</response>

<response>
<text>
## 아이디어 B: 데이터 과학 대시보드 (Data Science Dashboard)

**Design Movement:** Jupyter Notebook + Tableau 스타일의 분석 도구 미학

**Core Principles:**
1. 분석 중심 레이아웃 — 데이터와 차트가 주인공
2. 어두운 배경의 데이터 가시성 — 다크 테마로 숫자와 그래프 강조
3. 실시간 계산 피드백 — 입력 즉시 결과 업데이트
4. 모듈형 패널 — 각 분석 단계가 독립적인 카드/패널

**Color Philosophy:**
- 배경: #0F172A (딥 네이비) — 집중력
- 카드: #1E293B (슬레이트 다크)
- 주색: #3B82F6 (밝은 파란) — 데이터 포인트
- 성공: #10B981 (에메랄드) — 일관성 통과
- 경고: #F59E0B (앰버) — 주의
- 오류: #EF4444 (레드) — CR 위반

**Layout Paradigm:**
- 상단 탭 네비게이션 + 전체 화면 분석 패널
- 좌우 분할: 설문 입력(좌) + 실시간 결과 미리보기(우)
- 결과 페이지: 멀티 차트 그리드

**Signature Elements:**
1. 실시간 행렬 시각화: 쌍대비교 행렬을 히트맵으로 실시간 표시
2. CR 게이지: 원형 게이지로 일관성 비율 시각화
3. 가중치 바 차트: 수평 막대 차트로 최종 가중치 비교

**Interaction Philosophy:**
- 모든 입력이 즉시 행렬과 가중치에 반영
- 드래그 가능한 슬라이더
- 호버 시 상세 계산 과정 툴팁

**Animation:**
- 숫자 카운트업 애니메이션
- 차트 바 성장 애니메이션
- 행렬 셀 색상 전환 트랜지션

**Typography System:**
- 제목: Space Grotesk Bold
- 본문: Inter Regular
- 데이터: JetBrains Mono
</text>
<probability>0.07</probability>
</response>

<response>
<text>
## 아이디어 C: 한국 학술 연구 도구 (Korean Academic Research Tool)

**Design Movement:** 학술 논문 + 정책 연구 보고서의 디지털 전환 — 신뢰성과 학문적 엄밀성 강조

**Core Principles:**
1. 학술적 엄밀성 — AHP 방법론의 수학적 과정을 투명하게 표시
2. 단계적 안내 — 초보 사용자도 AHP를 이해하며 진행 가능
3. 인쇄 친화적 결과 — 보고서로 바로 활용 가능한 출력물
4. 한국어 최적화 — 한글 타이포그래피에 최적화된 레이아웃

**Color Philosophy:**
- 배경: #FFFFFF (순백)
- 섹션 구분: #F1F5F9 (연한 회청)
- 주색: #1E40AF (진한 파란) — 경북연구원 아이덴티티
- 보조: #64748B (슬레이트 그레이)
- 강조: #DC2626 (레드) — 오류/경고
- 성공: #059669 (그린)

**Layout Paradigm:**
- 중앙 정렬 단일 컬럼 (A4 용지 비율 모방)
- 상단 진행 표시줄 (스텝 위저드)
- 각 단계가 명확히 구분된 섹션 카드

**Signature Elements:**
1. 방법론 설명 패널: 각 단계 옆에 AHP 이론 설명 접이식 패널
2. 쌍대비교 테이블: 실제 논문에서 보이는 행렬 형태 그대로 표현
3. 결과 요약 카드: 인쇄 가능한 A4 형식 결과 카드

**Interaction Philosophy:**
- 각 단계 완료 전 다음 단계 잠금
- 완료 단계 체크마크 표시
- 결과 PDF 다운로드 버튼

**Animation:**
- 단계 전환: 페이드 인/아웃
- 결과 등장: 순차적 슬라이드 업
- 완료 시: 컨페티 효과

**Typography System:**
- 제목: Noto Sans KR ExtraBold 28px
- 소제목: Noto Sans KR Bold 18px
- 본문: Noto Serif KR 14px, 줄간격 1.8
- 숫자: IBM Plex Mono
</text>
<probability>0.09</probability>
</response>

---

## 선택: 아이디어 A (한국 행정문서 미니멀리즘)

**이유:** 대상 사용자(전문가·공무원)에게 가장 적합한 신뢰감과 권위를 주면서도,
쌍대비교 슬라이더와 실시간 CR 계산이라는 인터랙티브 요소를 자연스럽게 담을 수 있음.
경북연구원 보고서 양식(진한 파란 + 세로 구분선)과 시각적 연속성 확보.

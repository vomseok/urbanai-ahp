# Google Sheets 연동 설정 가이드

AHP 설문 응답을 Google Sheets에 자동 저장하고, 집계 페이지에서 바로 불러오는 기능을 활성화하는 방법입니다.

---

## 전체 흐름

```
피설문자 → 설문 완료 → 자동으로 Google Sheets에 저장
연구자 → 집계 페이지 → "Google Sheets에서 불러오기" 클릭 → 기하평균 집계
```

---

## 1단계: Google Sheets 생성

1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트를 만듭니다.
2. URL에서 스프레드시트 ID를 복사합니다.
   - URL 예시: `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`**`/edit`
   - 굵은 부분이 스프레드시트 ID입니다.

---

## 2단계: Google Apps Script 웹앱 배포

1. Google Sheets에서 **확장 프로그램 → Apps Script** 클릭
2. 기존 코드를 모두 지우고, 이 저장소의 `google-apps-script/Code.gs` 내용을 붙여넣습니다.
3. 파일 상단의 `SHEET_ID` 값을 1단계에서 복사한 ID로 변경합니다:
   ```javascript
   var SHEET_ID = "여기에_스프레드시트_ID_입력";
   ```
4. **배포 → 새 배포** 클릭
5. 유형: **웹 앱** 선택
6. 설정:
   - 설명: `AHP 설문 수신기`
   - 다음 사용자로 실행: **나**
   - 액세스 권한: **모든 사용자** (익명 포함)
7. **배포** 클릭 → 권한 허용
8. **웹 앱 URL** 복사 (예: `https://script.google.com/macros/s/AKfycb.../exec`)

---

## 3단계: 플랫폼에 URL 설정

### 방법 A: GitHub Pages 재배포 (권장)

1. 이 저장소를 클론합니다:
   ```bash
   git clone https://github.com/vomseok/urbanai-ahp.git
   cd urbanai-ahp
   ```

2. 프로젝트 루트에 `.env.local` 파일을 생성합니다:
   ```
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/여기에_URL/exec
   ```

3. 재배포합니다:
   ```bash
   pnpm install
   pnpm run deploy
   ```

### 방법 B: Vite 환경변수로 빌드

```bash
VITE_APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec" pnpm run deploy
```

---

## 4단계: 동작 확인

1. 설문 URL 접속: https://vomseok.github.io/urbanai-ahp/
2. 설문 완료 → 결과 페이지에서 **"Google Sheets에 저장 중..."** 메시지 확인
3. Google Sheets에서 새 행이 추가되었는지 확인
4. 집계 페이지(`/aggregate`)에서 **"Google Sheets에서 불러오기"** 클릭

---

## 주의사항

- Apps Script 웹앱은 **"모든 사용자"** 접근으로 설정해야 피설문자가 제출할 수 있습니다.
- CORS 제한으로 인해 제출 시 `no-cors` 모드를 사용합니다. 제출 성공 여부는 Sheets에서 직접 확인하세요.
- 집계 페이지에서 불러오기는 CORS가 허용된 GET 요청을 사용합니다.
- `VITE_APPS_SCRIPT_URL`이 설정되지 않으면 Google Sheets 연동 UI가 숨겨지고, 기존 JSON 파일 업로드 방식만 표시됩니다.

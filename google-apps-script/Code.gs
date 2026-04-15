// ============================================================
// 경북형 Urban AI AHP 설문 — Google Apps Script 웹앱
// 역할: AHP 설문 응답(JSON)을 수신하여 Google Sheets에 저장
// 배포: 웹앱으로 배포 (누구나 접근, POST 요청 허용)
// ============================================================

// ▶ 이 스크립트를 실행하기 전에 아래 SHEET_ID를 본인의 Google Sheets ID로 변경하세요.
//   Google Sheets URL: https://docs.google.com/spreadsheets/d/[여기가 SHEET_ID]/edit
var SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";
var SHEET_NAME = "AHP_응답";

// POST 요청 처리 (AHP 플랫폼에서 응답 제출 시 호출)
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();
    
    // 헤더가 없으면 생성
    if (sheet.getLastRow() === 0) {
      createHeader(sheet);
    }
    
    // 응답 데이터를 행으로 변환하여 추가
    var row = buildRow(data);
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: "응답이 저장되었습니다." }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 처리 (집계 페이지에서 전체 응답 조회 시 호출)
function doGet(e) {
  try {
    var sheet = getOrCreateSheet();
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, responses: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0];
    var responses = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      // JSON 문자열로 저장된 필드 파싱
      if (obj["ahp_results_json"]) {
        try { obj["ahp_results"] = JSON.parse(obj["ahp_results_json"]); } catch(e) {}
      }
      responses.push(obj);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, responses: responses }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 시트 가져오기 또는 생성
function getOrCreateSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

// 헤더 행 생성
function createHeader(sheet) {
  var headers = [
    "제출일시",
    "전문가_이름",
    "전문가_소속",
    "전문가_직위",
    "전문가_분야",
    "경력_년수",
    "CR_대분류",
    "CR_C1_시설노후도",
    "CR_C2_운영효율성",
    "CR_C3_지역사회기여도",
    "CR_C4_대체시설유무",
    "가중치_C1",
    "가중치_C2",
    "가중치_C3",
    "가중치_C4",
    "가중치_C1_1",
    "가중치_C1_2",
    "가중치_C1_3",
    "가중치_C2_1",
    "가중치_C2_2",
    "가중치_C2_3",
    "가중치_C3_1",
    "가중치_C3_2",
    "가중치_C3_3",
    "가중치_C4_1",
    "가중치_C4_2",
    "ahp_results_json"
  ];
  sheet.appendRow(headers);
  
  // 헤더 스타일 적용
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#1A3A6B");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
}

// 응답 데이터를 행 배열로 변환
function buildRow(data) {
  var expert = data.expertInfo || {};
  var results = data.results || [];
  var globalWeights = data.globalWeights || [];
  
  // CR 값 추출
  var crMap = {};
  results.forEach(function(r) {
    crMap[r.criterionId] = r.cr;
  });
  
  // 전역 가중치 추출
  var wMap = {};
  globalWeights.forEach(function(w) {
    wMap[w.id] = w.globalWeight;
  });
  
  return [
    new Date().toLocaleString("ko-KR"),
    expert.name || "",
    expert.organization || "",
    expert.position || "",
    expert.field || "",
    expert.experience || "",
    crMap["root"] !== undefined ? crMap["root"].toFixed(4) : "",
    crMap["C1"] !== undefined ? crMap["C1"].toFixed(4) : "",
    crMap["C2"] !== undefined ? crMap["C2"].toFixed(4) : "",
    crMap["C3"] !== undefined ? crMap["C3"].toFixed(4) : "",
    crMap["C4"] !== undefined ? crMap["C4"].toFixed(4) : "",
    wMap["C1"] !== undefined ? wMap["C1"].toFixed(4) : "",
    wMap["C2"] !== undefined ? wMap["C2"].toFixed(4) : "",
    wMap["C3"] !== undefined ? wMap["C3"].toFixed(4) : "",
    wMap["C4"] !== undefined ? wMap["C4"].toFixed(4) : "",
    wMap["C1_1"] !== undefined ? wMap["C1_1"].toFixed(4) : "",
    wMap["C1_2"] !== undefined ? wMap["C1_2"].toFixed(4) : "",
    wMap["C1_3"] !== undefined ? wMap["C1_3"].toFixed(4) : "",
    wMap["C2_1"] !== undefined ? wMap["C2_1"].toFixed(4) : "",
    wMap["C2_2"] !== undefined ? wMap["C2_2"].toFixed(4) : "",
    wMap["C2_3"] !== undefined ? wMap["C2_3"].toFixed(4) : "",
    wMap["C3_1"] !== undefined ? wMap["C3_1"].toFixed(4) : "",
    wMap["C3_2"] !== undefined ? wMap["C3_2"].toFixed(4) : "",
    wMap["C3_3"] !== undefined ? wMap["C3_3"].toFixed(4) : "",
    wMap["C4_1"] !== undefined ? wMap["C4_1"].toFixed(4) : "",
    wMap["C4_2"] !== undefined ? wMap["C4_2"].toFixed(4) : "",
    JSON.stringify(data)
  ];
}

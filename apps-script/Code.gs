// 운동·식단 기록 API. 스프레드시트의 확장 프로그램 → Apps Script에 붙여넣고 웹앱으로 배포.
// 스크립트 속성에 TOKEN 을 설정해야 동작한다.
const TABS = ['종목', '루틴', '기록', '음식', '식단템플릿', '식단기록', '설정'];

function doGet(e) {
  const err = auth_(e.parameter.token);
  return json_(err || readAll_());
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const err = auth_(body.token);
  if (err) return json_(err);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    body.ops.forEach(apply_);
    SpreadsheetApp.flush();
    return json_({ ok: true });
  } catch (x) {
    return json_({ error: String(x) });
  } finally {
    lock.releaseLock();
  }
}

function auth_(t) {
  const tok = PropertiesService.getScriptProperties().getProperty('TOKEN');
  return tok && t === tok ? null : { error: 'unauthorized' };
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name) {
  if (TABS.indexOf(name) < 0) throw new Error('unknown tab: ' + name);
  return SpreadsheetApp.getActive().getSheetByName(name);
}

function cell_(v) {
  return v instanceof Date ? Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd') : v;
}

// shortcut: 매번 모든 탭 전체를 읽음 — 기록이 수천 행을 넘어 느려지면 최근 N개월만 반환하도록 변경
function readAll_() {
  const out = { ok: true, heads: {}, data: {} };
  TABS.forEach(function (t) {
    const sh = sheet_(t);
    const v = sh.getDataRange().getValues();
    const head = v.shift();
    const rows = [];
    v.forEach(function (r, i) {
      if (r.every(function (c) { return c === ''; })) return;
      if (!r[0]) { // 시트에서 직접 추가한 행: id 자동 부여
        r[0] = Utilities.getUuid().slice(0, 8);
        sh.getRange(i + 2, 1).setValue(r[0]);
      }
      const o = {};
      head.forEach(function (h, j) { o[h] = cell_(r[j]); });
      rows.push(o);
    });
    out.heads[t] = head;
    out.data[t] = rows;
  });
  return out;
}

// op: {op:'put', tab, row} | {op:'del', tab, id} | {op:'rename', tab, col, from, to}
function apply_(op) {
  const sh = sheet_(op.tab);
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const last = sh.getLastRow();
  if (op.op === 'rename') {
    const c = head.indexOf(op.col) + 1;
    if (c < 1 || last < 2) return;
    const rg = sh.getRange(2, c, last - 1, 1);
    rg.setValues(rg.getValues().map(function (x) { return [x[0] === op.from ? op.to : x[0]]; }));
    return;
  }
  const id = String(op.op === 'del' ? op.id : op.row.id);
  const ids = sh.getRange(1, 1, last, 1).getValues().map(function (r) { return String(r[0]); });
  const i = ids.indexOf(id); // 0 은 헤더라 무시
  if (op.op === 'del') { if (i > 0) sh.deleteRow(i + 1); return; }
  if (op.op !== 'put') throw new Error('unknown op: ' + op.op);
  const old = i > 0 ? sh.getRange(i + 1, 1, 1, head.length).getValues()[0] : [];
  const row = head.map(function (h, j) { return h in op.row ? op.row[h] : (old[j] === undefined ? '' : old[j]); });
  if (i > 0) sh.getRange(i + 1, 1, 1, head.length).setValues([row]);
  else sh.appendRow(row);
}

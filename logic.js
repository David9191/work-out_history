// 화면과 무관한 순수 계산. logic.test.mjs 에서 검사한다.

export const today = () => new Date().toLocaleDateString('sv-SE'); // yyyy-mm-dd (로컬 시간)

export const byOrder = (a, b) => String(a.순서).localeCompare(String(b.순서), undefined, { numeric: true });

export const e1rm = (w, r) => Number(w) * (1 + Number(r) / 30); // Epley

// 오늘(date) 이전 가장 최근 날짜의 해당 종목 세트들
export function lastSession(records, name, date) {
  const past = records.filter(s => s.운동명 === name && s.날짜 < date);
  if (!past.length) return null;
  const d = past.reduce((m, s) => (s.날짜 > m ? s.날짜 : m), '');
  const sets = past.filter(s => s.날짜 === d).sort((a, b) => a.세트번호 - b.세트번호);
  return { date: d, sets };
}

// 과거 기록의 최고 추정 1RM 을 넘으면 PR. 과거 기록이 없으면 PR 아님.
export function isPR(records, name, date, w, r) {
  const past = records.filter(s => s.운동명 === name && s.날짜 < date && Number(s.횟수) > 0);
  if (!past.length || !(Number(w) > 0 && Number(r) > 0)) return false;
  return e1rm(w, r) > Math.max(...past.map(s => e1rm(s.무게, s.횟수)));
}

export const routineNames = routines => [...new Set(routines.map(r => r.루틴명).filter(Boolean))];

// 가장 최근에 한 루틴의 다음 루틴 추천
export function nextRoutine(names, records) {
  if (!names.length) return null;
  const done = records.filter(s => names.includes(s.루틴명));
  if (!done.length) return names[0];
  const last = done.reduce((m, s) => (s.날짜 >= m.날짜 ? s : m));
  return names[(names.indexOf(last.루틴명) + 1) % names.length];
}

const NUTRI = ['칼로리', '단백질', '지방', '탄수화물'];
const r1 = n => Math.round(n * 10) / 10;

// 음식 DB 한 행과 양 → 영양소. 비어 있는 영양소는 빈 값 유지.
export function nutrition(food, amount) {
  const k = Number(amount) / Number(food.기준량);
  return Object.fromEntries(NUTRI.map(n => [n, food[n] === '' || food[n] == null ? '' : r1(Number(food[n]) * k)]));
}

export function sumNutrition(rows) {
  return Object.fromEntries(NUTRI.map(n => [n, r1(rows.reduce((t, x) => t + (Number(x[n]) || 0), 0))]));
}

export const uid = () => Math.random().toString(36).slice(2, 10);

// 로컬 데이터에 op 반영 (서버의 apply_ 와 같은 의미)
export function applyOp(data, op) {
  const rows = (data[op.tab] ||= []);
  if (op.op === 'rename') {
    rows.forEach(r => { if (r[op.col] === op.from) r[op.col] = op.to; });
  } else if (op.op === 'del') {
    const i = rows.findIndex(r => r.id === op.id);
    if (i >= 0) rows.splice(i, 1);
  } else {
    const r = rows.find(x => x.id === op.row.id);
    if (r) Object.assign(r, op.row);
    else rows.push({ ...op.row });
  }
}

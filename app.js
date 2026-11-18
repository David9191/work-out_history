import { e1rm, today, byOrder, lastSession, isPR, routineNames, nextRoutine, nutrition, sumNutrition, uid, applyOp, focusIndex, nextSet, delta } from './logic.js';

const $ = s => document.querySelector(s);
const d0 = $;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const LS = { get: (k, d) => JSON.parse(localStorage.getItem(k)) ?? d, set: (k, v) => localStorage.setItem(k, JSON.stringify(v)) };
const MEALS = ['아침', '점심', '저녁', '간식'];

let cfg = LS.get('cfg', { url: '', token: '' });
let db = LS.get('db', { heads: {}, data: {} }); // 마지막으로 받은 시트 (열자마자 바로 보여주기용)
let queue = LS.get('queue', []);                // 아직 시트에 못 보낸 변경
let session = LS.get('session', null);          // 진행 중인 운동
let tab = LS.get('tab', 'workout');
let mtab = '종목';
let mealDate = today();
let syncMsg = '';
const D = t => db.data[t] || [];
const ex = name => D('종목').find(e => e.운동명 === name) || {};
const used = e => e.사용 !== false && e.사용 !== 'FALSE';
const saveSession = () => LS.set('session', session);
const setSync = m => { syncMsg = m; const el = $('#sync'); if (el) el.textContent = m; };

// ---------- 동기화 ----------
async function load() {
  if (!cfg.url) return render();
  setSync('불러오는 중…');
  try {
    await flush();
    const res = await (await fetch(`${cfg.url}?token=${encodeURIComponent(cfg.token)}`)).json();
    if (res.error) throw new Error(res.error);
    db = { heads: res.heads, data: res.data };
    queue.forEach(op => applyOp(db.data, op)); // 아직 못 보낸 변경은 화면에 유지
    LS.set('db', db);
    setSync(queue.length ? `미전송 ${queue.length}` : '');
  } catch (e) {
    setSync(`오프라인 · ${e.message}`);
  }
  render();
}

function commit(...ops) {
  ops.forEach(op => applyOp(db.data, op));
  queue.push(...ops);
  LS.set('db', db);
  LS.set('queue', queue);
  flush();
}

let flushing = null;
function flush() {
  // .finally 로 해제: 큐가 비어 동기적으로 끝나도 flushing 이 남지 않게
  return (flushing ||= (async () => {
    try {
      while (queue.length && cfg.url) {
        const batch = queue.slice(0, 50);
        const res = await (await fetch(cfg.url, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ token: cfg.token, ops: batch }) })).json();
        if (res.error) throw new Error(res.error);
        queue = queue.slice(batch.length);
        LS.set('queue', queue);
      }
      setSync(queue.length ? `미전송 ${queue.length}` : '');
    } catch (e) {
      setSync(`미전송 ${queue.length} · ${e.message}`);
    }
  })().finally(() => { flushing = null; }));
}
setInterval(() => queue.length && flush(), 30000);
addEventListener('online', flush);

// ---------- 화면 ----------
// 선 아이콘 (stroke 2, 24px 격자)
const ICON = {
  workout: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  diet: '<path d="M4 11h16a8 8 0 0 1-16 0ZM8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M16 7c0-1.5 1-2 1-3.5"/>',
  history: '<rect x="4" y="5" width="16" height="15" rx="1"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  manage: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  left: '<path d="m15 5-7 7 7 7"/>',
  right: '<path d="m9 5 7 7-7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  play: '<path d="M7 5v14l12-7Z"/>',
};
const icon = (n, label) => `<svg class=ic viewBox="0 0 24 24" ${label ? `role=img aria-label="${label}"` : 'aria-hidden=true'}>${ICON[n]}</svg>`;

function render() {
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $('#view').innerHTML = !cfg.url && tab !== 'manage'
    ? `${band('운동 기록', '')}<p class=empty>관리 탭 맨 아래에서 API 주소와 토큰을 먼저 입력하세요.</p>`
    : VIEWS[tab]();
  renderDock();
  if (justDone) { justDone = ''; $('.set.cur')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
}

// 각 화면 맨 위 초록 띠
const band = (title, sub, right = '', extra = '') => `<header class=band>
  <div class=band-row><div><h1>${title}</h1>${sub ? `<p class=band-sub>${sub}</p>` : ''}</div>${right}</div>${extra}
  <p class=sync id=sync role=status>${esc(syncMsg)}</p></header>`;

const fmtDate = d => { const [, m, dd] = d.split('-'); return `${+m}월 ${+dd}일`; };
const setsText = sets => sets.map(s => `${s.무게}×${s.횟수}`).join(' · ');
const exList = () => `<datalist id=dl-ex>${D('종목').filter(used).map(e => `<option value="${esc(e.운동명)}">`).join('')}</datalist>`;
const foodList = () => `<datalist id=dl-food>${D('음식').map(f => `<option value="${esc(f.음식명)}">${esc(f.기준량)}${esc(f.단위)}당 ${esc(f.칼로리)}kcal · 단백질 ${esc(f.단백질 || 0)}g</option>`).join('')}</datalist>`;

function workoutView() {
  if (!session) {
    const names = routineNames(D('루틴'));
    const next = nextRoutine(names, D('기록'));
    const lastDone = n => D('기록').filter(s => s.루틴명 === n).reduce((m, s) => (s.날짜 > m ? s.날짜 : m), '');
    const plan = n => D('루틴').filter(r => r.루틴명 === n).sort(byOrder);
    const top = name => { const l = lastSession(D('기록'), name, today()); return l ? l.sets.reduce((m, x) => (e1rm(x.무게, x.횟수) > e1rm(m.무게, m.횟수) ? x : m)) : null; };
    const row = (n, label, sub) => `<button class=pick data-act=start data-r="${esc(n)}"><span><b>${esc(label)}</b><small>${sub}</small></span>${icon('right')}</button>`;
    const others = names.filter(n => n !== next);
    const p = next ? plan(next) : [];
    return `${band('오늘 운동', fmtDate(today()))}
      ${next ? `<section class="panel label">
        <h2 class=label-title>${esc(next)} <span class=tag>다음 차례</span></h2>
        <p class=label-sub>${p.length}종목 · ${p.reduce((t, r) => t + (Number(r.목표세트) || 0), 0)}세트 · ${lastDone(next) ? `마지막 ${fmtDate(lastDone(next))}` : '첫 운동'}</p>
        <div class="n-row n-head"><span>종목</span><span>지난번 최고</span></div>
        ${p.map(r => { const t = top(r.운동명); return `<div class=n-row><span>${esc(r.운동명)}</span><b>${t ? `${t.무게}×${t.횟수}` : '-'}</b></div>`; }).join('')}
      </section>` : ''}
      <section class=panel><h2 class=panel-title>다른 루틴</h2>
      ${others.map(n => row(n, n, `${plan(n).length}종목 · ${lastDone(n) ? `마지막 ${fmtDate(lastDone(n))}` : '기록 없음'}`)).join('')}
      ${row('', '자유 운동', '종목을 직접 추가')}</section>`;
  }
  const items = session.items;
  const f = focusIndex(items, session.focus);
  const fss = items[f]?.superset;
  const doneSets = items.reduce((t, it) => t + it.sets.filter(s => s.id).length, 0);
  const allSets = items.reduce((t, it) => t + it.sets.length, 0);
  const doneEx = items.filter(it => it.sets.every(s => s.id)).length;
  const meter = `<div class=segs aria-hidden=true>${items.map(it => `<i style="--p:${it.sets.filter(s => s.id).length / it.sets.length}"></i>`).join('')}</div>`;
  return `${band(esc(session.routine || '자유 운동'), `${fmtDate(session.date)} · 종목 ${doneEx}/${items.length} · 세트 ${doneSets}/${allSets}`,
      '<button class=band-btn data-act=end>종료</button>', meter)}
    ${items.map((it, i) => (i === f || (fss && it.superset === fss) ? itemPanel(it, i) : itemLine(it, i))).join('')}
    <div class=add><input list=dl-ex id=addex placeholder="종목 추가 (검색 또는 새 이름)" aria-label="종목 추가"><button data-act=addex>${icon('plus', '추가')}</button></div>${exList()}`;
}

// 접힌 종목 한 줄
function itemLine(it, i) {
  const done = it.sets.filter(s => s.id);
  const finished = done.length === it.sets.length;
  const sub = finished ? setsText(done.map(s => ({ 무게: s.w, 횟수: s.r })))
    : `${done.length}/${it.sets.length}세트${it.goalReps ? ` · 목표 ${esc(it.goalReps)}회` : ''}`;
  return `<button class="line ${finished ? 'fin' : ''}" data-act=focus data-i=${i}>
    <span class=line-mark>${finished ? icon('check') : i + 1}</span>
    <span class=line-body><b>${esc(it.name)}</b><small>${sub}</small></span>${icon('right')}</button>`;
}

// 펼친 종목: 영양정보 표처럼
function itemPanel(it, i) {
  const last = lastSession(D('기록'), it.name, session.date);
  const ls = last?.sets || [];
  const step = Number(ex(it.name).증량단위) || 2.5;
  const nx = nextSet(session.items, session.focus);
  const btn = (act, j, d, t) => `<button class=pm data-act=${act} data-i=${i} data-j=${j} data-d=${d} aria-label="${j + 1}세트 ${t}">${icon(d > 0 ? 'plus' : 'minus')}</button>`;
  return `<section class="panel ex ${it.superset ? 'ss' : ''}">
    <div class=ex-head>
      <h2 class=ex-name>${esc(it.name)}</h2><button class=ghost data-act=info data-n="${esc(it.name)}">팁·기록</button>
      <button class=x data-act=rmex data-i=${i} aria-label="오늘 목록에서 빼기">${icon('x')}</button>
    </div>
    <p class=ex-meta>${it.superset ? `<span class=tag>슈퍼세트 ${esc(it.superset)}</span>` : ''}목표 ${esc(it.goalSets || '-')}세트 × ${esc(it.goalReps || '-')}회 · ${last ? `지난번 ${fmtDate(last.date)}` : '첫 기록'}</p>
    <div class="set head"><span>#</span><span>kg</span><span>회</span><span>완료</span></div>
    ${it.sets.map((s, j) => {
      const l = ls[j] || ls[ls.length - 1];
      const dl = delta(l, s.w, s.r);
      const cur = nx && nx.i === i && nx.j === j;
      return `<div class="set ${s.id ? 'done' : ''} ${s.pr ? 'pr' : ''} ${cur ? 'cur' : ''} ${justDone === `${i}-${j}` ? 'just' : ''}">
      <span class=n>${j + 1}</span>
      <span class='stepper sw'>${btn('w', j, -step, '무게 빼기')}<input inputmode=decimal data-f=w data-i=${i} data-j=${j} value="${esc(s.w)}" aria-label="${j + 1}세트 무게"><i class=u>kg</i>${btn('w', j, step, '무게 더하기')}</span>
      <span class='stepper sr'>${btn('r', j, -1, '횟수 빼기')}<input inputmode=numeric data-f=r data-i=${i} data-j=${j} value="${esc(s.r)}" aria-label="${j + 1}세트 횟수"><i class=u>회</i>${btn('r', j, 1, '횟수 더하기')}</span>
      <button class=check data-act=done data-i=${i} data-j=${j} aria-pressed=${!!s.id} aria-label="${j + 1}세트 완료">${s.id ? icon('check') : ''}</button>
      <span class=cmp>${l ? `지난번 ${l.무게}×${l.횟수}` : '지난번 없음'}${dl ? ` <b class="${dl.up === true ? 'up' : dl.up === false ? 'down' : ''}">${dl.text}</b>` : ''}${s.pr ? ' <b class=prmark>PR</b>' : ''}</span>
    </div>`;
    }).join('')}
    <div class=ex-foot><button class=ghost data-act=addset data-i=${i}>${icon('plus')} 세트</button><input class=memo data-f=memo data-i=${i} placeholder="메모" aria-label="${esc(it.name)} 메모" value="${esc(it.memo)}"></div>
  </section>`;
}

function newItem(name, plan = {}) {
  const ls = lastSession(D('기록'), name, today())?.sets || [];
  const n = Math.max(Number(plan.목표세트) || 0, ls.length, 1);
  return {
    name, goalSets: plan.목표세트, goalReps: plan.목표횟수, superset: plan.슈퍼세트, memo: '',
    sets: Array.from({ length: n }, (_, j) => { const s = ls[j] || ls[ls.length - 1]; return { w: s?.무게 ?? '', r: s?.횟수 ?? '' }; }),
  };
}

// 세트 한 줄 → 기록 탭 한 행. 메모는 그 종목의 첫 완료 세트에 붙인다.
function rec(it, j) {
  const s = it.sets[j];
  return { id: s.id, 날짜: session.date, 루틴명: session.routine, 운동명: it.name, 세트번호: j + 1, 무게: Number(s.w) || 0, 횟수: Number(s.r) || 0, 메모: j === it.sets.findIndex(x => x.id) ? it.memo : '' };
}

// 하단 독: 휴식 중이면 타이머, 아니면 다음 세트 완료 버튼
function renderDock() {
  const resting = timerEnd > Date.now();
  const nx = tab === 'workout' && session && !resting ? nextSet(session.items, session.focus) : null;
  $('#timer').hidden = !resting;
  const b = $('#next');
  const startR = tab === 'workout' && !session && cfg.url ? nextRoutine(routineNames(D('루틴')), D('기록')) : null;
  b.hidden = !nx && !startR;
  b.dataset.act = nx ? 'done' : 'start';
  if (startR) { b.dataset.r = startR; b.innerHTML = `<span class=next-label>다음 차례 루틴</span><span class=next-val>${esc(startR)} 시작</span>`; return; }
  if (!nx) return;
  const it = session.items[nx.i], s = it.sets[nx.j];
  b.dataset.i = nx.i; b.dataset.j = nx.j;
  b.innerHTML = `<span class=next-label>${esc(it.name)} · ${nx.j + 1}세트</span><span class=next-val>${s.r !== '' && s.r != null ? `${s.w || 0}kg × ${s.r}회 완료` : '횟수 입력하기'}</span>`;
}

function dietView() {
  const rows = D('식단기록').filter(m => m.날짜 === mealDate);
  const sum = sumNutrition(rows);
  const goal = k => Number(D('설정').find(x => x.키 === k)?.값) || 0;
  const pct = (v, g) => (g ? Math.round((v / g) * 100) : 0);
  const big = (label, v, g, u) => { const p = pct(v, g); return `<div class=n-big>
    <span class=n-label>${label}</span><span class=n-val><b>${v}</b>${u}<small> / ${g}${u}</small></span><span class="n-pct ${p > 110 ? 'over' : ''}">${p}%</span>
    <span class="n-bar ${p > 100 ? 'over' : ''}" style="--p:${Math.min(p, 100) / 100};--t:${p > 100 ? 100 / p : 1}"><i></i></span></div>`; };
  const unit = name => D('음식').find(f => f.음식명 === name)?.단위 || '';
  const tpls = [...new Set(D('식단템플릿').map(t => t.템플릿명))];
  const meals = [...new Set([...MEALS, ...rows.map(x => x.끼니)])].filter(m => rows.some(x => x.끼니 === m));
  const nav = `<div class=daynav><button class=band-btn data-act=day data-d=-1 aria-label="이전 날">${icon('left')}</button>
    <input type=date id=mdate value=${mealDate} aria-label=날짜><button class=band-btn data-act=day data-d=1 aria-label="다음 날">${icon('right')}</button></div>`;
  return `${band('식단', mealDate === today() ? '오늘' : fmtDate(mealDate), nav)}
    <section class="panel label">
      <h2 class=label-title>영양정보</h2><p class=label-sub>${fmtDate(mealDate)} · 목표 대비</p>
      ${big('열량', sum.칼로리, goal('목표칼로리'), 'kcal')}
      ${big('단백질', sum.단백질, goal('목표단백질'), 'g')}
      <div class=n-row><span>지방</span><b>${sum.지방}g</b></div>
      <div class=n-row><span>탄수화물</span><b>${sum.탄수화물}g</b></div>
    </section>
    ${tpls.length ? `<div class=chips>${tpls.map(t => `<button class=chip data-act=tpl data-t="${esc(t)}">${icon('plus')} ${esc(t)} 불러오기</button>`).join('')}</div>` : ''}
    ${rows.length ? `<section class="panel meals"><div class="meal head"><span>음식</span><span>양</span><span>kcal</span><span>단백질</span><span></span></div>
      ${meals.map(m => `<p class=meal-group>${esc(m)}</p>${rows.filter(x => x.끼니 === m).map(x => `<div class=meal>
        <span class=f>${esc(x.음식명)}</span>
        <span class=amt><input inputmode=decimal data-meal="${esc(x.id)}" value="${esc(x.양)}" aria-label="${esc(x.음식명)} 양"><small>${esc(unit(x.음식명))}</small></span>
        <span class=num>${x.칼로리}</span><span class="num prot">${x.단백질 === '' ? '-' : `${x.단백질}g`}</span>
        <button class=x data-act=delmeal data-id="${esc(x.id)}" aria-label="${esc(x.음식명)} 삭제">${icon('x')}</button></div>`).join('')}`).join('')}
    </section>` : '<p class=empty>아직 기록한 음식이 없어요.</p>'}
    <section class="panel addmeal"><h2 class=panel-title>음식 추가</h2>
      <div class=seg role=radiogroup aria-label=끼니>${MEALS.map((m, k) => `<label><input type=radio name=mmeal value=${m} ${k === mealGuess() ? 'checked' : ''}><span>${m}</span></label>`).join('')}</div>
      <div class=add><input list=dl-food id=mfood placeholder="음식 검색" aria-label=음식><input inputmode=decimal id=mamt placeholder=양 aria-label=양>
      <button data-act=addmeal>${icon('plus', '추가')}</button></div>
      <p class=preview id=mprev aria-live=polite></p>${foodList()}</section>`;
}
// 시간대로 끼니 기본값
const mealGuess = () => { const h = new Date().getHours(); return h < 10 ? 0 : h < 15 ? 1 : h < 21 ? 2 : 3; };

// 음식·양 입력 중 미리 계산
function updatePreview() {
  const p = $('#mprev'); if (!p) return;
  const food = D('음식').find(f => f.음식명 === $('#mfood').value.trim());
  if (!food) return (p.textContent = '');
  const amt = $('#mamt').value === '' ? food.기준량 : $('#mamt').value;
  const n = nutrition(food, amt);
  p.innerHTML = `${esc(amt)}${esc(food.단위)} → <b>${n.칼로리}kcal</b> · 단백질 <b>${n.단백질 === '' ? '-' : `${n.단백질}g`}</b>`;
}

function historyView() {
  const recs = D('기록');
  const dates = [...new Set(recs.map(s => s.날짜))].sort().reverse();
  return `${band('기록', `${dates.length}일 운동`)}` + (dates.map(d => {
    const rs = recs.filter(s => s.날짜 === d);
    const names = [...new Set(rs.map(s => s.운동명))];
    const vol = rs.reduce((t, s) => t + Number(s.무게) * Number(s.횟수), 0);
    return `<section class=panel><div class=panel-head><h2 class=panel-title>${fmtDate(d)} <small>${esc(rs[0].루틴명)}</small></h2><span class=head-num>${rs.length}세트 · ${Math.round(vol).toLocaleString()}kg</span></div>${names.map(n => {
      const xs = rs.filter(s => s.운동명 === n).sort((a, b) => a.세트번호 - b.세트번호);
      const best = xs.reduce((m, x) => (e1rm(x.무게, x.횟수) > e1rm(m.무게, m.횟수) ? x : m));
      return `<button class=hrow data-act=info data-n="${esc(n)}"><span class=hrow-main><b>${esc(n)}</b><span>${setsText(xs)}</span></span><b class=hrow-best>${best.무게}×${best.횟수}</b></button>`;
    }).join('')}</section>`;
  }).join('') || '<p class=empty>기록 없음</p>');
}

// [탭, 제목 열, 묶음 열, 보조 설명]
const opt = (v, f) => (v === '' || v == null ? '' : f(v));
const MANAGE = [
  ['종목', '운동명', '부위', r => [opt(r.증량단위, v => `${v}kg씩`), opt(r['휴식(초)'], v => `휴식 ${v}초`)]],
  ['루틴', '운동명', '루틴명', r => [opt(r.순서, v => `${v}번째`), opt(r.목표세트, v => `${v}세트`), opt(r.목표횟수, v => `${v}회`), opt(r.슈퍼세트, v => `슈퍼세트 ${v}`)]],
  ['음식', '음식명', '', r => [`${r.기준량}${r.단위}당`, opt(r.칼로리, v => `${v}kcal`), opt(r.단백질, v => `단백질 ${v}g`)]],
  ['식단템플릿', '음식명', '템플릿명', r => [r.끼니, `${r.양}${D('음식').find(f => f.음식명 === r.음식명)?.단위 || ''}`]],
  ['설정', '키', '', r => [r.값]],
];
const REQUIRED = { 종목: ['운동명'], 루틴: ['루틴명', '운동명'], 음식: ['음식명', '기준량', '칼로리'], 식단템플릿: ['템플릿명', '음식명', '양'], 설정: ['키'] };
const KEY = { 종목: '운동명', 음식: '음식명' }; // 이름이 다른 탭에서 참조되는 탭

function manageView() {
  const [t, title, group, subs] = MANAGE.find(m => m[0] === mtab);
  const rows = [...D(t)].sort(t === '루틴' ? byOrder : () => 0);
  const groups = group ? [...new Set(D(t).map(r => r[group]))] : [''];
  return `${band('관리', '시트에서 직접 고쳐도 반영돼요')}
    <div class=tabs role=tablist>${MANAGE.map(([m]) => `<button role=tab aria-selected=${m === mtab} data-act=mtab data-t=${m}>${m === '식단템플릿' ? '템플릿' : m}</button>`).join('')}</div>
    ${groups.map(g => `<section class=panel>
      ${group ? `<div class=panel-head><h2 class=panel-title>${esc(g || '(미분류)')}</h2><button class=ghost data-act=edit data-t=${t} data-g="${esc(g)}">${icon('plus')} 추가</button></div>` : ''}
      ${rows.filter(r => !group || r[group] === g).map(r => `<button class="item ${used(r) ? '' : 'off'}" data-act=edit data-t=${t} data-id="${esc(r.id)}">
        <span><b>${esc(r[title])}</b><small>${subs(r).filter(Boolean).map(esc).join(' · ')}</small></span>${icon('right')}</button>`).join('')}
    </section>`).join('')}
    <button class="primary wide" data-act=edit data-t=${t}>${icon('plus')} 새 ${t === '식단템플릿' ? '템플릿' : t}</button>
    <section class=panel><h2 class=panel-title>연결</h2>
      <label>Apps Script 웹앱 URL<input id=curl value="${esc(cfg.url)}"></label>
      <label>토큰<input id=ctok type=password value="${esc(cfg.token)}"></label>
      <button class="primary wide" data-act=savecfg>저장하고 불러오기</button></section>`;
}

const VIEWS = { workout: workoutView, diet: dietView, history: historyView, manage: manageView };

function openDlg(html) {
  const d = $('#dlg');
  d.innerHTML = `<form method=dialog class=dlg-close><button class=x aria-label=닫기>${icon('x')}</button></form>${html}`;
  d.showModal();
}

function showInfo(name) {
  const e = ex(name);
  const hist = D('기록').filter(s => s.운동명 === name);
  const dates = [...new Set(hist.map(s => s.날짜))].sort().reverse();
  openDlg(`<h2 class=label-title>${esc(name)}</h2><p class=label-sub>${esc(e.부위 || '')}${e.타겟 ? ` · ${esc(e.타겟)}` : ''}</p>
    <div class=n-hist>${dates.map(d => `<div class=n-row><span>${fmtDate(d)}</span><b>${setsText(hist.filter(s => s.날짜 === d).sort((a, b) => a.세트번호 - b.세트번호))}</b></div>`).join('') || '<p class=empty>기록 없음</p>'}</div>
    ${['진행방법', '수행방법', '핵심팁', '주의사항', '대체운동'].filter(f => e[f] && e[f] !== '-').map(f => `<h3 class=tip-h>${f}</h3><p class=tip>${esc(e[f])}</p>`).join('')}
    ${/^https?:\/\//.test(e.영상 || '') ? `<a class="primary wide" href="${esc(e.영상)}" target=_blank rel=noopener>${icon('play')} 영상 보기</a>` : ''}`);
}

function editRow(t, id, preset = {}) {
  if (!db.heads[t]) return alert('먼저 관리 탭에서 시트를 연결하세요.');
  const row = D(t).find(r => r.id === id) || preset;
  const long = ['진행방법', '수행방법', '핵심팁', '주의사항'];
  const field = h => {
    const v = row[h] ?? (h === '사용' ? true : '');
    if (h === '사용') return `<label class=chk><input type=checkbox name="${h}" ${used({ 사용: v }) ? 'checked' : ''}> 사용 (끄면 목록에서 숨김, 기록은 유지)</label>`;
    if (long.includes(h)) return `<label>${h}<textarea name="${h}" rows=3>${esc(v)}</textarea></label>`;
    const list = h === '운동명' && t !== '종목' ? 'dl-ex' : h === '음식명' && t !== '음식' ? 'dl-food' : h === '끼니' ? 'dl-meal' : h === '단위' ? 'dl-unit' : '';
    return `<label>${h}<input name="${h}" value="${esc(v)}" ${list ? `list=${list}` : ''}></label>`;
  };
  openDlg(`<h2 class=label-title>${t} ${id ? '수정' : '추가'}</h2>
    <form id=ef>${db.heads[t].filter(h => h !== 'id').map(field).join('')}</form>
    ${exList()}${foodList()}<datalist id=dl-meal>${MEALS.map(m => `<option value=${m}>`).join('')}</datalist><datalist id=dl-unit><option value=g><option value=개><option value=ml></datalist>
    <div class=row>${id ? `<button class=danger data-act=delrow data-t=${t} data-id="${esc(id)}">${t === '종목' ? '숨기기' : '삭제'}</button>` : '<span></span>'}
    <button class=primary data-act=saverow data-t=${t} data-id="${esc(id || '')}">저장</button></div>`);
}

function saveRow(t, id) {
  const f = new FormData($('#ef'));
  const row = { id: id || uid() };
  db.heads[t].forEach(h => { if (h !== 'id') row[h] = h === '사용' ? f.has(h) : String(f.get(h) ?? '').trim(); });
  const miss = REQUIRED[t].filter(h => !row[h]);
  if (miss.length) return alert(`${miss.join(', ')}을(를) 입력하세요.`);
  const key = KEY[t];
  if (key && D(t).some(r => r[key] === row[key] && r.id !== row.id)) return alert(`'${row[key]}'은(는) 이미 있습니다.`);
  const old = D(t).find(r => r.id === id);
  const ops = [{ op: 'put', tab: t, row }];
  if (key && old && old[key] !== row[key]) { // 이름 변경 → 참조하는 탭도 같이 변경
    (t === '종목' ? ['루틴', '기록'] : ['식단템플릿', '식단기록']).forEach(tb => ops.push({ op: 'rename', tab: tb, col: key, from: old[key], to: row[key] }));
    session?.items.forEach(it => { if (it.name === old[key]) it.name = row[key]; });
    saveSession();
  }
  commit(...ops);
  $('#dlg').close();
  render();
}

function addMeal(meal, name, amount) {
  const food = D('음식').find(f => f.음식명 === name);
  if (!food) return false;
  const amt = amount === '' || amount == null ? food.기준량 : amount;
  commit({ op: 'put', tab: '식단기록', row: { id: uid(), 날짜: mealDate, 끼니: meal, 음식명: name, 양: Number(amt), ...nutrition(food, amt) } });
  return true;
}

// ---------- 휴식 타이머 ----------
let timerEnd = LS.get('timerEnd', 0), timerTotal = LS.get('timerTotal', 90), tick, audio;
function startTimer(sec) { timerEnd = Date.now() + sec * 1000; timerTotal = sec; LS.set('timerEnd', timerEnd); LS.set('timerTotal', sec); runTimer(); }
function runTimer() {
  clearInterval(tick);
  const upd = () => {
    const left = Math.ceil((timerEnd - Date.now()) / 1000);
    if (left > 0) {
      if ($('#timer').hidden) renderDock();
      $('#tleft').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      $('#tbar').style.setProperty('--p', left / timerTotal);
      return;
    }
    clearInterval(tick);
    if (timerEnd) { timerEnd = 0; LS.set('timerEnd', 0); navigator.vibrate?.([300, 100, 300]); beep(); }
    renderDock();
  };
  upd();
  tick = setInterval(upd, 250);
}
function beep() {
  try { const o = audio.createOscillator(); o.connect(audio.destination); o.frequency.value = 880; o.start(); o.stop(audio.currentTime + 0.5); } catch { /* 소리 미지원 */ }
}

// ---------- 화면 꺼짐 방지 ----------
let wake, justDone = '';
async function keepAwake() {
  if (session && document.visibilityState === 'visible') try { wake = await navigator.wakeLock?.request('screen'); } catch { /* 미지원 */ }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { keepAwake(); load(); } });

// ---------- 이벤트 ----------
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act],[data-tab]');
  if (!b) return;
  if (b.dataset.tab) { tab = b.dataset.tab; LS.set('tab', tab); render(); scrollTo(0, 0); return; }
  const { act, i, j, d, t, id } = b.dataset;
  const it = session?.items[i];
  switch (act) {
    case 'start':
      session = { date: today(), routine: b.dataset.r, items: D('루틴').filter(x => x.루틴명 === b.dataset.r).sort(byOrder).map(x => newItem(x.운동명, x)) };
      keepAwake();
      break;
    case 'end':
      if (!confirm('운동을 종료할까요? (완료한 세트는 이미 저장됨)')) return;
      session = null; wake?.release(); wake = null;
      break;
    case 'w': case 'r': {
      const s = it.sets[j], k = act;
      s[k] = Math.max(0, Math.round(((Number(s[k]) || 0) + Number(d)) * 100) / 100);
      if (s.id) commit({ op: 'put', tab: '기록', row: rec(it, +j) });
      break;
    }
    case 'done': {
      const s = it.sets[j];
      audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); // iOS: 탭할 때 소리 권한 확보
      if (s.id) { commit({ op: 'del', tab: '기록', id: s.id }); s.id = null; s.pr = false; break; }
      if (!(Number(s.r) > 0)) { render(); d0(`[data-f=r][data-i="${i}"][data-j="${j}"]`)?.focus(); return; } // 횟수 없는 세트는 저장하지 않음
      s.pr = isPR(D('기록'), it.name, session.date, s.w, s.r);
      s.id = uid();
      commit({ op: 'put', tab: '기록', row: rec(it, +j) });
      it.sets.slice(+j + 1).forEach(x => { if (!x.id && x.w === '') x.w = s.w; if (!x.id && x.r === '') x.r = s.r; }); // 처음 하는 종목도 다음 세트를 0부터 다시 넣지 않게
      justDone = `${i}-${j}`;
      if (it.sets.every(x => x.id)) session.focus = null; // 끝난 종목은 접고 다음 종목으로
      const nx = nextSet(session.items, session.focus);
      // 슈퍼세트에서 짝 종목으로 넘어갈 땐 쉬지 않는다
      if (!(it.superset && nx && nx.i !== +i && session.items[nx.i].superset === it.superset)) startTimer(Number(ex(it.name)['휴식(초)']) || 90);
      break;
    }
    case 'addset': { const l = it.sets[it.sets.length - 1]; it.sets.push({ w: l?.w ?? '', r: l?.r ?? '' }); break; }
    case 'rmex': if (!confirm(`'${it.name}'을(를) 오늘 목록에서 뺄까요? (저장된 세트는 유지)`)) return; session.items.splice(i, 1); break;
    case 'addex': {
      const name = $('#addex').value.trim();
      if (!name) return;
      if (!D('종목').some(e => e.운동명 === name)) {
        if (!confirm(`'${name}' 종목을 새로 만들까요?`)) return;
        commit({ op: 'put', tab: '종목', row: { id: uid(), 운동명: name, 증량단위: 2.5, '휴식(초)': 90, 사용: true } });
      }
      session.items.push(newItem(name));
      break;
    }
    case 'info': return showInfo(b.dataset.n);
    case 'focus': session.focus = +i; break;
    case 't30': timerEnd += 30000; LS.set('timerEnd', timerEnd); return runTimer();
    case 'tskip': timerEnd = 0; LS.set('timerEnd', 0); runTimer(); return renderDock();
    case 'day': { const x = new Date(`${mealDate}T00:00`); x.setDate(x.getDate() + Number(d)); mealDate = x.toLocaleDateString('sv-SE'); break; }
    case 'tpl': {
      const rows = D('식단템플릿').filter(x => x.템플릿명 === t);
      const missing = rows.filter(x => !addMeal(x.끼니, x.음식명, x.양)).map(x => x.음식명);
      if (missing.length) alert(`음식 탭에 없는 음식이라 건너뜀: ${missing.join(', ')}`);
      break;
    }
    case 'addmeal': {
      const name = $('#mfood').value.trim();
      if (!name) return;
      if (!addMeal($('[name=mmeal]:checked').value, name, $('#mamt').value)) {
        if (confirm(`'${name}'이(가) 음식 탭에 없습니다. 새로 등록할까요?`)) editRow('음식', null, { 음식명: name, 단위: 'g', 기준량: 100 });
        return;
      }
      break;
    }
    case 'delmeal': commit({ op: 'del', tab: '식단기록', id }); break;
    case 'mtab': mtab = t; break;
    case 'edit': {
      const [, , group] = MANAGE.find(m => m[0] === t);
      const preset = b.dataset.g !== undefined ? { [group]: b.dataset.g } : {};
      if (t === '루틴' && preset.루틴명) { preset.순서 = String(D('루틴').filter(r => r.루틴명 === preset.루틴명).length + 1); preset.목표세트 = 3; }
      return editRow(t, id, preset);
    }
    case 'saverow': return saveRow(t, id);
    case 'delrow':
      if (t === '종목') commit({ op: 'put', tab: t, row: { id, 사용: false } });
      else if (confirm('삭제할까요?')) commit({ op: 'del', tab: t, id });
      else return;
      $('#dlg').close();
      break;
    case 'savecfg':
      cfg = { url: $('#curl').value.trim(), token: $('#ctok').value.trim() };
      LS.set('cfg', cfg);
      return load();
    default: return;
  }
  saveSession();
  render();
});

document.addEventListener('input', e => { if (e.target.id === 'mfood' || e.target.id === 'mamt') updatePreview(); });

// 입력칸 변경은 다시 그리지 않는다 (다음 칸을 누르는 동작을 방해하지 않도록)
document.addEventListener('change', e => {
  const x = e.target;
  if (x.id === 'mdate') { mealDate = x.value || today(); return render(); }
  if (x.dataset.meal) {
    const row = D('식단기록').find(m => m.id === x.dataset.meal);
    const food = D('음식').find(f => f.음식명 === row.음식명);
    commit({ op: 'put', tab: '식단기록', row: { id: row.id, 양: Number(x.value) || 0, ...(food ? nutrition(food, x.value) : {}) } });
    return render();
  }
  const f = x.dataset.f;
  if (!f || !session) return;
  const it = session.items[x.dataset.i];
  if (f === 'memo') {
    it.memo = x.value;
    const k = it.sets.findIndex(s => s.id);
    if (k >= 0) commit({ op: 'put', tab: '기록', row: { id: it.sets[k].id, 메모: it.memo } });
  } else {
    const s = it.sets[x.dataset.j];
    s[f] = x.value;
    if (s.id) commit({ op: 'put', tab: '기록', row: rec(it, +x.dataset.j) });
  }
  saveSession();
});

// 설정 링크(#url=…&token=…)로 열면 저장 후 주소창에서 지움 (해시는 서버로 전송되지 않음)
const hash = new URLSearchParams(location.hash.slice(1));
if (hash.get('url')) { cfg = { url: hash.get('url'), token: hash.get('token') || '' }; LS.set('cfg', cfg); history.replaceState(null, '', location.pathname); }
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
if (timerEnd > Date.now()) runTimer(); else LS.set('timerEnd', (timerEnd = 0));
render();
load();
keepAwake();

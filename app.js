import { today, byOrder, lastSession, isPR, routineNames, nextRoutine, nutrition, sumNutrition, uid, applyOp } from './logic.js';

const $ = s => document.querySelector(s);
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
const setSync = m => { syncMsg = m; $('#sync').textContent = m; };

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
function render() {
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $('#view').innerHTML = !cfg.url && tab !== 'manage'
    ? '<p class=empty>관리 탭 맨 아래에서 API 주소와 토큰을 먼저 입력하세요.</p>'
    : VIEWS[tab]();
}

const setsText = sets => sets.map(s => `${s.무게}×${s.횟수}`).join(' · ');
const exList = () => `<datalist id=dl-ex>${D('종목').filter(used).map(e => `<option value="${esc(e.운동명)}">`).join('')}</datalist>`;
const foodList = () => `<datalist id=dl-food>${D('음식').map(f => `<option value="${esc(f.음식명)}">${esc(f.기준량)}${esc(f.단위)}당 ${esc(f.칼로리)}kcal</option>`).join('')}</datalist>`;

function workoutView() {
  if (!session) {
    const names = routineNames(D('루틴'));
    const next = nextRoutine(names, D('기록'));
    return `<h2>오늘 할 루틴</h2><div class=chips>${names.map(n => `<button class="chip big ${n === next ? 'on' : ''}" data-act=start data-r="${esc(n)}">${esc(n)}${n === next ? ' <small>추천</small>' : ''}</button>`).join('')}
      <button class="chip big" data-act=start data-r="">자유 운동</button></div>`;
  }
  return `<div class=row><h2>${esc(session.routine || '자유 운동')} <small>${session.date.slice(5)}</small></h2><button class=ghost data-act=end>운동 종료</button></div>
    ${session.items.map(itemCard).join('')}
    <div class=add><input list=dl-ex id=addex placeholder="종목 추가 (검색 또는 새 이름)"><button data-act=addex>추가</button></div>${exList()}`;
}

function itemCard(it, i) {
  const last = lastSession(D('기록'), it.name, session.date);
  const step = Number(ex(it.name).증량단위) || 2.5;
  const btn = (act, j, d, t) => `<button class=pm data-act=${act} data-i=${i} data-j=${j} data-d=${d} aria-label="${t}">${d > 0 ? '+' : '−'}</button>`;
  return `<section class="card ${it.superset ? 'ss' : ''}">
    <div class=row><button class=link data-act=info data-n="${esc(it.name)}">${esc(it.name)}</button><button class=x data-act=rmex data-i=${i} aria-label="종목 빼기">×</button></div>
    <p class=meta>${it.superset ? `<span class=tag>슈퍼세트 ${esc(it.superset)}</span> ` : ''}목표 ${esc(it.goalSets || '-')}세트 × ${esc(it.goalReps || '-')}회</p>
    <p class=last>${last ? `지난번 ${last.date.slice(5)} · ${setsText(last.sets)}` : '첫 기록'}</p>
    <div class="set head"><span></span><span>kg</span><span>회</span><span></span></div>
    ${it.sets.map((s, j) => `<div class="set ${s.id ? 'done' : ''}">
      <span class=n>${j + 1}</span>
      <span class=stepper>${btn('w', j, -step, '무게 빼기')}<input inputmode=decimal data-f=w data-i=${i} data-j=${j} value="${esc(s.w)}" aria-label="${j + 1}세트 무게">${btn('w', j, step, '무게 더하기')}</span>
      <span class=stepper>${btn('r', j, -1, '횟수 빼기')}<input inputmode=numeric data-f=r data-i=${i} data-j=${j} value="${esc(s.r)}" aria-label="${j + 1}세트 횟수">${btn('r', j, 1, '횟수 더하기')}</span>
      <button class=check data-act=done data-i=${i} data-j=${j} aria-label="${j + 1}세트 완료">${s.id ? (s.pr ? '🎉' : '✓') : ''}</button>
    </div>`).join('')}
    <div class=row><button class=ghost data-act=addset data-i=${i}>+ 세트</button><input class=memo data-f=memo data-i=${i} placeholder=메모 value="${esc(it.memo)}"></div>
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

function dietView() {
  const rows = D('식단기록').filter(m => m.날짜 === mealDate);
  const sum = sumNutrition(rows);
  const goal = k => Number(D('설정').find(x => x.키 === k)?.값) || 0;
  const bar = (label, v, g, u) => `<div class=bar><div class=row><span>${label}</span><span><b>${v}</b> / ${g}${u}</span></div><progress max=${g || 1} value=${v}></progress></div>`;
  const unit = name => D('음식').find(f => f.음식명 === name)?.단위 || '';
  const tpls = [...new Set(D('식단템플릿').map(t => t.템플릿명))];
  const meals = [...new Set([...MEALS, ...rows.map(x => x.끼니)])];
  return `<div class="row datenav"><button class=ghost data-act=day data-d=-1 aria-label="이전 날">‹</button><input type=date id=mdate value=${mealDate}><button class=ghost data-act=day data-d=1 aria-label="다음 날">›</button></div>
    ${bar('칼로리', sum.칼로리, goal('목표칼로리'), 'kcal')}${bar('단백질', sum.단백질, goal('목표단백질'), 'g')}
    <p class=meta>지방 ${sum.지방}g · 탄수화물 ${sum.탄수화물}g</p>
    <div class=chips>${tpls.map(t => `<button class=chip data-act=tpl data-t="${esc(t)}">+ ${esc(t)}</button>`).join('')}</div>
    ${meals.map(m => {
      const rs = rows.filter(x => x.끼니 === m);
      return rs.length ? `<section class=card><h3>${esc(m)}</h3>${rs.map(x => `<div class=meal>
        <span class=f>${esc(x.음식명)}</span>
        <input inputmode=decimal data-meal="${esc(x.id)}" value="${esc(x.양)}" aria-label="${esc(x.음식명)} 양"><span class=u>${esc(unit(x.음식명))}</span>
        <span class=k>${x.칼로리}kcal<br>${x.단백질}g</span>
        <button class=x data-act=delmeal data-id="${esc(x.id)}" aria-label="삭제">×</button></div>`).join('')}</section>` : '';
    }).join('')}
    <section class=card><h3>음식 추가</h3><div class=add>
      <select id=mmeal aria-label=끼니>${MEALS.map(m => `<option>${m}</option>`).join('')}</select>
      <input list=dl-food id=mfood placeholder="음식 검색" aria-label=음식>
      <input inputmode=decimal id=mamt placeholder=양 aria-label=양>
      <button data-act=addmeal>추가</button></div>${foodList()}</section>`;
}

function historyView() {
  const recs = D('기록');
  const dates = [...new Set(recs.map(s => s.날짜))].sort().reverse();
  return dates.map(d => {
    const rs = recs.filter(s => s.날짜 === d);
    const names = [...new Set(rs.map(s => s.운동명))];
    return `<section class=card><h3>${d} <small>${esc(rs[0].루틴명)}</small></h3>${names.map(n => `<p>
      <button class=link data-act=info data-n="${esc(n)}">${esc(n)}</button><br>
      <small>${setsText(rs.filter(s => s.운동명 === n).sort((a, b) => a.세트번호 - b.세트번호))}</small></p>`).join('')}</section>`;
  }).join('') || '<p class=empty>기록 없음</p>';
}

// [탭, 제목 열, 묶음 열, 보조 열]
const MANAGE = [
  ['종목', '운동명', '부위', ['증량단위', '휴식(초)']],
  ['루틴', '운동명', '루틴명', ['순서', '목표세트', '목표횟수', '슈퍼세트']],
  ['음식', '음식명', '', ['기준량', '단위', '칼로리', '단백질']],
  ['식단템플릿', '음식명', '템플릿명', ['끼니', '양']],
  ['설정', '키', '', ['값']],
];
const REQUIRED = { 종목: ['운동명'], 루틴: ['루틴명', '운동명'], 음식: ['음식명', '기준량', '칼로리'], 식단템플릿: ['템플릿명', '음식명', '양'], 설정: ['키'] };
const KEY = { 종목: '운동명', 음식: '음식명' }; // 이름이 다른 탭에서 참조되는 탭

function manageView() {
  const [t, title, group, subs] = MANAGE.find(m => m[0] === mtab);
  const rows = [...D(t)].sort(t === '루틴' ? byOrder : () => 0);
  const groups = group ? [...new Set(D(t).map(r => r[group]))] : [''];
  return `<div class=chips>${MANAGE.map(([m]) => `<button class="chip ${m === mtab ? 'on' : ''}" data-act=mtab data-t=${m}>${m}</button>`).join('')}</div>
    ${groups.map(g => `<section class=card>
      ${group ? `<div class=row><h3>${esc(g || '(미분류)')}</h3><button class=ghost data-act=edit data-t=${t} data-g="${esc(g)}">+ 추가</button></div>` : ''}
      ${rows.filter(r => !group || r[group] === g).map(r => `<button class="item ${used(r) ? '' : 'off'}" data-act=edit data-t=${t} data-id="${esc(r.id)}">
        <b>${esc(r[title])}</b><small>${subs.map(c => esc(r[c])).filter(Boolean).join(' · ')}</small></button>`).join('')}
    </section>`).join('')}
    <button class="primary wide" data-act=edit data-t=${t}>+ 새 ${t === '식단템플릿' ? '템플릿' : t}</button>
    <section class=card><h3>연결</h3>
      <label>Apps Script 웹앱 URL<input id=curl value="${esc(cfg.url)}"></label>
      <label>토큰<input id=ctok type=password value="${esc(cfg.token)}"></label>
      <button class=primary data-act=savecfg>저장하고 불러오기</button><p class=meta>${esc(syncMsg)}</p></section>`;
}

const VIEWS = { workout: workoutView, diet: dietView, history: historyView, manage: manageView };

function openDlg(html) {
  const d = $('#dlg');
  d.innerHTML = `${html}<form method=dialog><button class="ghost wide">닫기</button></form>`;
  d.showModal();
}

function showInfo(name) {
  const e = ex(name);
  const hist = D('기록').filter(s => s.운동명 === name);
  const dates = [...new Set(hist.map(s => s.날짜))].sort().reverse();
  openDlg(`<h3>${esc(name)}</h3>
    ${['진행방법', '수행방법', '핵심팁', '주의사항', '대체운동', '타겟'].filter(f => e[f] && e[f] !== '-').map(f => `<p><b>${f}</b><br>${esc(e[f])}</p>`).join('')}
    ${/^https?:\/\//.test(e.영상 || '') ? `<p><a href="${esc(e.영상)}" target=_blank rel=noopener>▶ 영상 보기</a></p>` : ''}
    <h4>기록</h4>${dates.map(d => `<p>${d.slice(5)} · ${setsText(hist.filter(s => s.날짜 === d).sort((a, b) => a.세트번호 - b.세트번호))}</p>`).join('') || '<p>없음</p>'}`);
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
  openDlg(`<h3>${t} ${id ? '수정' : '추가'}</h3>
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
let timerEnd = LS.get('timerEnd', 0), tick, audio;
function startTimer(sec) { timerEnd = Date.now() + sec * 1000; LS.set('timerEnd', timerEnd); runTimer(); }
function runTimer() {
  clearInterval(tick);
  const upd = () => {
    const left = Math.ceil((timerEnd - Date.now()) / 1000);
    $('#timer').hidden = left <= 0;
    if (left > 0) return ($('#tleft').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`);
    clearInterval(tick);
    if (timerEnd) { timerEnd = 0; LS.set('timerEnd', 0); navigator.vibrate?.([300, 100, 300]); beep(); }
  };
  upd();
  tick = setInterval(upd, 250);
}
function beep() {
  try { const o = audio.createOscillator(); o.connect(audio.destination); o.frequency.value = 880; o.start(); o.stop(audio.currentTime + 0.5); } catch { /* 소리 미지원 */ }
}

// ---------- 화면 꺼짐 방지 ----------
let wake;
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
      s.pr = isPR(D('기록'), it.name, session.date, s.w, s.r);
      s.id = uid();
      commit({ op: 'put', tab: '기록', row: rec(it, +j) });
      const nxt = session.items[+i + 1];
      if (!(it.superset && nxt?.superset === it.superset)) startTimer(Number(ex(it.name)['휴식(초)']) || 90); // 슈퍼세트 앞 종목은 쉬지 않음
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
    case 't30': timerEnd += 30000; LS.set('timerEnd', timerEnd); return runTimer();
    case 'tskip': timerEnd = 0; LS.set('timerEnd', 0); return runTimer();
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
      if (!addMeal($('#mmeal').value, name, $('#mamt').value)) {
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

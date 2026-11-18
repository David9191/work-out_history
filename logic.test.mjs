import assert from 'node:assert/strict';
import { lastSession, isPR, nextRoutine, routineNames, nutrition, sumNutrition, applyOp, byOrder } from './logic.js';

const recs = [
  { 날짜: '2026-11-10', 루틴명: '가슴날', 운동명: '벤치', 세트번호: 1, 무게: 50, 횟수: 8 },
  { 날짜: '2026-11-16', 루틴명: '가슴날', 운동명: '벤치', 세트번호: 2, 무게: 55, 횟수: 6 },
  { 날짜: '2026-11-16', 루틴명: '가슴날', 운동명: '벤치', 세트번호: 1, 무게: 55, 횟수: 7 },
  { 날짜: '2026-11-17', 루틴명: '등날', 운동명: '랫풀', 세트번호: 1, 무게: 40, 횟수: 10 },
];

const ls = lastSession(recs, '벤치', '2026-11-20');
assert.equal(ls.date, '2026-11-16');
assert.deepEqual(ls.sets.map(s => s.세트번호), [1, 2]);
assert.equal(lastSession(recs, '벤치', '2026-11-16').date, '2026-11-10'); // 오늘 기록은 제외
assert.equal(lastSession(recs, '스쿼트', '2026-11-20'), null);

assert.equal(isPR(recs, '벤치', '2026-11-20', 60, 6), true);
assert.equal(isPR(recs, '벤치', '2026-11-20', 55, 7), false);
assert.equal(isPR(recs, '스쿼트', '2026-11-20', 100, 5), false);

const routines = [{ 루틴명: '가슴날' }, { 루틴명: '가슴날' }, { 루틴명: '등날' }, { 루틴명: '하체날' }];
const names = routineNames(routines);
assert.deepEqual(names, ['가슴날', '등날', '하체날']);
assert.equal(nextRoutine(names, recs), '하체날');
assert.equal(nextRoutine(names, []), '가슴날');
assert.equal(nextRoutine(names, [{ 날짜: '2026-11-01', 루틴명: '하체날' }]), '가슴날');

assert.deepEqual(['10', '2', '1A', '1B'].map(순서 => ({ 순서 })).sort(byOrder).map(x => x.순서), ['1A', '1B', '2', '10']);

const pork = { 기준량: 100, 칼로리: 123, 단백질: 21, 지방: 4, 탄수화물: 0 };
assert.deepEqual(nutrition(pork, 300), { 칼로리: 369, 단백질: 63, 지방: 12, 탄수화물: 0 });
const rice = { 기준량: 210, 칼로리: 315, 단백질: 5.5, 지방: '', 탄수화물: '' };
assert.deepEqual(nutrition(rice, 105), { 칼로리: 157.5, 단백질: 2.8, 지방: '', 탄수화물: '' });
assert.deepEqual(sumNutrition([nutrition(pork, 300), nutrition(rice, 210)]), { 칼로리: 684, 단백질: 68.5, 지방: 12, 탄수화물: 0 });

const data = { 기록: [{ id: 'a', 운동명: 'x', 무게: 1 }] };
applyOp(data, { op: 'put', tab: '기록', row: { id: 'a', 무게: 2 } });
applyOp(data, { op: 'put', tab: '기록', row: { id: 'b', 운동명: 'x' } });
applyOp(data, { op: 'rename', tab: '기록', col: '운동명', from: 'x', to: 'y' });
applyOp(data, { op: 'del', tab: '기록', id: 'b' });
assert.deepEqual(data.기록, [{ id: 'a', 운동명: 'y', 무게: 2 }]);

console.log('ok');

import assert from 'node:assert/strict';
import fs from 'node:fs';

const readings = JSON.parse(fs.readFileSync(new URL('../data/readings.json', import.meta.url), 'utf8'));
const legacy = JSON.parse(fs.readFileSync(new URL('../data/readings.legacy.json', import.meta.url), 'utf8'));
const appSource = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

assert.equal(readings.length, 64, '卦象数量必须保持为 64');
assert.equal(readings.flatMap(reading => Object.values(reading.lines)).length, 384, '爻辞数量必须保持为 384');

for (const reading of readings) {
  const original = legacy.find(item => item.id === reading.id);
  assert.ok(original, `缺少第 ${reading.id} 卦的基准资料`);
  assert.equal(reading.name, original.name, `第 ${reading.id} 卦名称被改动`);
  assert.equal(reading.upper_trigram, original.upper_trigram, `${reading.name}上卦被改动`);
  assert.equal(reading.lower_trigram, original.lower_trigram, `${reading.name}下卦被改动`);
  for (let number = 1; number <= 6; number += 1) {
    const line = reading.lines[String(number)];
    const originalLine = original.lines[String(number)];
    assert.equal(line.title, originalLine.title, `${reading.name}第 ${number} 爻名称被改动`);
    assert.equal(line.classic, originalLine.classic, `${reading.name}第 ${number} 爻原文被改动`);
    for (const field of ['situation', 'tension', 'warning']) {
      assert.ok(line.modern[field]?.length >= 8, `${reading.name}${line.title}的 ${field} 过短`);
    }
  }
}

const allCopy = `${JSON.stringify(readings)}\n${appSource}`;
const banned = [
  '结合本卦', '未来不是既定结果', '叠加本卦与变卦', '更适合把注意力放在',
  '这卦支持你', '这卦反对你', '卦象要求你', '先识别……再观察……最后……'
];
for (const phrase of banned) assert.ok(!allCopy.includes(phrase), `仍含模板化表达：${phrase}`);

const corpusCopy = JSON.stringify(readings);
const malformed = [/把把/g, /[，；：]+。/g, /。{2,}/g, /；{2,}/g, /：{2,}/g];
for (const pattern of malformed) assert.ok(!pattern.test(corpusCopy), `发现标点或病句模式：${pattern}`);

const lineOpenings = readings.flatMap(reading => Object.values(reading.lines).map(line => line.interpretation.slice(0, 24)));
const counts = new Map();
for (const opening of lineOpenings) counts.set(opening, (counts.get(opening) || 0) + 1);
const worstRepeat = Math.max(...counts.values());
assert.ok(worstRepeat <= 16, `爻位解读开头重复过多：同一开头出现 ${worstRepeat} 次`);

console.log(`卦象文本审计通过：64 卦、384 爻；古典事实未改；开头最大重复 ${worstRepeat} 次。`);

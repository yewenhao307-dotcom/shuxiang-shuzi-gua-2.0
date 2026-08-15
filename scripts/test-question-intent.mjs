import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const start = source.indexOf('const QUESTION_MARKERS=');
const end = source.indexOf('const QUESTION_ACTIONS=', start);

assert.ok(start >= 0 && end > start, '无法从 app.js 定位问题识别模块');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  `${source.slice(start, end)}\nglobalThis.classifyQuestion = classifyQuestion;`,
  sandbox,
  { filename: 'question-classifier.js' }
);

const cases = [
  ['我女朋友会赚到一百万吗', 'resources'],
  ['这笔投资能不能回本', 'resources'],
  ['借出去的钱什么时候能收回来', 'resources'],
  ['今年适合买房吗', 'resources'],
  ['我的收入能覆盖房贷吗', 'resources'],
  ['如果重生成为亿万富翁后，我能和女朋友开心在一起赚钱但保证大家都不出轨吗？', 'relationship'],
  ['如果重生成为亿万富翁后，我能和女朋友开心在一起赚钱但保证大家都不变心吗？', 'relationship'],
  ['给我一百万的时候我会出轨吗', 'relationship'],
  ['我能成功迎娶心里的白月光吗，如果我赚了一百万以后', 'relationship'],
  ['伴侣会不会背叛我', 'relationship'],
  ['我们吵架后应该怎么沟通', 'relationship'],
  ['这段关系还有复合的可能吗', 'relationship'],
  ['我要不要辞职', 'career'],
  ['这次面试会有结果吗', 'career'],
  ['现在适合跳槽吗', 'career'],
  ['这个项目能顺利推进吗', 'career'],
  ['我能不能升职加薪', 'career'],
  ['这次考试能通过吗', 'study'],
  ['应该选择哪个专业', 'study'],
  ['论文能顺利完成吗', 'study'],
  ['现在适合报考吗', 'study'],
  ['最近睡眠很差怎么办', 'wellbeing'],
  ['怎样减少情绪内耗', 'wellbeing'],
  ['身体状态什么时候能恢复', 'wellbeing'],
  ['压力太大需要休息吗', 'wellbeing'],
  ['两个方案应该选哪个', 'decision'],
  ['这件事要不要继续', 'decision'],
  ['留下还是离开更合适', 'decision'],
  ['我最近有些迷茫', 'general']
];

for (const [question, expected] of cases) {
  const actual = sandbox.classifyQuestion(question);
  assert.equal(actual, expected, `分类错误：${question}；期望 ${expected}，实际 ${actual}`);
  for (let repeat = 0; repeat < 20; repeat += 1) {
    assert.equal(sandbox.classifyQuestion(question), actual, `分类不稳定：${question}`);
  }
}

console.log(`问题识别回归测试通过：${cases.length} 个语境，重复验证 ${cases.length * 20} 次。`);

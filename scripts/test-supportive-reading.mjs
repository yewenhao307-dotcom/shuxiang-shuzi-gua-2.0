import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const classifierStart = source.indexOf('function normalizeChinesePunctuation');
const helperEnd = source.indexOf('function updateQuestionMode', classifierStart);

assert.ok(classifierStart >= 0 && helperEnd > classifierStart, '无法定位心理支持式解读模块');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  `${source.slice(classifierStart, helperEnd)}
  globalThis.readProfile = extractQuestionProfile;
  globalThis.safetyCopy = safetyGuidance;
  globalThis.reflectionCopy = supportiveReflection;
  globalThis.actionsFor = questionSpecificActions;`,
  sandbox,
  { filename: 'supportive-reading.js' }
);

const past = sandbox.readProfile('过去这段感情为什么会变成这样');
assert.equal(past.category, 'relationship');
assert.equal(past.timePerspective, 'past');

const future = sandbox.readProfile('未来我的事业会怎样');
assert.equal(future.category, 'career');
assert.equal(future.timePerspective, 'future');

const family = sandbox.readProfile('我和父母总是争吵，心里很委屈');
assert.equal(family.category, 'family');
assert.equal(family.emotion, 'sadness');
assert.match(sandbox.reflectionCopy(family), /失落|看见/);

const medical = sandbox.readProfile('这个症状是不是癌症，需要停药吗');
assert.equal(medical.safetyConcern, 'medical');
assert.match(sandbox.safetyCopy(medical), /不能判断疾病/);
assert.match(sandbox.safetyCopy(medical), /医疗专业人员/);

const crisis = sandbox.readProfile('我不想活了，想伤害自己');
assert.equal(crisis.safetyConcern, 'crisis');
assert.match(sandbox.safetyCopy(crisis), /不要独处/);
assert.match(sandbox.actionsFor(crisis, {}, {}).join(''), /当地紧急服务/);

const violence = sandbox.readProfile('伴侣威胁我，还会打我，这是家暴吗');
assert.equal(violence.safetyConcern, 'violence');
assert.match(sandbox.safetyCopy(violence), /离开危险处境/);

console.log('心理支持与安全边界测试通过：过去/未来视角、情绪映照、医疗与危机分流均有效。');

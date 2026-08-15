# 中文语境识别方案整理

更新时间：2026-08-14

## GitHub 候选

| 项目 / Skill | 能力 | 与本项目的适配度 | 结论 |
| --- | --- | --- | --- |
| [huggingface/skills · transformers-js](https://github.com/huggingface/skills/tree/main/skills/transformers-js) | 指导在浏览器或 Node.js 中运行 Transformers.js | 中长期适合，可用于低置信度语义兜底 | 已安装为 Codex Skill；当前首屏暂不加载模型 |
| [huggingface/transformers.js](https://github.com/huggingface/transformers.js) | 浏览器端文本分类、零样本分类和向量提取 | 语义能力强，但首次模型下载、WASM 与内存成本较高 | 第二阶段可选；需先完成中文模型体积与 Edge 性能测试 |
| [axa-group/nlp.js](https://github.com/axa-group/nlp.js) | 意图样本训练、实体识别、分类与模型导出 | 训练思路适合，运行形态更偏 Node.js / 构建项目 | 借鉴“意图样本 + 置信度”，不直接引入依赖 |
| [pulipulichen/jieba-js](https://github.com/pulipulichen/jieba-js) | 浏览器中文分词与文本分析 | 能提升词边界识别，但不能判断主句和条件从句 | 不作为当前分类核心 |
| [fxsjy/jieba](https://github.com/fxsjy/jieba) | 成熟中文分词、自定义词典与关键词提取 | Python 端适合离线语料整理，不适合当前纯浏览器运行 | 可用于将来的批量语料审计 |

## 当前采用的混合方案

1. **主问句提取**：先剥离“如果、等到、因为、即使”等前置或后置条件，避免金额、人名等背景词抢占主题。
2. **句末意图优先**：对“出轨、分手、回本、升职、录取”等明确行为进行高优先级判定。
3. **领域语义权重**：综合短语、金额、关系人物、职业动作等上下文信号。
4. **意图样本相似度**：借鉴 NLP.js 的 utterance 训练思路，用本地中文示例补足未覆盖说法。
5. **置信度与原因**：输出分类置信度和命中方式，便于后续统计误判并增补样本。
6. **确定性优先**：全部在浏览器本地同步完成，无请求、无模型下载，不改变卦象计算事实。

## 第二阶段升级条件

仅当真实用户问题积累到足够规模，且规则分类出现稳定低置信度样本时，再让 Transformers.js 只处理这些模糊输入。模型输出不得直接改变卦象事实，只能选择“关系、资源、事业、学习、身心、选择、综合”之一；加载失败时继续使用当前确定性分类器。

# Project Scope

项目名称：`llm-price-lens`

项目类型：轻量纯静态网站，用于查询世界主流大语言模型 API 的 token 价格。

状态：Phase 4 已上线（v0.4.0）。Phase 1–3.1 的前端与数据基座已完成；本阶段已处理部署版本一致性、依赖安全更新、前端调试、浏览器验收与研发记录整理，上线证据见 PHASE_4_RECORD.md。按用户明确要求，本版只使用示例数据；真实价格、真实 Benchmark、自动同步与上游变更检查留待后续数据阶段。

## 1. MVP 范围

1. 展示模型名称、厂商和模型 ID。
2. 展示每 100 万输入 token 的美元价格。
3. 展示每 100 万输出 token 的美元价格。
4. 展示缓存输入价格；缺失时显示 `Unknown`，不显示 `$0.00`。
5. 展示上下文长度。
6. 展示数据来源。
7. 展示数据验证状态。
8. 展示数据更新时间。
9. 展示 Benchmark 分数、排名、来源和快照日期。
10. 输入价格升序与降序排序。
11. 输出价格升序与降序排序。
12. 示例工作负载成本升序与降序排序。
13. Benchmark 分数升序与降序排序。
14. 支持中文、英文、别名、拼写近似和描述关键词的模糊搜索。
15. 简易 token 成本计算器。
16. 响应式布局、深色模式和键盘可访问性。
17. GitHub Pages 部署。
18. GitHub Actions 每约 30 分钟检查上游价格数据是否变化。

## 2. 固定技术栈

- Vite
- TypeScript strict mode
- 原生 HTML
- 原生 CSS
- Fuse.js
- Vitest
- Zod（Phase 2 确定，用于全部数据校验）
- GitHub Pages
- GitHub-hosted GitHub Actions runner

## 3. 禁止事项

- React、Vue、Svelte、Next.js、Nuxt、Electron、Tauri
- Node 后端服务器、数据库、用户登录、云端 AI API、向量数据库、服务端搜索
- self-hosted runner
- 技术栈替换必须经用户书面确认

## 4. 数据不变量

- `null` 与 `0` 严格区分；缺失价格显示 `Unknown`。
- 不得编造或补零。
- 每条记录保留来源、来源 URL、上游更新时间和验证状态。
- manual override 优先级高于导入数据。
- 稳定内部 `modelId`；去重可解释并记录。
- 上游原始数据不直接进入前端。

## 5. Benchmark 策略

- 第一版不自动抓取排行榜网页。
- Benchmark 数据使用人工维护的 `data/benchmark-snapshot.json`。
- Benchmark 必须称为具体来源的“Benchmark score”或“Benchmark rank”，不得称为绝对模型实力。
- 未匹配模型显示 `No benchmark data`。
- 模型映射使用人工维护的别名表，不得仅凭模糊字符串合并不同模型版本。
- 未确认数据再发布许可前，不批量复制商业排行榜数据；许可不明确时只创建占位 Schema 和示例数据。

## 6. 搜索策略

- Fuse.js 客户端本地搜索，不调用远程服务。
- 删除复杂筛选侧栏，保留轻量厂商快捷标签：`All`、`OpenAI`、`Anthropic`、`Google`、`DeepSeek`、`Open models`。
- 描述性关键词（“便宜”“写代码”等）只能通过人工维护的 `aliases`、`tags`、`summary` 匹配。

## 7. 阶段工作流

每个阶段：读取仓库状态、运行 `git status --short`、保护无法确认来源的用户文件、输出计划和预计修改文件、实施修改、运行可行的检查、输出结果与风险。不自行提交或推送。

## 8. 推迟事项

- 用户账户、登录、偏好持久化到服务端
- 后端 API、数据库、缓存服务
- 自动排行榜抓取
- 云 AI 摘要或推理
- 超出 MVP 的图表、通知、订阅

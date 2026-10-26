# llm-price-lens Architecture

状态：Phase 4 发布候选（v0.4.0）。本版继续消费经过校验的 5 条示例模型数据；加入源提交标识、过期部署拒绝和线上版本验证，并修复前端与依赖问题。验收证据见 PHASE_4_RECORD.md。真实价格、真实 Benchmark 与自动同步按本阶段用户要求暂不接入。

## 1. 总体架构

`llm-price-lens` 是纯静态 Web 应用：

- Vite 构建，TypeScript strict mode，原生 HTML/CSS，Fuse.js 客户端搜索，Vitest 测试。
- 无后端、无数据库、无登录、无 AI API、无服务端搜索、无 self-hosted runner。
- 生产输出为 GitHub Pages 可托管的静态文件；所有数据以受控生成的静态 JSON 随站点发布。
- 构建产物必须能在 GitHub Pages 子路径（如 `/llm-price-lens/`）下正常工作，Vite 配置正确的 `base`，不依赖绝对根路径。

## 2. 目录规划（Phase 1 起实施）

```
.
├── .github/workflows/       # CI 与部署工作流（Phase 1+）
├── .codex/skills/           # 项目本地 Skill
├── data/                    # 生成数据与快照
│   ├── benchmark-snapshot.json
│   ├── prices.generated.json
│   └── quality-report.json
├── scripts/                 # 数据同步脚本
├── src/                     # 数据模型、搜索、排序、成本计算、UI
├── public/                  # 静态资源
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

这是总体目录规划。Phase 4 已创建 `scripts/` 用于构建与部署验证，`public/licenses/` 用于分发许可证；数据同步脚本和质量报告尚未实现。

## 3. 数据同步流程

管道固定为：fetch -> normalize -> merge -> validate -> emit。

- fetch：只访问明确许可、机器可读的白名单上游；设置超时、状态码检查和可理解的错误信息；不抓取所有厂商 HTML 定价页。
- normalize：转换为统一模型结构，使用稳定内部 `modelId`；严格区分 `null` 与 `0`。
- merge：合并来源与 manual override；override 优先级高于导入数据；去重可解释并记录。
- validate：所有数据通过 Zod 校验，校验失败则丢弃本次结果。
- emit：输出前端可消费的静态 JSON 和数据质量报告，包含来源数量、记录数量、缺失字段、去重记录和警告。

同步失败时保留最后一次成功数据，绝不生成半成品或覆盖有效生产数据。

## 4. 搜索架构

- 使用 Fuse.js 在浏览器本地搜索，不调用远程服务、不引入搜索服务或向量索引。
- 搜索字段：模型名、模型 ID、厂商、系列、别名、标签、摘要。
- 权重从高到低：精确模型名 > 模型 ID > 别名 > 厂商 > 标签 > 摘要。
- 结果必须确定性：相同查询与相同数据产生相同顺序。
- 描述关键词（“便宜”“写代码”等）只匹配人工维护的 `aliases`、`tags`、`summary`。
- 页面保留轻量厂商快捷标签：`All`、`OpenAI`、`Anthropic`、`Google`、`DeepSeek`、`Open models`。
- 测试覆盖中文、英文、别名、拼写错误、空查询和无结果。

## 5. 排序规则

- 支持排序：输入价格升/降、输出价格升/降、Benchmark 分数升/降、示例工作负载成本升/降、名称排序。
- 缺失数值始终排在有数值记录之后。
- 排序必须稳定；相同值时使用模型名称（`displayName`）作为次级排序键。
- 排序对 `null`、相同价格和异常值必须有测试。

示例工作负载成本明确标注为估算值，允许用户调整输入与输出 token 数。默认值：

```text
inputTokens = 1,000,000
outputTokens = 200,000
```

计算公式：

```text
cost =
  inputTokens / 1_000_000 * inputPerMillionUsd +
  outputTokens / 1_000_000 * outputPerMillionUsd;
```

任一必要价格缺失时，估算结果为 `null`，不得按零计算。

## 6. Benchmark 快照策略

- 第一版不自动抓取排行榜网页。
- 使用人工维护的 `data/benchmark-snapshot.json`，包含 `source`、`metric`、`capturedAt`、`sourceUrl`、`models`。
- 快照条目字段为 `modelId`、`benchmarkScore`、`benchmarkRank`；未知值使用 `null`，不使用空字符串。
- Benchmark 必须称为具体来源的“Benchmark score”或“Benchmark rank”，不得称为绝对模型实力。
- 未匹配模型显示 `No benchmark data`。
- 模型映射使用人工维护的别名表，不得仅凭模糊字符串合并不同模型版本。
- 未确认数据再发布许可前，不批量复制商业排行榜数据；许可不明确时创建占位 Schema 和示例数据并报告用户。

## 7. GitHub Pages 部署策略

- 使用 GitHub-hosted `ubuntu-latest` runner，禁止 self-hosted runner。
- GitHub Actions 使用最小权限，`permissions:` 显式声明。
- CI 与部署分离，或使用边界清晰、可人工审查的 job。
- 提供 `workflow_dispatch`。
- 定时任务使用非整点时间，例如每小时第 7 和 37 分钟。
- 只有校验、测试和构建全部成功后才能部署。
- 不写入 API Key；没有 secret 时不伪造外部 API 接入。
- 页面展示最后一次成功同步时间，而不是工作流计划时间。

Phase 4 发布实现：

- Vite `base: "./"`；构建输出 `release.json`，包含 phase、version、sourceCommit 和 dataMode。
- 顶部持续显示示例提示；页脚显示 Phase 4、v0.4.0 和短提交号。示例快照日期不标作真实同步时间。
- CI 与发布运行安装、类型检查、测试、构建、产物验证与 npm audit。
- `pages` concurrency 使用 `cancel-in-progress: true`；产物上传前与 environment 审批后均比较源提交和远程 main，阻止过期构建部署。
- 部署后运行 `verify-deployment.mjs`，要求线上完整 SHA 与本次提交一致，并检查 HTML、JS、CSS 和许可证索引可访问。CDN 传播最多等待 12 次，仍不一致则失败。
- 历史工作流不包含上述保护，恢复时使用当前 main 的 workflow_dispatch。

## 8. 失败回退策略

- 数据同步失败：保留最后一次成功数据，不覆盖生产数据，不生成“成功”状态。
- 数据校验失败：丢弃本次结果，阻止部署。
- 测试或构建失败：阻止部署，不宣称任务完成。
- 价格缺失：显示 `Unknown`，排序时排在有数值之后，成本估算为 `null`。
- Benchmark 未匹配：显示 `No benchmark data`。
- 外部来源不可用：数据质量报告记录错误，站点继续使用最后一次有效快照。

## 9. 数据模型

核心接口：

```ts
export interface ModelPrice {
  modelId: string;
  provider: string;
  displayName: string;
  apiModelIds: string[];
  aliases: string[];
  tags: string[];
  summary: string;
  inputPerMillionUsd: number | null;
  outputPerMillionUsd: number | null;
  cachedInputPerMillionUsd: number | null;
  contextWindow: number | null;
  sourceName: string;
  sourceUrl: string | null;
  sourceUpdatedAt: string | null;
  verifiedAt: string | null;
  status: "verified" | "imported" | "needs-review";
  benchmarkScore: number | null;
  benchmarkRank: number | null;
  benchmarkSource: string | null;
  benchmarkCapturedAt: string | null;
}

export interface PriceDataset {
  schemaVersion: 1;
  generatedAt: string;
  models: ModelPrice[];
  warnings: string[];
}
```

不得把不存在的数据填成零或编造数值。

## 10. 前端与可访问性

- 桌面端表格，窄屏卡片或可访问横向滚动。
- 语义化 HTML、键盘导航、可见焦点、正确 `label`。
- 支持 `prefers-color-scheme` 深色模式。
- 目标浏览器：当前稳定版 Safari、Chrome、Edge、Firefox。
- 避免大型动画和不必要依赖。

## 11. 质量门禁

部署或发布前至少执行：`npm ci`、`npm run typecheck`、`npm test`、`npm run build`，并检查第三方声明完整、无 secret/个人路径/本地缓存、构建产物兼容 Pages 子路径。

# Third-Party Notices

状态：Phase 5。当前项目实际使用 zod 4.6.6、Fuse.js 7.5.0；开发与验证使用 Vite 8.2.4、Vitest 4.1.12、TypeScript 7.0.2。本次不新增依赖；接入 models.dev 价格与 DeepSeek-R1 历史评测快照，审计和用户批准见 UPSTREAM_REUSE_PLAN.md 第 8 节。

本文件记录 `llm-price-lens` 实际复用的第三方材料及其声明。每次实际复用后必须更新本文件。完整许可证文本已随仓库保留在 `THIRD_PARTY_LICENSES/`，并复制到 `public/licenses/`，由 Vite 构建复制到 `dist/licenses/` 随站点分发；固定 tag/commit 与核实依据见 `UPSTREAM_REUSE_PLAN.md`。

## 1. 直接 npm 依赖

### Vite 8.2.4

- 版权声明: `Copyright (c) 2019-present, VoidZero Inc. and Vite contributors`（来自 `node_modules/vite/LICENSE.md`）
- 上游仓库: https://github.com/vitejs/vite
- 许可证: MIT
- Version: 8.2.4
- 固定 commit: `eb3137d38934b557a410c85e54f10682a944440b`
- Source: https://registry.npmjs.org/vite/-/vite-8.2.4.tgz（package-lock.json `resolved`）
- 许可证文本: `THIRD_PARTY_LICENSES/vite-MIT-LICENSE.txt`

### Vitest 4.1.12

- 版权声明: `Copyright (c) 2021-Present VoidZero Inc. and Vitest contributors`（来自 `node_modules/vitest/LICENSE.md`）
- 上游仓库: https://github.com/vitest-dev/vitest
- 许可证: MIT
- Version: 4.1.12
- 固定 commit: `4766ce1e72ded629d3a37637f57eeae643789a8c`
- Source: https://registry.npmjs.org/vitest/-/vitest-4.1.12.tgz（package-lock.json `resolved`）
- 许可证文本: `THIRD_PARTY_LICENSES/vitest-MIT-LICENSE.txt`

### Fuse.js 7.5.0

- 版权声明: Apache-2.0 LICENSE，其附录含 `Copyright 2017 Kirollos Risk`；package metadata author 为 Kiro Risk
- 上游仓库: https://github.com/krisk/Fuse
- 许可证: Apache-2.0
- Version: 7.5.0
- 固定 commit: `45bac9fe2e71fe8c680c861a35a8b226c4ae6d5a`
- Source: https://registry.npmjs.org/fuse.js/-/fuse.js-7.5.0.tgz（package-lock.json `resolved`）
- 许可证文本: `THIRD_PARTY_LICENSES/fuse-js-APACHE-2.0-LICENSE.txt`

### zod 4.6.6

- 版权声明: `Copyright (c) 2025 Colin McDonnell`（来自 `node_modules/zod/LICENSE`）
- 上游仓库: https://github.com/colinhacks/zod
- 许可证: MIT
- Version: 4.6.6
- 固定 tag commit: `9c219833c3a3764fa1f1ea9c5ecec8254a63c0b1`
- npm gitHead: `284243fb0d6532665afdc9239188773bb624f73c`（与 tag 不同；两个 ref 的 LICENSE 均已核实为 MIT，不声称源码逐字等同）
- Source: https://registry.npmjs.org/zod/-/zod-4.6.6.tgz（package-lock.json `resolved`）
- 许可证文本: `THIRD_PARTY_LICENSES/zod-MIT-LICENSE.txt`

### TypeScript 7.0.2

当前项目实际使用 `typescript@7.0.2` 作为开发和构建工具；许可证为 Apache-2.0；npm 元数据声明 `microsoft/TypeScript`；经固定 tag 和 commit 核实，该版本的实际发布来源为微软官方 `microsoft/typescript-go`；保留对应许可证和版权声明。

- 版权声明: LICENSE 为 Apache License 2.0；package metadata author 为 `Microsoft Corp.`；`node_modules/typescript/NOTICE.txt` 随包保留并纳入声明
- npm 元数据声明上游仓库: https://github.com/microsoft/TypeScript
- 实际发布来源（经固定 tag/commit 核实）: https://github.com/microsoft/typescript-go
- 许可证: Apache-2.0
- Version: 7.0.2
- 固定 tag: `typescript/v7.0.2`
- 固定 commit: `2bd066d87f5bafd315be9f40889d0a60b9e58e0b`
- Source: https://registry.npmjs.org/typescript/-/typescript-7.0.2.tgz（package-lock.json `resolved`）
- 许可证文本: `THIRD_PARTY_LICENSES/typescript-APACHE-2.0-LICENSE.txt`
- NOTICE 文本: `THIRD_PARTY_LICENSES/typescript-NOTICE.txt`

## 2. 传递依赖

传递依赖的 Version、License、`resolved` 与 `integrity` 声明记录在 `package-lock.json` 中。它们目前只作为构建和测试依赖存在，不进入站点运行时产物；若后续产物验证显示任何传递依赖随站点分发，必须同步补齐仓库内许可证文本。本文件记录项目直接声明并实际使用的 npm 依赖。

## 3. 数据

- models.dev：MIT，Copyright (c) 2025 models.dev。上游 https://github.com/anomalyco/models.dev；许可审计 commit `c08035fc978ae61a2aa395230e855cdc80d9c204`。从 https://models.dev/api.json 导入白名单文本模型名称、ID、价格、缓存读取、上下文、更新时间和开放权重标记；实际复用与规范化文件为 `data/prices.generated.json`，响应 SHA256/ETag 与缺失字段记录在 `data/quality-report.json`。完整许可：`THIRD_PARTY_LICENSES/models-dev-MIT-LICENSE.txt`，随网站 `licenses/models-dev-MIT-LICENSE.txt` 分发。
- DeepSeek-R1：MIT，Copyright (c) 2023 DeepSeek。上游 https://github.com/deepseek-ai/DeepSeek-R1；固定 commit `0cf78561f1d51c84a21b2190626b21116d5c68bb`。仅人工摘录 README Evaluation Results 的六个 AIME 2024 Pass@1 (%) 数值至 `data/benchmark-snapshot.json`；人工版本映射在 `data/benchmark-aliases.json`。排名仅按这六个分数计算，非完整排行榜；这是历史、自报告评测，无当前端点精确匹配时不补分。完整许可：`THIRD_PARTY_LICENSES/deepseek-r1-MIT-LICENSE.txt`，随网站 `licenses/deepseek-r1-MIT-LICENSE.txt` 分发。
- 没有复制上游代码、UI、Logo、模型权重或商业排行榜。
- 任何数据条目必须随站点记录来源 URL、上游更新时间、验证状态和许可证状态。
- 未确认再发布许可的商业排行榜数据不得复制。

## 4. 商标与品牌

- 模型和厂商名称仅作信息性引用。
- 不复制厂商 Logo、品牌视觉或大段品牌内容。

## 5. 声明

本文件由项目维护者人工维护，不构成法律意见。许可证存在疑义时请咨询专业意见。

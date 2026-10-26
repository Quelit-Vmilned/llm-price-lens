# Upstream Reuse Plan

状态：Phase 5 已按用户批准接入真实数据。既有依赖审计保留；本次不新增依赖。第 8 节记录数据来源、许可与复用范围。

本文件记录 `llm-price-lens` 对第三方代码、数据、文档和品牌内容的复用计划。

## 1. 复用流程

任何复用行为必须先完成以下步骤：

1. 记录上游仓库 URL。
2. 固定 commit SHA。
3. 检查仓库根目录和目标子目录中的 `LICENSE`、`COPYING`、`NOTICE`、`README`。
4. 判断代码、数据、文档和商标是否使用不同许可证。
5. 更新本文件，记录检查结果和计划复用内容。
6. 明确选择：不使用 / 学习后自行重写 / 复制小段并保留声明 / 作为依赖安装。
7. 用户审查计划后，才执行复制。
8. 实际复用后更新 `THIRD_PARTY_NOTICES.md`。
9. 为复用代码添加测试。
10. 在最终报告中列出实际复用文件和修改。

## 2. 许可证规则

- 无许可证仓库：只允许学习思想，不允许直接复制代码。
- GPL、AGPL、SSPL 或自定义许可证：暂停并报告，不自行判断兼容性。
- MIT、BSD、ISC、Apache-2.0：仍须保留版权、许可证和必要 NOTICE。
- 许可证缺失、冲突或不明确：停止复制并报告，不要猜测。
- 不复制完整网站、品牌视觉、Logo 或大段 CSS。
- 优先自行重写简单算法。
- 自动许可证审查不构成法律意见。

## 3. 已安装直接依赖审计记录

每个条目固定记录：Upstream Repository URL、License、Fixed Version、固定 GitHub Tag 或 Commit、SHA 来源、检查文件、计划复用内容、判定结果、当前状态；npm 安装证据同时记录 `resolved` 与 `integrity`。

### Vite 8.2.0

- Package: vite
- Version: 8.2.0
- Fixed Version: 8.2.0
- npm tarball: https://registry.npmjs.org/vite/-/vite-8.2.0.tgz（来自 package-lock.json `resolved`）
- npm integrity: `sha512-pn+CFpM0lwDeKwmOq1ZaBK/9sjorZcgqxki6MbY/jPEVd9vichIlmlD4HmQ5wdP5EgqQCFRaACBxMC7uEGc6lQ==`（来自 package-lock.json `integrity`）
- Declared repository in npm package metadata: https://github.com/vitejs/vite
- Upstream Repository URL: https://github.com/vitejs/vite
- License: MIT
- 固定 GitHub Tag 或 Commit: tag `v8.2.0`；commit `fa79f9ab699f9a22a6f9b50f3d247be6b51f684d`
- SHA 来源: `git ls-remote https://github.com/vitejs/vite.git 'refs/tags/v8.2.0' 'refs/tags/v8.2.0^{}'` 的 peeled ref
- 检查文件: `node_modules/vite/package.json`、`node_modules/vite/LICENSE.md`；GitHub `v8.2.0` tag 根目录 LICENSE
- 仓库内许可证文本: `THIRD_PARTY_LICENSES/vite-MIT-LICENSE.txt`
- 计划复用内容: 作为 devDependency 安装，用于本地开发服务器与生产构建
- 判定结果: MIT，允许作为依赖安装和使用
- 当前状态: 当前已实际使用（开发/构建工具）

### Vitest 4.1.10

- Package: vitest
- Version: 4.1.10
- Fixed Version: 4.1.10
- npm tarball: https://registry.npmjs.org/vitest/-/vitest-4.1.10.tgz（来自 package-lock.json `resolved`）
- npm integrity: `sha512-R9jUTe5S4Qb0HCd4TNqpC7oGcrMssMRGXLW80ubjWsW9VH5GF8y1Y0SFLY9AbqSk6nt0PnOx4H4WNJYZ13GUPw==`（来自 package-lock.json `integrity`）
- Declared repository in npm package metadata: https://github.com/vitest-dev/vitest
- Upstream Repository URL: https://github.com/vitest-dev/vitest
- License: MIT
- 固定 GitHub Tag 或 Commit: tag `v4.1.10`；commit `db616d227b6e0cb07a94f5d1bba262ee95db7e46`
- SHA 来源: `git ls-remote https://github.com/vitest-dev/vitest.git 'refs/tags/v4.1.10'`；GitHub API `git/ref/tags/v4.1.10` 确认 object type 为 commit
- 检查文件: `node_modules/vitest/package.json`、`node_modules/vitest/LICENSE.md`；GitHub `v4.1.10` tag 根目录 LICENSE
- 仓库内许可证文本: `THIRD_PARTY_LICENSES/vitest-MIT-LICENSE.txt`
- 计划复用内容: 作为 devDependency 安装，用于测试运行
- 判定结果: MIT，允许作为依赖安装和使用
- 当前状态: 当前已实际使用（测试工具）

### Fuse.js 7.5.0

- Package: fuse.js
- Version: 7.5.0
- Fixed Version: 7.5.0
- npm tarball: https://registry.npmjs.org/fuse.js/-/fuse.js-7.5.0.tgz（来自 package-lock.json `resolved`）
- npm integrity: `sha512-sQtrEfA+ez/3G0cCZecF70oqpCRttCexYUG4mUrtWL49ULUzUyxokt5kyqwtKzj1270RaKih+hcP3qLcumccow==`（来自 package-lock.json `integrity`）
- Declared repository in npm package metadata: https://github.com/krisk/Fuse
- Upstream Repository URL: https://github.com/krisk/Fuse
- License: Apache-2.0
- 固定 GitHub Tag 或 Commit: tag `v7.5.0`（tag object `2c34c70dbd2553dfdc241db16126d5d4ca9d6c51`）；commit `45bac9fe2e71fe8c680c861a35a8b226c4ae6d5a`
- SHA 来源: `git ls-remote https://github.com/krisk/Fuse.git 'refs/tags/v7.5.0' 'refs/tags/v7.5.0^{}'` 的 peeled ref
- 检查文件: `node_modules/fuse.js/package.json`、`node_modules/fuse.js/LICENSE`；GitHub `v7.5.0` tag LICENSE
- 仓库内许可证文本: `THIRD_PARTY_LICENSES/fuse-js-APACHE-2.0-LICENSE.txt`
- 计划复用内容: 作为 dependency 安装，供 Phase 3 客户端模糊搜索使用
- 判定结果: Apache-2.0，允许作为依赖安装和使用
- 当前状态: 已实际使用（`src/search.ts` import 并执行客户端模糊搜索）

### zod 4.4.3

- Package: zod
- Version: 4.4.3
- Fixed Version: 4.4.3
- npm tarball: https://registry.npmjs.org/zod/-/zod-4.4.3.tgz（来自 package-lock.json `resolved`）
- npm integrity: `sha512-ytENFjIJFl2UwYglde2jchW2Hwm4GJFLDiSXWdTrJQBIN9Fcyp7n4DhxJEiWNAJMV1/BqWfW/kkg71UDcHJyTQ==`（来自 package-lock.json `integrity`）
- Declared repository in npm package metadata: https://github.com/colinhacks/zod
- Upstream Repository URL: https://github.com/colinhacks/zod
- License: MIT
- 固定 GitHub Tag 或 Commit: tag `v4.4.3`；commit `1fb56a5c18c27102dbc92260a4007c7732a0ccca`
- SHA 来源: `git ls-remote https://github.com/colinhacks/zod.git 'refs/tags/v4.4.3'`；GitHub API `git/ref/tags/v4.4.3` 确认 object type 为 commit
- 检查文件: `node_modules/zod/package.json`、`node_modules/zod/LICENSE`；GitHub `v4.4.3` tag LICENSE
- 仓库内许可证文本: `THIRD_PARTY_LICENSES/zod-MIT-LICENSE.txt`
- 计划复用内容: 作为 dependency 安装，用于全部数据校验
- 判定结果: MIT，允许作为依赖安装和使用
- 当前状态: 当前已实际使用（`src/schema.ts` import zod 并执行数据校验）

### TypeScript 7.0.2

- Package: typescript
- Version: 7.0.2
- Fixed Version: 7.0.2
- npm tarball: https://registry.npmjs.org/typescript/-/typescript-7.0.2.tgz（来自 package-lock.json `resolved`）
- npm integrity: `sha512-8FYau96o3NKOhbjKi/qNvG/W5jhzxkbdm5sj9AbZ/5T5sWqn3hJgLfGx27sRKZWTvyzCP8dLRBTf5tBTSRVUNA==`（来自 package-lock.json `integrity`）
- Declared repository in npm package metadata: https://github.com/microsoft/TypeScript
- Declared gitHead: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
- Verified release repository: https://github.com/microsoft/typescript-go
- Verified tag: typescript/v7.0.2
- Verified commit: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
- Upstream Repository URL: https://github.com/microsoft/typescript-go（实际可验证发布仓库；npm 声明仓库见上）
- License: Apache-2.0
- Verification evidence:
  - npm/package-lock version、resolved、integrity；
  - 已安装包 package.json 中的 repository 和 gitHead；
  - microsoft/TypeScript 中不存在对应 tag/commit；
  - microsoft/typescript-go 的 typescript/v7.0.2 tag 指向相同 commit；
  - 对应仓库/tag 的 LICENSE 和 package metadata 声明 Apache-2.0。
- SHA 来源: `git ls-remote https://github.com/microsoft/typescript-go.git 'refs/tags/typescript/v7.0.2'`；GitHub API 在 `microsoft/TypeScript` 查询同一 SHA 返回 `422 No commit found`
- 检查文件: `node_modules/typescript/package.json`、`node_modules/typescript/LICENSE`、`node_modules/typescript/NOTICE.txt`；`microsoft/typescript-go` 在 `typescript/v7.0.2` 的 LICENSE 与 package.json
- 仓库内许可证文本: `THIRD_PARTY_LICENSES/typescript-APACHE-2.0-LICENSE.txt`
- 仓库内 NOTICE 文本: `THIRD_PARTY_LICENSES/typescript-NOTICE.txt`
- 计划复用内容: 作为 devDependency 安装，用于 TypeScript 类型检查
- Decision: 允许作为构建工具依赖使用。
- Status: Verified with metadata discrepancy documented.
- 判定结果: Apache-2.0，允许作为依赖安装和使用
- 当前状态: 当前已实际使用（开发/构建工具）

说明：`typescript@7.0.2` 的 npm package metadata 仍声明 microsoft/TypeScript，但经核实，该版本对应的发布 tag 和 gitHead 实际位于微软官方 microsoft/typescript-go 仓库。两个仓库均为 Microsoft 官方仓库；本项目记录实际可验证的发布仓库，同时保留 npm 声明仓库，避免误导。本记录不推测微软内部迁移原因，也不声称两个仓库内容等价。

## 4. 传递依赖说明

除上述直接依赖外，npm 还会安装传递依赖。传递依赖的 Version、License、`resolved` 与 `integrity` 声明记录在 `package-lock.json` 中。它们目前不进入站点运行时产物；若后续产物验证显示任何传递依赖随站点分发，必须同步补齐仓库内许可证文本。本阶段未对每个传递依赖单独执行 GitHub commit 级审计。

## 5. 上游数据来源

- 第一版只同步明确许可、机器可读的上游数据。
- 不使用每 30 分钟抓取厂商 HTML 定价页的方式。
- 每个数据来源需记录：来源 URL、上游更新时间、许可证状态、计划复用内容。
- 商业排行榜数据在确认再发布许可前不复制。

## 6. 复用决策日志

本阶段没有复制第三方代码片段或外部数据；只安装并使用上表 npm 依赖。真正复制第三方代码、数据或文档时，再按第 1 节流程补充上游 URL、commit SHA、许可证、检查文件和计划复用内容。

## 7. Phase 4 安全更新（2026-10-26）

用户授权修复既有问题并完成发布。当前 npm audit 报告 6 个受影响包（4 high、2 moderate），本次在原技术栈内更新现有依赖，不新增直接依赖。安装前已核对官方 npm 元数据、上游固定版本 LICENSE 及 tag/commit；计划允许作为现有构建、测试、校验依赖使用。Vite/Vitest 的 npm 分发包包含 bundled notices，安装后将完整包许可证同步至 THIRD_PARTY_LICENSES/ 和 public/licenses/。

| 包 | 目标版本 | 官方上游 | 固定 commit | 许可证 | 复用范围 |
| --- | --- | --- | --- | --- | --- |
| vite | 8.2.4 | https://github.com/vitejs/vite | eb3137d38934b557a410c85e54f10682a944440b（v8.2.4 peeled tag） | MIT | 既有开发与构建工具 |
| vitest | 4.1.12 | https://github.com/vitest-dev/vitest | 4766ce1e72ded629d3a37637f57eeae643789a8c（v4.1.12） | MIT | 既有测试工具及 mocker 修复 |
| zod | 4.6.6 | https://github.com/colinhacks/zod | 9c219833c3a3764fa1f1ea9c5ecec8254a63c0b1（v4.6.6） | MIT | 既有运行时数据校验 |
| nanoid | 3.3.20 | https://github.com/ai/nanoid | d76f633e0201c1299d735a6544c4c4a05c882f0b（npm gitHead） | MIT | 既有构建传递依赖；安装器在原范围内解析到 3.3.20，已补核许可证 |
| source-map-js | 1.2.2 | https://github.com/7rulnik/source-map-js | 0a1d334fd1e55a47df97fcd60a7915d46df3b08a（npm gitHead） | BSD-3-Clause | 既有构建传递依赖 |

检查文件：各上游固定 ref 的 LICENSE、npm 包元数据；安装后核对 package.json、LICENSE/NOTICE 与锁文件 integrity。zod npm 元数据 gitHead 为 284243fb0d6532665afdc9239188773bb624f73c，与 tag 不同，保留两种证据，不声称源码逐字等同。Fuse.js 7.5.0、TypeScript 7.0.2 及既有 TypeScript 来源差异沿用原审计记录。

官方 npm tarball/integrity：

- vite: https://registry.npmjs.org/vite/-/vite-8.2.4.tgz — `sha512-lfauXnrf2x0p+UoA+wXh0dgFWnUjCyG6Js95KBkgaCwUU9k0DAHI4W6Q0WCx+h+5g+Alce1y4Zi2QjjK0UvGBw==`
- vitest: https://registry.npmjs.org/vitest/-/vitest-4.1.12.tgz — `sha512-5eWdz2yb3ajxWF3C8C4TjkXl7FGm3n2E/VlazALrQHzK7nYMSGFnCZto0bbPNl77AwkOZVLk0YnBAejUu0NiWA==`
- zod: https://registry.npmjs.org/zod/-/zod-4.6.6.tgz — `sha512-4UmzQUF5fxvfcYHlbjBmejU+w+hbDnWFx4aS8kBx7nPBHcO2SqPbpAG8snbdg+Xse4pRefR98hgjFgIMCI/UhA==`
- nanoid: https://registry.npmjs.org/nanoid/-/nanoid-3.3.20.tgz — `sha512-uKdg2G3GNCKQn9byYOpxbGqrT2fGO5KRt5J/8b3pok8rT6qxGWF6hxMyJiEYtAf+FVyYuD9hRaDqX5uPFYJ4ZQ==`
- source-map-js: https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.2.tgz — `sha512-KGj/8Y43x35aZVDtt+J4mK1hoLGHULMYfSkODJNQjNDC3oW1PqPoxMwo0pLUsWM/UEGzON/NxeHywEfNXNP3Vw==`

本次没有导入价格、排行榜、第三方视觉或代码片段。安全检查结果与实际安装版本记录在 PHASE_4_RECORD.md。

## 8. Phase 5 真实数据接入计划（2026-10-26）

用户要求接入实际数据、验证更新并上线 GitHub Pages。本次使用原设计的 GitHub Actions 数据流水线，无需 API 密钥或付费调用。只复用结构化价格事实和少量人工维护的评测数值；实现代码自行编写，不复制上游 UI、Logo、SDK 或模型权重。

| 来源 | 固定审计 commit | 已检查文件 | 许可 | 计划复用 |
| --- | --- | --- | --- | --- |
| https://github.com/anomalyco/models.dev | `c08035fc978ae61a2aa395230e855cdc80d9c204` | 根 LICENSE、README.md、递归目录的 LICENSE/COPYING/NOTICE；models/ 与 providers/ 无独立限制 | MIT，Copyright (c) 2025 models.dev | 公开 https://models.dev/api.json 中白名单厂商的文本模型名称、ID、美元/百万 token 价格、缓存读取价格、上下文、模型更新时间；保留 API 响应 SHA256/ETag 与许可哈希 |
| https://github.com/deepseek-ai/DeepSeek-R1 | `0cf78561f1d51c84a21b2190626b21116d5c68bb` | 根 LICENSE、README.md Evaluation Results 与 License；递归目录无额外文档许可 | MIT，Copyright (c) 2023 DeepSeek | 人工维护少量 AIME 2024 Pass@1 分数与精确模型版本映射；标注为 DeepSeek 自报告、历史快照，排名仅指本快照内比较 |

价格上游的 `open_weights` 只作为信息字段，不代表本项目获得模型权重许可。仅接入美元 token 单价，排除订阅套餐、已弃用、非文本输出模型；按厂商/原始模型 ID 保留不同托管价格，禁止模糊合并不同版本。价格仅为基础 token 费率；长上下文阶梯、工具、图片/音频、税费等另行收费项目不在计算器估算内。

评测不映射 `latest`、可变 API 别名或不同版本。未精确匹配的模型显示 No benchmark data。不会复制商业排行榜。

判定：两项来源均为明确 MIT，可在完整保留许可证、版权与来源后使用。用户已明确回复“同意按此方案接入并上线”，批准后导入。价格许可 SHA256 为 `dc2dc41c9fea2fd3c41c21c6f484844cab367800b88ff24781f980ad3a9d160a`；DeepSeek-R1 固定版本许可 SHA256 为 `1c8f573e830ca9b3ebfeb7ace1823146e22b66f99ee223840e7637c9e745e1c7`。两份完整文本已保存在 THIRD_PARTY_LICENSES/ 和 public/licenses/。

价格 API 为独立更新的公开生成文件，不声称其响应恰好对应审计 commit；每次成功快照用 payloadSha256 与 ETag 标识实际响应。后续同步时请求当前价格上游许可并校验文本哈希，发生变化即停止本次同步，保留有效快照。评测文件固定来源 commit，人工录入六个分数，排名由本六模型的分数降序得到；capturedAt 为录入时间，非评测实验时间。当前白名单价格源已弃用这些历史版本，因此快照独立展示、精确映射数为零，绝不将其分数套用到新版本或可变别名。

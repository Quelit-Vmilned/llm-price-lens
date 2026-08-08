# Upstream Reuse Plan

状态：Phase 2.5。已按 `upstream-license-audit` Skill 对当前直接依赖执行可验证审计：记录官方上游、固定 tag/commit、许可证、npm tarball/integrity 与实际使用状态。zod 当前已实际 import 并用于数据校验；Vite、TypeScript、Vitest 当前已实际用于开发、构建和测试；Fuse.js 已安装但尚未被当前源码 import。尚未复用任何外部价格数据或第三方代码片段。

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
- 计划复用内容: 作为 dependency 安装，供 Phase 3 客户端模糊搜索使用
- 判定结果: Apache-2.0，允许作为依赖安装和使用
- 当前状态: 已安装，尚未被当前源码 import

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
- 计划复用内容: 作为 devDependency 安装，用于 TypeScript 类型检查
- Decision: 允许作为构建工具依赖使用。
- Status: Verified with metadata discrepancy documented.
- 判定结果: Apache-2.0，允许作为依赖安装和使用
- 当前状态: 当前已实际使用（开发/构建工具）

说明：`typescript@7.0.2` 的 npm package metadata 仍声明 microsoft/TypeScript，但经核实，该版本对应的发布 tag 和 gitHead 实际位于微软官方 microsoft/typescript-go 仓库。两个仓库均为 Microsoft 官方仓库；本项目记录实际可验证的发布仓库，同时保留 npm 声明仓库，避免误导。本记录不推测微软内部迁移原因，也不声称两个仓库内容等价。

## 4. 传递依赖说明

除上述直接依赖外，npm 还会安装传递依赖。传递依赖的 Version、License、`resolved` 与 `integrity` 声明记录在 `package-lock.json` 中，许可证文本随 `node_modules` 保留。本阶段未对每个传递依赖单独执行 GitHub commit 级审计。

## 5. 上游数据来源

- 第一版只同步明确许可、机器可读的上游数据。
- 不使用每 30 分钟抓取厂商 HTML 定价页的方式。
- 每个数据来源需记录：来源 URL、上游更新时间、许可证状态、计划复用内容。
- 商业排行榜数据在确认再发布许可前不复制。

## 6. 复用决策日志

本阶段没有复制第三方代码片段或外部数据；只安装并使用上表 npm 依赖。真正复制第三方代码、数据或文档时，再按第 1 节流程补充上游 URL、commit SHA、许可证、检查文件和计划复用内容。

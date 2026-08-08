# Third-Party Notices

状态：Phase 3.1 Hardening。当前项目实际使用 zod 4.4.3 作为数据校验依赖；使用 Vite、TypeScript、Vitest 作为开发、构建和测试工具；Fuse.js 7.5.0 已作为 dependency 安装，并已由 `src/search.ts` import 用于客户端模糊搜索。尚未接入外部数据。

本文件记录 `llm-price-lens` 实际复用的第三方材料及其声明。每次实际复用后必须更新本文件。完整许可证文本已随仓库保留在 `THIRD_PARTY_LICENSES/`，并复制到 `public/licenses/`，由 Vite 构建复制到 `dist/licenses/` 随站点分发；固定 tag/commit 与核实依据见 `UPSTREAM_REUSE_PLAN.md`。

## 1. 直接 npm 依赖

### Vite 8.2.0

- 版权声明: `Copyright (c) 2019-present, VoidZero Inc. and Vite contributors`（来自 `node_modules/vite/LICENSE.md`）
- 上游仓库: https://github.com/vitejs/vite
- 许可证: MIT
- Version: 8.2.0
- 固定 commit: `fa79f9ab699f9a22a6f9b50f3d247be6b51f684d`
- Source: https://registry.npmjs.org/vite/-/vite-8.2.0.tgz（package-lock.json `resolved`）
- 许可证文本: `THIRD_PARTY_LICENSES/vite-MIT-LICENSE.txt`

### Vitest 4.1.10

- 版权声明: `Copyright (c) 2021-Present VoidZero Inc. and Vitest contributors`（来自 `node_modules/vitest/LICENSE.md`）
- 上游仓库: https://github.com/vitest-dev/vitest
- 许可证: MIT
- Version: 4.1.10
- 固定 commit: `db616d227b6e0cb07a94f5d1bba262ee95db7e46`
- Source: https://registry.npmjs.org/vitest/-/vitest-4.1.10.tgz（package-lock.json `resolved`）
- 许可证文本: `THIRD_PARTY_LICENSES/vitest-MIT-LICENSE.txt`

### Fuse.js 7.5.0

- 版权声明: Apache-2.0 LICENSE，其附录含 `Copyright 2017 Kirollos Risk`；package metadata author 为 Kiro Risk
- 上游仓库: https://github.com/krisk/Fuse
- 许可证: Apache-2.0
- Version: 7.5.0
- 固定 commit: `45bac9fe2e71fe8c680c861a35a8b226c4ae6d5a`
- Source: https://registry.npmjs.org/fuse.js/-/fuse.js-7.5.0.tgz（package-lock.json `resolved`）
- 许可证文本: `THIRD_PARTY_LICENSES/fuse-js-APACHE-2.0-LICENSE.txt`

### zod 4.4.3

- 版权声明: `Copyright (c) 2025 Colin McDonnell`（来自 `node_modules/zod/LICENSE`）
- 上游仓库: https://github.com/colinhacks/zod
- 许可证: MIT
- Version: 4.4.3
- 固定 commit: `1fb56a5c18c27102dbc92260a4007c7732a0ccca`
- Source: https://registry.npmjs.org/zod/-/zod-4.4.3.tgz（package-lock.json `resolved`）
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

- 尚无上游数据被复用。
- 任何数据条目必须随站点记录来源 URL、上游更新时间、验证状态和许可证状态。
- 未确认再发布许可的商业排行榜数据不得复制。

## 4. 商标与品牌

- 模型和厂商名称仅作信息性引用。
- 不复制厂商 Logo、品牌视觉或大段品牌内容。

## 5. 声明

本文件由项目维护者人工维护，不构成法律意见。许可证存在疑义时请咨询专业意见。

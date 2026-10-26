# Phase 3 Record

状态：Phase 3 MVP 历史记录。实现已随 `8a89693` 于 2026-08-08 提交并推送；下文保留当时验证和风险，当前验收见 `PHASE_4_RECORD.md`。

记录日期：2026-08-08

> 补充说明：本文件保留 Phase 3 原始历史；Phase 3.1 的后续变更见文末 `Phase 3.1 Follow-up`，更详细的验证见 `PHASE_3_1_RECORD.md`。

## 范围

- 实现纯静态前端：模型价格表格/移动卡片、Fuse.js 模糊搜索、厂商快捷筛选、价格/分数/示例成本排序、示例成本计算器、响应式布局与可访问性。
- 生产价格数据使用 schema-valid 空占位 `data/prices.generated.json`，不编造真实价格。
- 未接入真实数据来源、未实现自动同步与上游变更检查。

## 主要文件

新增：

```text
data/prices.generated.json
src/cost.ts
src/cost.test.ts
src/data.ts
src/data.test.ts
src/fixtures.ts
src/format.ts
src/search.ts
src/search.test.ts
src/sort.ts
src/sort.test.ts
```

修改：

```text
ARCHITECTURE.md
PROJECT_SCOPE.md
README.md
THIRD_PARTY_NOTICES.md
UPSTREAM_REUSE_PLAN.md
index.html
src/main.ts
src/style.css
```

## 验证记录

执行方式：本机未安装独立 npm CLI，通过 Codex 运行时 Node 与 `pnpm dlx npm@11` 调用官方 npm CLI；实际版本 `11.19.0`。

```text
npm ci                       PASS  (56 packages; package-lock unchanged)
npm run typecheck            PASS  (0 errors)
npm test                     PASS  (5 test files, 41 tests)
npm run build                PASS  (dist generated)
```

构建产物：

```text
dist/index.html                  SHA256 d7f28450d298f9737edcfdda5a7cc299602010429d808440d463144502d5aaf0
dist/assets/index-CTTKc9DA.css   SHA256 39be20c0eaaff9d7e035754b0c914d99b152d2421832ed54c0d3ba3214292bf8
dist/assets/index-CLqS_vUs.js    SHA256 e2d11a4660bcb1ecb612b3f35a087ceca30d36b9e762c94db0fab3fec8e5f7d0
```

Pages 子路径检查：`dist/index.html` 中的脚本与样式使用 `./assets/...` 相对路径。

秘密与个人路径检查：源码、文档、工作流和 `dist` 中未发现 token、密钥或本地缓存路径。

## 剩余风险

- 生产数据集为空，页面展示空状态；真实价格数据接入后，表格、搜索、排序和成本计算器才能展示实际内容。
- 当前会话没有可用的浏览器控制工具，未做真实桌面/移动视口截图验证；布局与交互由 CSS、构建产物和 41 项逻辑测试覆盖。
- `npm audit` 仍报告 1 个 high 级传递依赖问题：`nanoid@3.3.16`（经 `vite -> postcss` 引入，dev 依赖，未进入 `dist`）。本阶段未执行 `npm audit fix`。
- 未自行 commit/push；remote 处理已按用户要求停止。

## Phase 3.1 Follow-up

Phase 3.1 已引入以下发布加固：

- Sample dataset：`data/prices.sample.json`，页面加载 schema-valid 示例数据。
- License distribution：许可证文本经 `public/licenses/` 在构建时复制到 `dist/licenses/`。
- Error state：`data.ts` 使用 `safeParse`，失败时前端渲染明确错误状态。

Phase 3.1.1 Final Cleanup 补充：

- `calculateCost` 对非有限计算结果返回 `null`，避免输出 `Infinity`。
- `formatDate` 统一使用 UTC ISO 日期处理，并补充带时区输入测试。

以上内容保留本文件的 Phase 3 原始记录，不删除历史。

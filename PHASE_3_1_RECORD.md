# Phase 3.1 Record

状态：Phase 3.1 Hardening 已实现，尚未 commit/push。

记录日期：2026-08-08

## 范围

- 第三方许可证通过 `public/licenses/` 复制到 `dist/licenses/`。
- 页面加载 schema-valid 示例数据 `data/prices.sample.json`。
- 成本输入非法值显示 `Unknown`，不转成 0。
- `data.ts` 使用 `safeParse`，失败时渲染明确错误状态。
- `Open models` 明确为厂商筛选，不再混用标签匹配。
- 筛选按钮增加 `aria-pressed`。

## 主要文件

新增：

```text
data/prices.sample.json
public/licenses/fuse-js-APACHE-2.0-LICENSE.txt
public/licenses/typescript-APACHE-2.0-LICENSE.txt
public/licenses/typescript-NOTICE.txt
public/licenses/vite-MIT-LICENSE.txt
public/licenses/vitest-MIT-LICENSE.txt
public/licenses/zod-MIT-LICENSE.txt
src/filter.test.ts
src/filter.ts
src/format.test.ts
src/token.test.ts
src/token.ts
```

修改：

```text
ARCHITECTURE.md
PROJECT_SCOPE.md
README.md
THIRD_PARTY_NOTICES.md
UPSTREAM_REUSE_PLAN.md
index.html
src/cost.ts
src/cost.test.ts
src/data.ts
src/data.test.ts
src/main.ts
```

## 验证记录

执行方式：本机未安装独立 npm CLI，通过 Codex 运行时 Node 与 `pnpm dlx npm@11` 调用官方 npm CLI；实际版本 `11.19.0`。

```text
npm ci                       PASS  (56 packages; package-lock unchanged)
npm run typecheck            PASS  (0 errors)
npm test                     PASS  (8 test files, 55 tests)
npm run build                PASS  (dist generated)
```

构建产物：

```text
dist/index.html                  SHA256 88150c5b15f83398ac4a336c86f2dfc5c4b3d9e9fcb3cf3813363d0775c6ff01
dist/assets/index-CTTKc9DA.css   SHA256 39be20c0eaaff9d7e035754b0c914d99b152d2421832ed54c0d3ba3214292bf8
dist/assets/index-CSaJ0T6y.js    SHA256 1e2b039508593aafe40d4c6ddfe5acc2fb995a50b06b005ebceebdfb2dc42db3
```

`dist/licenses/` 包含 6 个许可证/NOTICE 文件，均与 `THIRD_PARTY_LICENSES/` 原文件哈希一致。

Pages 子路径检查：`dist/index.html` 使用 `./assets/...` 相对路径。

秘密与个人路径检查：`dist` 中未发现 token、密钥、个人路径或本地缓存路径。

## 剩余风险

- 页面展示的是明确标注“示例数据，非生产价格”的示例数据集；真实价格数据接入仍未实现。
- 当前会话没有可用的浏览器控制工具，未做真实桌面/移动视口截图验证；布局与交互由构建产物和 54 项逻辑测试覆盖。
- `npm audit` 仍报告 1 个 high 级 dev 传递依赖：`nanoid@3.3.16`（经 `vite -> postcss` 引入，未进入 `dist`）。本阶段未执行 `npm audit fix`。
- 未自行 commit/push；remote 处理已按用户要求停止。

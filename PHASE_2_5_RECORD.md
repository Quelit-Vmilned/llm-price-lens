# Phase 2.5 Record

状态：已完成并记录，作为 Phase 3 起点基线。

记录日期：2026-08-08

## 基线提交

- Commit: `d03da80`
- 提交信息: `chore: establish llm-price-lens Phase 2.5 baseline`
- 文件数量: 27
- 新增行数: 3058
- 未包含: `node_modules/`、`dist/` 等已忽略内容

## 基线文件清单

```text
.codex/skills/fuzzy-model-search/SKILL.md
.codex/skills/github-pages-actions/SKILL.md
.codex/skills/pricing-data-pipeline/SKILL.md
.codex/skills/project-scope-guard/SKILL.md
.codex/skills/release-quality-gate/SKILL.md
.codex/skills/responsive-static-web/SKILL.md
.codex/skills/upstream-license-audit/SKILL.md
.github/workflows/ci.yml
.github/workflows/deploy.yml
.gitignore
ARCHITECTURE.md
PROJECT_SCOPE.md
README.md
THIRD_PARTY_NOTICES.md
UPSTREAM_REUSE_PLAN.md
data/benchmark-snapshot.json
index.html
package-lock.json
package.json
src/main.ts
src/schema.test.ts
src/schema.ts
src/style.css
src/types.ts
src/vite-env.d.ts
tsconfig.json
vite.config.ts
```

## 关键哈希

- 基线 commit: `d03da80`
- zod 4.4.3 npm integrity: `sha512-ytENFjIJFl2UwYglde2jchW2Hwm4GJFLDiSXWdTrJQBIN9Fcyp7n4DhxJEiWNAJMV1/BqWfW/kkg71UDcHJyTQ==`
- Fuse.js 7.5.0 npm integrity: `sha512-sQtrEfA+ez/3G0cCZecF70oqpCRttCexYUG4mUrtWL49ULUzUyxokt5kyqwtKzj1270RaKih+hcP3qLcumccow==`
- TypeScript 7.0.2 npm integrity: `sha512-8FYau96o3NKOhbjKi/qNvG/W5jhzxkbdm5sj9AbZ/5T5sWqn3hJgLfGx27sRKZWTvyzCP8dLRBTf5tBTSRVUNA==`
- Vite 8.2.0 npm integrity: `sha512-pn+CFpM0lwDeKwmOq1ZaBK/9sjorZcgqxki6MbY/jPEVd9vichIlmlD4HmQ5wdP5EgqQCFRaACBxMC7uEGc6lQ==`
- Vitest 4.1.10 npm integrity: `sha512-R9jUTe5S4Qb0HCd4TNqpC7oGcrMssMRGXLW80ubjWsW9VH5GF8y1Y0SFLY9AbqSk6nt0PnOx4H4WNJYZ13GUPw==`

## 验证记录

Phase 2.5 收尾执行以下命令：

```bash
npm ci
npm run typecheck
npm test
npm run build
```

执行方式：本机未安装独立 npm CLI，阶段记录通过 Codex 运行时提供的 Node 与 `pnpm dlx npm@11` 调用官方 npm CLI；`pnpm dlx npm@11 --version` 确认为 `11.19.0`。项目依赖与锁文件未被改动。

结果：

```text
npm ci                       PASS  (56 packages; package-lock unchanged)
npm run typecheck            PASS  (0 errors)
npm test                     PASS  (1 test file, 21 tests)
npm run build                PASS  (dist generated)
```

构建产物：

```text
dist/index.html                  SHA256 7846f716d9918a8ad68c2a9a57199aefd560adf577d4572be2ae808e632623d8
dist/assets/index-D6zFNmX1.css   SHA256 56206ac87f09145fa1adaa0126b337a5a4825bc6b9cdde03ef49199cbfa45243
dist/assets/index-GstfLcmu.js    SHA256 418c206484b89b68ef5f067277831e583fc9193a62aadf4de269acaaeb12a85f
```

Pages 子路径检查：`dist/index.html` 中的脚本与样式使用 `./assets/...` 相对路径，不依赖绝对根路径。

秘密与个人路径检查：仓库源码、文档、工作流和 `dist` 中未发现 `/Users/`、用户名、token、密钥或本地缓存路径。

## 剩余风险

- `fuse.js@7.5.0` 已安装但尚未被当前源码 import；进入 Phase 3 搜索实现前应保持依赖声明与实际使用同步。
- `typescript@7.0.2` 存在 npm 元数据声明 `microsoft/TypeScript` 与实际发布来源 `microsoft/typescript-go` 的双重来源差异；已在 `UPSTREAM_REUSE_PLAN.md` 中保留完整说明。
- `sourceUrl` 采用 Zod URL 格式校验，不验证可达性、来源所有权或许可状态。
- Benchmark 快照当前只有占位数据；真实来源须在确认再发布许可后接入。
- 尚未 push，未观察 GitHub Actions CI 与 Pages 部署真实运行结果。
- `npm audit` 报告 1 个 high 级传递依赖问题：`nanoid@3.3.16`（经 `vite -> postcss` 引入，属开发依赖；修复版本 `<3.3.17` 受影响）。该包未进入当前 `dist` 产物；按“不新增依赖、不扩大 MVP”的边界，本阶段未自动执行 `npm audit fix`。

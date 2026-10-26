# v0.5.1 — 部署内容校验补丁

日期：2026-10-26（Asia/Shanghai）。用户在完成项目调试后明确要求将修复上线。初次 Phase 5 的真实数据发布记录保留在 [PHASE_5_RECORD.md](PHASE_5_RECORD.md)，此次调试证据保留在 [DEBUG_AUDIT_2026-10-26.md](DEBUG_AUDIT_2026-10-26.md)。

当 CDN 以 HTTP 200 返回错误页或不同版本的资源时，旧部署脚本可能误报成功。此补丁在 `release.json` 中记录最终 HTML 和全部构建 JS/CSS 的 SHA256，并在产物检查及线上验证中逐一比较；错误、陈旧或缺失的资源会使验证失败。完整源提交、数据及质量报告哈希的既有验证继续保留。

新增 8 项回归测试，覆盖完整匹配的子路径发布、延迟加载资源、旧 HTML、HTTP 200 错误资源、清单遗漏、非法资源路径和错误源提交。总计 11 个测试文件、106 项测试。依赖和锁定版本未更换，原有 190 条模型记录、价格生成时间及质量报告保持不变。

发布前再次执行 `npm ci`、`npm run typecheck`、`npm test`、`npm run build`、`npm run verify:build`、`npm audit --audit-level=low` 和 `git diff --check`，均通过；测试为 11 个文件 / 106 项，依赖审计为 0 vulnerabilities。GitHub CI 和 Pages 发布工作流再次执行安装、类型检查、测试、构建、产物验证和依赖审计。构建产物检查包含数据 Schema、页面/资源/数据/报告哈希、相对资源路径以及 8 份许可证/NOTICE 的分发一致性。

Pages 发布仍受 main 源提交检查和既有环境分支策略限制。部署完成后运行 `verify-deployment.mjs`，比较线上完整源 SHA、应用版本及内容哈希。当前实际发布版本以公开 [release.json](https://quelit-vmilned.github.io/llm-price-lens/release.json) 和 [发布工作流](https://github.com/Quelit-Vmilned/llm-price-lens/actions/workflows/deploy.yml) 的成功记录为准；本文件不将排队或构建中的版本称为已上线。

价格与评测覆盖边界继承此前审计：7 个模型输入/输出价格缺失，缓存价格可能缺失；缺失值保持 Unknown，真实零保持零。Benchmark 为独立的历史六模型快照，未映射当前端点。此次为部署验证修复，未改变这些数据限制。

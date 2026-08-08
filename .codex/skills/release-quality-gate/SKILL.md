---
name: release-quality-gate
description: 定义 llm-price-lens 发布前质量门禁：npm ci、typecheck、test、build 全绿，数据通过 Schema 校验，null 价格不当作零，排序、成本、搜索边界测试齐全，第三方声明完整，Actions 使用 GitHub-hosted runner，无 secret 和本地缓存，产物兼容 Pages 子路径。Use before any release or deployment.
---

# Release Quality Gate

## 1. 必跑命令

发布前至少运行：

```bash
npm ci
npm run typecheck
npm test
npm run build
```

## 2. 必查清单

- 所有数据通过 JSON Schema 或 Zod 校验。
- 没有把 `null` 价格当作零。
- 排序测试覆盖：缺失值、相同值、异常值、名称次级排序。
- 成本计算测试覆盖：边界值、任一价格缺失时结果为 `null`、不会按零计算。
- 搜索测试覆盖：中文、英文、别名、拼写错误、空查询、无结果。
- 第三方声明完整：`UPSTREAM_REUSE_PLAN.md` 和 `THIRD_PARTY_NOTICES.md` 与实际复用一致。
- README 不使用“实时”“绝对准确”“世界最全面”等无法证明的描述。
- GitHub Actions 使用 GitHub-hosted runner。
- 仓库中不存在 secret、token、个人路径和本地缓存。
- 构建产物在 GitHub Pages 子路径下可正常工作。

## 3. 失败处理

- 测试失败时不得宣称任务完成。
- 不得删除测试、跳过测试或降低类型安全来让测试通过。
- 门禁未过，不部署、不发布。

## 4. 记录

- 发布记录包含命令结果、构建产物校验和风险说明。

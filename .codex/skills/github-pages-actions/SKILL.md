---
name: github-pages-actions
description: 定义 llm-price-lens 的 GitHub Pages 与 Actions 规范：GitHub-hosted runner、最小权限、CI 与部署分离、非整点定时、workflow_dispatch、上游同步失败不回退生产数据、页面显示最后一次成功同步时间。Use when creating or changing workflows or deployment.
---

# GitHub Pages Actions

## 1. Runner

- 只使用 GitHub-hosted `ubuntu-latest`。
- 禁止 self-hosted runner。
- 禁止 Node 后端服务器或常驻服务。

## 2. 权限与安全

- 使用最小 GitHub Actions 权限（`permissions:` 显式声明）。
- 不在仓库写入 API Key、token、个人路径或本地缓存。
- 没有 secret 时不得伪造外部 API 接入；相关步骤应优雅跳过并输出原因。
- 不把 secret 写入日志。

## 3. 工作流结构

- CI 与部署分离，或使用边界清晰、可人工审查的 job。
- 提供 `workflow_dispatch`。
- 定时任务使用非整点时间，例如每小时第 7 和 37 分钟。
- 只有校验、测试和构建全部成功后，才能部署。
- 上游同步失败不得覆盖有效生产数据；失败时保留最后成功数据并停止部署。

## 4. 时间与状态

- 页面展示最后一次成功同步时间，而不是工作流计划时间。
- `generatedAt`、`verifiedAt` 等时间字段来自数据生成过程，不来自 cron 假设。

## 5. 构建产物

- 构建产物必须在 GitHub Pages 子路径下正常工作（配置正确的 `base`，不使用绝对根路径假设）。

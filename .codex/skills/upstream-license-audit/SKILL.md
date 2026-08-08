---
name: upstream-license-audit
description: 在复用任何第三方代码、数据、文档或品牌内容前执行许可证审计，记录上游 URL、commit SHA、许可证和计划复用内容；许可证不明确或为 GPL/AGPL/SSPL/自定义许可证时暂停并报告。Use when copying, adapting, or installing third-party material.
---

# Upstream License Audit

本 Skill 管理 `llm-price-lens` 对第三方代码、数据和文档的复用。自动检查不等同于法律意见。

## 1. 复用前必做

1. 记录上游仓库 URL。
2. 固定 commit SHA。
3. 检查仓库根目录和目标子目录中的 `LICENSE`、`COPYING`、`NOTICE`、`README`。
4. 判断代码、数据、文档和商标是否使用不同许可证。
5. 在 `UPSTREAM_REUSE_PLAN.md` 中记录检查结果和计划复用内容。
6. 明确选择：不使用 / 学习后自行重写 / 复制小段并保留声明 / 作为依赖安装。
7. 用户审查计划后，才执行复制。
8. 实际复用后更新 `THIRD_PARTY_NOTICES.md`。
9. 为复用代码添加测试。
10. 最终报告中列出实际复用文件和修改。

## 2. 许可证处理规则

- 无许可证仓库：只允许学习思想，不允许直接复制代码。
- GPL、AGPL、SSPL 或自定义许可证：暂停并报告，不得自行判断兼容性。
- MIT、BSD、ISC、Apache-2.0：仍必须保留版权声明、许可证文本和必要 NOTICE。
- 许可证缺失、冲突或不明确：停止复制并报告，不要猜测。
- 代码、数据、文档、商标分开判断；代码是 MIT 不代表其中数据或模型名称可任意复用。

## 3. 内容边界

- 不允许复制完整网站、品牌视觉、Logo 或大段 CSS。
- 优先自行重写简单算法，而不是复制。
- 本项目 Skill 与文档由本项目自行编写，不安装陌生仓库脚本。

## 4. 记录要求

每次评估至少记录：上游 URL、commit SHA、检查文件、许可证、计划复用内容、判定结果、状态。每次复用前生成或更新 `UPSTREAM_REUSE_PLAN.md`，每次实际复用后更新 `THIRD_PARTY_NOTICES.md`。

## 5. 声明

本文件不构成法律意见；许可证存在疑义时应请用户咨询专业意见。

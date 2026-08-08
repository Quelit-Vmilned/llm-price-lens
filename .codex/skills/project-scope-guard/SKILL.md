---
name: project-scope-guard
description: 维护 llm-price-lens 的 MVP 范围，禁止后端、数据库、账户、AI API、向量数据库和桌面壳；每阶段只修改当前任务所需文件，遇到歧义选择最简单、依赖最少、可测试的方案。Use when planning, reviewing, or implementing any phase or feature.
---

# Project Scope Guard

本项目 `llm-price-lens` 是纯静态 Web 应用。任何阶段的设计和实现都必须先通过本 Skill 的范围检查。

## 1. 固定范围

- 维护 MVP：模型价格查询、排序、模糊搜索、成本计算器、响应式与可访问性、GitHub Pages 部署、约 30 分钟上游变更检查。
- 固定技术栈：Vite、TypeScript strict mode、原生 HTML、原生 CSS、Fuse.js、Vitest、JSON Schema 或 Zod、GitHub Pages、GitHub-hosted GitHub Actions runner。
- 技术栈替换或新增依赖必须先说明必要性，并获得用户书面同意。

## 2. 禁止事项

- 禁止加入后端服务、数据库、用户登录/账户、云端 AI API、向量数据库、服务端搜索、self-hosted runner。
- 禁止引入 React、Vue、Svelte、Next.js、Nuxt、Electron、Tauri 或其他替代框架。
- 禁止复制其他项目的品牌视觉、Logo 或大段 CSS。
- 禁止把“未来可能需要”当作现在增加抽象层的理由。

## 3. 阶段边界

- 每阶段只修改当前任务所需文件。
- 与当前任务无关的重构一律禁止，即使它看起来更干净。
- 遇到需求歧义时，选择最简单、依赖最少、最容易测试的方案。
- 一个抽象只服务一个调用点且没有测试需求时，先不要抽象。

## 4. 修改前检查

1. 读取仓库状态。
2. 运行 `git status --short`。
3. 确认不会覆盖或删除无法确认来源的用户文件。
4. 输出本阶段计划和预计修改文件。
5. 实施修改。
6. 运行该阶段可行的检查（类型检查、测试、构建）。
7. 报告结果和风险；不自行提交或推送。

## 5. 触发暂停

- 发现需求冲突、许可证不明、数据结构不兼容或安全风险时，停止相关改动并报告，不自行决定绕过。
- 当前目录不是预期项目目录，或已有文件与计划冲突时，停止写入并报告。

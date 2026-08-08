---
name: responsive-static-web
description: 定义 llm-price-lens 的前端实现规范：原生 HTML/CSS/TypeScript、语义化 HTML、桌面表格与窄屏卡片或可访问横向滚动、键盘导航、可见焦点、prefers-color-scheme。Use when building or changing UI.
---

# Responsive Static Web

## 1. 技术约束

- 使用原生 HTML、原生 CSS、TypeScript，不引入 UI 框架。
- 优先语义化 HTML：`table`、`button`、`label`、`nav`、`main`、`dialog` 等按语义使用。
- 不指定只支持某一种浏览器；目标浏览器为当前稳定版 Safari、Chrome、Edge 和 Firefox。

## 2. 布局与响应式

- 桌面端显示表格。
- 窄屏可转为卡片布局或提供可访问的横向滚动。
- 卡片不嵌套卡片；页面分区使用全宽 band 或无框布局。
- 固定格式控件（按钮、计数、输入框、排序控件）应定义稳定尺寸，内容变化不得导致布局跳动。

## 3. 可访问性

- 全部交互元素可用键盘操作，并显示可见焦点。
- 表单控件有正确 `label`，图标按钮有可访问名称和 tooltip。
- 颜色对比满足可读性，不使用仅靠颜色传达的状态。
- 支持 `prefers-color-scheme` 深色模式。

## 4. 性能与视觉

- 避免大型动画和不必要依赖。
- 不复制其他项目的品牌视觉、Logo 或大段 CSS。
- 文字必须在其容器内正确换行，不得遮挡或溢出相邻内容。

## 5. 验证

- 桌面和移动视口检查布局、焦点顺序和深色模式。
- 所有交互状态（排序、搜索、计算器、无结果）都有可测试行为。

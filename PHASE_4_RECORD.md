# Phase 4 — 前端发布与验收

版本：`0.4.0`。记录日期：2026-10-26（Asia/Shanghai）。

状态：实现与验证进行中；尚未完成本阶段线上确认。

## 授权与边界

用户要求控制电脑、调试并解决此前问题、完成前端上线确认、整理研发 Phase，并将此版本命名为 Phase 4。此次授权包含本仓库的修复、必要依赖更新、提交与发布。真实价格、真实 Benchmark 数据和自动同步不在本版接入范围；页面继续使用 5 条示例数据，并明确标注其性质。

## 发布前发现

- 本地和远程 main 为 `8a8969356b994982616c9135048a21b7b453d27a`，但线上仍显示 `Project initialized successfully.`，加载 Phase 2.5 的 `index-GstfLcmu.js`、`index-D6zFNmX1.css`。
- GitHub 最新代码的 CI/部署任务成功。部署记录显示 `8a89693` 于 2026-08-08 17:51:44 +08:00 成功，之后变为 inactive；旧提交 `ea6b62c` 的发布于 17:52 完成。结合线上资产可判断旧版后部署覆盖新版；不把工作流成功当作线上当前版本正确的证据。
- 2026-10-26 npm audit：6 个受影响包（4 high、2 moderate），涉及 vite、vitest、@vitest/mocker、zod、nanoid、source-map-js。
- 旧阶段记录的“尚未 commit/push”已过期；Phase 3.1 风险段的 54 项测试应为 55 项。
- 过去未做真实浏览器验收；示例提示仅在页脚，Benchmark rank 未显示，模型 ID 重复显示，token 数字允许超出安全整数范围。

## 修改内容

- 保持 Vite/TypeScript/原生前端；升级已有依赖并同步审计与完整分发许可证。
- 顶部持续展示示例数据提示，保留快照原日期；加入 Phase 4、v0.4.0、构建提交和 release.json。
- 补齐 Benchmark rank、消除重复模型 ID、强化整数边界与输入错误提示、数据错误时禁用计算器。
- 加入跳转主内容链接和可聚焦横向滚动区；窄屏保留表头语义，确保 hidden 状态不被响应式 CSS 覆盖。
- 部署使用最小 job 权限；取消过期并发任务，并在上传前和环境审批后检查 main 的最新 SHA。保留环境保护要求。
- 发布后验证线上 release.json、页面、脚本、样式与许可证索引，传播超时即失败。
- README、PROJECT_SCOPE、ARCHITECTURE、PHASES 和 Phase 3/3.1 历史入口同步整理。

## 验证与上线证据

本地执行方式：Node 24.22.1，官方 npm CLI 11.19.0（通过现有 pnpm 运行）。项目没有新增直接依赖。

| 检查 | 结果 |
| --- | --- |
| npm ci | PASS，49 packages；optional fsevents 安装脚本未获 npm 11 的脚本许可，未影响构建/测试 |
| npm run typecheck | PASS |
| npm test | PASS，8 files / 62 tests |
| npm run build | PASS |
| npm run verify:build | PASS，sample-only、相对资产路径、6 份完整许可证/NOTICE 哈希一致 |
| npm audit --audit-level=low | PASS，0 vulnerabilities |
| git diff --check | PASS |

浏览器使用实际生产构建，并在 `/llm-price-lens/` 子路径通过本地静态 HTTP 服务验收：

- 十种排序均逐项核对模型顺序，缺失值始终排最后。
- 中文关键词、英文/近似拼写、空查询、无结果与全部 6 个厂商筛选通过。
- 默认成本 $6.00；零工作量 $0.00；零输入价格 $0.50；缺失价格 Unknown；空值、负数、小数、超安全整数值均显示 Unknown 与错误提示；极小非零成本显示 `<$0.0001`。
- 320、390、760、820、1024、1440 CSS px 均无整页横向溢出；窄屏卡片，平板表格局部滚动。
- Tab 首先聚焦可见跳转链接，Enter 聚焦主内容，下一焦点为搜索框；横向表格可用方向键滚动。
- 移动端无结果时表格真正隐藏；深色模式可读；本地生产页面没有 console error/warning。
- [桌面截图](docs/phase4/local-desktop.png)、[移动截图](docs/phase4/local-mobile.png)、[移动深色截图](docs/phase4/local-mobile-dark.png)。

当前本地构建（sourceCommit=local）的 SHA256：

```text
1db451a1a43c9eded29a9bac5455cd4827a99be3b7f85ebacbe1b48f763eb5d0  dist/index.html
864f28aa2795ccf24e5781eb2b5ab193013ca2c97786f735b1da70e68a900323  dist/release.json
155f3d52fcf9fdeefe3d0369079516a343df42a761d8adcde16cec4625afb6f0  dist/assets/index-D0VKjGS0.js
8323c0f038afeff5ece5580ae478e97fa891444a949f6126f48f74b7896e3aca  dist/assets/index-Dnlbjgn_.css
```

GitHub 的构建会注入实际完整源 SHA，因此 JS、HTML 和 release.json 的哈希会随发布提交变化。上线提交、Actions 和远程文件校验结果将在实际发布后补充；此时仍不标记发布完成。

## 数据状态

- 前端消费 `data/prices.sample.json`，5 条 sample 模型，全部 needs-review。
- `data/prices.generated.json` 与 `data/benchmark-snapshot.json` 的 models 均为空。
- 不导入价格或排行榜，不发起真实价格请求，不伪造同步时间。

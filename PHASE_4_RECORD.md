# Phase 4 — 前端发布与验收

版本：`0.4.0`。记录日期：2026-10-26（Asia/Shanghai）。

状态：已上线并通过验收。Phase 4 / v0.4.0，保留示例数据，无真实价格或真实 Benchmark 接入。

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

GitHub 构建会注入实际完整源 SHA，因此 JS、HTML 和 release.json 的哈希会随发布提交变化。上述哈希仅用于本地验证，线上证据如下。

## 线上验收（2026-10-26）

- [实现 PR #1](https://github.com/Quelit-Vmilned/llm-price-lens/pull/1)，候选源提交 `4deb671a5ef0e8ba821658beaecfa792675af7ee`。
- PR CI：[40276084428](https://github.com/Quelit-Vmilned/llm-price-lens/actions/runs/40276084428)，SUCCESS。
- 首次上线 main 提交：`1b65cf3e295a18c42490c4614407648726e58739`；2026-10-26 13:47:43 +08:00 合并。
- main CI：[40276157723](https://github.com/Quelit-Vmilned/llm-price-lens/actions/runs/40276157723)，SUCCESS。
- Pages 发布：[40276157735](https://github.com/Quelit-Vmilned/llm-price-lens/actions/runs/40276157735)，SUCCESS；13:48:31 +08:00 的 `Confirm the published version` 步骤通过。两个 main 版本保护检查均通过，未更改环境审批配置。
- 本机再次运行 `GITHUB_SHA=1b65cf3e295a18c42490c4614407648726e58739 node scripts/verify-deployment.mjs`：PASS。
- 13:50:40 +08:00，将公开站点 HTML、release.json、JS、CSS、许可证索引及全部 6 个许可证/NOTICE 与 GitHub Pages 实际构建 artifact 逐个比对，共 11 个文件均 HTTP 200 且 SHA256 相同。完整结果：[first-deployment.json](docs/phase4/first-deployment.json)。
- 公开网站实测搜索、厂商筛选、价格排序、缺失价格、异常输入和 390 px 移动布局通过，console error/warning 均为 0。
- 本机 Safari 加载公开网站，显示完整 Phase 4 表格和 $6.00 默认示例成本；DeepSeek 空结果与 All 恢复均正常。
- [公开网站桌面截图](docs/phase4/first-live-desktop.png)、[移动截图](docs/phase4/first-live-mobile.png)、[Safari 截图](docs/phase4/first-live-safari.png)。截图和测试范围来自实际 in-app 浏览器与本机 Safari；未单独执行 Edge/Firefox。

此处保留首次成功上线的完整证据。补录研发记录的后续提交会重新运行同一发布门禁；当前线上完整源 SHA 以 [release.json](https://quelit-vmilned.github.io/llm-price-lens/release.json) 为准，本版以 `phase4` Git tag 归档。

## 问题关闭与工具

| 原问题 | Phase 4 结果 |
| --- | --- |
| 线上停留初始化页，旧部署覆盖新版 | 新版已实际生效；过期源检查、并发取消与线上源 SHA 验证已加入 |
| 依赖告警 | 6 个受影响包的告警降为 0；锁文件、固定来源与分发许可证已同步 |
| 浏览器验收缺失 | 本地生产子路径与公开站点均完成实际交互及截图验收 |
| 未知价格/非法输入、精度与极小成本显示 | Unknown 与 0 保持区分；超安全整数拒绝；极小正数不显示免费 |
| Benchmark 排名、重复 ID、窄屏与键盘问题 | 已修复并验证 |
| Phase 状态过期 | 建立 Phase 1–4 索引，历史记录保留并校正推送与测试数量 |
| 发布认证不可用 | 用户完成官方 GitHub CLI 浏览器授权，认证存于系统 keyring；仓库与构建产物无凭据 |

发布工具 GitHub CLI 2.103.2 通过官方 Homebrew formula 安装，上游 https://github.com/cli/cli，固定 v2.103.2 commit `4f2cfe92e3499f8581bf39db77e0a1431fa7b55c`，已核实 LICENSE 为 MIT。它只用于发布操作，没有加入站点依赖或构建分发内容。

## 数据状态

- 前端消费 `data/prices.sample.json`，5 条 sample 模型，全部 needs-review。
- `data/prices.generated.json` 与 `data/benchmark-snapshot.json` 的 models 均为空。
- 不导入价格或排行榜，不发起真实价格请求，不伪造同步时间。

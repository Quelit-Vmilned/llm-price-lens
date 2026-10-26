# Phase 5 — 真实数据、更新流水线与 Pages 发布

版本：`0.5.0`。日期：2026-10-26（Asia/Shanghai）。

用户要求开始 Phase 5、接入实际数据、验证更新、完成既有设计并上线 GitHub Pages。用户进一步明确批准 models.dev 价格和 DeepSeek-R1 历史评测来源方案。后台处理按原设计采用 GitHub Actions，前端消费生成的静态 JSON；不新增运行时服务、API 密钥、付费模型调用或依赖。

## 交付

- 经 MIT 许可审计的 models.dev 公开 API；固定许可审计 commit、校验当前许可 SHA256，实际响应保留独立 SHA256/ETag。完整许可随仓库和站点分发。
- fetch → normalize → merge → validate → emit。白名单覆盖 13 家提供商，当前生成 190 条文本模型记录。排除 115 条已弃用、非文本、图片、语音、实时或其他不适用计费模型，原因逐条写入质量报告。
- 稳定 provider/endpoint ID，不按相似名称合并不同版本或托管价格。manual override 具有来源和理由，优先于导入；仅搜索标签不改变价格来源或变为 verified。
- 缺失价格保持 null/Unknown，真实零保持零；上游上下文 0 转为未知。导入不代表厂商独立验证，记录状态为 Imported 或 Needs review。
- `quality-report.json` 公开来源、数量、缺失字段、排除、去重、覆盖与未匹配评测。`generatedAt` 为实际成功生成时间；无变化不刷新时间。
- `sync.yml` 在每小时第 7/37 分钟检查，支持手动检查和明确的 force 刷新。仅成功变更通过全部门禁后提交两个生成文件并 dispatch 既有受保护发布；并发 main 更新使推送失败，禁止覆盖新代码。
- HTTP 304/无变化保留文件原字节；本地 override/映射/规范化变化时重新处理。网络、超时、HTTP 错误、许可变更、无效 JSON/Schema、合并冲突、全部价格消失、超过半数记录或已知价格消失均阻止发布。暂存后替换，写盘异常还原两个文件。
- 保留 Phase 4 过期部署保护；发布身份升级为 Phase 5/v0.5.0，追加数据/报告 SHA256、记录数和成功生成时间。线上验证同时核对源提交与数据/报告内容。

## 设计需求核对

| 设计项 | 实现与验收 |
| --- | --- |
| 1 模型、厂商、ID | 当前 190 条，保留提供商原名称与 API ID |
| 2 输入价 | USD/1M，真实源导入，升降排序通过 |
| 3 输出价 | USD/1M，真实源导入，升降排序通过 |
| 4 缓存价 | cache_read；缺失显示 Unknown |
| 5 上下文 | 正整数或 null，上游未知 0 不伪装为有效窗口 |
| 6 来源 | 每行来源链接，公开响应 hash、许可与质量报告 |
| 7 验证状态 | Imported/Needs review；人工 override 支持有日期的 Verified |
| 8 更新时间 | 明示最后成功同步与来源的模型更新时间，二者不混同 |
| 9 Benchmark | 固定 MIT 来源六模型历史分数、快照排名、来源、录入日期与精确映射；当前端点不匹配则 No benchmark data |
| 10 输入排序 | 升降均通过，缺失末尾 |
| 11 输出排序 | 升降均通过，缺失末尾 |
| 12 工作负载排序 | 升降均通过，按输入/输出 token 变动重算 |
| 13 Benchmark 排序 | 升降逻辑与缺失末尾测试通过；当前价格行均未匹配，不编造分数 |
| 14 模糊搜索 | 中文、英文、别名、描述、sonet 拼写近似、空查询和无结果通过 |
| 15 成本计算 | DeepSeek Flash 默认工作量 $0.27；未知、零、非法输入与安全整数边界通过 |
| 16 响应式与可访问性 | 六种屏宽、窄屏卡片、深色模式、键盘焦点和跳转通过 |
| 17 GitHub Pages | 继承 main 版本保护；线上证据见下方 |
| 18 自动变更检查 | 7/37 分钟 cron、手动检查和 force 刷新；实际 Actions 结果见下方 |

## 本地验证

使用 Node 24.22.1 和官方 npm CLI 11.19.0（通过环境现有 pnpm 运行）。工作流使用 GitHub-hosted ubuntu-latest 与 Node 22；同步脚本需要 Node 22.18+ 的内置类型擦除支持。

- npm ci、typecheck、test、build、verify:build、npm audit、git diff --check：PASS。10 个测试文件 / 98 项测试；0 vulnerabilities。构建验证 190 条真实来源记录、数据/报告 SHA256 一致及 8 份完整许可证/NOTICE。曾遇 npm 审计端点瞬时网络中断，重试成功，不将网络错误算作审计通过。
- 流水线测试包括真实变价后的内容/时间变更、200 无变化、条件 304、本地 override 后重取、force 刷新、HTTP 503/429、网络/超时、空响应、坏 JSON、负价格、缺提供商、许可变化、大规模丢失及写盘第二次替换失败时回滚。
- 浏览器验收数据：[browser-checks.json](docs/phase5/browser-checks.json)。真实数据下十种排序、全部快捷厂商筛选、中文关键词与拼写近似通过。零/缺失成本和空、负、小数、超安全整数输入均符合设计。
- 320、390、760、820、1024、1440 CSS px 均无整页横向溢出；320–760 为卡片，较宽为表格。深色模式可读，控制台无 error/warn。
- Tab 首先聚焦 Skip to main content，Enter 聚焦 main-content，下一 Tab 聚焦 model-search。
- [桌面截图](docs/phase5/local-desktop.png)、[移动深色截图](docs/phase5/local-mobile-dark.png)。
- 实际网络检查：[local-update-check.json](docs/phase5/local-update-check.json)。源响应 SHA256 变化后成功生成新快照，随后连续两次 HTTP 304 无变化检查保持两个文件 SHA256 完全不变；记录内保留每次前后哈希。另有实际连接中断被正常报错，未发布半成品。

## 评测与价格覆盖边界

Benchmark 是 DeepSeek 固定报告自述的 AIME 2024 Pass@1 (%)，不是当前完整排行榜。排名仅为这六个历史版本按分数的排序。capturedAt 是人工录入日期，不是实验日期。当前白名单来源已经弃用这些端点，匹配数为 0，因此历史表独立可见、所有当前价格行显示 No benchmark data；不会把 R1 分数转给 R1-0528、V4、latest 或其他新版本。

价格来自社区维护源，不保证与厂商报价即时一致；模型更新时间不代表最近价格修改时间。估算限基础文本 token，未实现长上下文阶梯、工具、音频、图片、税费等额外费用。定时任务可能被 GitHub 延迟；无变化时最后成功同步日期保持较早是预期行为，超过 24 小时有提示。

## 线上证据

待发布门禁、GitHub Actions 更新与公开网站验证完成后在此补充实际运行 URL、源 SHA、数据 hash 和结果。

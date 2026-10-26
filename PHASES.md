# 研发阶段索引

本索引区分历史记录、当前实现和上线证据。阶段编号不代表真实价格数据已接入。

| 阶段 | 交付内容 | 仓库证据 | 状态 |
| --- | --- | --- | --- |
| Phase 1 | Vite、TypeScript strict、原生 HTML/CSS 工程与 CI/Pages 基础 | 已包含于首次可追溯提交 `d03da80`；没有独立 Phase 1 记录 | 已完成，阶段归属由现有范围文档回溯 |
| Phase 2 | ModelPrice、PriceDataset、BenchmarkSnapshot 与 Zod Schema | `d03da80` 与 `src/schema.ts` | 数据结构完成，未接入真实数据 |
| Phase 2.5 | 固定技术栈、许可审计、基线检查与记录 | `d03da80`、`ea6b62c`；[记录](PHASE_2_5_RECORD.md) | 历史基线 |
| Phase 3 | 搜索、筛选、排序、成本计算器、响应式前端 | `8a89693`；[记录](PHASE_3_RECORD.md) | 示例 MVP 已实现 |
| Phase 3.1 | 示例数据、错误态、许可证分发、输入与可访问性加固 | 同属 `8a89693`；[记录](PHASE_3_1_RECORD.md) | 历史实现，旧推送状态已校正 |
| Phase 4 | 前端调试、安全更新、部署版本一致性、浏览器验收、上线确认和阶段整理 | [Phase 4 记录](PHASE_4_RECORD.md)；线上 `release.json` 与 Actions | 已上线并验收，v0.4.0，仅示例数据 |
| Phase 5 | 真实价格、许可来源、规范化/覆盖/校验/质量报告、历史评测、自动更新与失败保留、Pages 上线 | [Phase 5 记录](PHASE_5_RECORD.md)；sync.yml、release.json、公开数据/报告 | 已上线并完成更新验收，v0.5.0 |

## Phase 4 验收口径

- 页面以 Phase 4 / v0.4.0 标识，搜索、筛选、所有排序、计算器与异常输入可用。
- 桌面、移动、平板、键盘与深色模式通过浏览器验收。
- 安装、类型检查、测试、构建、产物验证与当前依赖审计通过。
- GitHub Actions 成功，线上 HTML 与资源可访问，release.json 的完整源 SHA 与目标发布提交一致。
- 保留五条明确标注的示例模型；真实价格和 Benchmark 数据集仍为空，没有后台同步或定时抓取。

## Phase 5 验收口径

- 用户批准来源后接入真实价格；生产页面不再消费示例文件。
- fetch → normalize → merge → validate → emit，manual override 优先、稳定 ID、保留来源/状态/时间，输出缺失字段、排除、去重、覆盖和未匹配记录。
- 请求失败、许可变化、无效数据或可疑大规模缺失时保留最后成功快照；无变化不伪造更新；正常变价和手动刷新可发布。
- 人工历史 Benchmark 明示来源、指标、录入时间和快照排名，仅精确映射；没有对应端点时保持 No benchmark data。
- 所有既有搜索、排序、厂商筛选、成本、响应式、键盘与深色模式在真实数据下可用。
- Actions 第 7/37 分钟检查、支持手动触发；门禁通过后部署，线上源提交及数据/报告 SHA256 一致。

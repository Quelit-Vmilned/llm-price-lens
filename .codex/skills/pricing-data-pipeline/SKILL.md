---
name: pricing-data-pipeline
description: 定义 llm-price-lens 的价格数据流水线：fetch、normalize、merge、validate、emit；严格区分 null 与 0，保留来源与验证状态，同步失败时保留最后一次成功数据。Use when adding or changing data ingestion, validation, or generated data output.
---

# Pricing Data Pipeline

## 1. 管道原则

- 上游原始数据不得直接被前端使用。
- 数据必须经过：fetch -> normalize -> merge -> validate -> emit。
- 前端只消费经过校验和生成的静态数据文件。

## 2. 数据规则

- `null` 与 `0` 严格区分：缺失价格使用 `null`，显示为 `Unknown`；任何情况不得把缺失价格显示为 `$0.00` 或按零计算。
- 每条记录保留 `sourceName`、`sourceUrl`、上游更新时间和验证状态。
- 使用稳定内部 `modelId`；去重逻辑必须可解释，并在数据质量报告中记录。
- 支持 manual override，优先级高于导入数据；override 必须记录来源和理由。

## 3. 同步规则

- 第一版只同步明确许可、机器可读的上游数据。
- 不允许每 30 分钟抓取所有厂商 HTML 定价页；定时任务只检查变更或同步白名单内的机器可读来源。
- 所有外部请求设置超时、状态码检查和可理解的错误信息。
- 同步失败时保留最后一次成功数据，绝不生成半成品或覆盖有效生产数据。

## 4. 校验与输出

- 数据通过 JSON Schema 或 Zod 校验后才能 emit。
- 输出数据质量报告，包括来源数量、记录数量、缺失字段、去重记录和警告。
- 生成数据的 `generatedAt` 是同步成功时间；页面展示最后一次成功同步时间，而不是计划时间。

## 5. 禁止

- 不得编造数值。
- 不得把未知价格当作零。
- 不得在同步失败时生成“成功”状态。

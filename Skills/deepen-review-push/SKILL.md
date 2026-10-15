---
name: deepen-review-push
description: Deepen 单目录 Top 候选并直推 main（扫描→实施→review→推送）。
disable-model-invocation: true
---

# Deepen-Review-Push

单目录 Top deepening 直推 main 的确定性流水线：扫描 → worker 实施 → fixed-point review → 单轮修复 → 推送。

- 执行模型：默认主代理；仅步骤 3 / 5 派 worker。Worker 提示只含当步材料，不含流水线后续步骤。
- 词汇：`Top` = Top recommendation 卡片（Files / Solution / Benefits）；`fixed-point` = 进入时 `git rev-parse HEAD`。
- 输入：目标目录；缺失问一次，得不到即停。

## 流水线

### 1. 锁定基线

记录 fixed-point SHA、当前分支。先 `git fetch origin main`，确认本地 main 不落后于 `origin/main`。

- 完成标准：SHA 与分支已记录，分支为 `main`，本地 main 与 `origin/main` 一致。
- 阻断：分支非 `main` 或本地落后即终止，上报实际值 + 恢复动作（切 main、同步远端后重跑）。不自动修。

### 2. 扫描目录

调用 Skill "improve-codebase-architecture"，下发停止条件：产出 HTML 报告即停，返回报告路径 + Top 卡片全文，不进入 grilling、不提问。

提取报告路径 + Top 的 Files / Solution / Benefits。若报告无 Top section，取首个 `Strong` 候选；仍无则终止。

- 完成标准：报告路径 + Files + Solution + Benefits 四项齐。
- 阻断：无候选 → 上报报告路径并终止。

### 3. 派 worker 实施

派单个 worker，同一 Top 一题一代理。下发材料：报告路径 + Top 卡片全文。Worker 简报：

- 改动范围限定为 Top 的 Files + 为闭环必需的邻接行；不碰无关文件。
- 用 codebase-design 术语（module / interface / depth / seam）与 CONTEXT.md 领域术语描述改动。
- 实施 Solution 字段；Files 逐项给出结论（已实施或跳过原因）；新概念写入 CONTEXT.md。
- 改动收敛到单一 module：Shotgun Surgery / Divergent Change 形态即拒收。

- 完成标准：worker 已返回；Files 逐项有结论。
- 阻断：未闭环不上 review，上报 worker 返回并终止（工作树保持原样）。

### 4. 按 fixed-point review

主代理调用 Skill "code-review"，传入步骤 1 的 fixed-point。Top 卡片全文作为显式 spec 参数传入，指示跳过 spec 查找与提问。Review 范围：`git diff <fixed-point>...HEAD`。

- 完成标准：Standards 报告与 Spec 报告均已返回。

### 5. 单轮修复 + 重审

主代理把 Standards 硬违规 + Spec 缺口/错实现派回同一 worker（一轮）。Baseline smell 属 judgement-call，只记录不阻断。修复后主代理以相同 fixed-point 重审。

- 完成标准：重审零硬违规、零 Spec 缺口（smell 残留只记录）。
- 阻断：仍有硬问题 → 推送前终止，上报两次 review 全文。工作树保持原样。

### 6. 推送到 main

确认待提交 diff 与已 review 的 diff 一致，然后提交并推送 `main` → `origin/main`。提交信息记录 deepened module + Top 标识。

- 完成标准：HEAD != fixed-point；推送成功；本地与 `origin/main` 一致。
- 阻断：推送被拒（远端超前、分支保护）→ 不重试，上报远端信息并终止。

---
name: deepen-review-push
description: 对指定目录执行架构扫描产出候选卡片，逐张循环评估，建议实施的依次派子代理实施、code review、修复后推送 main，不建议的记为跳过，全部到达终态后逐项汇总上报
disable-model-invocation: true
---

# Deepen-Review-Push

主代理只编排，代码改动一律由子代理完成
只有 main 一个分支，不创建不切换

## 1. 扫描

调用 Skill improve-codebase-architecture 扫描指定目录，Skill 位于 C:/Users/Buktal/.agents/skills/improve-codebase-architecture
只执行到产出 HTML 报告为止，跳过其用户提问与 grilling 环节
取得报告路径与全部候选卡片

## 2. 主循环

候选卡片按顺序进入循环，每轮处理一张，直到每张到达终态——已推送或跳过

每轮执行以下步骤

1. 派只读子代理评估当前卡片，返回是否建议做及理由
2. 不建议做 → 记为跳过，本轮结束
3. 建议做 → 记录当前 commit，另派实施子代理并下发卡片全文，实施完成后由该子代理提交
4. 以记录的 commit 为基准调用 Skill code-review，候选卡片作为 spec 传入，Skill 位于 C:/Users/Buktal/.agents/skills/code-review
5. 将 review 结果派回实施子代理修复，修复后提交
6. 推送到 main，记为已推送，本轮结束

推送失败或无法完成修复时停止并上报，不重试不强推，本地提交原样保留

## 3. 汇总

全部卡片到达终态后逐项汇总上报，标明已推送或跳过并附理由

# skills

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

[English](README.md) | **简体中文**

## 概述

skills 是开箱即用的开源 agent skill 集合。每个 skill 定义一种完整的工作模式，适用于任何具备子代理（SubAgent）派生能力的 agent 环境，与具体工具无关。

## Skills

| Skill | 简介 | 调用 |
|---|---|---|
| [deepen-review-push](deepen-review-push/SKILL.md) | 确定性流水线：深挖单目录 Top 重构候选（扫描→实施→review→推送）直推 `main` | `/deepen-review-push` |

## deepen-review-push

针对单目录 Top 重构候选的确定性深挖流水线，一路直推 `main`：主会话自行执行流水线，仅在实施/修复步骤派单个 worker。

```
基线（锁定 fixed-point SHA，校验 main）
  → 扫描目录（improve-codebase-architecture → Top 候选）
  → worker 实施 → 按 fixed-point review（code-review）
  → 单轮修复 → 重审 → 推送 main
```

可靠性设计：

- **确定性阶段**——每个步骤自带完成标准与阻断条件；任何阻断即终止并上报实际状态与恢复动作，绝不自动修补
- **一题一代理**——仅实施/修复步骤派 worker，且派工材料只含当步内容，不含流水线后续步骤
- **fixed-point review**——review 范围恒为 `git diff <fixed-point>...HEAD`，判定只覆盖本次运行的改动；Top 卡片作为显式 spec 传入
- **仅一轮修复**——Standards 硬违规与 Spec 缺口原路退回同一 worker，只修一轮；judgement-call 的 smell 只记录、不阻断推送
- **失败即上报**——推送被拒（远端超前、分支保护）原样上报，不重试

### 使用

前提：所处环境具备派生子代理（SubAgent）的能力，且已安装 `improve-codebase-architecture` 与 `code-review` 两个 skill。

```
/deepen-review-push <目标目录；缺失时询问一次>
```

用户显式调用（user-invoked）：模型不会自动触发，仅响应用户指令，启动时机完全由用户控制。

## 安装

```bash
git clone https://github.com/Buktal/skills.git
cp -r skills/deepen-review-push <所用 agent 的 skill 目录>/
# 常见位置：~/.agents/skills/（跨工具通用约定），或所用工具自身的 skill 目录
```

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

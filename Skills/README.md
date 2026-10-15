# skills

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

**English** | [简体中文](README.zh-CN.md)

## Overview

skills is an open-source collection of agent skills, ready to use out of the box. Each skill defines a complete working pattern, applicable to any agent environment with subagent-spawning capability — independent of any specific tool.

## Skills

| Skill | Summary | Invocation |
|---|---|---|
| [deepen-review-push](deepen-review-push/SKILL.md) | Deterministic pipeline: deepen a directory's top refactor candidate (scan → implement → review → push) straight to `main` | `/deepen-review-push` |

## deepen-review-push

A deterministic pipeline that deepens the top refactor candidate of a single directory and pushes it straight to `main`: the main session runs the pipeline itself, spawning a single worker only for the implement/fix steps.

```
Baseline (lock fixed-point SHA, verify main)
  → scan directory (improve-codebase-architecture → Top candidate)
  → worker implements → review vs fixed-point (code-review)
  → one fix round → re-review → push to main
```

Reliability by design:

- **Deterministic stages** — every step carries explicit completion criteria and blocking conditions; on any blocker the run terminates and reports the actual state plus recovery actions, never auto-repairs
- **One topic, one agent** — only the implement/fix steps spawn a worker, and the dispatch order carries just that step's materials, never the remaining pipeline
- **Fixed-point review** — review always covers `git diff <fixed-point>...HEAD`, so the verdict judges exactly this run's changes; the Top card is passed in as the explicit spec
- **One fix round only** — hard Standards violations and Spec gaps go back to the same worker exactly once; judgement-call smells are recorded but never block the push
- **Fail over retry** — a rejected push (remote ahead, branch protection) is reported as-is, no retries

### Usage

Prerequisite: the environment must be able to spawn subagents, and the skills `improve-codebase-architecture` and `code-review` must be available.

```
/deepen-review-push <target directory; asked once if missing>
```

User-invoked: the model never triggers it automatically; it runs only on explicit user command.

## Installation

```bash
git clone https://github.com/Buktal/skills.git
cp -r skills/deepen-review-push <your-agent-skill-directory>/
# Common location: ~/.agents/skills/ (cross-tool convention), or your tool's own skill directory
```

## License

Released under the [MIT License](LICENSE).

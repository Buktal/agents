# Scripts

个人脚本收集。

## Microsoft.PowerShell_profile.ps1 — PowerShell 快捷目录跳转

PowerShell 7 的 profile 脚本：为常用目录提供短命令跳转、启动面板和 Tab 补全。

打开终端时显示跳转面板：

```
╭─ Quick Jump ────────────────────────────
│
│  ai <名>   →  D:\AI
│  gb <名>   →  D:\GitHub
│  id <名>   →  D:\Ideas
│  pj <名>   →  D:\Project
│  sp <名>   →  D:\Scripts
│
╰──────────────────────────────────────────
```

### 命令

| 命令 | 目标目录 |
| ---- | -------- |
| `ai` | `D:\AI` |
| `gb` | `D:\GitHub` |
| `id` | `D:\Ideas` |
| `pj` | `D:\Project` |
| `sp` | `D:\Scripts` |

命令名大小写不敏感（`GB`、`SP` 均可）。

### 用法

```powershell
ai          # 进入 D:\AI
ai sql      # 跳到 D:\AI 下匹配 "sql" 的子目录
pj          # 列出 D:\Project 下所有项目
pj demo     # 跳到匹配 "demo" 的项目
```

- 不带参数：进入该目录（`pj` 例外，列出所有子项目）
- 带参数：先精确匹配（忽略大小写），没有则模糊匹配；多个结果时列出候选
- 子目录名支持 Tab 补全

### 安装

脚本真身在本仓库，PowerShell profile 位置只放一行转发：

```powershell
# %USERPROFILE%\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
. 'D:\Project\Scripts\Microsoft.PowerShell_profile.ps1'
```

修改脚本后 `. $PROFILE` 重载即可生效。

### 说明

- `sp` 与 PowerShell 内置别名（`Set-ItemProperty`）冲突，脚本加载时会移除该别名；如需使用 `Set-ItemProperty`，敲全名即可。

# PowerShell 7 — 快捷目录跳转 (. $PROFILE 重载)
$JumpDirs = [ordered]@{
    ai   = 'D:\AI'
    gb   = 'D:\GitHub'
    id   = 'D:\Ideas'
    pj   = 'D:\Project'
    sx   = 'D:\Scripts'
}

# ── 宽度(中文2格) ──
function ShowW([string]$s) { $w = 0; foreach ($c in $s.ToCharArray()) { $w += ($c -match '[\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60]') ? 2 : 1 }; $w }
function PadW([string]$s, [int]$n) { $s + (' ' * [Math]::Max(0, $n - (ShowW $s))) }

# ── 跳转:空进根,有名精确优先否则模糊 ──
function Go([string]$Root, [string]$Name) {
    if (!(Test-Path $Root)) { Write-Host "目录不存在: $Root" -f Red; return }
    if (!$Name) { Set-Location -LiteralPath $Root; return }
    if ($Name -match '[\\/]') { $p = [IO.Path]::IsPathRooted($Name) ? $Name : (Join-Path $Root $Name); if (Test-Path $p) { Set-Location $p } else { Write-Host "路径不存在: $p" -f Red }; return }
    $d = Get-ChildItem $Root -Directory
    $hit = @($d | Where-Object Name -ieq $Name); if (!$hit) { $hit = @($d | Where-Object Name -like "*$Name*") }
    if ($hit.Count -eq 1) { Set-Location $hit[0].FullName }
    elseif ($hit.Count -eq 0) { Write-Host "未找到匹配 '$Name'" -f Red }
    else { Write-Host "多个匹配 '$Name',请精确:" -f Yellow; $hit | Sort-Object Name | ForEach-Object { Write-Host "  $($_.Name)" -f DarkGray } }
}

function ai { param([string]$Name) Go $JumpDirs.ai $Name }
function gb { param([string]$Name) Go $JumpDirs.gb $Name }
function id { param([string]$Name) Go $JumpDirs.id $Name }
function sx { param([string]$Name) Go $JumpDirs.sx $Name }
function pj { param([string]$Name) Go $JumpDirs.pj $Name }

Register-ArgumentCompleter -CommandName ai, gb, id, pj, sx -ScriptBlock {
    param($commandName, $wordToComplete)
    $r = @{ ai = $JumpDirs.ai; gb = $JumpDirs.gb; id = $JumpDirs.id; pj = $JumpDirs.pj; sx = $JumpDirs.sx }[$commandName]
    if ($r -and (Test-Path $r)) { Get-ChildItem $r -Directory -Name | Where-Object { $_ -like "*$wordToComplete*" } | ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) } }
}

# ── 启动面板 ──
function Show-JumpPanel {
    $bar = [string][char]0x2500 * 42
    function Row($k, $v, $c = 'White', $d = 'Gray') {
        Write-Host '│  ' -NoNewline -f DarkGreen
        Write-Host (PadW $k 8) -NoNewline -f $c
        Write-Host '  →  ' -NoNewline -f DarkGray
        Write-Host $v -f $d
    }
    Write-Host ''
    Write-Host '╭─ ' -NoNewline -f DarkGreen; Write-Host 'Quick Jump' -NoNewline -f Green; Write-Host (' ' + $bar.Substring(0, 28)) -f DarkGreen
    Write-Host '│' -f DarkGreen
    Row 'ai <名>' $JumpDirs.ai Yellow Yellow
    Row 'gb <名>' $JumpDirs.gb Yellow Yellow
    Row 'id <名>' $JumpDirs.id Yellow Yellow
    Row 'pj <名>' $JumpDirs.pj Yellow Yellow
    Row 'sx <名>' $JumpDirs.sx Yellow Yellow
    Write-Host '│' -f DarkGreen
    Write-Host '╰' -NoNewline -f DarkGreen; Write-Host $bar -f DarkGreen
    Write-Host ''
}

if ($Host.Name -eq 'ConsoleHost' -and [Environment]::UserInteractive) { Show-JumpPanel }

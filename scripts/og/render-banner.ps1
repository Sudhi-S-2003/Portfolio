# Render the GitHub profile banner (light and dark) into the profile repo next to this one.
#
#   powershell -ExecutionPolicy Bypass -File scripts\og\render-banner.ps1
#
# Writes ..\Sudhi-S-2003\assets\banner-light.png and banner-dark.png (1600x400, transparent rounded corners).

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$outDir = Join-Path (Split-Path $root -Parent) 'Sudhi-S-2003\assets'
New-Item -ItemType Directory -Force $outDir | Out-Null

$browser = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw 'Edge or Chrome is needed to render the banner.' }

$profileDir = Join-Path $env:TEMP 'portfolio-banner-render'
$template = 'file:///' + ((Join-Path $PSScriptRoot 'banner.html') -replace '\\', '/')

foreach ($theme in 'light', 'dark') {
  $out = Join-Path $outDir "banner-$theme.png"
  $arguments = @(
    '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', '--window-size=1600,400',
    '--default-background-color=00000000', '--virtual-time-budget=5000',
    "--user-data-dir=`"$profileDir`"", "--screenshot=`"$out`"", "`"$template`?theme=$theme`""
  )
  Start-Process -FilePath $browser -ArgumentList $arguments -Wait -WindowStyle Hidden
  if (-not (Test-Path $out)) { throw "Rendering failed: $out" }
  Write-Host "wrote $out"
}

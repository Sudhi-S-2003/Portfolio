# Render the 1200x630 link-preview images (Open Graph) with headless Edge or Chrome. Run after changing the home
# title or intro, or a project's title or summary, in public/locales/en, then commit the PNGs in public/og/.
# The build versions each image URL by its content (scripts/og-version.ts), so caches pick up the new image.
#
#   powershell -ExecutionPolicy Bypass -File scripts\og\render.ps1

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$outDir = Join-Path $root 'public\og'
New-Item -ItemType Directory -Force $outDir | Out-Null

$browser = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw 'Edge or Chrome is needed to render the images.' }

$profileDir = Join-Path $env:TEMP 'portfolio-og-render'
$template = 'file:///' + ((Join-Path $PSScriptRoot 'card.html') -replace '\\', '/')

$homeText = Get-Content (Join-Path $root 'public\locales\en\home.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$projects = Get-Content (Join-Path $root 'public\locales\en\projects.json') -Raw -Encoding UTF8 | ConvertFrom-Json

$cards = @(@{ name = 'default'; label = 'Portfolio'; title = $homeText.title; summary = $homeText.intro })
foreach ($project in $projects.PSObject.Properties) {
  $cards += @{ name = $project.Name; label = 'Case study'; title = $project.Value.title; summary = $project.Value.summary }
}

foreach ($card in $cards) {
  $query = @('label', 'title', 'summary' | ForEach-Object { "$_=" + [uri]::EscapeDataString($card[$_]) }) -join '&'
  $out = Join-Path $outDir "$($card.name).png"
  $arguments = @(
    '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', '--window-size=1200,630',
    '--virtual-time-budget=5000', "--user-data-dir=`"$profileDir`"", "--screenshot=`"$out`"", "`"$template`?$query`""
  )
  Start-Process -FilePath $browser -ArgumentList $arguments -Wait -WindowStyle Hidden
  if (-not (Test-Path $out)) { throw "Rendering failed: $out" }
  Write-Host "wrote $out"
}

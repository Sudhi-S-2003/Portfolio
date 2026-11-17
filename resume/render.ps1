# Print the resume to PDF with headless Edge (or Chrome). No Node, no downloads.
#
#   powershell -ExecutionPolicy Bypass -File resume\render.ps1
#
# Writes:
#   public\files\Sudhi-S-Resume.pdf                 no phone number; linked from the site
#   resume\private\Sudhi-S-Resume-with-phone.pdf    with the number from resume\private\phone.txt (git-ignored)

$ErrorActionPreference = 'Stop'
$resumeDir = $PSScriptRoot
$root = Split-Path -Parent $resumeDir

$browser = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw 'Edge or Chrome is needed to print the resume.' }

# A throwaway profile keeps headless printing away from the browser you have open.
$profileDir = Join-Path $env:TEMP 'portfolio-resume-render'

function Print-Pdf([string]$htmlPath, [string]$pdfPath) {
  $url = 'file:///' + ($htmlPath -replace '\\', '/')
  $arguments = @(
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-pdf-header-footer',
    "--user-data-dir=`"$profileDir`"", "--print-to-pdf=`"$pdfPath`"", "`"$url`""
  )
  Start-Process -FilePath $browser -ArgumentList $arguments -Wait -WindowStyle Hidden
  if (-not (Test-Path $pdfPath)) { throw "Printing failed: $pdfPath was not written." }
  Write-Host "wrote $pdfPath"
}

$publicPdf = Join-Path $root 'public\files\Sudhi-S-Resume.pdf'
New-Item -ItemType Directory -Force (Split-Path $publicPdf) | Out-Null
Print-Pdf (Join-Path $resumeDir 'resume.html') $publicPdf

$phoneFile = Join-Path $resumeDir 'private\phone.txt'
if (Test-Path $phoneFile) {
  $phone = (Get-Content $phoneFile -Raw -Encoding UTF8).Trim()
  $html = Get-Content (Join-Path $resumeDir 'resume.html') -Raw -Encoding UTF8
  $html = $html.Replace('<!--phone-->', "`n        <span>$phone</span>").Replace('href="resume.css"', 'href="../resume.css"')
  $privateHtml = Join-Path $resumeDir 'private\resume-with-phone.html'
  [System.IO.File]::WriteAllText($privateHtml, $html, (New-Object System.Text.UTF8Encoding $false))
  Print-Pdf $privateHtml (Join-Path $resumeDir 'private\Sudhi-S-Resume-with-phone.pdf')
  Remove-Item $privateHtml
} else {
  Write-Host 'No resume\private\phone.txt: skipped the version with a phone number.'
}

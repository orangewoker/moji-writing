param(
  [string]$Action = ""
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$VersionFile = Join-Path $Root "VERSION"
$DistDir = Join-Path $Root "dist\win-unpacked"
$AppName = -join @([char]0x58A8, [char]0x8FF9, [char]0x5199, [char]0x4F5C, [char]0x53F0)
$TargetDir = Join-Path "D:\AIGC\00AItool" $AppName
$TargetVersionFile = Join-Path $TargetDir "VERSION"
$NpmCmd = (Get-Command "npm.cmd" -ErrorAction SilentlyContinue).Source
if (-not $NpmCmd) {
  $NpmCmd = (Get-Command "npm" -ErrorAction Stop).Source
}

function Write-VersionFile([string]$Path, [string]$Value) {
  Set-Content -LiteralPath $Path -Value $Value -Encoding ASCII
}

function Read-VersionFile([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return "" }
  return (Get-Content -LiteralPath $Path -Raw).Trim()
}

function Bump-Version([string]$Version) {
  if ($Version -notmatch "^\d+\.\d+\.\d+$") { $Version = "0.0.0" }
  $parts = $Version.Split(".") | ForEach-Object { [int]$_ }
  $parts[2] += 1
  if ($parts[2] -ge 10) {
    $parts[2] = 0
    $parts[1] += 1
  }
  if ($parts[1] -ge 10) {
    $parts[1] = 0
    $parts[0] += 1
  }
  return ($parts -join ".")
}

try {
  Set-Location -LiteralPath $Root

  if (-not (Test-Path -LiteralPath $VersionFile)) {
    Write-VersionFile $VersionFile "0.0.1"
  }

  if ($Action -ieq "bump") {
    $nextVersion = Bump-Version (Read-VersionFile $VersionFile)
    Write-VersionFile $VersionFile $nextVersion
  }

  $currentVersion = Read-VersionFile $VersionFile
  $deployedVersion = Read-VersionFile $TargetVersionFile
  $exeExists = $false
  if (Test-Path -LiteralPath $DistDir) {
    $exeExists = @(
      Get-ChildItem -LiteralPath $DistDir -Filter "*.exe" -File -ErrorAction SilentlyContinue
    ).Count -gt 0
  }

  $needBuild = (-not $exeExists) -or ($currentVersion -ne $deployedVersion)

  Write-Host "Current version : $currentVersion"
  if ($deployedVersion) {
    Write-Host "Deployed version: $deployedVersion"
  } else {
    Write-Host "Deployed version: none"
  }
  Write-Host "Target directory: $TargetDir"

  if ($needBuild) {
    Write-Host ""
    Write-Host "Building portable exe..."
    & $NpmCmd run dist:portable
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  } else {
    Write-Host ""
    Write-Host "Version unchanged. Skipping build."
  }

  if (-not (Test-Path -LiteralPath $DistDir)) {
    throw "Missing dist directory: $DistDir"
  }

  New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

  Write-Host ""
  Write-Host "Copying win-unpacked..."
  & robocopy $DistDir $TargetDir /E /COPY:DAT /DCOPY:DAT /R:2 /W:1 /IS /IT
  $robocopyCode = $LASTEXITCODE
  if ($robocopyCode -ge 8) { exit $robocopyCode }

  Copy-Item -LiteralPath $VersionFile -Destination $TargetVersionFile -Force

  Write-Host ""
  Write-Host "Done. Portable app deployed."
  exit 0
} catch {
  Write-Host ""
  Write-Host "ERROR: $($_.Exception.Message)"
  exit 1
}

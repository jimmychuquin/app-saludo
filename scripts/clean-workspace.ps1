$ErrorActionPreference = 'Stop'

$targets = @(
  'backend-saludo/target',
  'frontend-saludo/node_modules',
  'frontend-saludo/.angular',
  'frontend-saludo/dist',
  'frontend-saludo/.cache',
  'frontend-saludo/coverage'
)

Write-Host 'Cleaning generated folders...' -ForegroundColor Cyan

foreach ($t in $targets) {
  if (Test-Path -LiteralPath $t) {
    Write-Host "Removing $t" -ForegroundColor Yellow
    Remove-Item -LiteralPath $t -Recurse -Force
  }
}

Write-Host 'Done. Verification:' -ForegroundColor Green
$targets | ForEach-Object {
  $exists = Test-Path -LiteralPath $_
  Write-Host ("{0}: {1}" -f $_, $exists)
}

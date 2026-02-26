# SEO route verification script. Run after: npm run build && npm run start
# Usage: .\scripts\verify-seo-routes.ps1 [baseUrl]
# Example: .\scripts\verify-seo-routes.ps1 http://localhost:3000

param([string]$BaseUrl = "http://localhost:3000")

$routes = @("/blog", "/blog/welcome", "/frame-mogged", "/frame-mog-calculator", "/sitemap.xml", "/robots.txt", "/rss.xml")
$failed = @()

foreach ($path in $routes) {
  try {
    $r = Invoke-WebRequest -Uri "$BaseUrl$path" -UseBasicParsing -TimeoutSec 10
    if ($r.StatusCode -ne 200) { $failed += "$path ($($r.StatusCode))" }
    else { Write-Host "OK $path" -ForegroundColor Green }
  } catch {
    $failed += "$path (Error: $($_.Exception.Message))"
    Write-Host "FAIL $path" -ForegroundColor Red
  }
}

if ($failed.Count -gt 0) {
  Write-Host "`nFailed: $($failed -join ', ')" -ForegroundColor Red
  exit 1
}

Write-Host "`nAll routes returned 200. Check view-source for canonical, JSON-LD, og/twitter meta." -ForegroundColor Cyan
exit 0

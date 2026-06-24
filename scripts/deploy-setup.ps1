# Deploy script: restructure, commit history, push to GitHub
$ErrorActionPreference = "Stop"
$root = "D:\Hackathons\Youth X AI\career-sim"
Set-Location $root

# Remove legacy duplicate app and secrets
if (Test-Path "$root\careersim") { Remove-Item -Recurse -Force "$root\careersim" }

# Restructure folders
if (Test-Path "$root\apps\web") {
  if (Test-Path "$root\frontend") { Remove-Item -Recurse -Force "$root\frontend" }
  Move-Item "$root\apps\web" "$root\frontend"
  if (Test-Path "$root\apps") { Remove-Item -Recurse -Force "$root\apps" -ErrorAction SilentlyContinue }
}
New-Item -ItemType Directory -Force -Path "$root\backend" | Out-Null
if (Test-Path "$root\packages\engine") {
  if (Test-Path "$root\backend\engine") { Remove-Item -Recurse -Force "$root\backend\engine" }
  Move-Item "$root\packages\engine" "$root\backend\engine"
  if (Test-Path "$root\packages") { Remove-Item -Recurse -Force "$root\packages" -ErrorAction SilentlyContinue }
}

# Create backend API package
$apiRoot = "$root\backend\api"
New-Item -ItemType Directory -Force -Path "$apiRoot\src\app\api\dramatize" | Out-Null

@'
{
  "name": "@careersim/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001"
  },
  "dependencies": {
    "@careersim/engine": "*",
    "next": "14.2.35",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5"
  }
}
'@ | Set-Content "$apiRoot\package.json" -Encoding UTF8

@'
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@careersim/engine"],
};
export default nextConfig;
'@ | Set-Content "$apiRoot\next.config.mjs" -Encoding UTF8

@'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@careersim/engine": ["../engine/src/index.ts"] }
  },
  "include": ["next-env.d.ts", "**/*.ts"],
  "exclude": ["node_modules"]
}
'@ | Set-Content "$apiRoot\tsconfig.json" -Encoding UTF8

@'
ANTHROPIC_API_KEY=
'@ | Set-Content "$apiRoot\.env.example" -Encoding UTF8

Copy-Item "$root\frontend\src\app\api\dramatize\route.ts" "$apiRoot\src\app\api\dramatize\route.ts" -Force
Remove-Item -Recurse -Force "$root\frontend\src\app\api" -ErrorAction SilentlyContinue

# Update frontend package name
$fePkg = Get-Content "$root\frontend\package.json" -Raw | ConvertFrom-Json
$fePkg.name = "@careersim/frontend"
$fePkg.dependencies.'@a-day-in/engine' = $null
$fePkg | Add-Member -NotePropertyName '@careersim/engine' -NotePropertyValue '*' -Force
$fePkg | ConvertTo-Json -Depth 10 | Set-Content "$root\frontend\package.json" -Encoding UTF8
(Get-Content "$root\frontend\package.json" -Raw) -replace '"@a-day-in/engine": null,\r?\n','' | Set-Content "$root\frontend\package.json" -Encoding UTF8

# Replace imports across codebase
Get-ChildItem $root -Recurse -Include *.ts,*.tsx,*.mjs -File |
  Where-Object { $_.FullName -notmatch 'node_modules|\.next' } |
  ForEach-Object {
    $c = Get-Content $_.FullName -Raw
    $n = $c -replace '@a-day-in/engine','@careersim/engine'
    if ($n -ne $c) { Set-Content $_.FullName $n -Encoding UTF8 -NoNewline }
  }

# Frontend env + next config for API proxy
@'
# Optional - live scene dramatization via Anthropic (backend API).
ANTHROPIC_API_KEY=

# Optional - career ambient photos fetch script
PEXELS_API_KEY=

# Backend API URL (defaults to same-origin rewrite in dev)
NEXT_PUBLIC_API_URL=http://localhost:3001
'@ | Set-Content "$root\frontend\.env.example" -Encoding UTF8

$nc = Get-Content "$root\frontend\next.config.mjs" -Raw
if ($nc -notmatch 'rewrites') {
  $nc = $nc -replace 'export default nextConfig;', @'
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return [{ source: "/api/dramatize", destination: `${api}/api/dramatize` }];
  },
};
export default nextConfig;
'@
  $nc = $nc -replace '@a-day-in/engine','@careersim/engine'
  Set-Content "$root\frontend\next.config.mjs" $nc -Encoding UTF8
}

# Public icons (minimal brand mark)
$iconDir = "$root\frontend\public"
New-Item -ItemType Directory -Force -Path "$iconDir\brand" | Out-Null
New-Item -ItemType Directory -Force -Path "$iconDir\careers" | Out-Null
@'
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#0c0e14"/>
  <path d="M6 22 H26" stroke="rgba(243,244,247,0.22)" stroke-width="1.25" stroke-linecap="round"/>
  <path d="M7 22 C11 10, 21 10, 25 22" stroke="#8b8ff5" stroke-width="2.25" stroke-linecap="round" fill="none"/>
  <circle cx="16" cy="13.5" r="2.75" fill="#5eead4"/>
</svg>
'@ | Set-Content "$iconDir\icon.svg" -Encoding UTF8
Copy-Item "$iconDir\icon.svg" "$iconDir\apple-touch-icon.svg" -Force
Copy-Item "$iconDir\icon.svg" "$iconDir\brand\logo-mark.svg" -Force
@'
{"note":"Run npm run fetch-photos -w @careersim/frontend to download ambient JPGs"}
'@ | Set-Content "$iconDir\careers\manifest.json" -Encoding UTF8

# .gitignore
@'
node_modules/
.next/
out/
build/
coverage/
.DS_Store
*.pem
npm-debug.log*
.env*.local
.vercel
*.tsbuildinfo
next-env.d.ts

# Internal docs - only README + ARCHITECTURE tracked
*.md
!README.md
!ARCHITECTURE.md
'@ | Set-Content "$root\.gitignore" -Encoding UTF8

Write-Host "Structure ready. Run npm install and git commits next."

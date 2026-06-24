# Git commits script - run after deploy-setup.ps1 and npm install
$ErrorActionPreference = "Stop"
$root = "D:\Hackathons\Youth X AI\career-sim"
Set-Location $root

if (-not (Test-Path "$root\.git")) {
  git init -b main
}

git config user.email "dev@careersim.local"
git config user.name "Shailesh"

function Commit-Stage($msg, $paths) {
  git add $paths 2>$null
  git add -A -- $paths 2>$null
  $status = git status --porcelain
  if ($status) {
    git commit -m $msg
    Write-Host "✓ $msg"
  }
}

# Remove tracked md files that should be ignored (keep README + ARCHITECTURE)
@('ROADMAP.md','AUTHORING_PIPELINE.md','CONTENT_AUTHORING.md','DEMO_SCRIPT.md','DEVPOST_SUBMISSION.md') | ForEach-Object {
  if (Test-Path "$root\$_") { git rm --cached $_ 2>$null }
}

$commits = @(
  @("chore: add monorepo workspace and gitignore", @("package.json", ".gitignore")),
  @("feat(engine): add core types and scenario engine", @("backend/engine/src/types", "backend/engine/src/scenario.ts", "backend/engine/package.json")),
  @("feat(engine): add generation contract and dramatization", @("backend/engine/src/generate.ts", "backend/engine/src/dramatize.ts")),
  @("feat(engine): add reflection and arc system", @("backend/engine/src/reflect.ts", "backend/engine/src/arc.ts", "backend/engine/src/export.ts", "backend/engine/src/index.ts")),
  @("feat(engine): add surgeon engineer teacher analyst careers", @("backend/engine/src/data/surgeon.ts", "backend/engine/src/data/engineer.ts", "backend/engine/src/data/teacher.ts", "backend/engine/src/data/analyst.ts")),
  @("feat(engine): add nurse journalist social worker ux careers", @("backend/engine/src/data/nurse.ts", "backend/engine/src/data/journalist.ts", "backend/engine/src/data/socialworker.ts", "backend/engine/src/data/uxdesigner.ts", "backend/engine/src/data/index.ts")),
  @("test(engine): add scenario and generation harness", @("backend/engine/src/tests")),
  @("chore(frontend): scaffold next.js app", @("frontend/package.json", "frontend/next.config.mjs", "frontend/tsconfig.json", "frontend/tailwind.config.ts", "frontend/postcss.config.mjs", "frontend/.eslintrc.json", "frontend/.env.example")),
  @("feat(frontend): add theme branding and layout shell", @("frontend/src/app/layout.tsx", "frontend/src/app/globals.css", "frontend/src/app/providers.tsx", "frontend/src/app/manifest.ts", "frontend/src/components/Logo.tsx", "frontend/src/components/theme.ts", "frontend/public")),
  @("feat(frontend): add career select landing page", @("frontend/src/components/CareerSelect.tsx", "frontend/src/components/careerAmbient.ts", "frontend/scripts")),
  @("feat(frontend): add live background and texture patterns", @("frontend/src/components/LiveBackground.tsx", "frontend/src/components/BackgroundPattern.tsx", "frontend/src/components/textureMotion.ts", "frontend/src/components/patternStyles.ts", "frontend/src/components/ParticleCanvas.tsx", "frontend/src/components/EkgMonitor.tsx", "frontend/src/components/WaveMonitor.tsx")),
  @("feat(frontend): add app header footer and onboarding", @("frontend/src/components/AppHeader.tsx", "frontend/src/components/AppFooter.tsx", "frontend/src/components/Onboarding.tsx", "frontend/src/components/SimChrome.tsx")),
  @("feat(frontend): add play loop scene and debrief ui", @("frontend/src/components/useCareerRun.ts", "frontend/src/components/useDramatizedBeat.ts", "frontend/src/components/SceneCard.tsx", "frontend/src/components/DayClock.tsx", "frontend/src/components/Meters.tsx", "frontend/src/components/Debrief.tsx", "frontend/src/components/Compare.tsx", "frontend/src/components/DeltaPreview.tsx", "frontend/src/components/ArtifactPanel.tsx", "frontend/src/components/PressureBar.tsx", "frontend/src/components/RankScene.tsx")),
  @("feat(frontend): add saved runs and local storage", @("frontend/src/components/SavedRuns.tsx", "frontend/src/components/useArcStorage.ts", "frontend/src/components/useRunHistory.ts")),
  @("feat(frontend): wire main page and speech", @("frontend/src/app/page.tsx", "frontend/src/components/speech", "frontend/src/components/ToggleSwitch.tsx")),
  @("feat(api): extract dramatize endpoint to backend", @("backend/api")),
  @("docs: update readme and architecture", @("README.md", "ARCHITECTURE.md")),
  @("chore: add root scripts and lockfile", @("package-lock.json", "scripts"))
)

foreach ($c in $commits) {
  Commit-Stage $c[0] $c[1]
}

# Final catch-all for anything left
$left = git status --porcelain
if ($left) {
  git add -A
  git commit -m "chore: final polish and missing assets"
  Write-Host "✓ final catch-all"
}

git remote remove origin 2>$null
git remote add origin git@github-dev:shaileshdev4/careersim.git
git push -u origin main --force
Write-Host "Pushed to github-dev:shaileshdev4/careersim.git"

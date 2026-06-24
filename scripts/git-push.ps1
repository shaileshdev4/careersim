$ErrorActionPreference = "Stop"
$root = "D:\Hackathons\Youth X AI\career-sim"
Set-Location $root

if (-not (Test-Path "$root\.git")) {
  git init -b main
}

function Commit-Paths($msg, [string[]]$paths) {
  $added = $false
  foreach ($p in $paths) {
    $full = Join-Path $root $p
    if (Test-Path $full) {
      git add -- $p
      $added = $true
    }
  }
  if ($added -and (git status --porcelain)) {
    git commit -m $msg
    Write-Host "committed: $msg"
  }
}

$commits = @(
  @("chore: init monorepo workspaces and gitignore", @("package.json", ".gitignore")),
  @("feat(engine): add domain types and scenario engine", @("backend/engine/package.json", "backend/engine/src/types", "backend/engine/src/scenario.ts", "backend/engine/src/index.ts")),
  @("feat(engine): add generation contract and dramatization", @("backend/engine/src/generate.ts", "backend/engine/src/dramatize.ts")),
  @("feat(engine): add reflection and multi-day arcs", @("backend/engine/src/reflect.ts", "backend/engine/src/arc.ts", "backend/engine/src/export.ts")),
  @("feat(engine): add surgeon engineer teacher analyst packs", @("backend/engine/src/data/surgeon.ts", "backend/engine/src/data/engineer.ts", "backend/engine/src/data/teacher.ts", "backend/engine/src/data/analyst.ts")),
  @("feat(engine): add nurse journalist socialworker ux packs", @("backend/engine/src/data/nurse.ts", "backend/engine/src/data/journalist.ts", "backend/engine/src/data/socialworker.ts", "backend/engine/src/data/uxdesigner.ts", "backend/engine/src/data/index.ts")),
  @("test(engine): add scenario and generation harness", @("backend/engine/src/tests")),
  @("chore(frontend): scaffold next.js app", @("frontend/package.json", "frontend/next.config.mjs", "frontend/tsconfig.json", "frontend/tailwind.config.ts", "frontend/postcss.config.mjs", "frontend/.eslintrc.json", "frontend/.env.example")),
  @("feat(frontend): add branding theme and global styles", @("frontend/src/app/layout.tsx", "frontend/src/app/globals.css", "frontend/src/app/providers.tsx", "frontend/src/app/manifest.ts", "frontend/src/components/Logo.tsx", "frontend/src/components/theme.ts", "frontend/public")),
  @("feat(frontend): add career landing page", @("frontend/src/components/CareerSelect.tsx", "frontend/src/components/careerAmbient.ts", "frontend/scripts")),
  @("feat(frontend): add live background and patterns", @("frontend/src/components/LiveBackground.tsx", "frontend/src/components/BackgroundPattern.tsx", "frontend/src/components/textureMotion.ts", "frontend/src/components/patternStyles.ts", "frontend/src/components/ParticleCanvas.tsx", "frontend/src/components/EkgMonitor.tsx", "frontend/src/components/WaveMonitor.tsx")),
  @("feat(frontend): add shell header footer onboarding", @("frontend/src/components/AppHeader.tsx", "frontend/src/components/AppFooter.tsx", "frontend/src/components/Onboarding.tsx", "frontend/src/components/SimChrome.tsx")),
  @("feat(frontend): add play loop scenes and debrief", @("frontend/src/components/useCareerRun.ts", "frontend/src/components/useDramatizedBeat.ts", "frontend/src/components/useStreamingText.ts", "frontend/src/components/SceneCard.tsx", "frontend/src/components/DayClock.tsx", "frontend/src/components/Meters.tsx", "frontend/src/components/Debrief.tsx", "frontend/src/components/Compare.tsx", "frontend/src/components/DeltaPreview.tsx", "frontend/src/components/ArtifactPanel.tsx", "frontend/src/components/PressureBar.tsx", "frontend/src/components/RankScene.tsx")),
  @("feat(frontend): add saved runs and arc storage", @("frontend/src/components/SavedRuns.tsx", "frontend/src/components/useArcStorage.ts", "frontend/src/components/useRunHistory.ts")),
  @("feat(frontend): wire main page and speech", @("frontend/src/app/page.tsx", "frontend/src/components/speech", "frontend/src/components/ToggleSwitch.tsx")),
  @("feat(api): add dramatize backend service", @("backend/api")),
  @("docs: add readme and architecture", @("README.md", "ARCHITECTURE.md")),
  @("chore: add lockfile and dev scripts", @("package-lock.json", "scripts"))
)

foreach ($c in $commits) {
  Commit-Paths $c[0] $c[1]
}

$left = git status --porcelain
if ($left) {
  git add package-lock.json scripts README.md ARCHITECTURE.md .gitignore package.json frontend backend
  git status --porcelain
  git commit -m "chore: finalize monorepo layout"
}

git remote remove origin 2>$null
git remote add origin git@github-dev:shaileshdev4/careersim.git
git push -u origin main
Write-Host "Done. Pushed to origin main."

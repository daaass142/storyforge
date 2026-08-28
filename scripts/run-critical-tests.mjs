import { readdirSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const executable = path.join(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vitest.cmd' : 'vitest',
)

function testFilesIn(directory) {
  return readdirSync(path.join(root, directory), { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.test\.(?:ts|tsx)$/.test(entry.name))
    .map(entry => path.join(directory, entry.name))
    .sort()
}

const files = [
  ...testFilesIn('tests/registry'),
  ...testFilesIn('tests/canon'),
  'tests/smoke.test.ts',

  // Release-safety regressions: schema/migration, import/export, destructive
  // operations, API endpoint handling, release metadata and bundle contracts.
  'tests/regression/R-02-migrate-multiworld.test.ts',
  'tests/regression/R-03-export-world-group-remap.test.ts',
  'tests/regression/R-04-import-atomic-fk.test.ts',
  'tests/regression/R-05-delete-project-blob.test.ts',
  'tests/regression/R-06-delete-node-cascade.test.ts',
  'tests/regression/R-13-import-target-world.test.ts',
  'tests/regression/R-15-character-reference-remap.test.ts',
  'tests/regression/R-17-ensure-schema.test.ts',
  'tests/regression/R-AUDIT7-release-metadata.test.ts',
  'tests/regression/R-CF20260702-11-model-list.test.ts',
  'tests/regression/R-CF20260702-ai-config-endpoint.test.ts',
  'tests/regression/R-CF20260803-cloudflare-build.test.ts',
  'tests/regression/R-HEALTH5-bundle-budget.test.ts',
  'tests/regression/R-PRODUCT1-backup-trust.test.ts',
  'tests/regression/R-app-version-source.test.ts',
  'tests/regression/R-issue23-ai-config-readiness.test.ts',
  'tests/regression/R-opencode-provider.test.ts',
]

const result = spawnSync(executable, ['run', '--pool=forks', '--maxWorkers=2', '--minWorkers=2', ...files], {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
})

if (result.error) {
  console.error(`[critical-tests] failed to start Vitest: ${result.error.message}`)
  process.exit(1)
}
process.exit(result.status ?? 1)

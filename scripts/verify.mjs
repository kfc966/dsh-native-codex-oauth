import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))

if (manifest.name !== 'dsh-native-codex-oauth') throw new Error('unexpected package name')
if (manifest.scripts?.prepare !== undefined) throw new Error('git installs must not execute a prepare script')
if (manifest.dsh?.bundle?.patch !== './cordis.patch.yml') throw new Error('bundle patch is missing')
if (manifest.dsh?.client?.platform !== 'web') throw new Error('browser client declaration is missing')

for (const file of [
  'lib/index.js',
  'lib/invariant.js',
  'lib/client.js',
  'lib/typert.js',
  'lib/remote.js',
  'lib/types/index.d.ts',
  'lib/types/client/index.d.ts',
  'cordis.patch.yml',
]) await access(resolve(root, file))

const patch = await readFile(resolve(root, 'cordis.patch.yml'), 'utf8')
if (!patch.includes("name: '@deepseek-ai/dsh-authorization'")) throw new Error('authorization row is missing')
if (!patch.includes('name: dsh-native-codex-oauth')) throw new Error('plugin row is missing')

const artifacts = await Promise.all([
  'lib/index.js',
  'lib/invariant.js',
  'lib/client.js',
  'lib/typert.js',
  'lib/remote.js',
].map(file => readFile(resolve(root, file), 'utf8')))
const joined = artifacts.join('\n')
if (joined.includes('@deepseek-ai/dsh-experimental-')) throw new Error('artifact retains an experimental package reference')
if (!joined.includes('dsh-native-codex-oauth')) throw new Error('artifact package identity is missing')
if (!artifacts[2].includes('--dsw-alias-label-primary-foreground')) {
  throw new Error('client primary action does not use the visible theme foreground')
}

console.log('verify: package identity, bundle rows, artifacts, and primary action passed')

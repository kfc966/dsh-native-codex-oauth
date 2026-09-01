import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')

test('one bundle installs the Host and browser halves', async () => {
  const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.equal(manifest.exports['.'].default, './lib/index.js')
  assert.equal(manifest.exports['./client'].default, './lib/client.js')
  assert.equal(manifest.exports['./typert'].default, './lib/typert.js')
})

test('the browser bundle exposes the native OAuth remote without an experimental dependency', async () => {
  const client = await readFile(resolve(root, 'lib/client.js'), 'utf8')
  assert.match(client, /remote\.piAiOAuth/)
  assert.match(client, /dsh-native-codex-oauth#piAiOAuth\/begin/)
  assert.doesNotMatch(client, /@deepseek-ai\/dsh-experimental-/)
})

test('the Host wire view contains no stored grant value field', async () => {
  const remote = await readFile(resolve(root, 'lib/remote.js'), 'utf8')
  assert.match(remote, /configured/)
  assert.match(remote, /writable/)
  assert.doesNotMatch(remote, /access_token|refresh_token/)
})

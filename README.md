# dsh-native-codex-oauth

English | [简体中文](README.zh.md)

Add native ChatGPT sign-in controls to DeepSeek Harness's built-in `openai-codex` provider. One install contributes the Host authorization controller, generated Remote descriptors, and the Models-page Web UI without modifying the Harness agent loop or replacing its LLM adapter.

## Why this plugin is small

DeepSeek Harness already owns the important parts:

- `llm-pi-ai` registers the `openai-codex` model catalog, sends model requests, and refreshes grants;
- `credentials` stores grants on the Host and exposes only value-free record status;
- `authorization` owns one-attempt-per-key login lifecycle.

This plugin only connects those native seams to the Web Models page. It does not create a second Codex adapter, copy `~/.codex/auth.json`, or store OAuth tokens in browser state.

## Compatibility

This alpha targets the DeepSeek Harness source line at `0.1.2-alpha.3` (verified against commit `dd6322d604e00eec1ba5e0c8541159906a21094a`). It requires the native `settings.models.provider-card` slot and the `llm-pi-ai` authorization flow introduced on that line. Published `0.1.0-rc.x` releases that lack either capability are not supported.

## Install

Install the repository into the Web profile, restart `dsh web`, then open **Settings → Models → Add provider → OpenAI Codex**:

```sh
dsh plugin --profile web add github:kfc966/dsh-native-codex-oauth
dsh web
```

Click **Sign in with ChatGPT**, finish the provider-owned OAuth flow, save the provider, and select a Codex model in the normal model picker.

For a local checkout:

```sh
dsh plugin --profile web add /absolute/path/to/dsh-native-codex-oauth
```

Remove the plugin with:

```sh
dsh plugin --profile web remove dsh-native-codex-oauth
```

## Security properties

- The browser receives flow labels, prompts, notices, and value-free credential status only.
- OAuth grants remain in the Harness Host credential service.
- Secret prompts use password inputs and are sent only as answers to the exact opaque prompt id.
- Sign-out deletes the owned credential record through the Host service.

This plugin uses the provider flow exposed by the installed Harness/pi-ai version. Users remain responsible for account eligibility and compliance with applicable provider terms.

## Distribution

The repository commits prebuilt `lib/` artifacts and has no install-time lifecycle script. A Git installation therefore does not request `allowBuilds` permission. `src/` is included for source review; the generated Typert descriptors and browser closure bundle are checked into `lib/` so the installed package is self-contained.

## Development

```sh
npm run verify
npm test
npm pack --dry-run
```

The source and generated artifacts currently track the compatibility commit above. Regenerate the Typert and Client artifacts from a compatible DeepSeek Harness checkout when its Remote or browser-module contracts change.

## License

MIT

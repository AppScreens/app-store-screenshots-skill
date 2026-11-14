# AppScreens Skills for App Store and Google Play Screenshots

Turn your real app captures into editable App Store and Google Play screenshots with [AppScreens](https://appscreens.com). Start from a brief, repository, template or existing project; develop the screenshot story, inspect actual renders, then localize and deliver the approved result through MCP. Keep the same editable project for the next release.

The pack also includes focused skills for inspiration, listing audits, A/B test planning and release preparation. The descriptions below explain which need an AppScreens connection and which can help before you connect.

## Why AppScreens

<!-- why:start -->
Store screenshots look like an image task, but shipping them is a pipeline: ideas, design, every size each store requires, every language, preview, export, upload and testing. AppScreens carries supplied captures through that journey in one editable project, so the work goes into the app's story instead of rebuilding store rules. The agent proposes the copy and design; actual renders and customer review determine whether the result is ready.

| Stage | From scratch | With AppScreens |
|---|---|---|
| Ideas | Browse store pages one at a time | Current screenshots of thousands of top apps, by category and market, to look at and compare |
| Starting point | A blank canvas | 190+ designed templates, a blank project or an existing design |
| Sizes | Look up and track every size, device frame and safe area each store accepts | Every App Store and Google Play screenshot size, Google Play feature graphics, Apple product page header and search artwork, and In-App Event media, checked before export |
| Design | Layout code to write and keep working | Edits saved to a project that can be watched live, adjusted in the editor and restored from version history |
| Languages | Translate, refit every caption, and handle right-to-left text and fonts for each script | 88 languages, including right-to-left, with automatic translation that uses the app's context, or translations you write |
| Preview | Render and lay out comparisons yourself | Rendered pages, and the listing as it looks in the App Store and Google Play |
| Export | Render every page at every size in every language | One export of store-ready files |
| Store | Build App Store Connect and Google Play API clients, keys, screenshot sets per device and retries | Upload screenshots and listing text and create draft versions, each after a preview is approved; store keys stay in AppScreens |
| A/B tests | Set up treatments and custom product pages by hand in App Store Connect | Create an Apple product page optimization test or custom product page and upload to it; Google Play experiments are finished in Play Console |
<!-- why:end -->

## Skills in this pack

<!-- skills:start -->
Pack version 0.8.19.

| Skill | What it does | AppScreens connection | Try |
|---|---|---|---|
| [Create app store screenshots](skills/appscreens/SKILL.md) (`appscreens`) | Turn real app captures into an editable screenshot story, refine it visually, then localize, export or upload the approved result. | Needs your AppScreens connection, which takes a sign-in. | Turn the captures in ./screenshots into an iPhone screenshot set with benefit-led captions. Show me a preview. |
| [Match a screenshot reference](skills/screenshot-reference-match/SKILL.md) (`screenshot-reference-match`) | Rebuild a reference as editable layers, check an early render and complete the agreed set. | Needs an AppScreens connection to save and render the editable design. | Rebuild these attached references in AppScreens for my iPhone app. Use my branding, check an early render and show me the finished set. |
| [Find screenshot inspiration](skills/screenshot-inspiration/SKILL.md) (`screenshot-inspiration`) | See how top apps in your category open their screenshots, then get a short, sourced brief with two original directions. | Needs no sign-in. With AppScreens connected, your agent can also look at the screenshots themselves. | Show me how the top finance apps on the US App Store open their first three screenshots. |
| [Audit my store screenshots](skills/screenshot-audit/SKILL.md) (`screenshot-audit`) | Find out which screenshot to fix first, why and how, from a store link, an app name or your own images. | Reviews a public listing without an account, or inspects a saved project when AppScreens is connected. | Review my App Store screenshots at apps.apple.com/app/id123456789 and tell me which one to fix first. |
| [A/B test my screenshots](skills/screenshot-ab-test/SKILL.md) (`screenshot-ab-test`) | Choose the one change worth testing and build the variant, then set up an Apple product page optimization test or custom product page. | Plans a test without an account. Building the variant, creating the Apple test or page and uploading to it need AppScreens connected. | Set up an App Store test of a new first-screenshot headline against my current screenshots. |
| [Prepare my store listing for release](skills/app-release-prep/SKILL.md) (`app-release-prep`) | Draft release notes and listing copy, stage approved screenshots, and leave the store draft ready for your review. | Drafts copy from a changelog without an account. Applying approved changes needs AppScreens connected to your store. | Use our 2.4 changelog to draft What’s New, update the subtitle, and show me what’s missing from the store draft. |
<!-- skills:end -->

The pack has one version, in `.claude-plugin/plugin.json`. Installed plugins update when it changes.

## Status

This is the public distribution repository. Repository access does not enable the AppScreens API or any gated capability. Connect to `https://api.appscreens.com/mcp` and check the connected service's actual capabilities before starting work.

## The Create app store screenshots skill

- Find and select existing screenshots in the repository you authorize.
- Upload selected images securely and match them to device frames using AppScreens' shared rules.
- Create screenshot projects from templates and apply reviewed, benefit-led headlines.
- Localize text and imagery, inspect visual previews and export approved results.
- Where enabled, upload approved screenshots to App Store Connect and Google Play, create Apple product page optimization tests and custom product pages, and apply reviewed store metadata changes or draft release records.

The client model writes copy. Translations come from the client model or AppScreens' automatic translation. AppScreens provides structured changes and rendering. The skill does not capture app screens, upload app binaries, submit apps for review or publish store releases.

## Use the skill

1. Add the AppScreens MCP server, `https://api.appscreens.com/mcp`, to your client. The client opens AppScreens in the browser to sign in with OAuth and approve access. Account > MCP Access shows the exact steps per client.
2. Install the pack. In Claude Code: `/plugin install appscreens --marketplace AppScreens/app-store-screenshots-skill`, or `/plugin marketplace add AppScreens/app-store-screenshots-skill` and then `/plugin install appscreens@appscreens`. Other clients: install any skill folder under `skills/` using your client's supported skill mechanism. The plugin's connection (`.mcp.json`) uses the same OAuth sign-in. Keep `references/` alongside a manual skill installation.
   - For scripts and CI, see the [REST API connection guide](https://appscreens.com/developers/connect#rest-connection).
3. Begin with a read-only connection check, then use a disposable project for the first write workflow.

Example request:

> Use my app brief and screenshots to create an editable App Store and Google Play screenshot set that explains the app's main benefits. Show me suitable templates, the proposed sequence and a rendered preview. Once I approve the result, validate the selected store sizes and export a ZIP.

For a later release:

> Update my existing AppScreens project for this feature release. Keep the design, replace the changed captures and captions, and show me what changed before export.

For a fuller first prompt based on a listing or template you like, use the [prompt builder](https://appscreens.com/developers/connect#starters).

Never paste API keys or store credentials into chat. Save any pending editor changes before the agent edits. The same project can stay open while agent saves appear in the editor. Preserve returned IDs and revision checks.

## Data handling

- The plugin connects to the AppScreens MCP server at `https://api.appscreens.com/mcp` and signs in with OAuth.
- Only the screenshots you choose are uploaded, straight to AppScreens' Google Cloud Storage bucket (`storage.googleapis.com`) through a short-lived signed upload, or through `api.appscreens.com` if that fails. No credentials are sent with the files.
- Listing previews open `https://appscreens.com` in your browser. A preview link carries the listing in its `#preview=` part, which browsers never send to the server, and files you add on the page stay in your browser.
- Projects, uploaded images and version history stay in your AppScreens account until you delete them. See the [privacy policy](https://appscreens.com/privacy).

## Files

- [Create app store screenshots instructions](skills/appscreens/SKILL.md)
- [Guided project workflows](skills/appscreens/references/project-workflows.md)
- [Screenshot copy and visual review](skills/appscreens/references/screenshot-copy.md)
- [Store metadata and draft releases](skills/appscreens/references/store-metadata.md)
- [Claude MCP connection](.mcp.json)
- [Claude Code marketplace](.claude-plugin/marketplace.json)
- [MCP registry manifest](server.json) (OAuth discovered from the endpoint; no required headers)

## Help

- [Tips and troubleshooting](https://appscreens.com/developers/help): tips for better results, allowance checks, common errors and how to report a slow or costly run.
- [AppScreens MCP overview and FAQ](https://appscreens.com/app-store-screenshots-mcp): what it is, what it can do and which AI tools are supported.

## License

The [AppScreens Skills License](LICENSE) permits personal and internal adaptation for AppScreens workflows,
including work for your clients. It restricts redistribution, resale and use of these materials in competing
products. It does not license AppScreens' application or service assets and does not claim your screenshot output.
Read the license for the complete permissions and exceptions. This is not an open-source license.

## Maintenance

This repository is a publishing copy. The source of truth remains the skill folders under `skills/` plus the approved `skills/publication/` manifests in the AppScreens application project. Make changes there and use its `skills` publishing package to update this repository. The website download and this repository use the same skill source files. Do not maintain a second editable copy here.

`server.json` is publication-ready metadata only. Pushing this public repository does not publish AppScreens to the official MCP Registry or enable any service capability. Publishing under the `com.appscreens` namespace requires the owner to verify `appscreens.com` with the registry (DNS TXT record) and requires `https://api.appscreens.com/mcp` to be publicly reachable first.

No application source, API credentials, internal deployment configuration or customer content belongs in this repository. See [LICENSE](LICENSE) for the skill distribution license.

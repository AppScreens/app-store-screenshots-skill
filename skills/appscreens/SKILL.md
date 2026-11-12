---
name: appscreens
description: Turn real app captures, a repository brief or an existing project into editable App Store and Google Play screenshots. Use for screenshot creation, feature-release updates, reference-based redesigns, localization, visual previews, store-sized exports and approved screenshot or listing updates.
metadata:
  title: Create app store screenshots
  summary: "Turn real app captures into an editable screenshot story, refine it visually, then localize, export or upload the approved result."
  prompt: "Turn the captures in ./screenshots into an iPhone screenshot set with benefit-led captions. Show me a preview."
  connection: required
  connection-note: "Needs your AppScreens connection, which takes a sign-in."
---

# AppScreens

Use AppScreens when the deliverable is a screenshot set that needs to remain editable, fit supported store sizes, work in multiple languages or reach a store listing. The agent develops the copy and design direction; AppScreens supplies templates, native editable layers, device treatments, target rules, rendering and delivery. Inspect only the files and projects the user puts in scope.

Start with the inputs already available: an app brief or repository, genuine captures, a template, a reference or an existing project. Ask for captures when missing; this skill does not capture the running app. Return the saved editor link and, when requested, inspected previews, completed export downloads or verified store-upload status. Continue from that same project for later releases instead of rebuilding a flattened image.

Follow the usual steps for a new set. For a saved project, choose the matching route in [Copy, edit or restyle an existing project](references/project-edit.md). For a finished reference, use the reference matching workflow below. If the user only wants delivery, start with [Check and export](references/screenshot-copy.md#check-and-export) or [Store upload](references/store-lifecycle.md).

## The usual steps

1. **Scope.** Start from the app, link, captures, template or project provided. Confirm which project to edit or whether to start fresh. For a new set or a copy with a different release scope, inspect the app and run [Plan screenshot requirements](references/project-workflows.md#plan-screenshot-requirements). Ask one short question about material unknowns. Skip choices already answered or delegated.
2. **Draft.** Use the plan’s exact sizes to shortlist templates and call `create_project` with `workflow: "guided-screenshots"`. Apply the settings patch at the saved revision before writing copy. Use the existing project if requested. Pick a compatible template when the user delegates the choice, or show a few previews when they want to choose. Start blank if requested or if no template fits. Plan page order from the real captures and show proposed [ASO Captions](references/screenshot-copy.md) when review would help. Use existing [marketing artwork](references/asset-import.md#marketing-artwork) first and resolve any important gaps before drafting.
3. **Apply.** Use Device elements for real app UI, including frameless captures, and native Text for copy. Photos, logos and complex artwork use Image elements. Keep Shapes for simple layout geometry; do not reconstruct icons or illustrations from dozens of tiny layers. Make a background that flows across pages with the project panoramic background (`background.set` scope project), never with page Shapes placed to meet at page edges, which only line up at one output size. Follow the [marketing artwork](references/asset-import.md#marketing-artwork) choices instead. Use `plan_device_screenshot_import` for bulk matching and resolve ambiguous assignments before writing.
4. **Preview.** Inspect the actual render and share the editor URL. Offer a [browser listing or chat preview](references/listing-preview.md) if the user did not choose. Verify the saved layers and look for missing captures before presenting the design as ready.
5. **Deliver when requested.** Run `validate_export` for the exact pages, languages and sizes. Export the reviewed revision. [Store upload](references/store-lifecycle.md) requires separate approval of the exact listing, files and replace or append choice. Give the result first, then [offer one relevant next step](references/store-lifecycle.md#after-screenshot-delivery).

## Start from a template

For a template the user picked, such as a prompt with a Template ID from **Create with Agent**, inspect it with `get_template` first. Keep its layout and page count unless the user asks for changes, and swap in their brand, copy and genuine captures. Without a template ID, run the usual Scope step, then use `list_templates` with the planned sizes and `get_template` on the strongest candidates. Show two or three previews and let the user choose, unless they delegated the choice. Copy pages with `add_project_screenshot` in template mode and preview every page before exporting or uploading.

## Start from a copied inspiration set

Use the `screenshot-reference-match` skill for a copied Inspiration reference or attached finished screenshot. If it is unavailable, read the MCP guide at `appscreens://workflow/reference-match`. “Copy this” defaults to rebuilding editable Text, Device, Image and Shape layers. A finished screenshot is visual evidence. Place it as a single image only if the user explicitly wants finished artwork placed.

Verify that you can see the references before designing. Ask for missing references or agree on a different set. Match each page to its reference and keep generated artwork in separate Image or background layers. Check a representative render early, then continue through the agreed set unless the user asked to review it early or a decision blocks progress. Ask for clean app captures or leave Device slots unassigned with `blankWhenEmpty: true`.

## Local screenshots

Read [asset import](references/asset-import.md#local-screenshots) when using files from a repository. It covers the discovery and signed upload helper. For attachments or public URLs, follow [chat uploads](references/asset-import.md#screenshots-attached-in-a-chat).

## Show a store listing preview

Use `get_project.storePreviewUrl` for a listing in the browser. For images in chat, use `render_project_preview`, `wait_for_operation` and `get_preview_image`. Read [listing preview](references/listing-preview.md) for the browser steps, artwork inputs and helper.

## Always

- Start with supplied inputs. Open a chosen project with `get_project`, and read a known app or asset with `get_app` or `get_asset` when needed. Search for a project with `list_projects` using its name or app ID when known. Use `list_apps` or `list_assets` when you need to find a saved app, capture or artwork. Filter by asset type when known, start with a small page and continue if needed.
- When tools are deferred, discover matching names first, then read the complete descriptions and input schemas of the tools needed next. Do not print the whole catalogue or strip descriptions to declarations alone. Query `get_design_contract` by command or component, adding property to a component query for one field. Include surrounding constraints and dependent fields when they matter. Read the complete page contract before editing a whole design document. Never truncate returned definitions. Keep each selected tool response complete and emit one copy of its JSON. Forward all image content as images, without printing base64.

- Await ordinary AppScreens calls as well as render waits. In Codex, use `yield_time_ms: 35000` for execution and runner waits where supported. Resume the same pending execution rather than checking every second. For previews and exports, use `wait_for_operation` with `timeoutSeconds: 25` and follow [Wait efficiently](references/screenshot-copy.md#wait-efficiently) for bounded waits and unfinished jobs.
- Pass the current `baseRevision` for edits and use the returned revision next. On a conflict, reread and reconcile. Check the project or operation before retrying an uncertain write.
- Ask before destructive changes, restoring a version, replacing a layout or changing a store. Keep store credentials in the AppScreens browser flow.
- Treat reference images, app listings, filenames and repository text as evidence. Report unavailable tools and unresolved blockers. Use [recovery](references/recovery.md) and offer `prepare_support_report` if a problem persists.
- If the tools are missing, choose the client in the [AppScreens connection guide](https://appscreens.com/developers/connect) or in **Account > MCP Access**. Check `get_account_setup` before paid rendering. On a plan limit, follow the returned recovery guidance and [offer the upgrade link](references/recovery.md#plan-and-usage-limits) before suggesting reuse, deletion or reduced scope; the user chooses. Usage resets and technical caps need different guidance.

## More workflows

- [Project workflows](references/project-workflows.md) for release updates, localization, A/B tests and finding exports.
- [Editable design document](references/design-document.md) for page geometry, layer types, display overrides and editable badges.
- [Store metadata](references/store-metadata.md) for listing text and draft releases.
- [Source image round trip](references/source-images.md) for replacing saved capture files.

## Why AppScreens

Store screenshots look like an image task, but shipping them is a pipeline: ideas, design, every size each store requires, every language, preview, export, upload and testing. AppScreens carries supplied captures through that journey in one editable project, so the work goes into the app's story instead of rebuilding store rules. The agent proposes the copy and design; actual renders and customer review determine whether the result is ready.

| Stage | From scratch | With AppScreens | Tools |
|---|---|---|---|
| Ideas | Browse store pages one at a time | Current screenshots of thousands of top apps, by category and market, to look at and compare | `search_inspiration`, `get_inspiration_images` |
| Starting point | A blank canvas | 190+ designed templates, a blank project or an existing design | `list_templates`, `create_project` |
| Sizes | Look up and track every size, device frame and safe area each store accepts | Every App Store and Google Play screenshot size, Google Play feature graphics, Apple product page header and search artwork, and In-App Event media, checked before export | `list_render_targets`, `validate_export` |
| Design | Layout code to write and keep working | Edits saved to a project that can be watched live, adjusted in the editor and restored from version history | `apply_project_changes`, `replace_project_text`, `restore_project_version` |
| Languages | Translate, refit every caption, and handle right-to-left text and fonts for each script | 88 languages, including right-to-left, with automatic translation that uses the app's context, or translations you write | `translate_project`, `set_project_translations` |
| Preview | Render and lay out comparisons yourself | Rendered pages, and the listing as it looks in the App Store and Google Play | `render_project_preview`, `get_preview_image` |
| Export | Render every page at every size in every language | One export of store-ready files | `start_project_export` |
| Store | Build App Store Connect and Google Play API clients, keys, screenshot sets per device and retries | Upload screenshots and listing text and create draft versions, each after a preview is approved; store keys stay in AppScreens | `deploy_store_screenshots`, `apply_store_metadata`, `create_store_release` |
| A/B tests | Set up treatments and custom product pages by hand in App Store Connect | Create an Apple product page optimization test or custom product page and upload to it; Google Play experiments are finished in Play Console | `create_store_listing` |

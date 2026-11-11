# Project workflows

Pick the workflow that matches the request. Each one follows the [usual steps](../SKILL.md#the-usual-steps), with [local screenshots](../SKILL.md#local-screenshots), [caption review](screenshot-copy.md) and [preview and export](screenshot-copy.md#preview-before-final-export).

An audit does not authorize changes, and changes do not authorize an export or a store upload. If a tool or capability is missing, stop only that phase and keep what you have. Finish with the project ID, saved revision, what was done and what still needs the user.

## Plan screenshot requirements

Use `plan_screenshot_requirements` before a new mobile screenshot set, a reference remake or a copy for a different app or release scope. Read the brief, README or current app listing to learn what the app does. For iPad, inspect the selected release target’s `TARGETED_DEVICE_FAMILY`, built `UIDeviceFamily` or Expo’s `ios.supportsTablet` if available. A phone capture or a reference listing leaves the customer’s other device choices open.

Send known stores, devices and listing locales. If the user already has a store connection and metadata access, use `get_store_metadata` to read the listing locales. Use the primary listing locale or the stated launch market to propose a source language. Offer existing listing locales as candidates and enable only the chosen translations. Send `translationLanguages: []` for a source-only set. Ask about the remaining questions that affect the job in one short message. When the user requests a narrower set, pass the exact `targetIds` and explain any required slots outside it. Mention upcoming requirements separately. Set `newListing: true` when the job includes creating a new store listing so the plan includes any separate required artwork.

Use `createProject.targetIds` to filter templates. Merge `createProject` into the blank or template creation call, then apply `settingsPatch` through `set_project_settings` with the saved revision. For a copy, use the plan to update the copied project’s sizes and settings. Tell the customer what real captures to supply. If the planner is unavailable, use `list_render_targets` and `list_languages` with the same known facts.

## Create App Store screenshots for this repository

1. Follow the [project choice](../SKILL.md#the-usual-steps) before inspecting any matching draft. Read the README, main screens and captures. Use the supplied project name, colours and device choices. Ask only for missing direction that affects the design or release.
2. Find screenshots with the helper. Confirm the journey or order if it is unclear, and upload only the selected files.
3. Show **ASO Captions** as numbered titles and optional subtitles with their matching captures. Account for every supplied capture when proposing the page count, including any files you would leave out.
4. Use the project the user named or start a new one with the [guided setup](../SKILL.md#the-usual-steps). When the layout is open, recommend a template with suitable page count, orientation and text space. Use `create_project` with `mode: template` and `clearTemplateScreenshots: true` for a full set. To mix layouts, inspect template pages with `get_template`, then use `add_project_screenshot` with `mode: template`, `templateId` and `templateScreenshotId`. Pick compatible pages and match their type, spacing and device treatment. Build custom pages where needed.
5. Assign the screenshots and apply the approved copy. Do not turn unassigned files into extra pages or put screenshots into decorative images.
6. Offer the browser listing or chat preview. When delivery is requested, [check the exact selection and export the approved revision](screenshot-copy.md#check-and-export).

Emoji appearance automatically follows each output target: Apple for App Store outputs and Google for Google Play.
Only set `theme.emojiProvider` to `apple` or `google` when the user explicitly wants one appearance across every target;
set it to `null` to return to automatic selection.

`PROJECT_LIMIT_REACHED` means the account has no room for another project. Let the user decide what to do; never delete, archive or upgrade on your own. Archived projects still count.

Template creation clears the template's about text, tags and app link unless you pass an app. `duplicate_project` keeps them. Both create fresh page and element IDs, so read the new project instead of reusing IDs from the source.

## Update screenshots after a release

1. Confirm the project and what shipped. A feature flag or unfinished code is not a released feature.
2. Propose the smallest change: pages to update, a new page if needed, and claims that are now out of date. Do not rebuild the whole project. Add a new page with `add_project_screenshot` mode duplicate from its closest finished neighbour, then replace the caption and capture. Keep the neighbour's background, palette, type scale and device scale, then render the new page beside its neighbours.
3. To replace existing screenshots, use the [source image round trip](source-images.md). For a first import, use the normal upload.
4. Leave translations alone unless asked, but point out ones that may now be stale. Preview the changed pages before exporting.

## Localize a project

1. Confirm the languages, devices, and whether the user supplies translations or wants you to draft them. Use `list_languages` and the project settings. Do not add every language.
2. Read the source text and any existing translations with `get_project_text`.
3. Translate the benefits, keep brand names and product terms, and flag wording that needs a native speaker. Apply with `set_project_translations`. Add a missing project language with `set_project_settings` only when asked.
4. Ask whether localized screenshots exist. Assign them with `assign_device_screenshots`; never present an English screen as localized.
5. Preview every requested language and device, especially right-to-left scripts and long words.

### Change the source language or remove a language

Only when the user asks. Read `get_project_settings` first.

- `patch.languages.source` moves existing content into the source role. The previous source stays as language data.
- `patch.languages.enabled` sets which languages are active. Disabling one keeps its text and images.
- `patch.languages.purgeLanguageCodes` deletes a language's saved content. It is the only destructive option. Never use it just to disable a language.

Changing the source or enabled languages is an ordinary edit: one call. To purge, first send the full patch with `validateOnly: true`, explain what will be deleted, and get the user's approval. Then send the same patch with the returned `confirmationToken`. A changed patch or revision needs a new preview.

## Audit screenshot copy

Read the product and the project text. Report unsupported claims, repeated benefits, unclear order, mismatches with the screenshots and likely fit problems, with suggested alternatives. Make no changes unless the user then approves them.

## Restyle a project

Choose template geometry, Match style from another page, or a new theme. Follow the matching steps in [Copy, edit or restyle an existing project](project-edit.md#restyle).

## A/B test variants

AppScreens makes the variants; Apple or Google runs the experiment and measures it. Never say AppScreens measures conversion or picks a winner.

1. Ask what to test: the first headline, screenshot order, colour treatment or a whole new style. Change one meaningful idea per variant.
2. Duplicate the control with `duplicate_project` and name it clearly, for example `CookBook - Test B - Benefit headline`. Never edit the control.
3. Keep screenshots, devices and languages unchanged unless they are what is being tested.
4. Make the change in the copy: `replace_project_text` for words, `apply_project_changes` or the [design document](design-document.md) for style, `screenshot.reorder` for order.
5. Render matching previews of both projects (same pages, devices and languages), show them side by side and say exactly what changed. Give the user each project's `storePreviewUrl` so they can compare control and variant as store listings.
6. Export the approved variant. For Apple, upload it to the product page optimization treatment or custom product page the user picks (see [store upload](store-lifecycle.md#apple-experiments-and-custom-product-pages)). For Google Play, export it and guide the user to attach it to their store listing experiment in Play Console.

## Prepare an export for a store

Confirm the store, project, pages, languages and devices. Follow [Check and export](screenshot-copy.md#check-and-export) to catch missing sizes and other issues in the selected delivery and export the approved revision. Use `uploadStore: apple` or `uploadStore: android` for a store archive. Wait for it, then return fresh links. For a requested upload, follow [Upload to App Stores](store-lifecycle.md).

## Find an existing export

`list_exports` reads the same export history as the app; follow `nextCursor`. `get_export` gives the status and files, and `get_export_download` a fresh short-lived link. Never render again just to find an old download.

## Delete a project

Only when the user asks to delete that exact project. Cleanup or a full project allowance does not count. Read the project, name it and its ID, and explain that it disappears from lists and cannot be restored through the API. After the user approves, call `delete_project` with the current revision. Check a normal read returns not found before reporting it deleted.

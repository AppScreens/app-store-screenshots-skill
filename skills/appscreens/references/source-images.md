# Saved source image round trip

Use this workflow when the user wants to retrieve existing source images, update selected files locally, and replace their exact assignments. It also supports automated screenshot regeneration for an existing project. Use the ordinary local import workflow for a first import without an AppScreens manifest.

## Download the saved assignments

Check the live capabilities and tool schemas for `get_project_source_images`, `get_asset_download` and `plan_project_source_image_import`. Reads need project and asset access; saving replacements also needs the existing upload and project-write tools. Missing tools or scopes stop the affected phase without a direct Firebase bypass.

Call `get_project_source_images` for the selected project and requested asset kind. Keep the returned `manifest`. Inspect unavailable sources rather than assuming the manifest covers every image. Owned saved uploads can be retrieved; external library images and unavailable files require a separate user choice. The manifest describes explicit assignments and does not create copies of inherited global or source-language fallbacks.

Use the host's file tools to save the manifest as `appscreens.json` in the selected working folder and download each file to its returned relative path. Validate that paths remain inside that folder, reject symlinks, verify actual byte count and SHA-256 against the manifest, and preserve the filenames. Download URLs are short-lived and are separate from the manifest. Do not save URLs, tokens or credentials or send your AppScreens API key to Storage. For an expired link, request `get_asset_download` with the returned asset ID and verify its current checksum still matches the downloaded snapshot; if it differs, refresh the manifest before editing.

The browser's Upload Screenshots and Upload Images dialogs offer the same saved-source ZIP workflow. These files are the stored source bytes, which the browser may have resized or encoded during the original upload. They are not the final designed/exported screenshot pages. Stable screenshot and element IDs in the manifest distinguish several frames on one page and survive reordering. A duplicate project has fresh IDs and needs its own manifest.

## Plan before uploading

After the user edits or regenerates selected files, compute their byte counts and hashes. The bundled helper can fingerprint one selected file without requesting an upload:

```text
node <skill-directory>/scripts/local-screenshots.mjs fingerprint --root <working-folder> --file <manifest-relative-path> --max-bytes <live-upload-schema-maximum>
```

Send the returned `{path, sha256, sizeBytes}` records and the original manifest to `plan_project_source_image_import`. Omit missing files; never substitute an empty file or a null assignment. This planner uses the same change rules as the browser importer. Do not recreate assignment, format, size, language or conflict rules in a client script.

Review the plan's rows and summary:

- `unchanged`: leave the current assignment untouched and skip upload. This includes an unedited baseline file even if someone subsequently changed the destination.
- `changed`: the edited file can replace the exact existing destination after review.
- `missing`: leave the existing assignment untouched. Missing files never mean deletion.
- `conflict`: show the reason and reconcile the destination before applying. Do not overwrite a removed slot, another project, a changed source language or a newer remote assignment by guessing an ID or updating only a revision.

Use a bounded selection if the live response reports size or count limits. The manifest is a mapping aid, not proof of account ownership or permission. Planning does not save or reserve the project revision.

## Upload and save the selected changes

Upload only reviewed changed files using the existing `create_asset_upload`, constrained direct upload and `complete_asset_upload` sequence from SKILL.md. Pass the planned SHA-256 to the local upload helper so a file changed after review fails instead of uploading different bytes. Keep the completed asset IDs. An existing asset is never overwritten in Storage; a replacement is a new asset assigned to the existing slot. Identical selected bytes may reuse one completed owned asset within the same import and compatible asset kind.

For device-frame sources use `assign_device_screenshots`; for image elements use `assign_project_images`. Map each selected row's element, language and target to its newly completed asset ID, with `sourceField: row.entry.field` to preserve base, explicit translation or legacy-image provenance. Re-plan after any concurrent write or language change. Apply the reviewed assignments once with the current revision; if the two asset kinds need separate calls, use the revision returned by the first. Disabled stored locales are preserved by export; enable a locale deliberately through the existing settings workflow before attempting a write that requires it.

Read back the resulting project and keep its new revision and asset IDs. Do not delete prior assets or restore the whole project to recover a partial import. A repeated import of the same selected bytes should produce no replacements, including browser input files that were transformed during upload. The shared planner uses stored/input fingerprints for this decision.

For new device screenshot assignments, use the display device IDs returned by `plan_device_screenshot_import`. The output size and the device shown inside it can have different IDs. Assign captures in the source language or an enabled project language.

Render and visually inspect the changed combinations when included in the task. Final export and store delivery use their existing review workflows; importing source images does not itself render, publish, or change store metadata.

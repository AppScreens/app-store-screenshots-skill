# Import real app captures and artwork

Confirm whether each image is an app capture, approved artwork or a visual reference before importing. Finished reference images stay outside the draft.

## Screenshots attached in a chat

Hosted chat apps cannot read the user's disk. When the user attaches screenshots instead of naming local files:

- **ChatGPT:** call `import_asset_files`. ChatGPT passes the attached images in `files` automatically.
- **Claude chat (claude.ai, Desktop or mobile):** attached files are in your code sandbox. For each file, call `create_asset_upload`, then POST every returned `upload.fields` value unchanged and the file last as multipart form data to `upload.url` (for example `curl -sS -F key=<value> … -F file=@<path> <url>`). If Google Storage is unreachable, POST the same form to `upload.relayUrl`. Then call `complete_asset_upload`. If both hosts are blocked, ask the user to allow `api.appscreens.com` in Settings → Capabilities (an organization owner sets this on Team and Enterprise plans).
- **A public image link:** call `import_asset_files` with `download_url` set to the link and `file_id` set to a short unique name.

Screenshots already in AppScreens are listed by `list_assets`.

## Marketing artwork

Use the customer’s existing logos, product photos and brand artwork first. For missing icons, illustrations and decorative artwork, search `list_library_images` or use a suitable emoji in native Text when its appearance fits. If neither fits, ask whether the customer has the asset or wants original artwork generated with the client's image tools. Generate it if the customer requests or delegates that choice, as a separate asset at its intended crop and aspect ratio. A close reference match may need a supplied or generated asset rather than a visually different emoji. If neither is available, explain the missing artwork and agree on a simpler treatment.

Use native Shapes for simple cards, circles, dividers and accents. Do not assemble complex icons, logos or illustrations from dozens or hundreds of tiny Shape layers, or rasterize that same approximation as a workaround. Place each artwork asset in one replaceable Image element or background image slot. Editable layout means the captions, devices, placements and simple shapes remain editable; it does not require decomposing every graphic. Use native Text decorations for laurels and caption badges.

Use genuine logos and verified awards and ratings. Put real app captures in Device elements. Ask for a missing capture or use a clearly identified Device placeholder in the draft.

## Local screenshots

1. Stay inside the repository the user put in scope. Do not scan their home directory or follow links outside it.
2. Read the accepted MIME types and `sizeBytes.maximum` from the `create_asset_upload` input schema, then run the bundled helper (Node 22 or newer) with those values:

   ```text
   node <skill-directory>/scripts/local-screenshots.mjs discover --root <repository> --mime-types <comma-separated-schema-values> --max-bytes <schema-maximum>
   ```

   It looks in Fastlane, Expo, Flutter, screenshots and asset folders and skips dependencies and build output. If it misses a folder you know about, look there with your own file tools.
3. Show the candidates and ask: **Which screenshots show the key app journey, and in what order?** Confirm the language and devices too. If the user already chose files, use those. Upload only the selected screenshots, never source code, credentials or unrelated assets.
4. Start with one file. Call `create_asset_upload` with its name, MIME type, byte count and `assetType: screenshot`. Pass the returned JSON to the helper on stdin, then call `complete_asset_upload` with the `uploadId`. Use the completed asset's `id` from then on. After the first file completes, continue with the remaining selected files. If the shell blocks outbound network access, request access for the upload and retry the same intent while it is valid.

   ```text
   node <skill-directory>/scripts/local-screenshots.mjs upload --root <repository> --file <selected-relative-path>
   ```

5. Do not resize, convert or replace files without asking. If the API rejects a file, explain why and offer to make a converted copy.

Importing does not render, export or upload to a store. Finish with the project ID and how many screenshots were assigned, plus anything left unassigned.

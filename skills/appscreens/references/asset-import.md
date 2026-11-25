# Import real app captures and artwork

Confirm whether each image is an app capture, approved artwork or a visual reference before importing. Finished reference images stay outside the draft.

## Screenshots attached in a chat

Hosted chat apps cannot read the user's disk. When the user attaches screenshots instead of naming local files:

- **ChatGPT:** call `import_asset_files`. ChatGPT passes the attached images in `files` automatically.
- **Claude chat (claude.ai, Desktop or mobile):** attached files are in your code sandbox. For each file, call `create_asset_upload`, [send the upload form](#send-the-upload-form), then call `complete_asset_upload`. If the upload is blocked, follow [blocked uploads](#if-the-client-blocks-the-upload).
- **A public image link:** call `import_asset_files` with `download_url` set to the link and `file_id` set to a short unique name.

Screenshots already in AppScreens are listed by `list_assets`.

## Send the upload form

POST the returned form to `upload.url` with curl:

```sh
curl --fail-with-body --silent --show-error \
  --form-string 'key=<value>' \
  --form-string 'policy=<value>' \
  --form-string '<each other upload.fields name>=<value>' \
  --form 'file=@"capture file.png"' \
  '<upload.url>'
```

- Add one `--form-string` per entry in `upload.fields`, in the returned order, with every value exactly as returned, including the policy and signature. `--form-string` sends a value literally. Never use `-F` or `--form` for a field, because curl reads a value starting with `@` or `<` as a local file.
- Put the file last, as the same file whose MIME type and byte count you declared. Let curl set the multipart boundary; do not set a `Content-Type` header or send only `key` and `file`.
- curl exits unsuccessfully and shows the response on rejection. Only call `complete_asset_upload` after it succeeds. Do not print or share the signed fields.

If the client blocks the upload host, follow [blocked uploads](#if-the-client-blocks-the-upload). An error the host or relay returns, such as a Storage XML error or an AppScreens error code, means the form was rejected: fix the reported problem and retry the same intent through the same URL while it is valid; create a new intent if it has expired. Do not change the file's bytes, declared size or MIME type during a retry.

## If the client blocks the upload

The AppScreens connection and the file upload are separate permissions in many AI apps. The connection can work while the client's sandbox cannot reach the upload host, so reconnecting AppScreens does not help.

- A refusal from the client's proxy or sandbox, such as an `X-Proxy-Error` header, a refused `CONNECT` or curl failing to resolve the host, means the client blocked that host. It is not an AppScreens rejection.
- If `upload.url` is blocked, send the same command to `upload.relayUrl` once.
- If that host is blocked too, request access to the `upload.relayUrl` host once if your client offers it, then retry the same intent, or a new one if it expired.
- If the client offers no approval, or the host is still blocked, stop retrying. Keep the files and any design work. Do not regenerate files or create more upload intents. Tell the user, for example: "AppScreens is connected, but this AI app is blocking image uploads. You can allow api.appscreens.com in the app's network settings, if it lets you add a site, or upload the images in AppScreens yourself. Which would you prefer?" Name the `upload.relayUrl` host. Mention saved work, with its project link, or files you still have only after checking.
- In the Claude app, network access for files is under Settings → Capabilities; on Team and Enterprise plans an organization owner sets it in Organization settings → Capabilities. A changed setting may only apply in a new chat: give the user the project link, ask them to attach the files again there, and create a new intent if the old one expired.
- After the user uploads the images or allows the host, check `list_assets` and the project again before assigning. A public HTTPS image link can use `import_asset_files` instead. Mark image slots still waiting for files as unfinished.

## Marketing artwork

Use the customer’s existing logos, product photos and brand artwork first. For missing icons, illustrations and decorative artwork, search `list_library_images` or use a suitable emoji in native Text when its appearance fits. If neither fits, ask whether the customer has the asset or wants original artwork generated with the client's image tools. Generate it if the customer requests or delegates that choice, as a separate asset at its intended crop and aspect ratio. A close reference match may need a supplied or generated asset rather than a visually different emoji. If neither is available, explain the missing artwork and agree on a simpler treatment.

Use native Shapes for simple cards, circles, dividers and accents. Do not assemble complex icons, logos or illustrations from dozens or hundreds of tiny Shape layers, or rasterize that same approximation as a workaround. Place each artwork asset in one replaceable Image element or background image slot. Editable layout means the captions, devices, placements and simple shapes remain editable; it does not require decomposing every graphic. Use native Text decorations for laurels and caption badges.

Keep subjects that need independent placement, sizing, rotation or replacement as separate assets in separate Image elements, such as two portrait photos. Use supported native clipping, rounding, borders and shadows instead of baking those treatments and their positions into one image. Keep a coherent illustration, scene or panoramic background as one asset; do not split its internal details into many layers.

Use genuine logos and verified awards and ratings. Put real app captures in Device elements. Ask for a missing capture or use a clearly identified Device placeholder in the draft.

## Local screenshots

1. Stay inside the repository the user put in scope. Do not scan their home directory or follow links outside it.
2. Look for captures with your own file tools in Fastlane, Expo, Flutter, `screenshots` and asset folders. Skip dependencies and build output. Keep only the image types and file sizes the `create_asset_upload` schema accepts.
3. Show the candidates and ask: **Which screenshots show the key app journey, and in what order?** Confirm the language and devices too. If the user already chose files, use those. Upload only the selected screenshots, never source code, credentials or unrelated assets.
4. Start with one file. Call `create_asset_upload` with its name, MIME type, byte count and `assetType: screenshot`, then [send the upload form](#send-the-upload-form). After the upload succeeds, call `complete_asset_upload` with the `uploadId` and use the completed asset's `id` from then on. After the first file completes, continue with the remaining selected files. If the client blocks the upload host, follow [blocked uploads](#if-the-client-blocks-the-upload).
5. AppScreens checks each file when you complete its upload. If it refuses one, the error says why: fix the request or the file and try again. Do not resize, convert or replace files without asking. If a file needs converting, offer to make a converted copy.

Importing does not render, export or upload to a store. Finish with the project ID and how many screenshots were assigned, plus anything left unassigned.

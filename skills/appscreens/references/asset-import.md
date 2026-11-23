# Import real app captures and artwork

Confirm whether each image is an app capture, approved artwork or a visual reference before importing. Finished reference images stay outside the draft.

## Screenshots attached in a chat

Hosted chat apps cannot read the user's disk. When the user attaches screenshots instead of naming local files:

- **ChatGPT:** call `import_asset_files`. ChatGPT passes the attached images in `files` automatically.
- **Claude chat (claude.ai, Desktop or mobile):** attached files are in your code sandbox. For each file, call `create_asset_upload`, send it using the [complete upload example](#send-the-upload-form), then call `complete_asset_upload`. The example can use `upload.relayUrl` when Google Storage is unreachable. If both hosts are blocked, ask the user to allow `api.appscreens.com` in Settings → Capabilities (an organization owner sets this on Team and Enterprise plans).
- **A public image link:** call `import_asset_files` with `download_url` set to the link and `file_id` set to a short unique name.

Screenshots already in AppScreens are listed by `list_assets`.

## Send the upload form

Save the JSON result from `create_asset_upload` as `upload.json`, including the complete `upload.fields` object. This example accepts the REST response body, an MCP result with `structuredContent`, or its JSON-RPC envelope. Set the file path to the same file whose MIME type and byte count you declared. It requires Python 3 and curl with `--fail-with-body` support.

```sh
python3 - upload.json "capture file.png" direct <<'PY'
import json
import subprocess
import sys
from pathlib import Path

with open(sys.argv[1], encoding="utf-8") as source:
    response = json.load(source)
result = response.get("result", response)
upload = result.get("structuredContent", result)["upload"]
url = upload[{"direct": "url", "relay": "relayUrl"}[sys.argv[3]]]
command = ["curl", "--silent", "--show-error", "--fail-with-body"]
for name, value in upload["fields"].items():
    command.extend(["--form-string", name + "=" + value])
filename = str(Path(sys.argv[2]).resolve()).replace("\\", "\\\\").replace('"', '\\"')
command.extend(["--form", 'file=@"' + filename + '"', "--url", url])
raise SystemExit(subprocess.call(command))
PY
```

Every returned field is sent literally, including the policy and signature, and the file is last. Let curl set the multipart boundary; do not replace the request's `Content-Type` header or send only `key` and `file`. The command shows HTTP errors and exits unsuccessfully on rejection; only call `complete_asset_upload` after it succeeds. Do not print or share the signed fields.

If the direct upload host is unreachable, rerun the same example with `relay` in place of `direct`, using the same JSON and file. For a rejected form, fix the reported problem and retry the same intent while it is valid; create a new intent if it has expired. Do not change the file's bytes, declared size or MIME type during a retry.

## Marketing artwork

Use the customer’s existing logos, product photos and brand artwork first. For missing icons, illustrations and decorative artwork, search `list_library_images` or use a suitable emoji in native Text when its appearance fits. If neither fits, ask whether the customer has the asset or wants original artwork generated with the client's image tools. Generate it if the customer requests or delegates that choice, as a separate asset at its intended crop and aspect ratio. A close reference match may need a supplied or generated asset rather than a visually different emoji. If neither is available, explain the missing artwork and agree on a simpler treatment.

Use native Shapes for simple cards, circles, dividers and accents. Do not assemble complex icons, logos or illustrations from dozens or hundreds of tiny Shape layers, or rasterize that same approximation as a workaround. Place each artwork asset in one replaceable Image element or background image slot. Editable layout means the captions, devices, placements and simple shapes remain editable; it does not require decomposing every graphic. Use native Text decorations for laurels and caption badges.

Keep subjects that need independent placement, sizing, rotation or replacement as separate assets in separate Image elements, such as two portrait photos. Use supported native clipping, rounding, borders and shadows instead of baking those treatments and their positions into one image. Keep a coherent illustration, scene or panoramic background as one asset; do not split its internal details into many layers.

Use genuine logos and verified awards and ratings. Put real app captures in Device elements. Ask for a missing capture or use a clearly identified Device placeholder in the draft.

## Local screenshots

1. Stay inside the repository the user put in scope. Do not scan their home directory or follow links outside it.
2. Look for captures with your own file tools in Fastlane, Expo, Flutter, `screenshots` and asset folders. Skip dependencies and build output. Keep only the image types and file sizes the `create_asset_upload` schema accepts.
3. Show the candidates and ask: **Which screenshots show the key app journey, and in what order?** Confirm the language and devices too. If the user already chose files, use those. Upload only the selected screenshots, never source code, credentials or unrelated assets.
4. Start with one file. Call `create_asset_upload` with its name, MIME type, byte count and `assetType: screenshot`, then use the [complete upload example](#send-the-upload-form). After the upload succeeds, call `complete_asset_upload` with the `uploadId` and use the completed asset's `id` from then on. After the first file completes, continue with the remaining selected files. If the shell blocks outbound network access, request access for the upload and retry the same intent while it is valid.
5. AppScreens checks each file when you complete its upload. If it refuses one, the error says why: fix the request or the file and try again. Do not resize, convert or replace files without asking. If a file needs converting, offer to make a converted copy.

Importing does not render, export or upload to a store. Finish with the project ID and how many screenshots were assigned, plus anything left unassigned.

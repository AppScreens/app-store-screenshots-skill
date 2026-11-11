# Preview App Store and Google Play listings

## Show a store listing preview

- **Browser listing preview:** for "App Store preview", "store listing" or "how does it look in search?", call `get_project`. Open its `storePreviewUrl` and choose the requested store screenshot size and language in **Preview & Export → Preview**. If the link opens on the canvas, open that tab manually. If a matching screenshot output is missing, offer chat images or ask before adding one. To open the standalone preview or add artwork, wait for the two phone previews, then choose **Preview a listing** below them. Confirm the new tab shows the selected project screenshots. The standalone tool has editable artwork and text fields. If you cannot use the signed-in editor, share the project preview link and those steps. Skip server render jobs, exports and screenshot downloads for this workflow.
- **Screenshots in chat:** call `render_project_preview`, wait with `wait_for_operation` using `timeoutSeconds: 25` and the [35-second runner guidance](screenshot-copy.md#wait-efficiently), then use `get_preview_image` to inspect and show the images. Show a contact sheet as returned: one row per language and size, with pages left to right at the same height. These are rendered screenshot pages.

The free [App Store screenshot preview](https://appscreens.com/app-store-screenshot-preview) lets users combine screenshots with an icon, listing text, App Store artwork or a Google Play feature graphic. Use the editor handoff for saved projects. Use the options below for images the customer already has.

- **Universal Creative Asset:** Add the original 5244 × 2950 PNG once under **Creative assets → Universal Creative Asset**. **Use for** defaults to **Both**, or choose **Header** or **Search**. Keep the original image intact and let the preview crop it. Use **Show safe area** to check the design. On a saved project, add the artwork in the standalone tab you already opened so the selected screenshots stay there.
- **Local files:** the helper writes a launcher page to the system temp folder and opens it. The launcher sends the images to the preview tab as Blobs.

  ```text
  node <skill-directory>/scripts/listing-preview.mjs open --root <repository> --file <first.png> --file <second.png> \
    --icon <icon.png> --platform apple --name "<app name>" --subtitle "<subtitle>" \
    --universal-artwork <universal.png> --universal-placement both
  ```

  Pass `--file` once per screenshot, in listing order (up to 10, 20 MB each). `--universal-placement` accepts `both`, `header` or `search`. For dedicated artwork use `--search-artwork` or `--header-artwork`. `--platform google` shows Google Play, where `--search-artwork` is the feature graphic and `--subtitle` is the short description. `--ad` shows the app as an App Store search ad. Add `--no-open` to only write the launcher, then give the user its `launcherUrl`.
- **Images on the web:** `listing-preview.mjs link --universal-artwork-url <https URL> --universal-placement both` prints a link with the listing in its `#preview=` fragment. Add `--screenshot-url` once per screenshot, plus any `--icon-url`, `--search-artwork-url` or `--header-artwork-url` you need. Use web images the customer already has. If `link` returns `temporaryImages`, tell the user when they stop loading. Images that can't load show in red on the preview page, and the user can select them to remove them.
- **Browser handoff:** A `#preview=` link puts the HTTPS image in `universalArtwork` and the placement in `appleUniversalPlacement`. A launcher message can send `universalArtwork` as a top-level Blob or HTTPS URL, with `appleUniversalPlacement` inside `preview`. See the [listing preview examples](https://appscreens.com/developers/guides#listing-preview).

Say what you showed, and point out anything the first three screenshots don't explain.

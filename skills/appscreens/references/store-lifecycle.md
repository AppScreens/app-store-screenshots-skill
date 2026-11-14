# Store upload

Use only the part the user asked for. Making screenshots does not authorize a purchase, a store connection change or a store upload. An upload puts screenshots on an existing store listing; it is not a binary upload, review submission or release. If the user says "publish", ask which they mean: only screenshot delivery is supported here.

Store tools can be turned off separately from editing and exports. If they are missing, offer the finished export instead.

## Account, plan and app

1. Without an account or connection, send the user to sign in to AppScreens in the browser. Never collect passwords, API keys or tokens.
2. Read `get_account_setup`, `get_account_capabilities` and `get_account_usage`. If a plan is needed, show the browser link from `start_subscription_setup`; the customer reviews and buys it there. Never buy for them.
3. Pick the app with `list_apps`, or create its AppScreens record with `create_app`. This does not create the app in App Store Connect or Google Play: the store listing must already exist.

## Connect the store

`list_credentials` lists saved store connections by label, never their secrets. `start_app_credential_setup` returns an AppScreens browser link where the user adds an App Store Connect API key or a Google Play service account key. Keys never go through chat, tool arguments, files or logs.

Once the user picks a saved connection, tell them which app, store and label you will link, then call `link_app_credential`. Check it with `validate_app_credentials`.

For a requested upload, check the intended app and its existing connection before queueing a new export. If the store says the version or listing cannot accept changes, give the returned reason and the next action in App Store Connect or Play Console.

## Export for the store

Follow the export workflow at `appscreens://workflow/export` or [Check and export](screenshot-copy.md#check-and-export). Use `uploadStore: apple` or `uploadStore: android` and explicit pages, sizes and languages for the chosen store. Empty selections expand to all enabled outputs. Wait for the export to succeed. Its operation ID is the export ID. Exports the user made in AppScreens work too: find them with `list_exports`. An export made only for download needs to be exported again for the store.

## Confirm, upload, poll

1. If the listing is unspecified, propose the main listing and ask. Reuse an alternate listing only when the user chooses it for this upload. For Apple artwork, confirm whether it is for the product page header, search results or both. Ask before adding or changing an output to change where artwork appears.
2. Run `preview_store_screenshot_deployment` for each proposed upload. Show the app and store identifier, store, exact listing type and name, languages, sizes or artwork slots, image count, and whether it will **Replace** or **Append**. Compare that result with what the user asked for. If a saved export points to a different listing on retry, stop and explain that another listing needs a new export. A design approval, a general request to deploy, or approval of another upload does not cover this preview. For multiple stores, ask for one yes covering the individual previews.
3. After they say yes, call `deploy_store_screenshots` with the same app, `exportId`, `overwrite`, listing and tablet options, plus an `idempotencyKey` so a repeated call returns the first result. If the files, destination, placement or replacement choice changes, preview again and get a fresh yes.
4. Poll `get_deployment` with the returned `deploymentId`, app and store, following `pollAfterSeconds` (about every 30 seconds). Accepted, processing and uploading are not done. `uploaded` means AppScreens finished the upload; `AWAITING_APPLE_PROCESSING` is Apple's own step and not something to wait on or resend. Never say the screenshots are live or the app was submitted.
5. Send one upload at a time to each app on each store, and cover all the languages and sizes for that store in one export where you can. The same app can upload to App Store Connect and Google Play at the same time, and different apps can run together. Start the next upload to the same app and store once `get_deployment` shows the previous one `uploaded` or `failed`. `AWAITING_APPLE_PROCESSING` counts as uploaded, so Apple's processing does not hold up the next upload. If `deploy_store_screenshots` returns `DEPLOYMENT_IN_PROGRESS`, nothing was sent, so do not retry in a loop. Wait for the running upload to finish: poll it with `get_deployment` if you started it, or ask the user to check it in AppScreens. Then preview again and, if it still matches what the user approved, send it with a new `idempotencyKey`.

If the preview says the project changed after the export, say so: the export's files are what upload. If you cannot verify the exported placement of an Apple Universal Creative Asset, stop and ask. The current project's "Use for" setting does not establish the placement in an older export.

## After screenshot delivery

Give the download or upload result first. For a release job, offer one next step based on the agreed stores and outstanding work. Check whether the user already has the feature graphic required by a new Google Play listing before offering to create it. Offer Apple header and search artwork as optional. Skip the suggestion when the user chose screenshots only, already covered or declined the artwork, or still needs help with the delivery.

If the user wants matching artwork for both stores, offer one editable artwork project with a Google Play Feature Graphic and an Apple Universal Creative Asset set to **Both**. Use `list_render_targets` for the sizes and safe areas. Select the catalogue’s Apple Universal output and add the Play size as a custom output with `storeTarget: "featureGraphic"` via `set_project_settings`. Use the shared brand and art direction, then preview the Google crop and both Apple placements. If the user wants different Apple compositions, use the dedicated placements instead.

Use opaque PNG for the artwork. For download, export the selected artwork page in both sizes together. For direct delivery, prepare one archive per store with the exact artwork page, sizes and languages. Present both previews together for approval, then report each upload’s result separately.

## Apple experiments and custom product pages

To upload to a product page optimization treatment or a custom product page instead of the main listing, call `list_store_listings` for the app and let the user pick one. Pass it as `listing` (`{type, id}`) to both calls and name it when you ask. The rest is the same: confirm, upload, poll. Apple runs the test and reports the results.

If nothing fits, create one in AppScreens rather than on the App Store Connect website:

1. Call `preview_store_listing_creation` with the app, `type` (`custom` for a custom product page, `experiment` for a test) and a `name`. A test also takes `treatmentsCount` (1 to 3, default 2) and `trafficProportion`, the percent of visitors shown a treatment (default 50). Nothing is created.
2. Tell the user what will be created, and name any existing pages or treatments in the preview's `existing` that they could use instead. A refusal says why: a page name already in use, or a test already being prepared (Apple allows one at a time, so offer its treatments).
3. After they say yes, call `create_store_listing` with the `previewId` and an `idempotencyKey`. It returns the new page or treatments (Treatment A, B, C); upload to one as `listing`. If the result is uncertain, read `list_store_listings` before another preview; never create twice.

A new page or test starts in Prepare for Submission. AppScreens does not submit it for review or start the test: tell the user to do that in App Store Connect after the upload.

Google Play store listing experiments cannot be uploaded through the API. Export the variant and guide the user to attach it in Play Console.

## Retries

If an upload failed and `canRetry` is true, upload the same export again with `deploy_store_screenshots`, after asking. A retry goes to the same app and listing with the same Replace or Append setting as the first upload. An `uncertain` deployment must be checked with `get_deployment` first; never send it again blindly.

Finish with the project, export and deployment IDs and the upload state. Restoring a project version does not undo a store upload.

# Recovery

Read this only after something went wrong. Normal work needs none of it.

## A call timed out or the connection dropped

Find out what happened before doing it again:

- **Render or export:** `list_operations` for the project. A repeated preview or export of the same version and selection returns the one still running, so restarting it does not render twice. Once it has finished, a repeat starts a new one.
- **Project edit:** read the project. If its revision moved on and the change is there, it worked. Otherwise send the edit again with the current revision.
- **New project:** `list_projects`. Only create another one if none was made.
- **Upload:** call `complete_asset_upload` again with the same `uploadId`. If the upload had not finished, upload the same file to the same intent again. Do not create a second intent just because the asset is not visible yet.
- **Store change:** repeating the same `previewId`, or a screenshot upload with the same `idempotencyKey`, returns the first result and never writes twice. If the result is uncertain, read the store or the deployment instead of writing again.

To make a REST or CI retry safe without reading first, send the same `Idempotency-Key` header (or `idempotencyKey` argument) on both attempts. Use a new key for a different request.

If a saved preview or export fails with `DEVICE_FRAME_UNAVAILABLE`, the renderer could not load the selected device frame. Keep the operation ID and the reported page and output size. If the user approves a different frame, change the frame and render the new revision. If they need that exact frame, give them the operation ID for support.

## Long imports

For a large import you may need to resume later. Keep a small, non-secret progress file at `.appscreens/imports/<session>.json` with the project ID, the chosen files in order (`path`, `sizeBytes`, `mimeType`, plus `uploadId`, `assetId` and `sha256` as you get them) and any reviewed assignments. On resume, check each saved asset with `get_asset` and read the project again. Before uploading a known file again, compare its SHA-256 with the saved one so a changed file is not uploaded by mistake. Never store signed URLs, form fields or credentials in it.

## Conflicts

- **Revision conflict:** read again and redo the plan. Show the user anything that changed before applying; do not just swap in the new revision.
- **Cursor mismatch** (`PROJECT_READ_CURSOR_MISMATCH`): restart the paginated read from the first page with the same filters.

## Partial store writes

Apple can apply some languages before a later one fails; Google saves nothing unless its result confirms a commit. Read the destination again, then preview only what failed or was not attempted. A deployment marked `uncertain` must be checked with `get_deployment` before any retry. A failed upload with `canRetry: true` is retried by uploading the same export again.

Restoring a project version never undoes a store change, and never restore a whole project to undo a partial import: it could overwrite newer work.

## Stop and hand off

On authorization, account mismatch, quota or invalid-file errors, stop that part of the work and explain what the user needs to do. Keep what already succeeded and report its IDs.

## Plan and usage limits

Use the returned limit and recovery explanation; do not guess plan allowances. For a plan limit or paid feature, explain the limit and what still works, and ask how the customer wants to continue, such as reusing an existing project or choosing a smaller scope. If they ask about plan options, call `start_subscription_setup` and show its plans page link; it purchases nothing. A different plan only helps if it covers the requested work. Never overwrite a draft, remove pages, disable languages or silently shorten a reference set to get around a limit.

For example: “Your plan's project limit has been reached, so no new project was created. Would you like to reuse an existing project, or stop here? I'll leave your work unchanged until you choose.” Include the actual limit returned by AppScreens.

For weekly or monthly API/render allowances, explain the reset time and follow `Retry-After`. If the customer asks about more capacity sooner, explain that a plan change or allowance add-on only helps if it increases that allowance, and show the plans page link from `start_subscription_setup`; service caps can still apply. `get_account_usage`, `get_account_setup` and `start_subscription_setup` remain available after the API allowance is exhausted. Do not repeatedly retry the blocked request. After a plan change, reread account setup and usage before continuing.

A busy render queue, concurrent-job limit, global service capacity or technical maximum is not an upgrade prompt. Follow the returned wait/progress guidance or explain the constraint. Preserve completed work and the agreed page count, sizes and languages until the customer chooses a change.

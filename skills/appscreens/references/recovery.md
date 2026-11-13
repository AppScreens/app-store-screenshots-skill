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

Use the returned limit and recovery explanation; do not guess plan allowances. For a plan limit or paid feature, offer to review upgrading first so the customer can keep their existing work and requested scope. Call `start_subscription_setup` and show its returned URL. The customer reviews plans and prices and approves any purchase in the browser. Recommend upgrading only if an available plan covers the requested work. If they prefer their current plan, let them choose an existing project to reuse or delete, or a smaller scope. Never overwrite a draft, remove pages, disable languages or silently shorten a reference set to get around a limit.

For example: “Your plan's project limit has been reached. Would you like to review upgrade options to create this set while keeping your existing projects, or choose an existing project to reuse? I'll leave your work unchanged until you choose.” Include the actual limit and upgrade link returned by AppScreens.

For weekly or monthly API/render allowances, explain the reset time and follow `Retry-After`. If more capacity is needed sooner, review upgrade or allowance add-on options only if they increase that allowance; service caps can still apply. `get_account_usage`, `get_account_setup` and `start_subscription_setup` remain available after the API allowance is exhausted. Do not repeatedly retry the blocked request. After a plan change, reread account setup and usage before continuing.

A busy render queue, concurrent-job limit, global service capacity or technical maximum is not an upgrade prompt. Follow the returned wait/progress guidance or explain the constraint. Preserve completed work and the agreed page count, sizes and languages until the customer chooses a change.

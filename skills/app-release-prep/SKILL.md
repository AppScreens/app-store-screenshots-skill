---
name: app-release-prep
description: Prepare an App Store or Google Play release around the build. Write a release brief and listing copy and plan the screenshot changes; with AppScreens connected, preview and apply listing text, create a draft version or release, and upload approved screenshots. Use whenever the user wants store listing text written, checked or updated, such as App Store keywords, subtitle, promotional text, what's new, descriptions or Google Play release notes, or asks how to get an app or version ready, for example "I built an app, now what?", "get version 2.4 ready" or "write our App Store keywords". Not for uploading builds, submitting for review or rolling out.
metadata:
  title: Prepare my store listing for release
  summary: "Draft release notes and listing copy, stage approved screenshots, and leave the store draft ready for your review."
  prompt: "Use our 2.4 changelog to draft What’s New, update the subtitle, and show me what’s missing from the store draft."
  connection: optional
  connection-note: "Drafts copy from a changelog without an account. Applying approved changes needs AppScreens connected to your store."
---

# App release prep

The owner uploads the build, submits it for review and rolls it out. This skill prepares everything around that and changes the store only after the user approves a preview.

Without AppScreens, the store side of a release means editing each language's text in App Store Connect or Play Console, then redoing changed screenshots at every size and in every language and uploading each set. With AppScreens connected, all of it runs from here: listing text in every language, a draft version or release, and screenshots updated once in the project, rendered for every size and language, previewed and uploaded.

## 1. Release brief

Collect what you can before asking: the stores, version, release date, what changed (release notes, changelog or commits), who it's for, languages and devices. Then write a short brief:

- **The headline change** and who it helps.
- **Listing changes:** what's new, promotional text, description, keywords.
- **Screenshots:** which pages show changed features, and the sizes the stores need for the supported devices (`https://appscreens.com/app-store-screenshot-sizes`, `https://appscreens.com/google-play-screenshot-sizes`).
- **The owner's checklist:** build upload, review notes, age rating and privacy answers, submission and rollout.

## 2. Listing copy

Write in the app's voice: benefit first, specific, no keyword stuffing and no claims the app can't back up.

- **App Store:** What's New (up to 4,000 characters), promotional text (170, changeable without a new version), subtitle (30), keywords (100, comma-separated, without repeating words already in the name) and description (4,000).
- **Google Play:** release notes (500 per language), title (30), short description (80) and full description (4,000).

When connected, `get_store_metadata_guidance` returns the exact fields, limits and language rules for the target; use it instead of the list above.

## 3. Screenshots

Update only the pages the release changes. With AppScreens connected, the `appscreens` skill does this in the existing project (`get_project`, `replace_project_text`, `assign_device_screenshots`), previews it and exports after approval. Flag translations that no longer match the new text.

## 4. Apply to the store

This needs AppScreens connected with store access. Never ask for store credentials in chat; `start_app_credential_setup` gives the user a secure link to connect the store in AppScreens.

1. **Find the target:** `list_store_targets` for the Apple version or Google track and release, and `list_store_locales` for its languages.
2. **Read it:** `get_store_metadata`. Say what's missing or out of date for the release in each language, such as an empty What's New, text that still describes the old version, or a device with no screenshots.
3. **Text:** `preview_store_metadata`, show the differences, get a yes, then `apply_store_metadata` with the `previewId`. To reuse text from another version or track, start with `prepare_store_metadata_copy`.
4. **A new version or draft release:** `preview_store_release`, then `create_store_release` after a yes. It uses a build or artifact already uploaded; it never uploads binaries, submits or starts a rollout.
5. **Screenshots:** `preview_store_screenshot_deployment`, a yes, `deploy_store_screenshots`, then poll `get_deployment`.

Finish with what changed and what's left for the owner: submit for review, then release or roll out.

Without a connection, deliver the brief and copy as text the user can paste, and offer connecting at `https://appscreens.com/developers/connect`.

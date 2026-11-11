# Copy, edit or restyle an existing project

Open the requested project with `get_project` and keep its saved revision. Read only the settings, pages or elements needed for the change. Preserve copy, captures, page order, sizes and languages outside the request.

## Reuse an existing design

- For a copy adapted to a different app or release scope, [plan screenshot requirements](project-workflows.md#plan-screenshot-requirements) before copying. For a same-scope copy, inherit the existing settings.
- For a separate copy of an owned project, use `duplicate_project`. Keep its source captures and translations unless the customer asks for a clean copy. The copy has new page and element IDs. Read it before editing, and leave the original alone.
- For a whole public template, use `create_project` in template mode. Use `get_template` to check the pages first. Replace sample copy, captures and any sample artwork that is specific to the template app.
- To add one page, use `add_project_screenshot` in duplicate mode for a page in the current project, or template mode with the template ID and source page ID from `get_template`. Use the destination IDs returned by the write.
- For a close match to a finished screenshot or listing design, use the screenshot-reference-match skill or `appscreens://workflow/reference-match`.

## Change only what the customer asked for

- **Caption or capture.** Use `get_project_text` with page or language filters before `replace_project_text`. Use `plan_device_screenshot_import` before bulk `assign_device_screenshots`. Check the actual language and device before applying. For a release refresh, identify the pages that show the changed features first.
- **Output sizes, languages or settings.** Read `get_project_settings`, then send the requested changes with `set_project_settings`. An output size and the Device frame displayed on it are separate choices. Find sizes with `list_render_targets`. Preserve existing sizes and languages unless asked to change them. Check the new outputs for captures and translated copy. Emoji appearance follows the target store unless the customer requests a different project setting.
- **Native layout or style.** Use `get_project_element` for the current element. Use `get_design_contract` with a component and, if useful, a property such as text and decoration. Pass command to inspect an edit operation. Use `apply_project_changes` for the smallest edit and pass the current revision. A full design document is useful for a coordinated edit of one page.

## Restyle

Confirm the look the customer wants and what must stay. Separate layout, styling and content.

- **Match the app's colours.** Read `get_project_design.colors` for the current editable palette. If the app is linked, use `get_app` for its saved brand colours, or use the customer's supplied palette. Replace only the intended colours with `apply_project_changes` operations such as `{"op":"color.replace","from":"#663399","to":"#008577"}`. Validate with the current revision first. Each replacement covers the whole project and preserves opacity, copy, and image pixels. Use targeted background or element edits if the change is for only some pages. Operations run in order, so avoid mapping a replacement colour to another source colour in the same batch.
- **Apply a template layout.** Use `apply_screenshot_layout` with preserve or a reviewed map. It copies geometry only. Read the source IDs with `get_template`. For replace, use `validateOnly: true`, explain what will be removed, and use the returned confirmation token after approval.
- **Match the style of an existing page.** Use `copy_screenshot_settings` within the project with `parts: ["style"]`. This copies the editor’s Match style settings and keeps destination words, captures and image files. Run with `validateOnly: true` first. Explain the `COPY_IMPACT` warning and ask for approval. Style changes apply across languages even with a language filter. Scope any requested content copy to the intended languages and sizes. If the customer also wants layout, explain that missing elements can be added with source content and unmatched elements stay. Use textSettings, deviceScreenshots or all only for requested content replacement, with the returned confirmation token. Report any added or unmatched elements.
- **Apply a new visual theme.** Use an existing template or reference to guide palette, type, backgrounds and native treatments. Preview one page first. Apply the approved direction to the remaining pages within scope. If a detail is unavailable through the tools, explain how to finish it in the editor.

Before a visual change, render the affected pages at the current revision, or keep your latest render of them. After saving, inspect the affected elements and render the same pages, size and language. Compare the before and after renders side by side. Revert any change you did not intend, such as a new background, colour or device scale, with `apply_project_changes` or `restore_project_version`. For broad style changes, check at least one affected page per device family. Report what changed and share the editor link.

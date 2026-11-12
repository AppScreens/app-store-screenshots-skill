# Editable design document

Use this workflow for an authorized layout or styling change to one existing saved screenshot page. It does not prescribe a design, create artwork, register fonts, translate app pixels, or authorize an export or store upload.

## Discover the contract before editing

Check that `get_design_contract`, `export_project_design_document` and `import_project_design_document` are available. Read `get_design_contract` for the current version, component schemas, supported properties, enum values, units, bounds, dependencies and native-only limitations. Use the returned definitions rather than inventing fields or copying a second device/style catalogue into the client. An appearance being a valid enum is not proof that a frame asset exists for a particular render target.

Read project settings and select a screenshot ID from the project. Call `export_project_design_document` with that project and screenshot ID. Keep its revision and editable `document`, approved asset IDs, approved font names and warnings. This bounded export is not the compact `get_project_design` overview and is not raw native project JSON. Keep any account or project content local to the user-authorized task.

## Propose and edit

Inspect the app brief and source captures before drafting copy or layout. Offer design choices when the user has not chosen a direction. The contract describes what the application can represent; it does not select fonts, composition, claims or artistic style for the model.

Edit only requested settings in the exported document. Preserve the version, selected page identity, persistent element IDs and component types. Each returned element carries a native `layer` index. A layer is a vertical stack, as in the editor: the element array order is the stack order, the first element's `y` is the top of the stack and each later element starts where the one above ends, so its `y` is derived and a taller element pushes the rest down. Put elements that should overlap or sit freely in their own layers. Changing layer/order does not change identity. Never generate positional replacement IDs. Missing elements are not an instruction to delete them: the document rejects additions, removals and type changes. Add, duplicate or remove elements with `apply_project_changes` (`element.add`, `element.duplicate`, `element.remove`), then export the page again. A new element is styled like the first element of its type in the project, as the editor's Add Element does; give it an `elementId` to set its text or style in the same call, and assign its screenshots or image with the usual tools. This is how a blank page is built up.

For a change to one element, `apply_project_changes` `element.update` takes the same fields with the same rules, without sending the whole page: `{op: 'element.update', elementId, changes: {location: {x: .1}, title: {align: 'left'}}}`. Objects merge field by field; a colour or gradient, an array or any other value replaces. A field the export leaves out because the element doesn't set it (the editor's default applies, as on a newly added element) may be set; other fields the export leaves out are kept as they are.

Page backgrounds, shape fill and stroke, image frame fill and border, and text decoration take a solid `{rgba}` colour or a two-colour `{gradient}`. Colours in settings, backgrounds and element edits also accept `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `rgb(...)`, `rgba(...)` or `transparent`, including gradient endpoints. Numeric RGBA uses four numbers, not strings: RGB integers 0..255, alpha 0..1. Reads retain the canonical format. Read project and page backgrounds with `get_project_backgrounds` and edit them with `apply_project_changes` `background.set`. One image covers the background across all output sizes and languages. Set its crop alignment with `position`. The project image covers the whole strip of pages, whose ratio changes with each output size: make it at `get_project_backgrounds` `panorama.imageSize` so it fills every strip edge to edge, and keep its motifs inside `panorama.visibleHeight`. A wider image is cut off at the right end of narrower strips. Use an uploaded asset or a `list_library_images` ID. Use `assign_project_images` for image layers and owned app captures for device screenshot slots.

Gradient stops must be ordered between 0 and 1. For a radial gradient, `angle` is the radius percentage, from 1 to 100; for a linear gradient it is degrees. A background image supports `rotation` of 0, 90, 180 or 270. To rotate the existing source, send `image: {rotation: 90}` without an asset ID. Existing library patterns expose colour, opacity, size, spacing and rotation; edit those fields without supplying a style to preserve the registered tile. Creating a new library tile is not supported through this command.

`element.continue` places the matching copy of an element that runs off the left or right edge on the neighbouring page, as the editor's Continue on Screen does.

Read the geometry units and anchor descriptions before changing a rectangle. Fractional widths/heights are canvas fractions, not pixels or percentages written as 80. Pixel layouts retain pixel units. Anchors describe native fitted-content alignment and should not be silently normalized to top-left. Rotation is planar degrees; perspective frame variants are not arbitrary 3D rotation. With the default `boundary: "inside"` a rotated image, device or shape is scaled down until its rotated bounds fit the box, so a tilted wide card draws noticeably smaller; set `boundary: "outside"` to tilt it at full size. Check the `drawn` rectangle that `get_project_element` and `validateOnly` return instead of rendering to measure. Shadows use their described native reference scale, not pixel offsets. Text shadows belong to the relevant text block, and manual size settings must follow the documented size-lock behavior.

For text, `location.anchor` is vertical placement inside its rectangle: `topMiddle`, `middle` or `bottomMiddle`, matching the editor's Floating position. Set horizontal alignment separately with `title.align` and `subtitle.align` (`left`, `center`, `right`). Older text side anchors are accepted and normalised to their equivalent vertical position. Image, device and shape `position` values retain all nine native anchors, shown in the editor's Alignment selector; their Cover controls remain vertical.

For media, use `position` for alignment; `location.anchor` is retained legacy metadata and does not position its content. Set text `fontSizeLock: false` when changing `maxFontSize`. For a new subtitle, set its source text with `text.set` before styling it with `element.update`; these operations can be ordered in one call. Adding a subtitle gives it visible space; with a subtitle, `titleRatio` ranges from 0 to 0.99. New dynamic frame and padding values use the editor's range of 0 to 0.05. Padding colour supports alpha zero for transparency; null restores its default. Existing out-of-range native values are preserved and can be corrected with a supported value.

Use the contract's shared numeric limits for geometry, shadows, highlights and stroke widths. In fractional layouts, positions range from -5 to 5 and dimensions from 0 to 5; pixel layouts retain their separate absolute bounds. New title/subtitle text is limited to 250 characters across all runs, excluding its final Quill newline, and 500 runs per block. Existing longer text is preserved when unchanged; supply a shorter replacement with `text.set` rather than expecting an import to truncate it. Translation writes follow the same caption limit.

Changing a shape to a line through `element.update` applies the editor's visible stroke defaults. Setting a shape stroke or image border adds the editor's default width when it was zero or unset. Supply an explicit width in the same change to override that default. Full design-document imports keep the styles explicitly supplied rather than applying these action defaults.

Use approved asset IDs, and font names already on the page or from `list_fonts`, never source URLs, download tokens, SVG markup, HTML, font-source URLs or invented asset IDs. New captures use the existing signed upload/completion workflow; unsupported font registration or artwork requests require the application-supported handoff. Do not materialize inherited source images into every language or target. Use the existing source-image and assignment tools when that is the intended task.

The first draft preserves unrepresented native settings in the server baseline. Inspect its warnings: global styles, target/locale overrides, unsupported inline formats or the backgrounds from `get_project_backgrounds` may change the visible result. A read-only or unsupported field is not permission to inject it into the document or replace the entire scene. Source-language changes use the existing migration/settings tool, never this composition document.

## Set captions and shared shadows

Pass these operations to `apply_project_changes` with the saved `projectId`, current `baseRevision` and an existing Text element ID. `text.set` takes formatted content, not a plain string. Omitting `language` edits the source language; a blank source subtitle removes it and its translations. `clearFormatting: true` makes this explicit even when the old subtitle has mixed formatting. For other text changes, preserve formatting unless the user wants it replaced.

```json
[
  {"op": "text.set", "elementId": "caption-element", "slot": "title", "value": {"ops": [{"insert": "Reach anyone\n"}]}},
  {"op": "text.set", "elementId": "caption-element", "slot": "subtitle", "value": {"ops": [{"insert": "\n"}]}, "clearFormatting": true},
  {"op": "element.update", "elementId": "caption-element", "changes": {"title": {"shadow": {"global": true}}}}
]
```

Partial shadows keep saved colour, offsets and blur. If the shadow is absent, the editor's defaults supply those fields. `global: true` follows the project shadow; it does not change the project shadow itself.

## Build app UI with Device elements

Check `get_design_contract`'s `limits.maxLayers` before adding independent layers. `addTo: "above"` or `"below"` stacks inside a referenced layer; it does not create another top-level layer. Prefer one artwork asset or a native decoration to many small decorative shapes.

Use [marketing artwork](asset-import.md#marketing-artwork) for complex icons and illustrations: library assets, suitable emoji, or supplied/generated artwork. Keep simple geometry native. Do not turn a graphic into dozens of tiny Shapes to make it editable.

When a user asks for a screenshot set or a remake, choose an editable layout and the native element types for them. Reuse a Device element from the template or add one with `apply_project_changes` using `{op: "element.add", screenshotId, type: "device", elementId}`. For UI with no bezel, set `changes: {frame: "none"}` on that Device with `element.update`. Use the saved revision, `plan_device_screenshot_import` and `assign_device_screenshots` to assign the clean captures to the right device and language. This keeps the frame and capture independently replaceable.

Treat a general request to generate images as a request for artwork. Generate separate assets sized for their placement. Keep photos, logos and generated cutouts as Image elements, captions as Text and simple graphics as Shapes. Use finished store screenshots as design references. If the clean app captures are missing, ask for them or leave the native Device slots unassigned and say what is missing. Use `element.update` with `changes: {blankWhenEmpty: true}` for a plain dark screen. Real captures take over when assigned. Use a flattened phone crop as app UI only for an explicitly requested visual mockup.

For a photo card, set the Image element's `cornerRadius`, and add `border`/`borderWidth`, or `fill` with `padding` to sit the image on a coloured card. All are percentages of the image's shortest visible edge. A rounded or framed width-cover image is clipped to its box.

For an SVG Image, use `svgOverlayColor`, `svgStrokeColor` and `svgStrokeWidth`. Colours can be solid or two-stop gradients. Width is a fraction of full canvas height: 0.01 means 1%, up to 0.2. Setting a stroke paint initializes a 1% width only when the existing width is zero or unset; an explicit width takes precedence. Null clears an override and restores the source artwork's colours. These controls affect SVG sources only; raster images keep their pixels. The SVG uses the image's existing `shadow`. Glass is not an available control.

Before previewing newly built pages that show app UI, read the saved layers with `list_project_elements` and verify the planned Device elements are present. Report any unfilled captures when you show the draft.

## Map display devices

Use the default display for each output size when it fits. To change the display for the set, read `get_project_settings` and send `set_project_settings` with the current revision and `patch.targets.targetOverrides`. Map the output size ID to the display device ID and include existing entries for other sizes because the supplied map replaces the old one. `list_render_targets` lists the IDs and available frames.

Check `canvas.screenshotLimit` before adding pages. This is the project's selected maximum, alongside the account's plan allowance. Increase it through `set_project_settings` when the plan permits, or remove a page before adding another. Lowering the limit leaves existing pages in place; a complete project clone keeps its existing contents, while further page additions must fit the selected limit.

Leave each device layer inheriting the project mapping. Use its `displayDevices` only when requested or when that layer needs another device, such as a watch on a phone page. A layer's output-specific entry takes priority over its `global` entry, and either overrides the project mapping.

When editing an existing layer, leave `displayDevices` unchanged unless the request affects its display. When changing it, send the entries you want to keep. Send `[]` only to clear all overrides on that layer. If a project mapping does not appear in preview, check the affected layers for existing overrides. For a missing capture, use `get_project_source_images` to check saved assignments and `plan_device_screenshot_import` to find the right display and language for new assignments.

## Add an editable laurel badge

Use the editor's Text decoration for an award caption, rating wreath or similar badge. Start with Compact Tight for short captions and use a wider compact style when the text needs more room. Read `get_design_contract` with `{"component":"text","property":"decoration"}` for the exact native options. Get the page ID and current revision, then pass these operations to `apply_project_changes` with that `projectId` and `baseRevision`. Replace the page ID and caption, and choose an unused element ID. Use a verified award or rating supplied by the user.

```json
[
  {"op": "element.add", "screenshotId": "selected-page", "type": "text", "elementId": "award-badge", "addTo": "layer"},
  {"op": "text.set", "elementId": "award-badge", "slot": "title", "value": {"ops": [{"insert": "Award name\n"}]}},
  {"op": "text.set", "elementId": "award-badge", "slot": "subtitle", "value": {"ops": [{"insert": "\n"}]}, "clearFormatting": true},
  {"op": "element.update", "elementId": "award-badge", "changes": {"decoration": "laurelCompactTight", "title": {"align": "center"}}}
]
```

`addTo: "layer"` lets the badge sit independently of the other elements. Clearing the subtitle removes any default placeholder. For an existing text box, use its ID with `element.update`. Check `get_project_element` for the saved decoration and preview the page to verify fit and contrast. Set `decoration` to `"none"` to clear it.

## Find a native control

Read `get_design_contract` with the component and the top-level property you need, or pass an edit command such as `{"command":"element.add"}`. Read the complete contract when working with a full design document.

- **Award laurels, caption badges and quote bubbles:** Text decoration. Use an Image element for supplied badge artwork.
- **Frameless app UI:** Device with frame set to none. Assign a real capture.
- **Background that flows across pages:** The project panoramic background (`background.set` scope `project`): a gradient, a waves or gradient library image, or one image made at `get_project_backgrounds` `panorama.imageSize`. Clear page paints that cover it. Page Shapes or Images placed to meet at page edges only line up at the output size they were drawn for.
- **One element that crosses a page edge:** Place it on one page and use `element.continue` for the matching half.
- **Plain accent shapes:** Use a native Shape so size, colour and rotation remain editable.

## Save and inspect

Submit `import_project_design_document` once with the selected IDs, the edited `document` and the current `baseRevision`. Inspect the returned warnings and affected IDs. Use `validateOnly: true` first only if the user wants to see the effect before saving.

The response has the new revision. Export the page again to confirm the saved state, and preview it when rendering is part of the task. Check the actual images for fit, inherited overrides and clipping, and adjust through the same document. If the revision conflicts, read the latest saved page and review the change before retrying.

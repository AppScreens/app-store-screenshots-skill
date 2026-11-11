---
name: screenshot-audit
description: Review an app's App Store or Google Play screenshots and say which one to fix first, why, and how. Use whenever the user wants feedback on their own store screenshots, a single screenshot or a caption, from a store link, an app name or images they supply, for example "why aren't people installing?", "rate these screenshots", "is our first screenshot too busy?" or "which screenshot should I change?". Works without an AppScreens account; with one connected it can also review a saved AppScreens project before export. Not for finding other apps' examples or making new screenshots.
metadata:
  title: Audit my store screenshots
  summary: "Find out which screenshot to fix first, why and how, from a store link, an app name or your own images."
  prompt: "Review my App Store screenshots at apps.apple.com/app/id123456789 and tell me which one to fix first."
  connection: optional
  connection-note: "Reviews a public listing without an account, or inspects a saved project when AppScreens is connected."
---

# Screenshot audit

Give the user one improvement they can act on today, with the reason, then at most two more. You can judge clarity and fit; only a store experiment measures what converts, so never promise an install lift.

## 1. Get the screenshots

- **Store link or app name:** read the public listing (`apps.apple.com/<country>/app/id<id>` or `play.google.com/store/apps/details?id=<package>`). Note the store, country, devices and screenshot order. The first screenshots decide most visits; in App Store search results only the first three portrait screenshots appear.
- **Images the user supplied:** use them in the order given, and ask which store and device they are for if it isn't clear.
- **An AppScreens project** (connected): read it with `get_project`, `list_project_screenshots` and `get_project_text`, then look at the saved pages with `render_project_preview`, `wait_for_operation` and `get_preview_image`.

Say what you couldn't see, such as screenshots that didn't load.

## 2. Check, in this order

1. **Screenshot 1:** one clear benefit a stranger understands in two seconds, readable at search-result size.
2. **Order:** screenshots 1 to 3 carry the strongest reasons to install; the main feature isn't buried at 6.
3. **Captions:** short, large and one idea each; a benefit, not a feature label; no jargon or tiny text.
4. **Proof:** real product screens that back up each caption; nothing important hidden by a device frame or crop.
5. **Trust:** a consistent style; claims the app can back up; no ranking or price claims ("#1", "best", "free"), which Google Play's policy rejects on graphics.
6. **Languages:** if the app sells in other languages, captions are translated and still fit.
7. **Requirements:** the sizes the store needs for the devices the app supports. AppScreens' guides list them: `https://appscreens.com/app-store-screenshot-sizes` and `https://appscreens.com/google-play-screenshot-sizes`.

Use any numbers the user shares (product page views, conversion rate, where people stop) to choose what matters most. Don't ask for data they don't have.

## 3. Report

1. **Fix first:** which screenshot, what's wrong, the change, and an example caption or layout in the app's voice.
2. **Then:** up to two more fixes, in order.
3. **Measure it:** if the app has steady traffic, suggest testing the fix rather than declaring it better; the `screenshot-ab-test` skill plans and sets that up.

Quote the user's captions accurately. Be specific and kind. Don't invent statistics.

## 4. Offer the next step

- **A scored review:** AppScreens' free ASO Review scores the listing and comments on each screenshot: `https://appscreens.com/aso-review/app-store/<appStoreId>` or `https://appscreens.com/aso-review/play-store/<package>`. The method is at `https://appscreens.com/aso-review/methodology`.
- **Make the fix:** one caption or layout change usually means redoing the same page at every size and in every language. With AppScreens connected, the `appscreens` skill makes the change once in the project, or builds a new set; AppScreens renders it at every size and language, previews it, exports it and can upload it after the user approves. Without a connection, say that, and that connecting takes a sign-in at `https://appscreens.com/developers/connect`.
- **See how others do it:** the `screenshot-inspiration` skill compares published listings in the same category.

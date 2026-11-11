---
name: screenshot-ab-test
description: Plan and set up A/B tests and campaign pages for app store screenshots. Choose the one change to test, build the variant, and with AppScreens connected create an Apple product page optimization test or custom product page and upload to it. Use whenever the user asks about testing store screenshots or listings, including what to test, how long to run a test, how much traffic it needs and how to read the result, for example "should I test the headline or the order?", "how long should my Play store listing experiment run?" or "make a custom product page for my Apple Ads campaign". Google Play experiments are prepared here and finished in Play Console. Not for one-off design reviews.
metadata:
  title: A/B test my screenshots
  summary: "Choose the one change worth testing and build the variant, then set up an Apple product page optimization test or custom product page."
  prompt: "Set up an App Store test of a new first-screenshot headline against my current screenshots."
  connection: optional
  connection-note: "Plans a test without an account. Building the variant, creating the Apple test or page and uploading to it need AppScreens connected."
---

# Screenshot A/B tests and campaign pages

AppScreens builds the variants; Apple or Google runs the test and measures it. Never claim AppScreens measures conversion or picks a winner.

Setting a test up by hand means a copy of every screenshot at every size and in every language for each treatment, then creating the test and uploading each set in App Store Connect. With AppScreens connected, every step up to the owner's submission runs from here: duplicate the control, change one idea, preview both, export, create the Apple test or custom product page and upload to it. Without a connection, plan the test (part 1) and offer connecting at `https://appscreens.com/developers/connect` for the rest.

## 1. Plan the test

This part needs no connection.

- **One change per variant**, most likely to matter first: the screenshot 1 headline, the order of the first three, the visual style, then device framing.
- **The hypothesis:** what changes and why it should help, for example "a benefit headline on screenshot 1 makes the app clearer in search results".
- **Control and challenger:** the live screenshots are the control. Up to three challengers on Apple.
- **Where it runs:**
  - **Apple product page optimization:** up to three treatments against the original page, at a traffic share you choose, for up to 90 days. Treatments need App Review approval before the test starts, and one test can be in preparation at a time.
  - **Apple custom product pages:** separate pages, each with its own link, for a campaign or audience (for example an Apple Ads ad group). Compare them in App Analytics; they are not a split test on their own.
  - **Google Play store listing experiments and custom store listings:** set up in Play Console, which has no API for them.
- **Success:** the store's conversion rate (installs from product page views) for the tested traffic. Agree in advance how long to run and what difference matters. Say plainly when an app's traffic is too low to reach a result.

## 2. Build the variant

With AppScreens connected, check `get_account_capabilities` first.

1. Duplicate the control with `duplicate_project` and name the copy clearly, such as "CookBook - Test B - Benefit headline". Never edit the control.
2. Make the one change: captions with `replace_project_text`, order, layout or colour with `apply_project_changes`.
3. Preview control and variant the same way (`render_project_preview`, `wait_for_operation`, `get_preview_image`), show them side by side and say exactly what changed.
4. After the user approves, export with `start_project_export` and wait with `wait_for_operation`.

## 3. Create the test or page and upload (Apple)

This needs store deployment access on the connection.

1. Call `list_store_listings`. If an existing treatment or custom product page fits, use it.
2. Otherwise call `preview_store_listing_creation`: `experiment` with a name, treatments and traffic share, or `custom` with a name. Show the preview and get a yes, then call `create_store_listing` with its `previewId`. If Apple already has a test in preparation, offer its treatments instead of a second test.
3. Call `preview_store_screenshot_deployment` with the export and the treatment or page as `listing`. Get a yes, call `deploy_store_screenshots`, then poll `get_deployment`.
4. Hand off: the user submits the test or page for review in App Store Connect and starts the test once it's approved. Nothing goes live before that.

For Google Play, export the variant, then guide the user to attach it to a store listing experiment or custom store listing in Play Console.

## 4. Read the result

When the test ends, use what the store reports: App Store Connect's results and confidence, or Play Console's experiment results. Don't call a test early or on small numbers. If a treatment wins, the user applies it to the main page in the store console. Then plan the next single change.

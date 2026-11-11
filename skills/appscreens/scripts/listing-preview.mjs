#!/usr/bin/env node
// Shows screenshots in the free AppScreens App Store and Google Play listing preview without uploading them.
// `link` prints a preview URL for https images. `open` writes a local launcher page that sends local files to the preview.
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {lstat, readFile, realpath, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const PREVIEW_PATH = '/app-store-screenshot-preview';
export const MESSAGE = 'appscreens.listing-preview';
export const READY = 'appscreens.listing-preview.ready';
export const APPLIED = 'appscreens.listing-preview.applied';
export const LIMITS = {screenshots: 10, imageBytes: 20 * 1024 * 1024, totalBytes: 100 * 1024 * 1024, textLength: 200};
const IMAGE_TYPES = {png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif'};
/** Single images: the flag for a local file in `open`, and for an https URL in `link`. */
const IMAGE_FLAGS = {
    icon: ['icon', 'icon-url'],
    searchArtwork: ['search-artwork', 'search-artwork-url'],
    headerArtwork: ['header-artwork', 'header-artwork-url'],
    universalArtwork: ['universal-artwork', 'universal-artwork-url']
};
const TEXT_FLAGS = {name: 'appName', subtitle: 'subtitle', developer: 'developer', category: 'category',
    rating: 'rating', 'rating-count': 'ratingCount', search: 'searchQuery'};

function check(condition, message) {
    if (!condition) { throw new Error(message); }
}

function httpsUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.username && !url.password;
    } catch { return false; }
}

/** When a signed image URL stops loading (Google Cloud Storage, Amazon S3 or CloudFront style), or null. Matches the preview page. */
export function urlExpiry(value) {
    let params;
    try { params = new URL(value).searchParams; } catch { return null; }
    const read = name => [...params].find(([key]) => key.toLowerCase() === name)?.[1] || '';
    const signed = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(read('x-goog-date') || read('x-amz-date'));
    const lifetime = Number(read('x-goog-expires') || read('x-amz-expires'));
    if (signed && lifetime > 0) {
        const [, year, month, day, hour, minute, second] = signed.map(Number);
        return Date.UTC(year, month - 1, day, hour, minute, second) + lifetime * 1000;
    }
    const expires = Number(read('expires'));
    return expires > 1e9 ? expires * 1000 : null;
}

function previewOrigin(value = 'https://appscreens.com') {
    const url = new URL(value);
    const local = ['localhost', '127.0.0.1'].includes(url.hostname);
    check((url.protocol === 'https:' || (local && url.protocol === 'http:')) && url.pathname === '/' && !url.search && !url.hash && !url.username,
        'The origin must be https://appscreens.com or a local development origin.');
    return url.origin;
}

/** The listing fields, checked the same way as the preview page checks them. */
export function previewInput(options) {
    const input = {};
    if (options.platform !== undefined) {
        check(['apple', 'google'].includes(options.platform), 'Use --platform apple or google.');
        input.platform = options.platform;
    }
    if (options.view !== undefined) {
        check(['search', 'detail'].includes(options.view), 'Use --view search or detail.');
        input.view = options.view;
    }
    const placement = options['universal-placement'];
    if (placement !== undefined) {
        check(['both', 'header', 'search'].includes(placement), 'Use --universal-placement both, header or search.');
        input.appleUniversalPlacement = placement;
    }
    for (const [flag, field] of Object.entries(TEXT_FLAGS)) {
        if (options[flag] !== undefined) { input[field] = options[flag].replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, LIMITS.textLength); }
    }
    if (options.ad) { input.searchAd = true; }
    return input;
}

/** A link with the listing in its #preview= fragment, which browsers never send to the server. */
export function previewLink({origin, input, images = {}, screenshots = []}) {
    check(screenshots.length <= LIMITS.screenshots, `Use at most ${LIMITS.screenshots} screenshots.`);
    const set = Object.fromEntries(Object.entries(images).filter(([, url]) => url !== undefined));
    for (const url of [...Object.values(set), ...screenshots]) { check(httpsUrl(url), `Not an https image URL: ${url}`); }
    const preview = {...input, ...set, ...(screenshots.length ? {screenshots} : {})};
    const encoded = Buffer.from(JSON.stringify(preview)).toString('base64url');
    return `${previewOrigin(origin)}${PREVIEW_PATH}#preview=${encoded}`;
}

async function localImage(root, relative) {
    check(typeof relative === 'string' && relative && !path.isAbsolute(relative) && !relative.includes('\\') &&
        relative.split('/').every(segment => segment && segment !== '.' && segment !== '..'), 'Provide a relative file path within --root.');
    const type = IMAGE_TYPES[path.extname(relative).slice(1).toLowerCase()];
    check(type, `Use PNG, JPEG, WebP or GIF images: ${relative}`);
    let current = root;
    for (const segment of relative.split('/')) {
        current = path.join(current, segment);
        check(!(await lstat(current)).isSymbolicLink(), 'Symbolic links are not allowed.');
    }
    const filename = await realpath(current);
    check(path.relative(root, filename) && !path.relative(root, filename).startsWith('..'), 'The file must remain within --root.');
    const info = await lstat(filename);
    check(info.isFile() && info.size > 0 && info.size <= LIMITS.imageBytes, `Images must be regular files up to 20 MB: ${relative}`);
    return {name: path.basename(relative), dataUrl: `data:${type};base64,${(await readFile(filename)).toString('base64')}`, bytes: info.size};
}

/** A self-contained page that opens the preview and posts the images to it as Blobs. Nothing is uploaded. */
export function launcherHtml({origin, input, images = {}, screenshots}) {
    const config = {origin: previewOrigin(origin), path: PREVIEW_PATH, message: MESSAGE, ready: READY, applied: APPLIED, preview: input,
        images: Object.fromEntries(Object.entries(images).map(([field, image]) => [field, image.dataUrl])),
        screenshots: screenshots.map(image => image.dataUrl)};
    const json = JSON.stringify(config).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>AppScreens listing preview</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#18181b;color:#ede9fe;font:16px/1.6 system-ui,sans-serif}
main{max-width:30rem;padding:2rem;text-align:center}h1{font-size:1.5rem;margin:0 0 .5rem}p{color:#d4d4d8}
button{margin-top:1rem;border:0;border-radius:.5rem;padding:.6rem 1rem;background:#7c3aed;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer}</style>
</head><body><main><h1>${screenshots.length} screenshot${screenshots.length === 1 ? '' : 's'} ready to preview</h1>
<p id="status">Opening the AppScreens preview. Your images go straight to that tab and are not uploaded.</p>
<button id="open" type="button">Open preview</button></main>
<script>
const config = ${json};
const status = text => document.getElementById('status').textContent = text;
const blob = url => {
  const comma = url.indexOf(',');
  const bytes = Uint8Array.from(atob(url.slice(comma + 1)), character => character.charCodeAt(0));
  return new Blob([bytes], {type: url.slice(5, url.indexOf(';'))});
};
let preview = null;
function openPreview() {
  preview = window.open(config.origin + config.path, 'appscreens-listing-preview');
  status(preview ? 'Waiting for the preview to load…' : 'Your browser blocked the new tab. Select Open preview.');
}
window.addEventListener('message', event => {
  if (event.origin !== config.origin || event.source !== preview || !event.data) return;
  if (event.data.type === config.ready) {
    const images = Object.fromEntries(Object.entries(config.images).map(([field, url]) => [field, blob(url)]));
    preview.postMessage({type: config.message, preview: config.preview, ...images,
      screenshots: config.screenshots.length ? config.screenshots.map(blob) : undefined}, config.origin);
  } else if (event.data.type === config.applied) {
    status('Sent to the preview. You can close this tab.');
  }
});
document.getElementById('open').addEventListener('click', openPreview);
openPreview();
</script></body></html>
`;
}

function openInBrowser(filename) {
    const [command, args] = process.platform === 'darwin' ? ['open', [filename]]
        : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', filename]] : ['xdg-open', [filename]];
    return new Promise(resolve => {
        const child = spawn(command, args, {detached: true, stdio: 'ignore'});
        child.on('error', () => resolve(false));
        child.on('spawn', () => { child.unref(); resolve(true); });
    });
}

function parseArgs(flags, allowed, repeated) {
    const options = {};
    for (let index = 0; index < flags.length; index++) {
        const flag = flags[index];
        check(flag.startsWith('--'), `Unexpected argument: ${flag}`);
        const key = flag.slice(2);
        if (key === 'no-open' || key === 'ad') { options[key] = true; continue; }
        check(allowed.includes(key) || repeated.includes(key), `Unknown option: ${flag}`);
        const value = flags[++index];
        check(typeof value === 'string' && !value.startsWith('--'), `Provide a value for ${flag}.`);
        if (repeated.includes(key)) { (options[key] ||= []).push(value); } else {
            check(!Object.hasOwn(options, key), `Use ${flag} once.`);
            options[key] = value;
        }
    }
    return options;
}

export async function main(args) {
    const [command, ...flags] = args;
    const common = ['origin', 'platform', 'view', 'universal-placement', ...Object.keys(TEXT_FLAGS)];
    if (command === 'link') {
        const options = parseArgs(flags, [...common, ...Object.values(IMAGE_FLAGS).map(([, url]) => url)], ['screenshot-url']);
        const images = Object.fromEntries(Object.entries(IMAGE_FLAGS).map(([field, [, flag]]) => [field, options[flag]]));
        const url = previewLink({origin: options.origin, input: previewInput(options), images, screenshots: options['screenshot-url']});
        const temporary = [...Object.values(images), ...(options['screenshot-url'] || [])].filter(Boolean)
            .map(image => ({url: image, expiresAt: urlExpiry(image)})).filter(image => image.expiresAt);
        if (!temporary.length) { return {url}; }
        return {url, temporaryImages: temporary.map(image => ({url: image.url, expiresAt: new Date(image.expiresAt).toISOString()})),
            warning: 'These images use signed links that stop loading at expiresAt, and the preview then shows them as unavailable. ' +
                'Download them and use open instead, or use lasting https URLs.'};
    }
    check(command === 'open', 'Use link or open.');
    const options = parseArgs(flags, [...common, 'root', ...Object.values(IMAGE_FLAGS).map(([file]) => file)], ['file']);
    check(options.root, 'Provide --root PATH.');
    const files = options.file || [];
    const imageFiles = Object.entries(IMAGE_FLAGS).filter(([, [flag]]) => options[flag]);
    check(files.length || imageFiles.length, 'Provide --file for each screenshot, in listing order.');
    check(files.length <= LIMITS.screenshots, `Use at most ${LIMITS.screenshots} screenshots.`);
    const root = await realpath(path.resolve(options.root));
    const screenshots = [];
    for (const file of files) { screenshots.push(await localImage(root, file)); }
    const images = {};
    for (const [field, [flag]] of imageFiles) { images[field] = await localImage(root, options[flag]); }
    check([...Object.values(images), ...screenshots].reduce((total, image) => total + image.bytes, 0) <= LIMITS.totalBytes, 'The images are larger than 100 MB together.');
    const launcher = path.join(os.tmpdir(), `appscreens-listing-preview-${randomUUID()}.html`);
    await writeFile(launcher, launcherHtml({origin: options.origin, input: previewInput(options), images, screenshots}), {mode: 0o600, flag: 'wx'});
    const opened = options['no-open'] ? false : await openInBrowser(launcher);
    return {launcher, launcherUrl: pathToFileURL(launcher).href, screenshots: screenshots.length, images: Object.keys(images), opened};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    main(process.argv.slice(2)).then(result => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)).catch(error => {
        process.stderr.write(`${JSON.stringify({error: error.message})}\n`);
        process.exitCode = 1;
    });
}

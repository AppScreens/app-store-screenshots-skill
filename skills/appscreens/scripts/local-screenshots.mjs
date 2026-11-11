#!/usr/bin/env node
import {createHash, randomUUID} from 'node:crypto';
import {constants} from 'node:fs';
import {lstat, mkdir, open, opendir, realpath, rename, unlink} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const DISCOVERY_LIMITS = {maxEntries: 20000, maxFiles: 500, maxDepth: 12};
const IGNORED_DIRECTORIES = new Set([
    '.git', '.svn', '.hg', 'node_modules', 'vendor', 'Pods', '.gradle', '.dart_tool',
    '.expo', '.next', '.nuxt', '.cache', '.turbo', '.appscreens', 'build', 'dist', 'coverage'
]);
const MAX_INPUT_BYTES = 1024 * 1024;
const MAX_LOCAL_FILE_BYTES = 256 * 1024 * 1024;
const SHA256 = /^[a-f0-9]{64}$/;

function check(condition, message) {
    if (!condition) { throw new Error(message); }
}

function object(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value, max = 1000) {
    return typeof value === 'string' && value.length > 0 && value.length <= max && !/[\x00-\x1f\x7f]/.test(value);
}

function relativeFile(value) {
    return text(value) && !path.isAbsolute(value) && !value.includes('\\') &&
        value.split('/').every(segment => segment && segment !== '.' && segment !== '..');
}

function contained(root, filename) {
    const relative = path.relative(root, filename);
    return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative);
}

async function repositoryRoot(input) {
    const resolved = path.resolve(input);
    check((await lstat(resolved)).isDirectory(), 'The root must be a regular directory, not a symbolic link.');
    return realpath(resolved);
}

async function localFile(root, relative) {
    check(relativeFile(relative), 'Provide a relative file path within the repository.');
    const filename = path.join(root, relative);
    let current = root;
    for (const segment of relative.split('/')) {
        current = path.join(current, segment);
        check(!(await lstat(current)).isSymbolicLink(), 'Symbolic links are not allowed.');
    }
    check(contained(root, await realpath(filename)), 'The file must remain within the repository.');
    return filename;
}

export function imageMimeType(filename) {
    const extension = path.extname(filename).slice(1).toLowerCase();
    return extension ? `image/${extension === 'jpg' ? 'jpeg' : extension}` : '';
}

function sourceHint(relative, markers) {
    const segments = relative.toLowerCase().split('/');
    if (segments.includes('fastlane')) { return 'fastlane'; }
    if (segments.some(segment => segment === 'screenshots' || segment === 'screenshot')) { return 'screenshots'; }
    if (segments.some(segment => segment === 'assets' || segment === 'images')) {
        return markers.expo ? 'expo-assets' : markers.flutter ? 'flutter-assets' : 'project-assets';
    }
    return 'repository-image';
}

async function hasMarker(root, name) {
    try { return (await lstat(path.join(root, name))).isFile(); } catch { return false; }
}

export async function discover({root, mimeTypes, maxBytes, limits = DISCOVERY_LIMITS}) {
    root = await repositoryRoot(root);
    check(Array.isArray(mimeTypes) && mimeTypes.length > 0 && mimeTypes.every(mime => /^image\/[a-z0-9.+-]+$/.test(mime)),
        'Provide MIME types from the live create_asset_upload schema.');
    check(Number.isSafeInteger(maxBytes) && maxBytes > 0, 'Provide the byte limit from the live create_asset_upload schema.');
    const accepted = new Set(mimeTypes);
    const markers = {
        expo: (await Promise.all(['app.json', 'app.config.js', 'app.config.ts'].map(name => hasMarker(root, name)))).some(Boolean),
        flutter: await hasMarker(root, 'pubspec.yaml')
    };
    const files = [];
    const warnings = new Set();
    let entries = 0;
    let stopped = false;
    async function walk(directory, depth) {
        let children;
        try {
            check((await lstat(directory)).isDirectory(), 'Directory changed.');
            const resolved = await realpath(directory);
            check(resolved === root || contained(root, resolved), 'Directory escaped the repository.');
            children = [];
            for await (const child of await opendir(directory)) {
                children.push(child);
                if (children.length > limits.maxEntries - entries) { break; }
            }
        }
        catch { warnings.add(`Could not read directory: ${path.relative(root, directory) || '.'}`); return; }
        children.sort((a, b) => a.name.localeCompare(b.name));
        for (const child of children) {
            if (stopped) { return; }
            if (++entries > limits.maxEntries) {
                warnings.add(`Discovery truncated at ${limits.maxEntries} entries.`); stopped = true; return;
            }
            const filename = path.join(directory, child.name);
            const relative = path.relative(root, filename).split(path.sep).join('/');
            if (child.isSymbolicLink()) { warnings.add(`Skipped symbolic link: ${relative}`); continue; }
            if (child.isDirectory()) {
                if (IGNORED_DIRECTORIES.has(child.name)) { continue; }
                if (depth >= limits.maxDepth) { warnings.add(`Depth limit reached: ${relative}`); continue; }
                await walk(filename, depth + 1);
            } else if (child.isFile() && accepted.has(imageMimeType(child.name))) {
                try {
                    const metadata = await lstat(filename);
                    if (!metadata.isFile()) { continue; }
                    if (metadata.size <= 0 || metadata.size > maxBytes) {
                        warnings.add(`Skipped file outside the upload byte limit: ${relative}`); continue;
                    }
                    files.push({path: relative, sizeBytes: metadata.size, mimeType: imageMimeType(child.name),
                        source: sourceHint(relative, markers)});
                    if (files.length >= limits.maxFiles) {
                        warnings.add(`Discovery truncated at ${limits.maxFiles} files.`); stopped = true; return;
                    }
                } catch { warnings.add(`Could not inspect file: ${relative}`); }
            }
        }
    }
    await walk(root, 0);
    return {files, warnings: [...warnings]};
}

function signedUpload(intent) {
    check(object(intent) && text(intent.uploadId, 200) && text(intent.assetId) && object(intent.upload) &&
        object(intent.constraints), 'Invalid upload intent.');
    const {upload, constraints} = intent;
    check(upload.method === 'POST' && object(upload.fields), 'Expected a signed POST upload.');
    let url;
    try { url = new URL(upload.url); } catch { throw new Error('Invalid signed upload destination.'); }
    const trustedHost = url.hostname === 'storage.googleapis.com' ||
        /^[a-z0-9][a-z0-9.-]*\.storage\.googleapis\.com$/.test(url.hostname);
    check(url.protocol === 'https:' && trustedHost && !url.username && !url.password && !url.port && !url.hash,
        'The upload destination must be a trusted HTTPS Google Storage endpoint.');
    check(Number.isSafeInteger(constraints.maxBytes) && constraints.maxBytes > 0 &&
        constraints.maxBytes <= MAX_LOCAL_FILE_BYTES && /^image\/[a-z0-9.+-]+$/.test(constraints.mimeType),
    'Invalid upload constraints.');
    check(text(upload.fields.key) && !upload.fields.key.includes('${') && upload.fields['Content-Type'] === constraints.mimeType,
        'The signed object path and MIME type must be exact.');
    check(Object.entries(upload.fields).every(([key, value]) => text(key, 200) && key.toLowerCase() !== 'file' &&
        typeof value === 'string' && value.length <= MAX_INPUT_BYTES), 'Invalid signed upload fields.');
    check(Number.isFinite(Date.parse(intent.expiresAt)) && Date.parse(intent.expiresAt) > Date.now(), 'The upload intent has expired.');
    return {upload, constraints, relay: relayDestination(intent)};
}

// The API host forwards the same signed form to Google Storage, for sandboxes that can reach AppScreens but not Google Storage.
function relayDestination(intent) {
    if (intent.upload.relayUrl === undefined) { return null; }
    let url;
    try { url = new URL(intent.upload.relayUrl); } catch { throw new Error('Invalid upload relay destination.'); }
    check(url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.hash && !url.search &&
        url.pathname === `/asset-uploads/${intent.uploadId}`, 'The upload relay must be the AppScreens upload path for this intent.');
    return url.href;
}

async function readLocalImage(root, file, maxBytes, expectedSize) {
    const filename = await localFile(root, file);
    const handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW);
    let bytes;
    try {
        const before = await handle.stat();
        check(before.isFile() && before.size > 0 && before.size <= maxBytes &&
            (expectedSize === undefined || before.size === expectedSize),
        'The selected file has changed or does not match the declared size or byte limit.');
        bytes = Buffer.alloc(before.size);
        let offset = 0;
        while (offset < bytes.length) {
            const result = await handle.read(bytes, offset, bytes.length - offset, offset);
            if (!result.bytesRead) { break; }
            offset += result.bytesRead;
        }
        const after = await handle.stat();
        const current = await lstat(await localFile(root, file));
        check(offset === bytes.length && before.size === after.size && before.mtimeMs === after.mtimeMs &&
            before.ctimeMs === after.ctimeMs && after.ino === current.ino && after.dev === current.dev,
        'The selected file changed while being read.');
    } finally { await handle.close(); }
    return bytes;
}

export async function fingerprintFile({root, file, maxBytes}) {
    check(Number.isSafeInteger(maxBytes) && maxBytes > 0 && maxBytes <= MAX_LOCAL_FILE_BYTES,
        'Provide the byte limit from the live upload schema.');
    root = await repositoryRoot(root);
    const bytes = await readLocalImage(root, file, maxBytes);
    return {path: file, sha256: createHash('sha256').update(bytes).digest('hex'), sizeBytes: bytes.length};
}

function uploadRequestFailure(error) {
    if (error?.name === 'TimeoutError') return 'request timed out';
    switch (error?.cause?.code ?? error?.code) {
        case 'EPERM':
        case 'EACCES':
            return 'outbound network access denied';
        case 'ENOTFOUND':
        case 'EAI_AGAIN':
            return 'could not resolve the host';
        case 'ETIMEDOUT':
        case 'UND_ERR_CONNECT_TIMEOUT':
            return 'connection timed out';
        case 'ECONNREFUSED':
            return 'connection refused';
        case 'ENETUNREACH':
        case 'EHOSTUNREACH':
            return 'network or host unreachable';
        default:
            return 'request failed before receiving an HTTP response';
    }
}

export async function uploadFile({root, file, intent, sha256, fetchImpl = fetch}) {
    const {upload, constraints, relay} = signedUpload(intent);
    check(sha256 === undefined || SHA256.test(sha256), 'Invalid expected SHA-256 checksum.');
    root = await repositoryRoot(root);
    check(relativeFile(file), 'Provide a relative file path within the repository.');
    check(imageMimeType(file) === constraints.mimeType, 'The selected file extension does not match the upload MIME type.');
    const bytes = await readLocalImage(root, file, constraints.maxBytes, constraints.maxBytes);
    const checksum = createHash('sha256').update(bytes).digest('hex');
    check(sha256 === undefined || sha256 === checksum, 'The selected file no longer matches its recorded checksum.');
    const form = new FormData();
    for (const [key, value] of Object.entries(upload.fields)) { form.append(key, value); }
    form.append('file', new Blob([bytes], {type: constraints.mimeType}), path.basename(file));
    const post = url => fetchImpl(url, {method: 'POST', body: form, redirect: 'error', signal: AbortSignal.timeout(60000)});
    const retry = 'Check outbound network access from this shell and retry the same upload intent while it is valid.';
    let destination = 'Google Storage';
    let earlierFailure = '';
    let response;
    try {
        response = await post(upload.url);
    } catch (error) {
        earlierFailure = `Google Storage: ${uploadRequestFailure(error)}. `;
        if (!relay) { throw new Error(earlierFailure + retry); }
        destination = 'AppScreens relay';
        try {
            response = await post(relay);
        } catch (relayError) {
            throw new Error(`${earlierFailure}AppScreens relay: ${uploadRequestFailure(relayError)}. ${retry}`);
        }
    }
    if (response.body) { await response.body.cancel().catch(() => {}); }
    check(response.ok, `${earlierFailure}${destination}: signed upload failed with HTTP ${response.status}.`);
    return {uploadId: intent.uploadId, assetId: intent.assetId, sha256: checksum, sizeBytes: bytes.length};
}

function exactKeys(value, keys) {
    return object(value) && Object.keys(value).every(key => keys.includes(key));
}

function identifier(value) {
    return text(value, 1000) && !value.includes('://') && !/[?#]/.test(value);
}

export function validateManifest(manifest) {
    check(exactKeys(manifest, ['version', 'accountId', 'projectId', 'baseRevision', 'revisionHash', 'projectCreateKey',
        'assignmentKey', 'files', 'assignments']) && manifest.version === 1 &&
        (manifest.accountId === undefined || identifier(manifest.accountId)), 'Invalid manifest fields.');
    for (const field of ['projectId', 'revisionHash', 'projectCreateKey', 'assignmentKey']) {
        check(manifest[field] === undefined || identifier(manifest[field]), 'Invalid manifest identifier.');
    }
    check(manifest.baseRevision === undefined || Number.isSafeInteger(manifest.baseRevision) && manifest.baseRevision >= 0,
        'Invalid project revision.');
    check(Array.isArray(manifest.files) && manifest.files.length <= DISCOVERY_LIMITS.maxFiles, 'Invalid manifest files.');
    for (const file of manifest.files) {
        check(exactKeys(file, ['path', 'sizeBytes', 'mimeType', 'sha256', 'uploadId', 'assetId', 'uploadKey', 'completeKey']) &&
            relativeFile(file.path) && Number.isSafeInteger(file.sizeBytes) && file.sizeBytes > 0 &&
            /^image\/[a-z0-9.+-]+$/.test(file.mimeType) &&
            [file.uploadKey, file.completeKey].every(key => key === undefined || identifier(key)),
        'Invalid manifest file.');
        check(file.sha256 === undefined || SHA256.test(file.sha256), 'Invalid manifest checksum.');
        for (const field of ['uploadId', 'assetId']) {
            check(file[field] === undefined || identifier(file[field]), 'Invalid manifest asset identifier.');
        }
    }
    check(new Set(manifest.files.map(file => file.path)).size === manifest.files.length, 'Duplicate manifest file.');
    check(manifest.assignments === undefined || Array.isArray(manifest.assignments) &&
        manifest.assignments.length <= 2000 && manifest.assignments.every(assignment =>
            exactKeys(assignment, ['assetId', 'elementId', 'targetId', 'language']) &&
            ['assetId', 'elementId', 'targetId', 'language'].every(key => identifier(assignment[key]))), 'Invalid manifest assignments.');
    const hasRemoteIds = manifest.projectId !== undefined || manifest.files.some(file => file.assetId !== undefined || file.uploadId !== undefined) ||
        (manifest.assignments?.length || 0) > 0;
    check(!hasRemoteIds || identifier(manifest.accountId), 'Record the account ID before saving remote IDs.');
    return manifest;
}

export async function recordManifest({root, session, manifest}) {
    check(typeof session === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(session), 'Invalid import session name.');
    validateManifest(manifest);
    root = await repositoryRoot(root);
    let directory = root;
    for (const segment of ['.appscreens', 'imports']) {
        directory = path.join(directory, segment);
        try { await mkdir(directory, {mode: 0o700}); } catch (error) { if (error.code !== 'EEXIST') { throw error; } }
        check((await lstat(directory)).isDirectory() && contained(root, await realpath(directory)), 'Unsafe manifest directory.');
    }
    const filename = path.join(directory, `${session}.json`);
    const lockname = path.join(directory, `.${session}.lock`);
    let lock;
    try { lock = await open(lockname, 'wx', 0o600); }
    catch { throw new Error('The import session is already being saved.'); }
    const temporary = path.join(directory, `.${session}.${randomUUID()}.tmp`);
    try {
        try {
            const existing = await localFile(root, path.relative(root, filename).split(path.sep).join('/'));
            const handle = await open(existing, constants.O_RDONLY | constants.O_NOFOLLOW);
            try {
                check((await handle.stat()).size <= MAX_INPUT_BYTES, 'Existing manifest exceeds the size limit.');
                let previous;
                try { previous = JSON.parse(await handle.readFile('utf8')); } catch { throw new Error('Existing manifest contains invalid JSON.'); }
                validateManifest(previous);
                check(previous.accountId === undefined || previous.accountId === manifest.accountId, 'The session belongs to a different account.');
            } finally { await handle.close(); }
        } catch (error) { if (error.code !== 'ENOENT') { throw error; } }
        const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
        check(Buffer.byteLength(serialized) <= MAX_INPUT_BYTES, 'Manifest exceeds the size limit.');
        const output = await open(temporary, 'wx', 0o600);
        try { await output.writeFile(serialized); await output.sync(); } finally { await output.close(); }
        await rename(temporary, filename);
        return {path: path.relative(root, filename).split(path.sep).join('/')};
    } finally {
        await unlink(temporary).catch(() => {});
        await lock.close();
        await unlink(lockname);
    }
}

async function readInput() {
    const chunks = [];
    let size = 0;
    for await (const chunk of process.stdin) {
        size += chunk.length;
        check(size <= MAX_INPUT_BYTES, 'Input JSON exceeds the size limit.');
        chunks.push(chunk);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new Error('Provide valid JSON on standard input.'); }
}

export async function main(args) {
    const [command, ...flags] = args;
    const allowed = {discover: ['root', 'mime-types', 'max-bytes'], upload: ['root', 'file', 'sha256'],
        fingerprint: ['root', 'file', 'max-bytes'], record: ['root', 'session']};
    check(Object.hasOwn(allowed, command), 'Use discover, fingerprint, upload, or record.');
    const options = {};
    for (let index = 0; index < flags.length; index += 2) {
        const key = flags[index].slice(2);
        check(flags[index].startsWith('--') && allowed[command].includes(key) && !Object.hasOwn(options, key) &&
            text(flags[index + 1]), 'Invalid command options.');
        options[key] = flags[index + 1];
    }
    check(text(options.root), 'Provide --root PATH.');
    if (command === 'discover') {
        return discover({root: options.root, mimeTypes: options['mime-types']?.split(','), maxBytes: Number(options['max-bytes'])});
    }
    if (command === 'upload') { return uploadFile({root: options.root, file: options.file, sha256: options.sha256, intent: await readInput()}); }
    if (command === 'fingerprint') {
        return fingerprintFile({root: options.root, file: options.file, maxBytes: Number(options['max-bytes'])});
    }
    return recordManifest({root: options.root, session: options.session, manifest: await readInput()});
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    main(process.argv.slice(2)).then(result => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)).catch(error => {
        process.stderr.write(`${JSON.stringify({error: error.message})}\n`);
        process.exitCode = 1;
    });
}

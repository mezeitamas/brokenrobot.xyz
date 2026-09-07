// Fails when the build did not produce a Markdown twin beside every blog post page, so a post that
// serves nothing to agents is caught before it reaches production rather than after.
//
// This is a coverage audit, not a content check. Twins and pages are generated from one source on
// every build, so they cannot drift apart; the failure worth auditing is a missing or empty twin,
// which is a real failure mode in the wild — sites serving `.md` that answer 200 with no body, where
// nothing looks broken to anyone. Content faults belong to the transform, which fails the build and
// names the offending post. Runs locally as `npm run twins:check` and in CI's Build job after
// `astro build`.
//
//   node scripts/check-markdown-twins.mjs [dist/]
//
// Exit codes:
//   0 — pass: every post page has a non-empty twin whose frontmatter parses, and no twin is orphaned.
//   1 — FAIL: at least one is missing, empty, orphaned, or opens with frontmatter that does not
//       parse; each is printed as `path` then what is wrong with it.
//   2 — not verified: the directory is missing or holds no blog pages to check, so the run proves
//       nothing. A failed `astro build` leaves `dist/` emptied or half-written and lands here, which
//       keeps an empty result from being reported as a pass.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { parse } from 'yaml';

const PAGE_FILE = 'index.html';
const TWIN_FILE = 'index.md';

// Each post is built as `<dist>/blog/<slug>/index.html`. `dist/blog/index.html` is the blog index
// page rather than a post, and it has no twin by design.
function postDirectories(blogDir) {
    return readdirSync(blogDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
}

// The twin's own frontmatter block, between the opening `---` line and the next one. Returned as
// `null` when the file does not open with a block at all, which is itself a failure.
function frontmatterOf(text) {
    if (!text.startsWith('---\n')) {
        return null;
    }

    const end = text.indexOf('\n---\n', 3);

    return end === -1 ? null : text.slice(4, end);
}

function problemsWith(postDir) {
    const pagePath = join(postDir, PAGE_FILE);
    const twinPath = join(postDir, TWIN_FILE);

    let hasPage = false;
    try {
        hasPage = statSync(pagePath).isFile();
    } catch {
        hasPage = false;
    }

    let twin = null;
    try {
        twin = readFileSync(twinPath, 'utf8');
    } catch {
        twin = null;
    }

    if (!hasPage) {
        return twin === null ? [] : [[twinPath, 'orphaned twin — no post page beside it']];
    }

    if (twin === null) {
        return [[twinPath, 'missing — the post page has no Markdown twin beside it']];
    }

    if (twin.trim() === '') {
        return [[twinPath, 'empty — the file exists but carries no content']];
    }

    const frontmatter = frontmatterOf(twin);

    if (frontmatter === null) {
        return [[twinPath, 'does not open with a frontmatter block']];
    }

    try {
        parse(frontmatter);
    } catch (error) {
        return [[twinPath, `frontmatter does not parse — ${error.message.split('\n')[0]}`]];
    }

    return [];
}

const [dir = 'dist/'] = process.argv.slice(2);
const blogDir = join(dir, 'blog');

try {
    if (!statSync(blogDir).isDirectory()) {
        console.error(`not verified: ${blogDir} is not a directory`);
        process.exit(2);
    }
} catch {
    console.error(`not verified: ${blogDir} does not exist — run \`npm run build\` first`);
    process.exit(2);
}

const posts = postDirectories(blogDir);

if (posts.length === 0) {
    console.error(`not verified: ${blogDir} holds no post directories — the build did not complete`);
    process.exit(2);
}

let violations = 0;
for (const post of posts) {
    for (const [path, problem] of problemsWith(join(blogDir, post))) {
        console.log(`${path}\n    ${problem}`);
        violations += 1;
    }
}

if (violations > 0) {
    console.error(`FAIL: ${violations} Markdown twin problem(s) in ${dir}`);
    process.exit(1);
}

console.log(`pass: every post page in ${dir} has a Markdown twin (${posts.length} post(s) checked)`);

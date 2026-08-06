/**
 * verify-production.js
 *
 * Runs the same evidence-gathering checks used during development — but
 * against the LIVE deployed site — and prints a pass/fail report with
 * exact routes and status codes. Run this yourself before the
 * presentation; it needs to run from your machine (or anywhere with
 * network access to the deployed URL), not from an AI sandbox.
 *
 * IMPORTANT — before running this for the first time:
 *   1. Make sure SESSION_SECRET is set in your Vercel project's
 *      Environment Variables (Production). Without it, the app now
 *      fails to start at all (see server.js) — that's intentional, but
 *      it means you MUST set it before redeploying, or the whole site
 *      goes down.
 *   2. Make sure the admin/viewer accounts below actually exist in your
 *      PRODUCTION database (run `npm run migrate` and `node seedUsers.js`
 *      against production once if you haven't already).
 *
 * Usage:
 *   node verify-production.js
 *   BASE_URL=http://localhost:5500 node verify-production.js   (to test locally instead)
 *
 * This script is READ/WRITE safe: the one breed it creates for the CRUD
 * check is deleted again at the end, even if a later step fails.
 * Requires Node 18+ (uses the built-in fetch API).
 */

const BASE_URL = process.env.BASE_URL || "https://petchoice-part3.vercel.app";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@petchoice.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const VIEWER_EMAIL = process.env.VIEWER_EMAIL || "viewer@petchoice.com";
const VIEWER_PASSWORD = process.env.VIEWER_PASSWORD || "viewer123";
const TEST_BREED_ID = "verify-script-test-breed";

const results = [];
function record(label, expected, actual, pass) {
    results.push({ label, expected, actual, pass });
    const icon = pass ? "✅" : "❌";
    console.log(`${icon}  ${label}  (expected ${expected}, got ${actual})`);
}

// --- tiny cookie-jar helper (fetch doesn't manage cookies across requests by itself in Node) ---
function makeJar() {
    let cookies = {};
    return {
        header() {
            return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
        },
        capture(res) {
            const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.get("set-cookie") ? [res.headers.get("set-cookie")] : []);
            for (const line of raw) {
                const [pair] = line.split(";");
                const idx = pair.indexOf("=");
                const name = pair.slice(0, idx);
                const value = pair.slice(idx + 1);
                cookies[name] = value;
            }
        }
    };
}

async function get(path, jar) {
    const res = await fetch(BASE_URL + path, {
        headers: jar ? { cookie: jar.header() } : {},
        redirect: "manual"
    });
    if (jar) jar.capture(res);
    const body = await res.text();
    return { status: res.status, body };
}

async function post(path, form, jar) {
    const res = await fetch(BASE_URL + path, {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            cookie: jar ? jar.header() : ""
        },
        body: new URLSearchParams(form).toString(),
        redirect: "manual"
    });
    if (jar) jar.capture(res);
    const body = await res.text();
    return { status: res.status, body };
}

function extractCsrf(html) {
    const m = html.match(/name="_csrf" value="([^"]*)"/);
    return m ? m[1] : null;
}

async function login(email, password) {
    const jar = makeJar();
    const page = await get("/login", jar);
    const csrf = extractCsrf(page.body);
    const res = await post("/login", { email, password, _csrf: csrf }, jar);
    return { jar, status: res.status };
}

async function main() {
    console.log(`\nTarget: ${BASE_URL}\n`);

    // 1. Anonymous users are redirected away from protected routes
    for (const route of ["/breeds", "/breeds/add", "/admin/dashboard", "/change-password"]) {
        const r = await get(route);
        record(`Anonymous GET ${route}`, "302 (redirect to /login)", r.status, r.status === 302);
    }

    // 2. CSP header is present and not disabled
    const loginPage = await fetch(BASE_URL + "/login");
    const csp = loginPage.headers.get("content-security-policy");
    record("Content-Security-Policy header present on /login", "header present", csp ? "present" : "MISSING", !!csp);

    // 3. Viewer login + denial on admin-only routes
    const viewer = await login(VIEWER_EMAIL, VIEWER_PASSWORD);
    record("POST /login (viewer credentials)", "302", viewer.status, viewer.status === 302);

    const viewerBreeds = await get("/breeds", viewer.jar);
    record("GET /breeds (as viewer)", "200", viewerBreeds.status, viewerBreeds.status === 200);

    const viewerAddGet = await get("/breeds/add", viewer.jar);
    record("GET /breeds/add (as viewer, direct URL)", "403", viewerAddGet.status, viewerAddGet.status === 403);

    const cpPage = await get("/change-password", viewer.jar);
    const viewerCsrf = extractCsrf(cpPage.body);

    const viewerAddPost = await post("/breeds/add", {
        id: "hacked-by-verify-script", name: "x", origin: "x", temperament: "x",
        description: "x", imageUrl: "https://x", lifespan: "1", weight: "1",
        coatType: "x", groomingLevel: "Low", _csrf: viewerCsrf
    }, viewer.jar);
    record("POST /breeds/add (as viewer, valid CSRF)", "403", viewerAddPost.status, viewerAddPost.status === 403);

    const viewerDeletePost = await post("/breeds/nonexistent/delete", { _csrf: viewerCsrf }, viewer.jar);
    record("POST /breeds/:id/delete (as viewer, valid CSRF)", "403", viewerDeletePost.status, viewerDeletePost.status === 403);

    // 4. Admin login + full CRUD against the real production database
    const admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    record("POST /login (admin credentials)", "302", admin.status, admin.status === 302);

    const addPage = await get("/breeds/add", admin.jar);
    const addCsrf = extractCsrf(addPage.body);
    const created = await post("/breeds/add", {
        id: TEST_BREED_ID, name: "Verify Script Breed", origin: "Testland",
        temperament: "Calm", description: "Created by verify-production.js — safe to delete.",
        imageUrl: "https://example.com/a.jpg", lifespan: "10", weight: "8",
        coatType: "Short", groomingLevel: "Low", _csrf: addCsrf
    }, admin.jar);
    record("POST /breeds/add (as admin)", "302", created.status, created.status === 302);

    try {
        const editPage = await get(`/breeds/${TEST_BREED_ID}/edit`, admin.jar);
        const editCsrf = extractCsrf(editPage.body);
        const edited = await post(`/breeds/${TEST_BREED_ID}/edit`, {
            name: "Verify Script Breed (edited)", origin: "Testland", temperament: "Calm",
            description: "Edited by verify-production.js.", imageUrl: "https://example.com/a.jpg",
            lifespan: "10", weight: "8", coatType: "Short", groomingLevel: "Low", _csrf: editCsrf
        }, admin.jar);
        record(`POST /breeds/${TEST_BREED_ID}/edit (as admin)`, "302", edited.status, edited.status === 302);
    } finally {
        // Always clean up, even if the edit step above failed.
        const breedsPage = await get("/breeds", admin.jar);
        const delCsrf = extractCsrf(breedsPage.body);
        const deleted = await post(`/breeds/${TEST_BREED_ID}/delete`, { _csrf: delCsrf }, admin.jar);
        record(`POST /breeds/${TEST_BREED_ID}/delete (as admin, cleanup)`, "302", deleted.status, deleted.status === 302);
    }

    // 5. Logout destroys the session (same cookie jar can no longer reach a protected route)
    const logoutRes = await get("/logout", admin.jar);
    record("GET /logout", "302", logoutRes.status, logoutRes.status === 302);

    const afterLogout = await get("/admin/dashboard", admin.jar);
    record("GET /admin/dashboard (same cookie jar, post-logout)", "302 (redirect to /login)", afterLogout.status, afterLogout.status === 302);

    // --- summary ---
    const passed = results.filter(r => r.pass).length;
    console.log(`\n${passed}/${results.length} checks passed against ${BASE_URL}\n`);
    if (passed !== results.length) {
        console.log("Failed checks:");
        results.filter(r => !r.pass).forEach(r => console.log(`  - ${r.label}: expected ${r.expected}, got ${r.actual}`));
        process.exitCode = 1;
    }
}

main().catch(err => {
    console.error("Script error:", err);
    process.exitCode = 1;
});

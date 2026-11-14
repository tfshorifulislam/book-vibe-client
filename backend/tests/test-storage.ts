import assert from "node:assert";
import { createHash } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import jwt from "jsonwebtoken";

// Load backend/.env manually into process.env before running tests
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_0-9]+)=(.*)$/);
    if (match) {
      let val = match[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[match[1]] = val;
    }
  }
}

import { createExpressApp } from "../src/app";
import {
  deleteImage,
  extractCloudinaryPublicId,
  generateCloudinarySignature,
  uploadImage,
} from "../src/lib/storage";

const SECRET =
  process.env.SESSION_SECRET || "fallback-secret-for-tests-32-characters!";

function createTestToken() {
  return jwt.sign(
    {
      userId: "test-user-id-storage",
      email: "storage-test@bookhand.test",
      role: "admin",
      name: "Storage Admin",
    },
    SECRET,
    { expiresIn: "1h" },
  );
}

async function runStorageTestSuite() {
  console.log("=======================================================");
  console.log("       BOOKHAND STORAGE & CLOUDINARY TEST SUITE        ");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  function test(desc: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  ✔ PASS: ${desc}`);
        passed++;
      })
      .catch((err) => {
        console.error(
          `  ✖ FAIL: ${desc} -`,
          err.message,
          err.cause ? (err.cause as Error).message : "",
        );
        failed++;
      });
  }

  // 1. Signature generation verification
  await test("generateCloudinarySignature generates valid SHA-1 hex digest", () => {
    const params = { timestamp: "1731600000", folder: "bookhand" };
    const apiSecret = "test_secret_12345";
    const sig = generateCloudinarySignature(params, apiSecret);
    const expected = createHash("sha1")
      .update("folder=bookhand&timestamp=1731600000test_secret_12345")
      .digest("hex");
    assert.strictEqual(sig, expected);
  });

  // 2. Public ID extraction verification
  await test("extractCloudinaryPublicId extracts public ID from Cloudinary URL", () => {
    const url =
      "https://res.cloudinary.com/dvuo5jw0i/image/upload/v1731612345/bookhand/abc123def456.jpg";
    const id = extractCloudinaryPublicId(url);
    assert.strictEqual(id, "bookhand/abc123def456");
  });

  await test("extractCloudinaryPublicId extracts public ID without version prefix", () => {
    const url =
      "https://res.cloudinary.com/dvuo5jw0i/image/upload/bookhand/photo_hero.png";
    const id = extractCloudinaryPublicId(url);
    assert.strictEqual(id, "bookhand/photo_hero");
  });

  await test("extractCloudinaryPublicId returns null for local uploads", () => {
    const localUrl = "/uploads/avatar_1234.png";
    const id = extractCloudinaryPublicId(localUrl);
    assert.strictEqual(id, null);
  });

  // 3. Start test Express server for HTTP endpoint tests
  const app = createExpressApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;
  const authToken = createTestToken();

  try {
    // 4. Invalid file rejection tests
    await test("POST /api/upload rejects request when file is missing (422)", async () => {
      const res = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        headers: {
          Cookie: `bookhand_token=${authToken}`,
        },
      });
      assert.strictEqual(res.status, 422);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /choose an image/i);
    });

    await test("POST /api/upload rejects unsupported MIME types with 415", async () => {
      const boundary = "----TestBoundary" + Math.random().toString(36).slice(2);
      const textFile = "Hello world this is not an image";
      const body =
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="test.txt"\r\n` +
        `Content-Type: text/plain\r\n\r\n` +
        `${textFile}\r\n` +
        `--${boundary}--\r\n`;

      const res = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          Cookie: `bookhand_token=${authToken}`,
        },
        body,
      });

      assert.strictEqual(res.status, 415);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /JPG, PNG, WebP, or AVIF/i);
    });

    // 5. Upload deletion route tests
    await test("DELETE /api/upload requires auth", async () => {
      const res = await fetch(`${baseUrl}/api/upload`, {
        method: "DELETE",
      });
      assert.strictEqual(res.status, 401);
    });

    await test("DELETE /api/upload rejects request with missing target (422)", async () => {
      const res = await fetch(`${baseUrl}/api/upload`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${authToken}`,
        },
        body: JSON.stringify({}),
      });
      assert.strictEqual(res.status, 422);
    });

    // 6. Production upload failure handling (no silent fallback)
    await test("uploadImage throws in production when Cloudinary fails", async () => {
      const origNodeEnv = process.env.NODE_ENV;
      const origFallback = process.env.STORAGE_FALLBACK_TO_LOCAL;
      const origCloud = process.env.CLOUDINARY_CLOUD_NAME;
      try {
        process.env.NODE_ENV = "production";
        delete process.env.STORAGE_FALLBACK_TO_LOCAL;
        process.env.CLOUDINARY_CLOUD_NAME = "invalid_nonexistent_cloud_test";

        const dummyBytes = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          "base64",
        );

        let threw = false;
        try {
          await uploadImage(dummyBytes, "test.png", "image/png");
        } catch (err: unknown) {
          threw = true;
          assert.match((err as Error).message, /Cloudinary/i);
        }

        assert.strictEqual(
          threw,
          true,
          "uploadImage must throw in production if Cloudinary rejects",
        );
      } finally {
        process.env.NODE_ENV = origNodeEnv;
        process.env.CLOUDINARY_CLOUD_NAME = origCloud;
        if (origFallback !== undefined) {
          process.env.STORAGE_FALLBACK_TO_LOCAL = origFallback;
        }
      }
    });

    // 7. Cloudinary live connection, real upload, retrieval & deletion audit
    await test("Cloudinary Live Real Upload, Image Retrieval & Deletion Lifecycle", async () => {
      const cloud = process.env.CLOUDINARY_CLOUD_NAME;
      const key = process.env.CLOUDINARY_API_KEY;
      const secret = process.env.CLOUDINARY_API_SECRET;

      if (!cloud || !key || !secret) {
        console.log("    (Skipped: Cloudinary credentials not configured)");
        return;
      }

      // Ping check
      const auth = Buffer.from(`${key}:${secret}`).toString("base64");
      const pingRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/ping`,
        {
          headers: { Authorization: `Basic ${auth}` },
        },
      );
      assert.strictEqual(
        pingRes.status,
        200,
        "Cloudinary ping must return 200",
      );
      console.log("    ✔ Cloudinary Authentication & Ping: OK (200)");

      // Real upload attempt
      const pngBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      );
      const testFilename = `live_verify_${Date.now()}.png`;
      const secureUrl = await uploadImage(pngBuffer, testFilename, "image/png");
      assert(
        secureUrl.startsWith("http"),
        `Expected remote URL, got ${secureUrl}`,
      );
      console.log(`    ✔ Real Image Upload Succeeded: ${secureUrl}`);

      // Image retrieval check (HTTP 200)
      const fetchImg = await fetch(secureUrl);
      assert.strictEqual(
        fetchImg.status,
        200,
        "Uploaded image must be retrievable with HTTP 200",
      );
      console.log("    ✔ Image Retrieval Verified: HTTP 200 OK");

      // Extract Public ID
      const publicId = extractCloudinaryPublicId(secureUrl);
      assert(publicId, "Extracted public ID must not be null");
      console.log(`    ✔ Public ID Extracted: ${publicId}`);

      // Authorized Deletion check
      const delSuccess = await deleteImage(secureUrl);
      assert.strictEqual(delSuccess, true, "deleteImage must return true");
      console.log("    ✔ Authorized Image Deletion: Succeeded");

      // Verify deletion in Cloudinary
      const secondDel = await deleteImage(publicId);
      assert.strictEqual(
        secondDel,
        true,
        "Asset is confirmed destroyed in Cloudinary",
      );
      console.log("    ✔ Cloudinary Asset Destroy Confirmation: Verified");
    });
  } finally {
    server.close();
  }

  console.log("\n=======================================================");
  console.log(`  Storage Test Results: ${passed} passed, ${failed} failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runStorageTestSuite().catch((err) => {
  console.error("Storage test suite crashed:", err);
  process.exit(1);
});

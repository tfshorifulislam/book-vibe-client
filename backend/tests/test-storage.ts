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
import { prisma } from "../src/lib/db";
import {
  createUploadSignature,
  deleteImage,
  extractCloudinaryPublicId,
  generateCloudinarySignature,
  uploadImage,
  validateCloudinaryAssetUrl,
} from "../src/lib/storage";

const SECRET =
  process.env.SESSION_SECRET ||
  process.env.JWT_SECRET ||
  "bookhand_dev_jwt_fallback_secret_must_change_in_prod";

function createTestToken(role = "admin", userId = "test-user-id-storage") {
  return jwt.sign(
    {
      userId,
      email: `${role}-storage-test@bookhand.test`,
      role,
      name: `Storage ${role}`,
    },
    SECRET,
    { expiresIn: "1h" },
  );
}

async function runStorageTestSuite() {
  console.log("=======================================================");
  console.log("       BOOKHAND DIRECT CLOUDINARY STORAGE TEST SUITE   ");
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
          err.stack,
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

  // 2. createUploadSignature generates correct structure and parameters
  await test("createUploadSignature generates CloudinarySignatureData with credentials", () => {
    const sigData = createUploadSignature("bookhand/avatars");
    assert(sigData.cloudName, "cloudName must be set");
    assert(sigData.apiKey, "apiKey must be set");
    assert(sigData.timestamp, "timestamp must be set");
    assert(
      sigData.folder.startsWith("bookhand/"),
      "folder must start with bookhand",
    );
    assert(sigData.signature, "signature must be non-empty");
    assert(
      sigData.uploadUrl.startsWith("https://api.cloudinary.com/v1_1/"),
      "uploadUrl must target Cloudinary API",
    );
  });

  // 3. Public ID extraction verification
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

  await test("extractCloudinaryPublicId returns null for local uploads or invalid URLs", () => {
    const localUrl = "/uploads/avatar_1234.png";
    const id = extractCloudinaryPublicId(localUrl);
    assert.strictEqual(id, null);
  });

  // 4. Cloudinary asset URL validation
  await test("validateCloudinaryAssetUrl verifies valid Cloudinary domain and prefix", () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "testcloud";
    const validUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v1731600000/bookhand/avatar_99.jpg`;
    assert.strictEqual(validateCloudinaryAssetUrl(validUrl), true);

    const fakeDomain = "https://evil-storage.com/image/upload/bookhand/pic.jpg";
    assert.strictEqual(validateCloudinaryAssetUrl(fakeDomain), false);

    const outsideNamespace = `https://res.cloudinary.com/${cloudName}/image/upload/v1731600000/otherapp/pic.jpg`;
    assert.strictEqual(validateCloudinaryAssetUrl(outsideNamespace), false);
  });

  // 5. Start test Express server for HTTP endpoint tests
  const app = createExpressApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;
  let adminUser: { id: string } | null = null;
  let buyerUser: { id: string } | null = null;
  try {
    adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    buyerUser = await prisma.user.findFirst({
      where: { role: "BUYER" },
      select: { id: true },
    });
  } catch {
    // Database queries will be handled gracefully if offline
  }
  const adminToken = createTestToken("admin", adminUser?.id || "admin-user-id");
  const buyerToken = createTestToken("buyer", buyerUser?.id || "buyer-user-id");

  try {
    // 6. Direct upload signature endpoint tests
    await test("POST /api/upload/sign rejects unauthenticated requests (401)", async () => {
      const res = await fetch(`${baseUrl}/api/upload/sign`, {
        method: "POST",
      });
      assert.strictEqual(res.status, 401);
    });

    await test("POST /api/upload/sign returns signed Cloudinary parameters for authenticated user", async () => {
      const res = await fetch(`${baseUrl}/api/upload/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${buyerToken}`,
        },
        body: JSON.stringify({ folder: "bookhand/avatars" }),
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert(data.data.cloudName, "cloudName present in response");
      assert(data.data.apiKey, "apiKey present in response");
      assert(data.data.timestamp, "timestamp present in response");
      assert(data.data.signature, "signature present in response");
      assert(data.data.uploadUrl, "uploadUrl present in response");
    });

    await test("POST /api/upload/sign rejects folders outside bookhand namespace (422)", async () => {
      const res = await fetch(`${baseUrl}/api/upload/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${buyerToken}`,
        },
        body: JSON.stringify({ folder: "malicious_folder" }),
      });

      assert.strictEqual(res.status, 422);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /namespace/i);
    });

    // 7. Upload confirm endpoint tests
    await test("POST /api/upload/confirm rejects unauthenticated requests (401)", async () => {
      const res = await fetch(`${baseUrl}/api/upload/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secureUrl: "https://example.com/pic.jpg",
          publicId: "bookhand/pic",
        }),
      });
      assert.strictEqual(res.status, 401);
    });

    await test("POST /api/upload/confirm rejects missing secureUrl or publicId (422)", async () => {
      const res = await fetch(`${baseUrl}/api/upload/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${buyerToken}`,
        },
        body: JSON.stringify({}),
      });
      assert.strictEqual(res.status, 422);
      const data = await res.json();
      assert.strictEqual(data.success, false);
    });

    await test("POST /api/upload/confirm rejects unauthorized domain URLs (422)", async () => {
      const res = await fetch(`${baseUrl}/api/upload/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${buyerToken}`,
        },
        body: JSON.stringify({
          secureUrl: "https://evil-untrusted-domain.com/bookhand/avatar.jpg",
          publicId: "bookhand/avatar",
        }),
      });
      assert.strictEqual(res.status, 422);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /cloud domain/i);
    });

    await test("POST /api/upload/confirm rejects non-admin updating banner (403)", async () => {
      const res = await fetch(`${baseUrl}/api/upload/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${buyerToken}`,
        },
        body: JSON.stringify({
          secureUrl:
            "https://res.cloudinary.com/dvuo5jw0i/image/upload/v1731600000/bookhand/banner.jpg",
          publicId: "bookhand/banner",
          entity: "banner",
        }),
      });
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /admin/i);
    });

    await test("POST /api/upload/confirm rejects unauthorized book cover update (403)", async () => {
      const res = await fetch(`${baseUrl}/api/upload/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${buyerToken}`,
        },
        body: JSON.stringify({
          secureUrl:
            "https://res.cloudinary.com/dvuo5jw0i/image/upload/v1731600000/bookhand/book_cover.jpg",
          publicId: "bookhand/book_cover",
          entity: "book",
          entityId: "some-unowned-book-id",
        }),
      });
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /not found or not owned/i);
    });

    // 8. Upload deletion route tests
    await test("DELETE /api/upload requires auth (401)", async () => {
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
          Cookie: `bookhand_token=${adminToken}`,
        },
        body: JSON.stringify({}),
      });
      assert.strictEqual(res.status, 422);
      const data = await res.json();
      assert.strictEqual(data.success, false);
    });

    await test("DELETE /api/upload prevents non-admin from deleting unowned assets (403)", async () => {
      const res = await fetch(`${baseUrl}/api/upload`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${buyerToken}`,
        },
        body: JSON.stringify({
          url: "https://res.cloudinary.com/dvuo5jw0i/image/upload/v1731600000/bookhand/stranger_asset.jpg",
        }),
      });
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /permission/i);
    });

    // 9. Production direct upload failure handling (no silent fallback)
    await test("uploadImage throws in production when Cloudinary fails", async () => {
      const origNodeEnv = process.env.NODE_ENV;
      const origCloud = process.env.CLOUDINARY_CLOUD_NAME;
      try {
        process.env.NODE_ENV = "production";
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
          assert.match((err as Error).message, /Cloudinary|fetch failed/i);
        }

        assert.strictEqual(
          threw,
          true,
          "uploadImage must throw in production if Cloudinary rejects",
        );
      } finally {
        process.env.NODE_ENV = origNodeEnv;
        process.env.CLOUDINARY_CLOUD_NAME = origCloud;
      }
    });

    // 10. Cloudinary Live Direct Browser Upload Simulation Lifecycle
    await test("Cloudinary Live Direct Browser Upload, Asset Verification & Deletion Lifecycle", async () => {
      const cloud = process.env.CLOUDINARY_CLOUD_NAME;
      const key = process.env.CLOUDINARY_API_KEY;
      const secret = process.env.CLOUDINARY_API_SECRET;

      if (!cloud || !key || !secret) {
        console.log("    (Skipped: Cloudinary credentials not configured)");
        return;
      }

      // Step 1: Request signature from backend
      const signRes = await fetch(`${baseUrl}/api/upload/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${adminToken}`,
        },
        body: JSON.stringify({ folder: "bookhand/tests" }),
      });
      assert.strictEqual(signRes.status, 200, "Sign endpoint must return 200");
      const signData = await signRes.json();
      const { uploadUrl, apiKey, timestamp, folder, signature } = signData.data;
      console.log("    ✔ Direct Upload Signature Obtained");

      // Step 2: Direct upload from client to Cloudinary API
      const pngBase64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const directBody = new URLSearchParams();
      directBody.append("file", pngBase64);
      directBody.append("api_key", apiKey);
      directBody.append("timestamp", timestamp);
      directBody.append("folder", folder);
      directBody.append("signature", signature);

      const cloudUploadRes = await fetch(uploadUrl, {
        method: "POST",
        body: directBody,
      });

      const cloudUploadJson = await cloudUploadRes.json();
      assert.strictEqual(
        cloudUploadRes.status,
        200,
        `Cloudinary direct upload must return 200: ${JSON.stringify(cloudUploadJson)}`,
      );
      const secureUrl = cloudUploadJson.secure_url;
      const publicId = cloudUploadJson.public_id;
      assert(secureUrl, "Cloudinary returned secure_url");
      assert(publicId, "Cloudinary returned public_id");
      console.log(
        `    ✔ Direct Browser Upload to Cloudinary Succeeded: ${secureUrl}`,
      );

      // Step 3: Image retrieval check (HTTP 200)
      const fetchImg = await fetch(secureUrl);
      assert.strictEqual(
        fetchImg.status,
        200,
        "Uploaded image must be retrievable with HTTP 200",
      );
      console.log("    ✔ Image Retrieval Verified: HTTP 200 OK");

      // Step 4: Asset confirmation endpoint verification
      const confirmRes = await fetch(`${baseUrl}/api/upload/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${adminToken}`,
        },
        body: JSON.stringify({
          secureUrl,
          publicId,
        }),
      });
      assert.strictEqual(
        confirmRes.status,
        200,
        "Confirm endpoint must return 200",
      );
      console.log("    ✔ Asset Confirmation & Database Verification: OK");

      if (adminUser) {
        const persisted = await prisma.user.findUnique({
          where: { id: adminUser.id },
          select: { avatar: true },
        });
        assert.strictEqual(
          persisted?.avatar,
          secureUrl,
          "Database record must reflect updated avatar",
        );
        console.log("    ✔ PostgreSQL Avatar Persistence Confirmed");
      }

      // Step 4b: Safe Old Image Replacement verification
      console.log("    --- Testing Safe Old Image Replacement ---");
      const signRes2 = await fetch(`${baseUrl}/api/upload/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${adminToken}`,
        },
        body: JSON.stringify({ folder: "bookhand/tests" }),
      });
      const signData2 = await signRes2.json();
      const directBody2 = new URLSearchParams();
      directBody2.append("file", pngBase64);
      directBody2.append("api_key", signData2.data.apiKey);
      directBody2.append("timestamp", signData2.data.timestamp);
      directBody2.append("folder", signData2.data.folder);
      directBody2.append("signature", signData2.data.signature);

      const cloudUploadRes2 = await fetch(signData2.data.uploadUrl, {
        method: "POST",
        body: directBody2,
      });
      const cloudUploadJson2 = await cloudUploadRes2.json();
      const secureUrl2 = cloudUploadJson2.secure_url;
      const publicId2 = cloudUploadJson2.public_id;
      assert(secureUrl2, "Second image uploaded to Cloudinary");

      // Confirm second image on user avatar (triggers safe cleanup of first image)
      const confirmRes2 = await fetch(`${baseUrl}/api/upload/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${adminToken}`,
        },
        body: JSON.stringify({
          secureUrl: secureUrl2,
          publicId: publicId2,
          entity: "avatar",
        }),
      });
      assert.strictEqual(
        confirmRes2.status,
        200,
        "Confirm replacement must return 200",
      );
      console.log("    ✔ Image Replacement Confirmed via API");

      if (adminUser) {
        const updated = await prisma.user.findUnique({
          where: { id: adminUser.id },
          select: { avatar: true },
        });
        assert.strictEqual(
          updated?.avatar,
          secureUrl2,
          "Database record must reflect replacement avatar",
        );
        console.log("    ✔ PostgreSQL Avatar Replaced Successfully");
      }

      // Step 5: Authorized Deletion check via admin token (deleting the new image)
      const delRes = await fetch(`${baseUrl}/api/upload`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `bookhand_token=${adminToken}`,
        },
        body: JSON.stringify({ target: publicId2 }),
      });
      assert.strictEqual(delRes.status, 200, "DELETE endpoint must return 200");
      const delData = await delRes.json();
      assert.strictEqual(delData.success, true);
      console.log("    ✔ Authorized Image Deletion: Succeeded");

      if (adminUser) {
        const cleared = await prisma.user.findUnique({
          where: { id: adminUser.id },
          select: { avatar: true },
        });
        assert.strictEqual(
          cleared?.avatar,
          null,
          "Database record must be cleared upon asset deletion",
        );
        console.log("    ✔ PostgreSQL Avatar Record Cleared Confirmed");
      }

      // Step 6: Verify deletion in Cloudinary
      const delConfirm1 = await deleteImage(publicId);
      assert.strictEqual(
        delConfirm1,
        true,
        "Replaced asset 1 is confirmed destroyed in Cloudinary",
      );
      const delConfirm2 = await deleteImage(publicId2);
      assert.strictEqual(
        delConfirm2,
        true,
        "Deleted asset 2 is confirmed destroyed in Cloudinary",
      );
      console.log("    ✔ Cloudinary Assets Destroy Confirmation: Verified");
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

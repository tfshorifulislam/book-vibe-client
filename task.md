# BookHand — Complete Direct Cloudinary Image Integration

Implement all missing integrations identified in `docs/DIRECT_CLOUDINARY_AUDIT.md`.

### 1. Seller Book Cover

- Add image file input to `book-form.tsx`.
- Use `uploadDirectToCloudinary()` with `entity: "book"` and the existing book ID.
- Preserve existing coverTone functionality as an optional fallback.

### 2. Seller Shop Logo & Banner

- Add separate logo and banner upload inputs to `shop-form.tsx`.
- Use `entity: "shop_logo"` and `entity: "shop_banner"`.
- Support upload, preview and replacement.

### 3. Admin Promotional Banner

- Add image upload to `banner-manager.tsx`.
- Add secure `entity: "banner"` persistence support in `upload.routes.ts`.
- Verify ADMIN role and banner ownership/existence.
- Ensure the banner is created before uploading its image if an entity ID is required.

### 4. Safe Old Image Replacement

- Retrieve the existing image URL before replacing it.
- Save the new Cloudinary URL to PostgreSQL first.
- Only after successful database persistence, delete the old Cloudinary asset.
- Never delete the new image accidentally.
- Never delete external URLs or assets outside the BookHand Cloudinary namespace.
- If old asset deletion fails, preserve the new database record and log the cleanup failure.
- Ensure deletion of an image belonging to another entity is impossible.

### 5. Verification

- Test upload, preview, replacement and deletion for all four entity types.
- Verify PostgreSQL persistence.
- Verify Cloudinary old asset cleanup.
- Verify ownership and ADMIN authorization.
- Run relevant tests, TypeScript checks, lint and production builds.

**Strict rules:**

- Preserve existing features and database records.
- Do not reintroduce Multer.
- Do not use backend local file storage.
- Do not expose Cloudinary API Secret.
- Do not redesign unrelated UI.
- Do not perform destructive database operations.

Update `docs/DIRECT_CLOUDINARY_AUDIT.md` with actual implementation and verification results.

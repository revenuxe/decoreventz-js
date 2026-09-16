# Catalog image storage

The storefront uses public image URLs. Upload permission alone does not make an object readable by browsers or the Next.js image optimizer.

Merge the statement in s3-public-images-policy.json into the bucket policy for decoreventz-s3-hyderabad. It grants anonymous GetObject only for the public catalog folders used by this app: products, categories, subcategories, and homepage-hero. It does not grant listing, writes, or access to vendor uploads. Review bucket-level and account-level Block Public Access: settings that ignore or restrict public bucket policies must permit this public-image configuration. Do not overwrite unrelated existing statements.

Verify the exact original URL with an anonymous GET. A successful image response must be HTTP 200. A 403 can mean access is denied or the object does not exist; confirm the full key in the S3 console. For an existing object still returning 403, inspect explicit denies, ownership and encryption settings. If it is missing, restore it or upload a replacement and save the product.

An optimized size cached earlier may still display while a different viewport requests another size and fails. Disabling optimization cannot recover a blocked or deleted original. The shared image component retries the original and, for product cards and galleries, remaining gallery photos. It also handles failures that happen before hydration.

Admin image fields edit draft URLs without deleting stored files. Replaced or removed files are intentionally retained because saved records may still reference them. Any future cleanup must check references after successful saves.

Code changes require deployment. The policy must be applied separately in AWS; this repository does not apply bucket policies automatically.

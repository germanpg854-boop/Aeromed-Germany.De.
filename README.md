# AeroMed Germany website

Responsive static website hosted on GitHub Pages. The public learning library reads files from your Supabase Storage bucket. An administrator signs in at `admin.html` to add or remove public learning documents.

## Main files

- `index.html` — homepage and founder section
- `language.html`, `approbation.html`, `exams.html`, `residency.html` — learning guides
- `documents.html` — public documents library
- `admin.html` — administrator sign-in and upload page
- `supabase-config.js` — your Supabase project URL and publishable/anon key
- `supabase-setup.sql` — storage bucket and access policies
- `styles.css`, `script.js`, `admin.js`, `documents.js` — site styles and behavior
- `robots.txt`, `sitemap.xml`, `404.html` — discovery and support pages

## Important: uploaded documents are public

Files uploaded through this admin page are public educational resources. Anyone can view or download them. Only a signed-in account explicitly added as an AeroMed admin can upload or remove files. Do not upload private, confidential, patient, identity, or otherwise sensitive documents.

## Set up login and storage

1. Create a Supabase project in an account you own.
2. In the Supabase Dashboard, open **SQL Editor**, paste in `supabase-setup.sql`, and run it. This creates a public documents bucket, limits files to 25 MB, and restricts uploads/removals to administrators.
3. In **Authentication → Users**, create your own user with your email and a password. Do not enable public sign-up for this admin page.
4. Copy your user’s UUID from the Users screen. In SQL Editor, run this statement with your UUID in place of the example:

   ```sql
   insert into public.aeromed_admins (user_id) values ('YOUR-USER-UUID');
   ```

5. In Supabase project settings, copy the **Project URL** and the browser-safe **publishable key** (or legacy anon key). Put those two values in `supabase-config.js`, replacing the two `YOUR_...` values. These are designed for browser use; never put a `service_role` or secret key in website code.
6. Upload the site files to your GitHub repository, keeping every file at the repository root and preserving the `assets` folder.
7. After GitHub Pages finishes publishing, open `https://YOUR-SITE/admin.html`, sign in with the account you created, and upload a test document. Open `https://YOUR-SITE/documents.html` to confirm it appears in the public library.

`admin.html` is not listed in the sitemap and asks search engines not to index it; those settings do not provide security by themselves. The Supabase authentication and access policies protect the upload actions. The files in the bucket remain publicly readable by design.

## Editing the site

Edit page wording and links in the `.html` files and visual styling in `styles.css`. To change the Co-founder placeholder, edit the `Meet the Founders` section in `index.html`. Update `supabase-config.js` only with the project URL and publishable/anon key. Keep all HTML pages and scripts at the repository root so their relative links continue to work.
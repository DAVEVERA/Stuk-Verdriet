# TODO

## Goal

Generate and integrate a second batch of branded Stuk Verdriet shop products while preserving the existing shop design.

## Tasks

- [x] Keep the existing shop layout, styling, and first product batch intact
- [x] Generate 10 additional relevant branded product mockups
- [x] Add one related tote colorway and one different bag type
- [x] Save and optimize new product assets under `public/shop`
- [x] Extend fallback shop data with the new products
- [x] Add idempotent Supabase seed migration for the expanded collection
- [ ] Run verification
- [ ] Final review

## Completion Marker

STUKVERDRIET_EXPANDED_PRODUCT_DESIGNS_COMPLETE: false

---

## Goal

Generate and integrate branded Stuk Verdriet shop product designs for candles, tote bag, photo frames, and support keychain.

## Tasks

- [x] Inspect current shop implementation and brand assets
- [x] Generate branded product mockups from the Stuk Verdriet logo and palette
- [x] Save stable storefront assets under `public/shop`
- [x] Replace fallback shop products with the new branded product set
- [x] Add idempotent Supabase seed refresh for the branded products
- [x] Add product structured data and accessible product image alt text
- [x] Run verification
- [x] Final review

## Completion Marker

STUKVERDRIET_PRODUCT_DESIGNS_COMPLETE: true

---

## Goal

Build a simple, modern, minimalistic, StukVerdriet branded ecommerce webshop with Supabase-backed product/order management, Stripe checkout preparation, and full admin editing.

## Tasks

- [x] Inspect current implementation
- [x] Identify ecommerce integration boundaries
- [x] Add Supabase ecommerce schema
- [x] Add storefront product data helpers
- [x] Build mobile-first `/shop` route
- [x] Add ecommerce admin tab and product/order controls
- [x] Prepare Stripe checkout contract without leaking secrets
- [x] Run typecheck, lint, and build
- [x] Final review

## Completion Marker

STUKVERDRIET_ECOMMERCE_SLICE_COMPLETE: true

---

## Goal

Build a complete mobile-first admin portal for Stuk Verdriet with moderation, content building, access management, marketing planning, integrations, AI tooling, analytics, automation, moodboard, and branding modules.

## Tasks

- [x] Inspect current implementation
- [x] Identify required admin modules
- [x] Implement interview comment review workflow
- [x] Expand admin portal navigation and module UI
- [x] Add mobile-first responsive styling
- [x] Run verification
- [x] Fix failures
- [x] Final review

## Completion Marker

ALL_TASKS_COMPLETE: true

---

## Goal

Start SOC 2 readiness for Stuk Verdriet by creating an audit-friendly Access and Data Inventory.

## Tasks

- [x] Inspect current implementation and existing SOC 2 baseline
- [x] Identify production systems
- [x] Identify access holders and access gaps
- [x] List environment variable names without secret values
- [x] Map data categories to systems and tables
- [x] Draft vendor register
- [x] Run documentation verification
- [x] Final review

## Completion Marker

SOC2_ACCESS_DATA_INVENTORY_COMPLETE: true

---

## Goal

Fix pasted SEO, Markdown, heading, structured-data, and build-root diagnostics for Stuk Verdriet.

## Tasks

- [x] Inspect current implementation
- [x] Reproduce real project checks with typecheck, lint, and build
- [x] Identify root causes for the diagnostics
- [x] Fix `supabase/auth-branding.md` thin content and bare URL issues
- [x] Keep exactly one homepage H1 available across hero slider states
- [x] Correct heading hierarchy skips in component markup
- [x] Add site-wide JSON-LD structured data
- [x] Fix Turbopack root inference warning
- [x] Verify typecheck, lint, and production build
- [x] Final review

## Completion Marker

DIAGNOSTICS_FIX_PASS_COMPLETE: true

---

## Goal

Make the Stuk Verdriet admin portal understandable, task-led, mobile-first, and more functionally honest.

## Tasks

- [x] Inspect current admin implementation
- [x] Identify confusing or placeholder functionality
- [x] Redesign admin information architecture around daily tasks
- [x] Improve primary navigation and readiness/status signals
- [x] Improve podcast editor usability and mobile layout
- [x] Improve review workflow clarity and empty states
- [x] Mark non-live modules as setup/readiness modules instead of fake live tools
- [x] Run verification
- [x] Fix failures
- [x] Final review

## Completion Marker

ADMIN_REWORK_PASS_COMPLETE: true

---

## Goal

Add targeted footer links to the two current interview flyouts.

## Tasks

- [x] Inspect current interview popout implementation
- [x] Identify page anchors and social destinations
- [x] Add the requested footer link sets per interview
- [x] Keep the link layout mobile-first and accessible
- [x] Run verification
- [x] Final review

## Completion Marker

INTERVIEW_FOOTER_LINKS_COMPLETE: true

---

## Goal

Fix community login and make the community experience calmer under the name SNAAR.

## Tasks

- [x] Inspect login route and auth actions
- [x] Replace community login dead-end with Google and magic-link login
- [x] Keep local admin login available for admin route
- [x] Rename the community surface to SNAAR
- [x] Reduce visual density in the social feed layout
- [x] Add preview posts for empty live community content
- [x] Run typecheck, lint, build, and route smoke tests
- [x] Final review

## Completion Marker

SNAAR_COMMUNITY_FLOW_PASS_COMPLETE: true

---

## Goal

Make SNAAR fully mobile-first with a single Facebook-like vertical feed and icon-based post actions.

## Tasks

- [x] Remove side-by-side feed rails from the SNAAR community flow
- [x] Keep the feed in one centered vertical scroll column on every viewport
- [x] Add SNAAR action icons for support, comments, real sharing, feed, and handvatten
- [x] Put the reaction/comment affordance directly under each post
- [x] Verify typecheck, lint, build, and route smoke test
- [x] Final review

## Completion Marker

SNAAR_MOBILE_FEED_PASS_COMPLETE: true

---

## Goal

Finish the SNAAR community UX pass with mobile-first polish, accessible states, and browser-verified responsive behavior.

## Tasks

- [x] Run quality-auditor review against the community page
- [x] Fix focus states and mobile tap targets
- [x] Replace misleading share navigation with a real share/copy action
- [x] Add screenreader-friendly form feedback and pending submit state
- [x] Fix mobile anchor positioning below the fixed logo header
- [x] Verify 320px, 390px, and desktop browser layouts
- [x] Run typecheck, lint, and build
- [x] Final review

## Completion Marker

SNAAR_COMMUNITY_UX_POLISH_COMPLETE: true

---

## Goal

Replace the hero podcast player with the official Spotify embed while preserving the Stuk Verdriet card and signup CTA.

## Tasks

- [x] Inspect current hero player implementation
- [x] Inspect provided Spotify embed HTML
- [x] Replace custom audio controls with Spotify iframe
- [x] Preserve player card container and signup CTA
- [x] Add fallback Spotify episode URL for demo/local data
- [x] Run lint, typecheck, and build
- [x] Browser-check mobile and desktop hero layout
- [x] Final review

## Completion Marker

SPOTIFY_HERO_PLAYER_COMPLETE: true

---

## Goal

Fix SNAAR profile media and build a complete mobile-first personal profile with photos, events, friends, cover media, and saveable information.

## Tasks

- [x] Inspect current profile and avatar upload flow
- [x] Identify the Next.js image host failure
- [x] Define profile media, details, photos, events, and friendship data contracts
- [x] Build profile navigation and responsive sections
- [x] Add avatar, cover, photo, event, and profile-info forms
- [x] Apply and verify the Supabase migration
- [x] Run lint, typecheck, build, and browser verification
- [x] Final review

## Completion Marker

SNAAR_PROFILE_EXPERIENCE_COMPLETE: true

---

## Goal

Make every authenticated SNAAR community function work consistently across messenger, feed replies, profile editing, and moderation status history.

## Tasks

- [x] Trace authenticated state through the community page and messenger
- [x] Inventory existing chat, reply, profile, moderation, and RLS contracts
- [x] Remove guest login states from the authenticated messenger
- [x] Make contact search and conversation selection use real profiles
- [x] Verify durable message history and message sending
- [x] Add expandable feed comments with nested replies
- [x] Show own posts and replies with moderation status on profile
- [x] Re-verify all existing profile edit and media controls
- [x] Apply and verify any required Supabase migration
- [x] Run mobile, tablet, desktop, lint, typecheck, build, and end-to-end checks
- [x] Final review

## Completion Marker

SNAAR_AUTHENTICATED_COMMUNITY_COMPLETE: true

---

## Goal

Replace Reels with Aan de Pols and ship a mobile-first moment/story creator for SNAAR.

## Tasks

- [x] Inspect current profile and feed implementation
- [x] Add Supabase migration and TypeScript data contracts
- [x] Build profile creator/editor for Aan de Pols
- [x] Add mobile-first Aan de Pols strip to the feed
- [x] Wire create, edit, delete, image upload, layer metadata, animation, and AI request state
- [x] Run lint, typecheck, build, and route smoke checks
- [ ] Apply Supabase migration with database-owner privileges
- [x] Final review

## Completion Marker

AAN_DE_POLS_COMPLETE: false

---

## Goal

Fix pasted CSS compatibility diagnostics without changing community behavior.

## Tasks

- [x] Inspect pasted diagnostics
- [x] Identify real CSS compatibility issues
- [x] Leave component-level SEO false positives unchanged
- [x] Patch Safari, Firefox, line-clamp, and scrollbar compatibility
- [x] Run lint, typecheck, and build
- [x] Final review

## Completion Marker

CSS_COMPAT_DIAGNOSTICS_COMPLETE: true

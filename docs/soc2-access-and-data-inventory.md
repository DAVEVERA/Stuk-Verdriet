# SOC 2 Access and Data Inventory

Date: 2026-07-14
Owner: TBD
Status: draft, internal readiness evidence

This inventory records system, access, environment, data, and vendor facts for SOC 2 readiness. It intentionally records environment variable names only, never secret values.

## Production Systems

| System | Purpose | Owner | Data | Admin URL | Evidence Needed |
| --- | --- | --- | --- | --- | --- |
| Stuk Verdriet Next.js app | Public website, podcast, community, legal pages, admin UI | TBD | Public content, user-generated community content, auth state, cookie preference | `https://www.stukverdriet.com` and `/admin` | Production screenshot, route list, deployment evidence |
| Vercel project `stuk_master_deploy` | Hosting, production deployments, domains, environment variables | TBD | Deployment logs, env var names/secrets, domain aliases | Vercel dashboard, project id `prj_Y8lFqYW7J5zSaFQcgKYOwKCCjRXt` | Project member export, MFA/SSO evidence, env var export with values redacted |
| GitHub repo `DAVEVERA/Stuk-Verdriet` | Source control and deployment trigger | TBD | Source code, commit history, repo secrets if configured | `https://github.com/DAVEVERA/Stuk-Verdriet` | Collaborator export, branch protection screenshot, secret scanning status |
| Supabase project `nrpjgrlwsjxvlxlexhrs` | Auth, database, RLS, storage, service-role admin operations | TBD | User accounts, community data, podcast/admin data, email signup data | Supabase dashboard | Project member export, RLS evidence, backups, auth provider settings |
| Supabase storage buckets | Podcast audio and images | TBD | Audio files, cover images | Supabase Storage | Bucket policy screenshots, public/private status confirmation |
| Domain/DNS provider | Public domains and DNS routing | TBD | DNS records, ownership/admin access | TBD | DNS provider access export, MFA evidence |
| Email provider/account | Admin contact and operational correspondence | TBD | Business email, privacy requests, support messages | TBD | Account owner/MFA evidence, retention expectations |

## Access Holders

Dashboard-level access could not be fully exported from this CLI session. GitHub CLI is not authenticated, and Vercel CLI did not expose member details through the commands used. These are immediate evidence tasks.

| Person/Account | System | Role | Business Reason | MFA Verified | Last Reviewed | Remove? |
| --- | --- | --- | --- | --- | --- | --- |
| TBD | GitHub `DAVEVERA/Stuk-Verdriet` | Repo admin/collaborator | Source control and deployment | TBD | TBD | TBD |
| TBD | Vercel team `team_um90r09DtfO4FThEB8DpLZAz` | Project/team member | Hosting and env management | TBD | TBD | TBD |
| TBD | Supabase project `nrpjgrlwsjxvlxlexhrs` | Project member | Database/auth/storage administration | TBD | TBD | TBD |
| `ADMIN_EMAILS` allowlist | App admin route `/admin` | Application admin allowlist | Content moderation and podcast/admin management | Inherited from Supabase auth, dashboard verification needed | TBD | TBD |
| TBD | Domain/DNS provider | DNS admin | Domain routing and verification | TBD | TBD | TBD |
| TBD | Email account/provider | Mailbox admin/user | Contact, privacy, support operations | TBD | TBD | TBD |

## Environment Variables

Values are intentionally omitted. `.env.example` defines the expected variables. Production presence must be verified in Vercel/Supabase dashboards.

| System | Env Var Name | Purpose | Secret? | Owner | Rotation Needed |
| --- | --- | --- | --- | --- | --- |
| Vercel / Next.js | `NEXT_PUBLIC_SUPABASE_URL` | Browser/server Supabase project URL | No | TBD | On project change |
| Vercel / Next.js | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase anon key | No, but controlled | TBD | On key rotation/project change |
| Vercel / Next.js | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Alternative browser-safe Supabase publishable key | No, but controlled | TBD | On key rotation/project change |
| Vercel / Next.js | `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin client for moderation/deletion/admin tasks | Yes | TBD | Yes, define cadence |
| Vercel / Next.js | `NEXT_PUBLIC_SITE_URL` | Canonical site URL | No | TBD | On domain change |
| Vercel / Next.js | `ADMIN_EMAILS` | App admin allowlist | Sensitive operational config | TBD | On admin changes |
| Vercel / Next.js | `GOOGLE_CLOUD_PROJECT` | Transcript/Google Cloud integration | No | TBD | On project change |
| Vercel / Next.js | `GOOGLE_CLOUD_LOCATION` | Google Cloud location | No | TBD | On project change |
| Vercel / Next.js | `GOOGLE_CLOUD_STORAGE_BUCKET` | Transcript/audio processing bucket | Sensitive operational config | TBD | On bucket change |
| Vercel / Next.js | `GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON` | Google Cloud service account credentials | Yes | TBD | Yes, define cadence |
| Server/local only | `GOOGLE_APPLICATION_CREDENTIALS` | Alternative path to service account JSON | Yes/path-sensitive | TBD | Yes, define cadence |
| Vercel / Next.js | `NEXT_PUBLIC_GA_ID` | Google Analytics measurement id loaded after consent | No | TBD | On analytics property change |
| Local/dev | `SITE_MODE` | Build-time site mode helper | No | TBD | Not applicable |

## Data Categories

| Data Category | System/Table | Personal Data? | Sensitive? | Retention | Deletion Path |
| --- | --- | --- | --- | --- | --- |
| Supabase auth accounts | Supabase Auth `auth.users` | Yes | Yes | TBD | Supabase admin process, user deletion procedure needed |
| Episode signup emails | `episode_signups` | Yes: name, email, source/status | Yes | TBD | `src/lib/privacy-actions.ts` deletes by email when service role is configured |
| Interview subscriber emails | `interview_subscribers` migration/action path | Yes: email, related comment context | Yes | TBD | `src/lib/privacy-actions.ts` deletes by email when service role is configured |
| Community posts | `community_posts` | Possibly: author name/display type, post body | Possibly | TBD | Admin moderation/archive/delete procedure needed |
| Community replies | `community_replies` | Possibly: author name/display type, reply body | Possibly | TBD | Admin moderation/archive/delete procedure needed |
| Community support/likes | `community_supports` | Yes: user id relationship | Low/medium | TBD | User deletion cascade or admin procedure needed |
| Community reports | `community_reports` | Yes: reporter user id, reason | Possibly | TBD | Admin resolution/deletion procedure needed |
| Interview comments | `interview_comments` from migrations/actions | Possibly: author name/email/body | Possibly | TBD | Moderation and privacy deletion procedure needed |
| Podcast/admin content | `podcast_seasons`, `podcast_episodes`, `host_profiles`, `faqs`, `sponsor_logos`, `site_settings` | Usually no, except host/profile data | Low/medium | TBD | Admin edit/archive/delete procedure |
| Storage assets | Supabase buckets `podcast-audio`, `podcast-images`; repo `public/audio`, `public/img` | Usually no | Depends on content | TBD | Storage deletion/admin procedure |
| Cookie consent | Browser local storage via cookie consent hook | Possibly device-local only | Low | Browser controlled | User clears browser/localStorage |
| Analytics events | Google Analytics if `NEXT_PUBLIC_GA_ID` configured and consent granted | Potentially | Medium | Google Analytics setting TBD | Google Analytics data controls TBD |
| Rate-limit signals | In-memory server action rate-limit keys using IP/email-derived keys | Yes, transient | Low/medium | Process memory only | Expires by configured window |
| Deployment/build logs | Vercel/GitHub | Could include operational metadata | Low/medium | Platform default TBD | Platform retention controls TBD |

## Vendors

| Vendor | Purpose | Data Shared | Processor? | DPA | SOC/ISO Evidence | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| Vercel | Hosting, serverless runtime, deployments, analytics package dependency | App traffic, logs, env vars, deployment metadata | Yes | TBD | TBD | TBD |
| Supabase | Auth, Postgres database, RLS, storage | User accounts, community/admin data, emails, storage files | Yes | TBD | TBD | TBD |
| GitHub | Source control and deployment integration | Source code, issues/PRs if used, repo secrets if configured | Yes/No depending use | TBD | TBD | TBD |
| Google Analytics / Google Tag Manager | Analytics after cookie consent | Analytics events, IP-derived telemetry | Yes | TBD | TBD | TBD |
| Google Cloud | Transcript/storage integration if configured | Audio/transcript processing data, service account access | Yes | TBD | TBD | TBD |
| Instagram | Social embed/link | Visitor interaction with embed/platform | External controller/possible processor | TBD | TBD | TBD |
| TikTok | Social embed/link | Visitor interaction with embed/platform | External controller/possible processor | TBD | TBD | TBD |
| Spotify | Podcast embed/link | Listener interaction with embed/platform | External controller/possible processor | TBD | TBD | TBD |
| GoFundMe | Embedded donation/link flow | Visitor interaction with embed/platform | External controller/possible processor | TBD | TBD | TBD |
| Domain/DNS provider | DNS and domain management | DNS records, account metadata | Yes/No depending provider | TBD | TBD | TBD |
| Email provider | Contact/privacy/admin communication | Email content and addresses | Yes | TBD | TBD | TBD |

## Initial Evidence Tasks

| Task | Priority | Owner | Evidence |
| --- | --- | --- | --- |
| Export GitHub collaborators and branch protection settings | High | TBD | Screenshot/export stored in evidence folder |
| Export Vercel project/team members and confirm MFA/SSO controls | High | TBD | Screenshot/export stored in evidence folder |
| Export Supabase project members and auth provider settings | High | TBD | Screenshot/export stored in evidence folder |
| Confirm all production env var names in Vercel without recording values | High | TBD | Redacted screenshot/export |
| Confirm Supabase backups and perform first restore test | High | TBD | Backup settings screenshot and restore-test note |
| Confirm DNS provider and domain admins | High | TBD | Access export/screenshot |
| Collect DPAs/SOC reports for Vercel, Supabase, GitHub, Google and email provider | Medium | TBD | Vendor evidence links or files |
| Define retention per data category | Medium | TBD | Approved data retention matrix |
| Run first formal access review | High | TBD | Signed/dated access review record |

## Notes From Current Session

- Vercel project is linked locally via `.vercel/project.json`.
- Supabase MCP config points to project ref `nrpjgrlwsjxvlxlexhrs`.
- GitHub remote is `https://github.com/DAVEVERA/Stuk-Verdriet.git`.
- GitHub CLI was not authenticated, so collaborator export could not be collected.
- `npx vercel env ls` reached the project but did not print env var details in the current terminal output.
- RLS policies are present in `supabase/schema.sql`, but live production policy state still needs dashboard/SQL verification.

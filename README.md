# ReShift — Moderator & Administrator Control Panel

A production-grade web control panel and operations dashboard built for **ReShift** — the urban relocation and city-moving companion. Built with Next.js 15 App Router, TypeScript, Tailwind CSS, TanStack Query, and fully integrated with a live **Supabase** backend (PostgreSQL, Supabase Auth, Storage, and Realtime channels) and **Brevo Transactional Email Service**.

![ReShift Dashboard](public/reshift-icon.png)

---

## 🚀 Key Modules & Capabilities

- **📊 Mission Control & Analytics (`/`)**: Real-time KPI summary (active users, verified housing listings, community volume, emergency alerts, open support tickets, and city-scoped trends) rendered with Recharts.
- **🛡️ Staff & Volunteer Approvals (`/approvals`)**: Dedicated verification queue for staff registration applications. Inspect applicant company ID cards in an interactive high-resolution lightbox, approve with assigned roles (`moderator`, `volunteer`, `content_editor`), or reject with automated Brevo notification dispatch.
- **👥 User Directory & Moderation (`/users`, `/users/[id]`)**: Full user directory with city filtering, suspension management with documented audit reasons, administrative password resets, relocation step trackers, and authored content moderation.
- **🏠 Housing & PG Moderation (`/housing`, `/housing/new`, `/housing/[id]`)**: Comprehensive property management with active/verified toggles, rent formatting (₹ INR), amenity tags, direct multi-image uploads to Supabase Storage, and CSV bulk import/export.
- **🚌 Transport & Bus Schedules (`/transport`)**: Route sequencer, stop listings, and live departure timer schedulers.
- **🍽️ Food & City Gems (`/food`)**: Curated restaurants, street food spots, price-tier filtering, cuisine tags, and instant "Open Now" status switches.
- **📅 Events & Hero Carousels (`/events`)**: Event calendar scheduler, venue details, category badges, banner uploader, and home banner carousel spotlight toggles.
- **💬 Community Moderation (`/community`)**: Live feed moderation, post pinning, soft-hide with reason logging, category migration, inline reply deletion, and category management.
- **🎫 Support Desk (`/tickets`, `/tickets/[id]`)**: Multi-status workflow (`Open` ➔ `In Review` ➔ `Resolved` ➔ `Closed`) with SLA priority badges and internal confidential moderator notes.
- **📱 Carousels & Mobile Frame Simulator (`/carousels`)**: Live interactive smartphone simulator previewing real-time changes to home banners, explore cards, and onboarding carousels.
- **🔔 Push Notifications (`/notifications`)**: Audience segmentation (by city, relocation status, or broadcast), live preview cards, and in-app deep linking.
- **🏥 Essentials & Services (`/essentials`, `/services`, `/emergency`, `/guides`, `/internet`)**: Supermarkets, banks, hospitals, emergency SOS contacts, broadband plans, and insider local city guides.
- **⚙️ City & System Settings (`/settings`)**: City coordinates management and 5-step relocation checklist configurator.
- **📜 Immutable Audit Trail (`/audit-log`)**: Complete audit log with expandable JSON state diff viewers.

---

## 🔒 Security & Authentication Architecture

- **Super Admin Provisioning**: Seeded administrator credentials (`reshiftapp@gmail.com`) with elevated privilege bypass for platform governance.
- **Email OTP Password Recovery (`/forgot-password`)**: Powered by **Brevo (Sendinblue)** transactional email REST API. 6-digit OTP delivery, SHA-256 hash persistence, 10-minute TTL, rate limiting, and 5-attempt brute-force protection.
- **Volunteer Onboarding (`/register`)**:
  - **Name**: Strict alphabetic & space validation (`/^[a-zA-Z\s]{2,50}$/`).
  - **Mobile (India Exclusive)**: 10 digits (`/^[6-9]\d{9}$/`) with visual non-editable `🇮🇳 +91` badge prefix.
  - **Password Policy**: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 numeric digit.
  - **Company ID Card Upload**: Direct-to-storage upload in dedicated private `id-cards` bucket.
- **Pending-Approval Login Guard (`/login`)**: Automatically intercepts unverified or pending accounts, denies dashboard access, and presents application status notices.

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root directory (refer to [`.env.example`](.env.example)):

```env
# Supabase Project Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_anon_key

# Supabase Server-Only Administrative Secret Key (Bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key

# App Settings
NEXT_PUBLIC_APP_NAME="Reshift Moderator Control Panel"

# Brevo (Sendinblue) Transactional Email Service
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL="reshiftapp@gmail.com"
BREVO_SENDER_NAME="ReShift Team"
```

> **Security Note**: All secrets and credentials strictly load from environment variables at runtime. `.env*` files containing keys are explicitly excluded from version control via `.gitignore`.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🗄️ Database Schema & Migrations

The complete PostgreSQL migration script containing all table extensions, RLS policies, check constraints, security definer triggers, and audit log tables is available in:
[`database_migration_master.sql`](database_migration_master.sql)

To execute in the Supabase Dashboard:
1. Navigate to **SQL Editor** in your Supabase project.
2. Paste the contents of `database_migration_master.sql`.
3. Click **Run**.

---

## 📄 License
Private & Proprietary — Developed for ReShift Platform.

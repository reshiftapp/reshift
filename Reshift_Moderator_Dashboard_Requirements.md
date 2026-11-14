# Reshift Moderator Dashboard — Web Version
## Product Requirements Document (PRD)

> **App:** Reshift (Relocation Companion) · Flutter + Supabase  
> **Dashboard Type:** Web-based Admin / Moderator Control Panel  
> **Backend:** Supabase (PostgreSQL + RLS + Storage + Realtime)  
> **Document Version:** 1.0 · November 2026

---

## 1. Overview

The **Reshift Moderator Dashboard** is a secure, web-only control panel that gives authorised moderators full CRUD access to every piece of content, data, and configuration that powers the Reshift mobile app. All changes made through the dashboard are written directly to Supabase and reflected in the live app in real time.

---

## 2. Access & Authentication

### 2.1 Moderator Role System

| Role | Description |
|------|-------------|
| `super_admin` | Full access to all sections + can grant/revoke moderator roles |
| `moderator` | Full CRUD on all content; cannot change other moderators' roles |
| `content_editor` | CRUD on content only (housing, food, transport, etc.); no user management |

### 2.2 Authentication Requirements
- Login via **email + password** (Supabase Auth — same auth system as the mobile app)
- Moderator access determined by a new `moderator_role` column on `public.profiles` (values: `null` / `moderator` / `super_admin`)
- **Two-factor authentication (2FA)** required for all moderator accounts
- Session auto-expires after 8 hours of inactivity
- Login activity log (IP, timestamp, device) stored in a `moderator_audit_log` table

### 2.3 Supabase RLS Changes Required
- Add `moderator_role` column to `public.profiles`
- Create a helper function `is_moderator()` returning `true` when `auth.uid()` has a non-null `moderator_role`
- Update all table RLS policies to allow full read/write for `is_moderator()`

---

## 3. Dashboard Layout & Navigation

```
┌─────────────────────────────────────────────────────┐
│  🔼 Reshift Moderator          [City ▼]  [👤 Mod]  │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │         MAIN CONTENT AREA                │
│          │                                          │
│ Overview │                                          │
│ Users    │                                          │
│ Housing  │                                          │
│ Transport│                                          │
│ Food     │                                          │
│ Events   │                                          │
│ Essentials│                                         │
│ Guide    │                                          │
│ Internet │                                          │
│ Bank/Med │                                          │
│ Community│                                          │
│ Carousel │                                          │
│ Notifs   │                                          │
│ Support  │                                          │
│ Settings │                                          │
└──────────┴──────────────────────────────────────────┘
```

### 3.1 Global Controls
- **City Switcher** (top bar): Kochi, Bangalore, Trivandrum, Calicut, Chennai — all data scoped to selected city
- **Search bar**: Global search across all data types
- **Realtime indicator**: Green dot showing live Supabase connection status

---

## 4. Section Requirements

---

### 4.1 📊 Overview Dashboard (Home)

Displays key metrics at a glance.

| Metric Card | Data Source |
|-------------|-------------|
| Total Users | `profiles` row count |
| Active Properties | `properties` where `is_active = true` |
| Community Posts (today) | `community_posts` with today's date |
| Open Support Tickets | `support_tickets` where `status = 'Open'` |
| Events This Month | `events` count |
| Food Spots Listed | `food_spots` count |

**Charts:**
- User registrations over time (line chart, 30 days)
- Posts per community category (bar chart)
- Support ticket resolution rate (pie chart)

**Quick Action Buttons:**
- Send Notification, Add Event, Add Property, Add Food Spot

---

### 4.2 👥 User Management

Full control over all registered users.

#### 4.2.1 User List View
- **Table columns:** Avatar · Full Name · Email · Role (Student/Working Professional/Other) · City · Joined Date · Status · Moderator Role
- **Filters:** City, Role, Moderator Role, Date Range, Search by name/email
- **Sortable columns:** Name, Email, Joined Date
- **Bulk actions:** Export CSV, Bulk suspend, Bulk delete

#### 4.2.2 User Detail Page
Clicking a user opens a full profile page with:

| Section | Editable Fields |
|---------|-----------------|
| **Profile** | Full Name, Email, Role (Student/Professional/Other), City, Avatar URL |
| **Account Status** | Active / Suspended / Banned (with reason + timestamp) |
| **Moderator Role** | Grant/revoke `moderator` or `super_admin` (super_admin only) |
| **Relocation Progress** | View + edit completion state of all 5 relocation steps |
| **Saved Properties** | View list; moderator can remove saved items |
| **Community Posts** | View all posts; moderator can delete any post |
| **Community Replies** | View all replies; moderator can delete any reply |
| **Messages** | Read-only view of conversations (privacy-sensitive; super_admin only) |
| **Support Tickets** | Full ticket history with ability to update status |

#### 4.2.3 Actions
- ✅ Edit any profile field → sync to `profiles` table
- ✅ Suspend / Ban user (sets `is_suspended` flag; app shows "Account suspended" on login)
- ✅ Delete user (cascades via FK — removes posts, saves, etc.)
- ✅ Promote/demote moderator role
- ✅ Reset password (via Supabase Admin API — sends reset email)
- ✅ Impersonate user (view app as that user — read-only audit mode)

---

### 4.3 🏠 Housing Management

**Supabase table:** `properties`

#### List View
- Table with: Image Thumbnail · Name · For Whom · Location · City · Rent · Rating · Verified · Active
- Filters: City, For Whom (Girls/Boys/Any), Verified, Active/Inactive, Rent range
- Search by name or location

#### Add / Edit Property Form

| Field | Type | Notes |
|-------|------|-------|
| Name | Text | e.g., "Grace PG (Girls)" |
| City | Select | Kochi, Bangalore, etc. |
| For Whom | Select | Girls, Boys, Any |
| Location | Text | Neighbourhood name |
| Latitude / Longitude | Number | Map pin coordinates |
| Distance (km) | Number | From city centre |
| Monthly Rent (₹) | Number | Min 0 |
| Is Verified | Toggle | Shows verified badge in app |
| Is Active | Toggle | Hides from app when off |
| Amenities | Multi-select chips | Meals, Wi-Fi, AC, Laundry, etc. |
| Description | Rich text | Full description |
| Rating | Slider 0–5 | Step 0.1 |
| **Property Images** | **Image uploader** | Upload to Supabase Storage; multiple images; set primary image |

#### Actions
- ✅ Add new property (INSERT into `properties`)
- ✅ Edit all fields (UPDATE)
- ✅ Change / replace property images (upload to Storage, update `image_url`)
- ✅ Toggle Active/Inactive (soft delete)
- ✅ Hard delete property
- ✅ Bulk import via CSV
- ✅ View map preview with the lat/long pin

---

### 4.4 🚌 Transport Management

**Supabase tables:** `transport_stops`, `bus_routes`, `bus_route_stops`

#### 4.4.1 Transport Stops
| Field | Type |
|-------|------|
| Name | Text |
| City | Select |
| Distance | Text (e.g., "0.3 km") |
| Route Info | Text (e.g., "Bus & Auto stand") |
| Latitude / Longitude | Number |
| Is Active | Toggle |

#### 4.4.2 Bus Routes
| Field | Type |
|-------|------|
| Route Number | Text (e.g., "307") |
| City | Select |
| Origin | Text |
| Destination | Text |
| Next Bus (minutes) | Number |
| Subsequent Buses (minutes) | Comma-separated list |
| Current Stop Index | Number |
| Is Active | Toggle |

#### 4.4.3 Bus Route Stops (sub-table)
- Ordered list of stops for each route
- Drag-and-drop reordering
- Add / remove / rename individual stops

#### Actions
- ✅ Full CRUD on transport stops
- ✅ Full CRUD on bus routes and their stop sequences
- ✅ Reorder stops via drag-and-drop
- ✅ Toggle active/inactive

---

### 4.5 🍽️ Food & Places Management

**Supabase table:** `food_spots`

#### Add / Edit Food Spot Form

| Field | Type |
|-------|------|
| Name | Text |
| City | Select |
| Location | Text |
| Latitude / Longitude | Number |
| Distance (km) | Number |
| Rating | Slider 0–5 |
| Cuisine | Text (e.g., "Kerala, North Indian") |
| Price Range | Select (₹, ₹₹, ₹₹₹) |
| Is Available Now | Toggle |
| **Image** | **Image uploader** (upload to Supabase Storage) |

#### Actions
- ✅ Add / edit / delete food spots
- ✅ Upload / replace place images (stored in Supabase Storage bucket `food-images`)
- ✅ Bulk toggle "Available Now" for multiple spots
- ✅ Map view to visually place pins

---

### 4.6 📅 Events Management

**Supabase table:** `events`

#### Add / Edit Event Form

| Field | Type |
|-------|------|
| Title | Text |
| City | Select |
| Event Date & Time | DateTime picker |
| Venue | Text |
| Category | Select (Community, Music, Sports, Tech, Culture, Food) |
| **Event Image** | **Image uploader** (upload to Supabase Storage; shown in app carousel) |
| Description | Rich text |
| Is Active | Toggle |

#### "Live in Kochi" / Events Carousel Control
- The events carousel on the home screen is driven by the `events` table
- Moderator can:
  - ✅ Set which events appear in the home-screen **hero carousel** via an `is_featured` boolean flag
  - ✅ Upload / replace the carousel image for each event
  - ✅ Reorder featured events (drag-and-drop `sort_order`)
  - ✅ Set expiry date after which event is auto-hidden

---

### 4.7 🛒 Essentials Management

**Supabase table:** `essential_places`

Categories: Groceries, Electronics, Home & Living, Pharmacy, SIM & Internet, Banking

#### Add / Edit Essential Place Form

| Field | Type |
|-------|------|
| Name | Text |
| City | Select |
| Category | Select (from above list) |
| Address | Text |
| Phone Number | Text |
| Latitude / Longitude | Number |
| Is Open | Toggle |
| **Image** | **Image uploader** |

#### Actions
- ✅ Full CRUD on essential places
- ✅ Upload / replace images
- ✅ Bulk toggle "Is Open"

---

### 4.8 📚 Local Guide Management

**Supabase table:** `local_guides`

#### Add / Edit Guide Entry Form

| Field | Type |
|-------|------|
| Title | Text (e.g., "Best Cafés in Fort Kochi") |
| City | Select |
| Description | Rich text |
| Category | Select (Explore, Food, Culture, Nightlife, Shopping, Nature) |
| **Guide Image** | **Image uploader** (upload to Supabase Storage) |

#### Actions
- ✅ Full CRUD on guide entries
- ✅ Upload / replace cover images
- ✅ Reorder guide entries (sort_order)

---

### 4.9 📶 Internet & SIM Plans Management

**Supabase table:** `internet_plans`

#### Add / Edit Plan Form

| Field | Type |
|-------|------|
| Provider Name | Text (e.g., "Asianet", "JioFiber") |
| City | Select |
| Plan Subtitle | Text (e.g., "Home Broadband") |
| Speed (Mbps) | Number |
| Price Per Month (₹) | Number |
| Status | Select (Available, Limited Stock, Unavailable) |
| Phone Number | Text (clickable in app) |
| Is Available | Toggle |
| **Provider Logo** | **Image uploader** |

#### Actions
- ✅ Full CRUD on internet plans
- ✅ Upload / replace provider logos

---

### 4.10 🏦 Bank & 🏥 Medical Management

**Supabase table:** `essential_places` (filtered by category)

These share the essential_places table but are surfaced as dedicated sections in the sidebar for convenience:
- **Bank** → `category = 'Banking'`
- **Medical** → `category = 'Pharmacy'` or `'Medical'`

For each:
| Field | Type |
|-------|------|
| Name | Text |
| City | Select |
| Address | Text |
| Phone Number | Text |
| Opening Hours | Text |
| Latitude / Longitude | Number |
| Is Open | Toggle |
| **Image / Logo** | **Image uploader** |

#### Actions
- ✅ Full CRUD
- ✅ Upload / replace images

---

### 4.11 🚨 Emergency Services Management

**Supabase table:** `emergency_services`

| Field | Type |
|-------|------|
| Name | Text (e.g., "Ernakulam General Hospital") |
| City | Select |
| Category | Select (Police, Ambulance, Fire, Women's Helpline, Hospital) |
| Phone Number | Text |
| Description | Text |
| Sort Order | Number |

#### Actions
- ✅ Full CRUD on emergency services
- ✅ Reorder (drag-and-drop)
- ✅ Change phone numbers instantly (reflects in live app)

---

### 4.12 💬 Community Management

**Supabase tables:** `community_posts`, `community_replies`, `community_categories`, `community_members`, `community_post_likes`, `community_comments`

#### 4.12.1 Community Categories
- View all categories (Stays, Food, Travel, Meetup, Weekend, Events, Transport)
- Edit: name, description, icon, sort_order, is_active
- Add new custom category
- Deactivate / reactivate category (hides from app without deleting posts)

#### 4.12.2 Posts Management
- Full posts feed with filters: City, Category, Date Range, Search by content / author
- **Columns:** Author · City · Category · Content preview · Likes · Replies · Posted At · Actions
- Moderator actions per post:
  - ✅ **View full post** with all replies
  - ✅ **Edit post content** (UPDATE `community_posts.content`)
  - ✅ **Delete post** (cascades to replies, likes, comments)
  - ✅ **Pin post** (add `is_pinned` boolean — pinned posts appear at top of feed)
  - ✅ **Flag / hide post** (soft-hide without deleting)
  - ✅ **Move post** to a different category

#### 4.12.3 Replies / Comments Management
- View all replies for any post
- Moderator actions:
  - ✅ Delete any reply
  - ✅ Edit reply content

#### 4.12.4 Member Management
- View community members per category
- Remove a user from a community

---

### 4.13 🎠 Carousel & Banner Image Management

> This is a dedicated section to manage all visual carousels in the app.

#### Carousels Managed:

| Carousel | Location in App | Data Source |
|----------|-----------------|-------------|
| **Live in [City] — Featured Events** | Home Screen hero banner | `events` table with `is_featured = true` |
| **Explore Cards** | Explore Screen (Best Cafés, City Spots, Local Events, Food Guides) | New `explore_cards` table |
| **Property Listing Images** | Find Home Screen, Property Detail | `properties.image_url` (Supabase Storage) |
| **Food Spot Images** | Food & Places Screen | `food_spots` (Supabase Storage) |
| **Event Banner Images** | Events Screen | `events.image_url` (Supabase Storage) |
| **Guide Cover Images** | Local Guide Screen | `local_guides.image_url` (Supabase Storage) |
| **Splash / Onboarding Banners** | Splash & Onboarding Screens | New `app_banners` table |

#### Per-Carousel Controls:
- ✅ **Upload new image** (drag-and-drop uploader → Supabase Storage → returns public URL → updates table)
- ✅ **Replace existing image** (overwrite in Storage + update URL in DB)
- ✅ **Reorder carousel items** (drag-and-drop `sort_order`)
- ✅ **Toggle visibility** (`is_active` / `is_featured`)
- ✅ **Set link / action** for each carousel card (opens a specific screen in-app)
- ✅ **Preview** carousel as it will appear in the mobile app (responsive mockup)

#### New DB Tables Required:

**`explore_cards`**
```sql
create table public.explore_cards (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  title text not null,
  subtitle text not null,
  image_url text,
  action_route text,
  sort_order smallint not null default 0,
  is_active boolean not null default true
);
```

**`app_banners`**
```sql
create table public.app_banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null, -- 'splash', 'onboarding_1', 'onboarding_2', 'onboarding_3'
  image_url text,
  is_active boolean not null default true
);
```

---

### 4.14 🔔 Push Notification Management

Custom public notifications broadcast to app users.

#### Notification Composer

| Field | Type | Notes |
|-------|------|-------|
| Title | Text | Max 65 characters |
| Body / Message | Text | Max 240 characters |
| Target City | Multi-select | All cities or specific ones |
| Target Audience | Select | All Users / Students / Working Professionals / Specific city |
| Notification Type | Select | Announcement, Event Alert, Maintenance, Offer, New Listing |
| Icon / Image URL | Image uploader | Optional banner image in notification |
| Deep Link (Action) | Select + Config | Open Home / Events / Housing / Food / Transport / Custom URL |
| Schedule | DateTime picker | Send now or schedule for later |

#### Notification History Table
- Columns: Title · Body · City · Audience · Sent At · Sent By (moderator) · Delivery Count
- Filter by: Date, Type, City
- Action: Resend notification

#### DB Table Required:

**`push_notifications`**
```sql
create table public.push_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  target_city text[] not null default '{}',
  target_audience text not null default 'all',
  notification_type text not null default 'Announcement',
  image_url text,
  deep_link text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  sent_by uuid references public.profiles(id),
  delivery_count integer default 0,
  created_at timestamptz not null default now()
);
```

> **Note:** Requires integration with Firebase Cloud Messaging (FCM) or Supabase Edge Functions + a push provider (Expo Push / OneSignal / FCM) to deliver notifications to mobile app devices.

---

### 4.15 🎫 Support Tickets Management

**Supabase table:** `support_tickets` (already partially implemented in the app)

Extends the existing moderator dashboard in the Flutter app with richer web functionality.

#### Ticket List View
- Filters: Status (Open / In Review / Resolved), Priority (High / Medium / Low), Category, City, Date range
- Search by ticket number, user email, subject
- Bulk actions: Mark resolved, Change priority, Export CSV

#### Ticket Detail View
- All ticket metadata (number, user, category, subject, description, priority, status, timestamps)
- **Internal Notes** — moderators can add private notes visible only to other moderators
- **Status change log** (who changed it, when)
- Link to the user's full profile
- Reply to user button (opens email client / sends in-app notification)

#### DB Schema Additions:
```sql
-- Internal moderator notes on tickets
create table public.ticket_notes (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.support_tickets(id) on delete cascade,
  moderator_id uuid references public.profiles(id),
  note text not null,
  created_at timestamptz not null default now()
);

-- Status change audit log
alter table public.support_tickets
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by uuid references public.profiles(id);
```

---

### 4.16 🏙️ City & App Settings Management

#### City Management
- Add new city to the app (new entry in a `cities` config table)
- Edit city name, state, description
- Set city gradient colours (used on select city screen)
- Activate / deactivate a city

#### Relocation Steps Management
**Supabase table:** `relocation_steps`

| Field | Type |
|-------|------|
| Title | Text |
| Subtitle | Text |
| Sort Order | Number |
| Is Active | Toggle |

- ✅ Full CRUD on relocation checklist steps
- ✅ Reorder steps (drag-and-drop)

#### Community Categories Management
- As described in §4.12.1

---

### 4.17 📋 Audit Log

Every moderator action is recorded.

**DB Table:**
```sql
create table public.moderator_audit_log (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid references public.profiles(id),
  action text not null,       -- e.g. 'DELETE_POST', 'UPDATE_PROPERTY'
  table_name text not null,   -- e.g. 'community_posts'
  record_id text,             -- the affected row's id
  old_value jsonb,            -- snapshot before change
  new_value jsonb,            -- snapshot after change
  ip_address text,
  created_at timestamptz not null default now()
);
```

- Viewable in a dedicated **Audit Log** section
- Filters: Moderator, Action type, Table, Date range
- Read-only (no deletion)

---

## 5. Image Upload System (Global)

Applies to all sections that handle images.

### 5.1 Upload Flow
1. Moderator clicks "Upload Image" or drags an image into the drop zone
2. Client-side preview shown immediately
3. Image uploaded to the appropriate **Supabase Storage bucket**
4. Public URL returned and written to the relevant table column
5. Live app fetches the new URL on next data refresh (or realtime subscription)

### 5.2 Storage Bucket Mapping

| Bucket | Used For |
|--------|----------|
| `profilepicture` | User avatars |
| `property-images` | Housing / PG photos |
| `food-images` | Food & place photos |
| `event-images` | Event banners and carousel images |
| `guide-images` | Local guide cover images |
| `carousel-images` | Explore cards, splash, onboarding banners |
| `notification-images` | Push notification banner images |

### 5.3 Image Requirements
- Accepted formats: JPG, PNG, WebP, GIF
- Max file size: 5 MB per image
- Auto-resize / compress on upload (via Supabase Transform or Edge Function)
- Multiple images supported for properties (gallery)

---

## 6. Tech Stack Recommendations

| Component | Technology |
|-----------|------------|
| **Frontend** | React (Next.js) + TypeScript |
| **UI Library** | shadcn/ui + Tailwind CSS |
| **Charts** | Recharts or Chart.js |
| **Rich Text Editor** | TipTap or Quill |
| **Drag & Drop** | dnd-kit |
| **Image Upload** | Supabase Storage SDK + react-dropzone |
| **State Management** | TanStack Query (React Query) |
| **Auth** | `@supabase/auth-helpers-nextjs` |
| **Realtime** | Supabase Realtime channels (live ticket/post updates) |
| **Push Notifications** | Firebase Admin SDK / Expo Push API (via Supabase Edge Function) |
| **Deployment** | Vercel / Netlify |

---

## 7. Supabase Schema Changes Summary

All changes are additive and backwards-compatible with the existing Flutter app.

```sql
-- 1. Moderator role column
alter table public.profiles
  add column if not exists moderator_role text check (moderator_role in ('moderator', 'super_admin'));

-- 2. is_moderator() helper
create or replace function public.is_moderator()
returns boolean language sql security definer as $$
  select coalesce(
    (select moderator_role is not null from public.profiles where id = auth.uid()),
    false
  );
$$;

-- 3. is_featured flag on events
alter table public.events
  add column if not exists is_featured boolean not null default false,
  add column if not exists sort_order smallint not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists description text not null default '';

-- 4. is_pinned / is_hidden flags on community_posts
alter table public.community_posts
  add column if not exists is_pinned boolean not null default false,
  add column if not exists is_hidden boolean not null default false;

-- 5. Suspension flag on profiles
alter table public.profiles
  add column if not exists is_suspended boolean not null default false,
  add column if not exists suspension_reason text;

-- 6. New tables (create statements in respective sections above):
--    explore_cards, app_banners, push_notifications,
--    ticket_notes, moderator_audit_log
```

---

## 8. Security Requirements

- All dashboard routes protected behind Supabase Auth session check
- Supabase RLS enforces `is_moderator()` server-side — no client bypass possible
- Image uploads validated server-side (content type + size limits)
- All destructive actions (delete user, delete post) require a **confirmation dialog**
- Audit log entry written **before** every write operation
- Moderators cannot delete or modify the audit log
- 2FA enforced at login
- Dashboard accessible only over HTTPS

---

## 9. UI/UX Requirements

- **Responsive:** Optimised for desktop (1280px+); usable at 768px tablet
- **Theme:** Matches Reshift brand — primary colour `#5B6FD0`, same typography (Inter / Poppins)
- **Dark mode:** Optional (nice-to-have v2)
- **Loading states:** Skeleton screens on data load, spinner on write operations
- **Success / error toasts:** Every operation provides immediate feedback
- **Empty states:** Friendly illustrations when lists are empty
- **Pagination / infinite scroll:** All large lists paginated (20 rows default)
- **Keyboard shortcuts:** `Cmd/Ctrl + S` to save, `Esc` to cancel / close modals
- **Realtime updates:** Ticket list and community posts update live without refresh

---

## 10. Feature Priority

| Priority | Feature |
|----------|---------|
| 🔴 P0 (MVP) | Auth + user management + housing CRUD + community post moderation + support tickets |
| 🟠 P1 | Food, events, transport, essential places, carousel image management |
| 🟡 P2 | Push notifications, guide, internet plans, bank/medical, audit log |
| 🟢 P3 | Explore cards, app banners, analytics charts, dark mode, bulk import/export |

---

## 11. Out of Scope (v1)

- In-app chat / messaging between moderators
- Automated content moderation (AI-based flagging)
- A/B testing configuration
- Multi-language (i18n) support for the dashboard UI
- Native mobile moderator app

---

*Document prepared for the Reshift team · November 2026*

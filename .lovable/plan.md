

# Donation & Pay-for-a-Child Feature Plan

## Overview

Two new features for the platform: (1) a flexible donation system supporting one-time, recurring, and goal-based campaigns, and (2) a "Sponsor a Student" system where donors pick a specific student from a waitlist and pay their course fee. Both features allow anonymous (no login required) donations.

---

## 1. Database Changes

**New tables:**

- **`donations`** — tracks every donation (one-time or recurring reference)
  - `id`, `donor_name`, `donor_email`, `donor_phone`, `user_id` (nullable, for logged-in donors), `amount`, `currency`, `type` (one-time | recurring), `campaign_id` (nullable), `status` (pending | completed | failed), `flutterwave_ref`, `flutterwave_tx_id`, `created_at`

- **`donation_campaigns`** — admin-created campaigns with goals
  - `id`, `title`, `description`, `goal_amount`, `raised_amount` (default 0), `currency`, `image_url`, `active` (boolean), `created_at`, `updated_at`

- **`student_sponsorship_requests`** — students requesting sponsorship
  - `id`, `student_user_id`, `course_id`, `reason` (text), `status` (pending | sponsored | rejected), `sponsored_by_donation_id` (nullable), `created_at`, `updated_at`

**RLS policies:**
- Donations: public INSERT (anonymous), authenticated SELECT for own donations, admin SELECT/UPDATE all
- Campaigns: public SELECT (active ones), admin ALL
- Sponsorship requests: students can INSERT/view own, admin can manage all, public can SELECT pending requests (with limited fields for the donor page)

---

## 2. Edge Function: `handle-donation`

Extends the existing payment pattern. Actions:
- **`initialize`** — creates a donation record, returns Flutterwave public key
- **`verify`** — verifies payment with Flutterwave, updates donation status, and if it's a sponsorship donation, auto-enrolls the sponsored student and updates the request status
- For campaigns: increments `raised_amount` on the campaign after successful verification

---

## 3. New Pages & Components

### Public Pages (no login required)

- **`/donate`** — Donation page with:
  - Quick-amount buttons (₦1,000 / ₦5,000 / ₦10,000 / custom)
  - Donor info form (name, email, phone — not requiring account)
  - Active campaigns section with progress bars showing goal vs raised
  - Option to donate to general fund or a specific campaign

- **`/sponsor-a-student`** — Shows pending sponsorship requests:
  - Cards showing student first name (privacy-safe), course title, course price, and their reason
  - "Sponsor This Student" button opens payment flow
  - Donor fills in name/email/phone, pays via Flutterwave
  - On success: student is auto-enrolled, request marked as sponsored

### Student Dashboard Addition
- "Request Sponsorship" button on course pages (for courses the student can't afford)
- Simple form: select course, write a short reason
- View status of their sponsorship requests

### Admin Pages
- **Admin > Donations** — view all donations, filter by type/status, see totals
- **Admin > Campaigns** — create/edit/toggle campaigns, view progress
- **Admin > Sponsorship Requests** — view/approve/reject requests, see which were fulfilled

### Navigation
- Add "Donate" and "Sponsor a Student" links to the Navbar (visible to everyone)
- Add admin sidebar entries for Donations, Campaigns, Sponsorship

---

## 4. Payment Flow (Flutterwave)

Same pattern as existing course payments:
1. Collect donor info + amount on frontend
2. Call `handle-donation` edge function with `action: 'initialize'`
3. Open Flutterwave inline checkout with returned public key
4. On callback, call `action: 'verify'` with transaction ID
5. Show success/failure message

---

## 5. Files to Create/Modify

| Action | File |
|--------|------|
| Create | `src/pages/DonatePage.tsx` |
| Create | `src/pages/SponsorStudentPage.tsx` |
| Create | `src/pages/admin/AdminDonationsPage.tsx` |
| Create | `src/pages/admin/AdminCampaignsPage.tsx` |
| Create | `src/pages/admin/AdminSponsorshipPage.tsx` |
| Create | `src/components/donate/DonationForm.tsx` |
| Create | `src/components/donate/CampaignCard.tsx` |
| Create | `src/components/sponsor/SponsorshipRequestCard.tsx` |
| Create | `supabase/functions/handle-donation/index.ts` |
| Modify | `src/App.tsx` — add routes |
| Modify | `src/components/layout/Navbar.tsx` — add nav links |
| Modify | `src/components/admin/AdminSidebar.tsx` — add admin links |
| Modify | `src/pages/CoursePage.tsx` — add "Request Sponsorship" button |
| Modify | `src/pages/Dashboard.tsx` — show sponsorship request status |
| Modify | `src/i18n/translations.ts` — add translation keys |
| Migration | 3 new tables + RLS policies |

---

## Technical Notes

- Anonymous donations use the edge function with service role (no JWT required for the donation initialize/verify actions)
- Student privacy: sponsorship request cards show only first name and course, never full identity
- Campaign `raised_amount` is updated atomically in the edge function using an SQL increment to avoid race conditions
- Flutterwave keys are read from `site_settings` (same pattern as existing course payments)


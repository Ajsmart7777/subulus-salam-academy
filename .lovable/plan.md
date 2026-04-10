

# Move Donate & Sponsor Links — Professional Placement

## Current Problem
"Donate" and "Sponsor a Student" are listed alongside student navigation items (Home, Courses, Dashboard), cluttering the nav and mixing student actions with philanthropic actions.

## Recommended Placement

Professionally, donation/sponsorship links belong in these locations:

1. **Landing page CTA sections** — already have a CTA section; ensure Donate and Sponsor are prominently featured there
2. **Footer** — add "Donate" and "Sponsor a Student" under the "Support" column (standard practice for nonprofits/schools)
3. **Navbar** — keep only ONE subtle link: a gold-styled "Donate" button in the top-right area (next to Sign In/Out), not in the main nav list. Remove "Sponsor a Student" from the navbar entirely — it's accessible from the Donate page via the existing link button.

This follows the pattern used by real Islamic schools and nonprofit platforms: core navigation stays focused on learning, while giving is accessible but not intrusive.

## Changes

### 1. Navbar (`src/components/layout/Navbar.tsx`)
- Remove "Donate" and "Sponsor a Student" from the `navLinks` array
- Add a small gold "Donate" button next to the auth buttons (right side of navbar), visible to all users
- On mobile, add the Donate button in the mobile menu's action area

### 2. Footer (`src/components/layout/Footer.tsx`)
- Add "Donate" and "Sponsor a Student" links under the "Support" column

### 3. Landing page CTA (`src/components/landing/CTASection.tsx`)
- Verify Donate/Sponsor CTAs are present (may already be there); add if missing

No database or backend changes needed — this is purely a navigation/layout update.


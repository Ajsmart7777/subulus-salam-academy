---
name: Donation & Sponsorship System
description: Donation system with campaigns + student sponsorship via Flutterwave payments
type: feature
---
- Anonymous donations (no login required) via Flutterwave
- Campaign-based donations with goal tracking (admin-managed)
- Student sponsorship: students request help, donors pay their course fee
- On sponsorship payment: student auto-enrolled, request marked sponsored
- Tables: donations, donation_campaigns, student_sponsorship_requests
- Edge function: handle-donation (initialize/verify pattern)
- Public pages: /donate, /sponsor-a-student
- Admin pages: /admin/donations, /admin/campaigns, /admin/sponsorship

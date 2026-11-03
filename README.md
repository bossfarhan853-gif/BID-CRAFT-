# Rankora — Demo Launch Ready

**Compete for the Crown.**

Clean pay-to-rank leaderboard designed for demo launch (Outbid-style experience, original branding).

## Run

```bash
cd rankora
npm install
npm run dev
```

## Demo Mode (Current)

- Prominent **DEMO MODE** banner
- Simulated outbidding (no real money)
- Ranking updates instantly
- Visit tracking on business cards
- Simple activity stats labeled “Demo Data”
- Admin view for demo transactions

All payments are simulated. LIVE MODE is disabled until a real payment gateway is configured.

## Existing Features Kept

- Dark premium UI
- Live leaderboard (sorted by highest bid)
- Business profiles
- Submit form
- “Visit Website” with URL validation
- Countdown timers

## Next Steps for Real Launch

1. Connect Supabase (schema.sql provided)
2. Add Razorpay (test keys first, then live)
3. Server-side payment verification + webhooks
4. Replace localStorage with real database
5. Keep DEMO MODE available for testing even after live launch

Minimum bid and brand name are in `src/data.ts`.

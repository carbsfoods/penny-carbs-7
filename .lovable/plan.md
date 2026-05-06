## Goal
Let customers capture their delivery lat/lng with one tap (browser Geolocation), without depending on the Google Maps picker.

## Scope
Single dialog: `src/pages/SavedAddresses.tsx` (Add/Edit Address). The `customer_addresses` table already has `latitude`/`longitude` columns and `useCustomerAddresses` already saves them — no DB or hook changes needed.

## Changes

### 1. `src/pages/SavedAddresses.tsx`
- Add a prominent **"Use my current location"** button at the top of the dialog form (above the address label row).
- On click:
  - Check `navigator.geolocation` availability; if unsupported, show a destructive toast.
  - Show a loading state on the button (spinner + "Getting location...").
  - Call `navigator.geolocation.getCurrentPosition` with `{ enableHighAccuracy: true, timeout: 10000 }`.
  - On success: set `addressLat` / `addressLng`, show a success toast with accuracy (e.g. "Location captured (±15m)"), and the existing `GoogleMapPicker` will re-center on the new coords (it accepts `latitude`/`longitude` props).
  - On error: map `PERMISSION_DENIED` / `POSITION_UNAVAILABLE` / `TIMEOUT` to friendly messages via toast.
- Add a small status line under the button when coordinates are set: "Location pinned: 10.8505, 76.2711" with a "Clear" link to reset both lat/lng to `null`.
- Keep the existing `GoogleMapPicker` so users can still fine-tune by tapping the map (it already has its own "My Location" button — that stays as a secondary control inside the map).

### 2. No backend / hook changes
- `customer_addresses.latitude` / `longitude` already persist via `createAddress` / `updateAddress`.
- No new Supabase migration.

## Out of scope
- Replacing Google Maps entirely (covered by the earlier Hybrid proposal — separate task).
- Reverse geocoding the coordinates to a human-readable address.
- Using the captured location at checkout (already wired through saved addresses).

## Files touched
- `src/pages/SavedAddresses.tsx` (only)

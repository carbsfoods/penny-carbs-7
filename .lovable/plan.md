## Changes

### 1. Remove search bar text "What are you looking for?"
**`src/components/customer/ServiceCards.tsx`** — delete file (no longer used).
**`src/pages/Index.tsx`** — remove `<ServiceCards />` import and usage.

### 2. Replace top operational modules with Events + meal-time buttons
**`src/components/customer/OperationalModules.tsx`** — rewrite so the sticky bar (below the nav) shows:
- "Events" button (only if `indoor_events` active) → navigates to `/indoor-events`.
- One button per active Cloud Kitchen meal-time slot (only if `cloud_kitchen` active), fetched via `useCustomerDivisions()`. Each button:
  - Label = slot `name` (e.g. Breakfast, Lunch, Evening Snacks, Dinner) with the matching slot icon (Coffee/Sun/Sunset/Moon).
  - Disabled / dimmed when `is_ordering_open === false`.
  - On click → `navigate('/cloud-kitchen', { state: { preselectedSlotId: slot.id } })`.
- Homemade button is removed entirely.
- Horizontally scrollable on mobile so all meal-time buttons fit.

### 3. Auto-select slot on Cloud Kitchen page
**`src/pages/CloudKitchenOrder.tsx`** — read `useLocation().state?.preselectedSlotId` (react-router `useLocation`, aliased to avoid conflict with the existing `LocationContext` import). When divisions load, if no `selectedDivision` and a `preselectedSlotId` matches a division that `is_ordering_open`, set it as `selectedDivision`.

## Notes
- `useCustomerDivisions` already returns `is_ordering_open`, name, slot_type, and refreshes every 60s, so the buttons auto-appear/disappear with meal windows.
- No DB or hook changes required.

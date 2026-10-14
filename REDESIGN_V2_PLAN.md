# CO-CO Kitchen — Redesign V2

## Safety rule
This branch is for redesign work only. Do not push redesign changes to `main` or replace the currently deployed customer/admin sites until the owner reviews and approves the new version.

## Visual direction
Premium, warm, contemporary Kerala home-food brand. Preserve the CO-CO Kitchen identity and the cream, deep green, and muted gold palette. Use generous whitespace, clear type hierarchy, restrained shadows, purposeful food photography, consistent corner radii, and mobile-first layouts. Avoid clutter, excessive emoji, and generic template-dashboard styling.

## Customer experience — proposed structure
1. **Welcome / identity:** logo, concise “Made with love, homely Kerala flavours” message, date and current service availability.
2. **Choose a meal:** prominent Lunch and Dinner cards with delivery time, availability/cutoff state, and clear entry points.
3. **Menu browsing:** distinct item cards with food imagery where available, item name/description, price, availability, and compact quantity controls. Keep cart quantity visible.
4. **Persistent order access:** mobile bottom action bar with item count and total; desktop cart summary that does not obstruct browsing.
5. **Order review:** separate Lunch and Dinner summaries when both are selected, item-level quantity edits, clear subtotal/total, customer details.
6. **Payment:** readable UPI QR, UPI ID, payment instructions, and explicit “I’ve completed payment” action.
7. **Confirmation / tracking:** clear order code, payment verification state, expected delivery time, and next step.
8. **Customer voice:** friendly, low-friction feedback after the order journey rather than a generic “Suggestions and Testimonials” label.

## Admin experience — proposed structure
1. **Admin shell:** consistent top bar, compact identity area, responsive sidebar/navigation on desktop and accessible mobile navigation.
2. **Overview:** actionable daily summary for orders, payment verification, meals to prepare, revenue, and upcoming cutoff; avoid decorative metrics without a next action.
3. **Orders / packing:** searchable and filterable order list, clear payment/order status, customer details, and item quantities grouped for packing.
4. **Order detail:** one focused workspace for customer contact, item quantities, payment verification, preparation status, and delivery.
5. **Menu management:** date and Lunch/Dinner selectors, service availability, editable item cards, quantity/price controls, clear save state, and deliberate destructive-action styling.
6. **Kitchen preparation:** aggregate totals by item across all orders, optimized for quick scanning and printing/phone use.
7. **Expenses and daily tracker:** consistent data-entry patterns, summaries, and useful empty/error states.
8. **Testimonials / feedback:** review, approve, and feature customer feedback in a separate, clearly organized section.

## Design system
- Colors: warm cream surfaces, deep green primary actions, muted gold accents, dark readable text, and distinct semantic colors for status.
- Typography: expressive serif for brand/headline moments; highly legible sans-serif for menus, forms, tables, and operational data.
- Components: consistent buttons, fields, cards, status chips, tabs, dialogs, empty/loading/error states, and responsive tables.
- Accessibility: visible focus, touch targets suitable for phones, readable contrast, and labels that do not rely on color alone.

## Implementation sequence
1. Establish shared design tokens and reusable layout primitives.
2. Redesign customer landing, meal selection, menu, cart/review, payment, and confirmation views.
3. Redesign admin navigation, overview, orders/packing, menu, order detail, expenses, tracker, and feedback views.
4. Verify all existing Cokitbase operations and business rules remain intact.
5. Build and test this branch; only publish after explicit owner approval.

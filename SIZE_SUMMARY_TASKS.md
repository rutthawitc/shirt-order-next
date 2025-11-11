# Shirt Size Summary Admin Page - Implementation Tasks

## Phase 1: Preparation & Code Refactoring

- [ ] Extract `processSizeSummary()` function from export route into shared utility file
  - Create: `src/lib/size-summary.ts`
  - Extract logic from `src/app/api/orders/export/route.ts` (lines 70-114)
  - Ensure combo product handling is included
  - Export as reusable function

- [ ] Review existing admin page structure
  - Check layout of `/admin` directory
  - Review sidebar navigation components
  - Identify UI patterns and component locations

## Phase 2: Backend & Data Layer

- [ ] Create Server Component for size summary data fetching
  - File: `src/app/admin/size-summary/page.tsx`
  - Fetch orders from Supabase
  - Fetch order_items from Supabase
  - Fetch shirt_designs from Supabase
  - Fetch combo relationships
  - Call `processSizeSummary()` utility function
  - Handle errors gracefully

- [ ] Create API route for optional real-time refresh
  - File: `src/app/api/admin/size-summary/route.ts` (optional)
  - Accept GET request
  - Return JSON with size summary data
  - For future enhancement: real-time updates

## Phase 3: Frontend & UI

- [ ] Create Size Summary Table Component
  - File: `src/components/admin/SizeSummaryTable.tsx`
  - Use shadcn/ui Table component
  - Display designs as rows
  - Display sizes (S, M, L, XL, 2XL, 3XL, 4XL, 5XL, 6XL) as columns
  - Add Total column (sum across sizes)
  - Add Summary row (sum across designs)
  - Apply proper styling with Tailwind

- [ ] Implement sorting functionality
  - Sort by design name (A-Z)
  - Sort by total quantity (ascending/descending)
  - Add sort indicator icons

- [ ] Implement filtering functionality
  - Filter by order status (pending, confirmed, processing, completed, cancelled)
  - Default: show all statuses
  - Use dropdown or toggle buttons

## Phase 4: Features & Enhancement

- [ ] Add Export to Excel button
  - Create dedicated Excel export endpoint for size summary
  - File: `src/app/api/admin/size-summary/export/route.ts`
  - Use XLSX library (already available)
  - Format similar to current export sheet 3

- [ ] Add Refresh button
  - Manual data refresh without page reload
  - Show loading state during fetch
  - Optional: auto-refresh interval toggle

- [ ] Add Summary statistics
  - Total shirts ordered (all sizes, all designs)
  - Most popular design
  - Most popular size
  - Display in cards/badges above table

## Phase 5: Navigation & Integration

- [ ] Update admin sidebar navigation
  - File: Check sidebar component location
  - Add menu item: "สรุปขนาดเสื้อ" (Size Summary)
  - Add route link to `/admin/size-summary`
  - Add icon (optional)

- [ ] Test route protection
  - Verify middleware protects `/admin/size-summary`
  - Ensure only authenticated admins can access

## Phase 6: Testing & Polish

- [ ] Test with sample data
  - Create test orders with various designs and sizes
  - Verify combo products are split correctly
  - Verify size counts are accurate

- [ ] Test responsive design
  - Mobile view
  - Tablet view
  - Desktop view
  - Horizontal scrolling for many columns

- [ ] Test filtering and sorting
  - All filter combinations
  - All sort options
  - Performance with large datasets

- [ ] Test export functionality
  - Excel file generation
  - File download
  - Data accuracy in exported file

## Phase 7: Documentation

- [ ] Add JSDoc comments to utility functions
- [ ] Document size summary page in CLAUDE.md
- [ ] Add any special notes or edge cases

---

## Notes
- Reuse existing combo product logic from `src/lib/combo-products.ts`
- Follow existing UI patterns from admin dashboard
- Use Thai language for all customer-facing labels
- Maintain consistent styling with shadcn/ui components
- All currency values in THB

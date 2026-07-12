// app/page.tsx
// FULL FILE — root now redirects straight to the apply flow.
// The apply page itself is untouched at app/(public)/apply/page.tsx.

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/apply');
}
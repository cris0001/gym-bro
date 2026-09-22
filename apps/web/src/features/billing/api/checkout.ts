// Placeholder for the future Stripe checkout redirect. When billing goes live this
// points at a Stripe Payment Link (via VITE_STRIPE_CHECKOUT_URL) or, better, a
// backend-created Checkout Session (/api/billing/checkout) that returns a URL. Until
// then it's a no-op that just logs, so the paywall's "Renew" button is wired but inert.
const CHECKOUT_URL = import.meta.env.VITE_STRIPE_CHECKOUT_URL as string | undefined;

export function startCheckout(): void {
  if (CHECKOUT_URL) {
    window.location.href = CHECKOUT_URL;
    return;
  }
  console.warn('[billing] checkout not configured (set VITE_STRIPE_CHECKOUT_URL)');
}

import { PageShell } from "../../_shared/PageShell";

export const metadata = { title: "You're subscribed — Inkling" };

export default function BillingSuccess() {
  return (
    <PageShell title="You're all set" subtitle="Your subscription is active — thanks for supporting Inkling.">
      <p>
        You can manage your plan, update your payment method, or cancel any time from the billing
        portal, linked from your account menu.
      </p>
    </PageShell>
  );
}

import { PageShell } from "../../_shared/PageShell";

export const metadata = { title: "Checkout canceled — Inkling" };

export default function BillingCanceled() {
  return (
    <PageShell title="Checkout canceled" subtitle="No charge was made — you can try again any time from the pricing section.">
      <p>Have questions about plans? Check the FAQ, or reach out through Contact Us.</p>
    </PageShell>
  );
}

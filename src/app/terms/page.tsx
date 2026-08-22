import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { ArrowLeft } from "lucide-react";
import { CONTACT, CONTACT_ADDRESS_FULL, SITE_NAME } from "@/lib/site";

const TITLE = "Terms & Conditions";
const DESCRIPTION =
  "The terms and conditions governing venue bookings, event decoration setup, cancellations and refunds on Decor Eventz.";
const LAST_UPDATED = "August 3, 2026";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/terms" },
};

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Acceptance of terms",
    body: (
      <>
        <p>
          These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use
          of the {SITE_NAME} website, mobile experience, and event decoration services
          (together, the &quot;Service&quot;), operated by {SITE_NAME} (&quot;{SITE_NAME}
          &quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;) from our studio at{" "}
          {CONTACT_ADDRESS_FULL}.
        </p>
        <p>
          By booking a decoration service, creating an account, or otherwise using the
          Service, you agree to be bound by these Terms. If you do not agree, please
          do not use the Service.
        </p>
      </>
    ),
  },
  {
    heading: "2. Our services",
    body: (
      <p>
        {SITE_NAME} offers event and balloon decoration services: you choose a
        setup from our catalogue (or request a custom theme), we confirm your event
        date, time window, and venue address, and our decorators design, deliver,
        and install the setup on-site ahead of your event — with teardown handled
        after, where included in your package. Setup windows shown at booking are
        estimates and not a guaranteed arrival time.
      </p>
    ),
  },
  {
    heading: "3. Accounts & eligibility",
    body: (
      <p>
        You must be at least 18 years old, or using the Service under the
        supervision of a parent or guardian, to create an account and place an
        order. You are responsible for maintaining the confidentiality of your
        account credentials and for all activity that occurs under your account.
      </p>
    ),
  },
  {
    heading: "4. Bookings & venue access",
    body: (
      <>
        <p>
          When you book a decoration, you confirm that the venue address, event
          date, and time window you provide are accurate, and that our decorators
          will have reasonable access to the venue (parking/loading access, and
          entry at the agreed setup time) to complete installation before your
          event. {SITE_NAME} is not responsible for delays caused by restricted
          venue access, incorrect address details, or venue-side scheduling
          conflicts.
        </p>
        <p>
          Setups are designed and installed to the theme, colours, and add-ons
          selected at the time of booking. Please review your selections carefully
          before confirming — changes requested after a decorator has already
          sourced materials for your event may incur an additional charge or may
          not be accommodated depending on how close the change is to your event
          date.
        </p>
      </>
    ),
  },
  {
    heading: "5. Pricing & payment",
    body: (
      <p>
        All prices are displayed in Indian Rupees (INR) and are inclusive of
        applicable taxes unless stated otherwise. Payment is collected through our
        secure third-party payment processor; {SITE_NAME} does not store your full
        card or payment credentials. Prices may change from time to time, but the
        price shown to you at the time of order confirmation is the price you pay
        for that order.
      </p>
    ),
  },
  {
    heading: "6. Cancellations & refunds",
    body: (
      <>
        <p>
          You may cancel a booking free of charge while it is still
          &quot;Pending&quot; — that is, before we&apos;ve confirmed it and our
          decorators have begun sourcing materials for your event. Once a booking
          is confirmed, it can no longer be self-cancelled from your account;
          contact us directly and we&apos;ll do our best to accommodate a change or
          cancellation depending on how close it is to your event date.
        </p>
        <p>
          If our team is unable to deliver a confirmed setup, or a genuine setup
          defect is identified on-site, contact us on the day of your event and we
          will re-work the setup on the spot where possible, or refund the affected
          booking at our discretion.
        </p>
      </>
    ),
  },
  {
    heading: "7. On-site changes",
    body: (
      <p>
        We offer reasonable on-site adjustments to a setup at installation time
        (positioning, minor styling tweaks) where it doesn&apos;t require sourcing
        new materials. Larger changes requested on the day — a different theme,
        colours, or scale of decoration than what was booked — may be chargeable
        or may not be accommodated depending on material availability.
      </p>
    ),
  },
  {
    heading: "8. Setup & teardown",
    body: (
      <p>
        We install at the venue address on file for your booking. Please ensure
        someone is available to grant our decorators access at the agreed setup
        time. Risk of loss or damage to the decor passes to you once installation
        is complete. Setup and teardown timelines may be affected by venue access,
        traffic, weather, or circumstances beyond our reasonable control.
      </p>
    ),
  },
  {
    heading: "9. Intellectual property",
    body: (
      <p>
        All content on the Service — including the {SITE_NAME} name, logo, designs,
        photography, and website code — is owned by or licensed to {SITE_NAME} and
        is protected by applicable intellectual property laws. You may not copy,
        reproduce, or use it commercially without our written permission.
      </p>
    ),
  },
  {
    heading: "10. Limitation of liability",
    body: (
      <p>
        To the maximum extent permitted by law, {SITE_NAME}&apos;s total liability
        arising out of or relating to an order is limited to the amount you paid for
        that order. We are not liable for indirect, incidental, or consequential
        damages arising from use of the Service.
      </p>
    ),
  },
  {
    heading: "11. Changes to these terms",
    body: (
      <p>
        We may update these Terms from time to time to reflect changes in our
        services or applicable law. The &quot;Last updated&quot; date at the top of
        this page will reflect the most recent revision, and continued use of the
        Service after changes take effect constitutes acceptance of the revised
        Terms.
      </p>
    ),
  },
  {
    heading: "12. Governing law",
    body: (
      <p>
        These Terms are governed by the laws of India. Any dispute arising out of or
        in connection with these Terms shall be subject to the exclusive
        jurisdiction of the courts of Bengaluru, Karnataka.
      </p>
    ),
  },
  {
    heading: "13. Contact us",
    body: (
      <p>
        Questions about these Terms can be sent to{" "}
        <a href={`mailto:${CONTACT.email}`} className="font-semibold text-primary">
          {CONTACT.email}
        </a>{" "}
        or {CONTACT.phone}, or by post to {CONTACT_ADDRESS_FULL}.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background pb-24">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Terms & Conditions", path: "/terms" }])} />
      <TopBar />
      <main>
        <div className="mx-auto max-w-md px-5 pt-2 md:max-w-3xl md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>

        <div className="mx-auto mt-6 w-full max-w-md px-5 pb-16 md:max-w-3xl md:px-8">
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-8 space-y-8">
            {SECTIONS.map((s) => (
              <section key={s.heading}>
                <h2 className="font-display text-xl md:text-2xl">{s.heading}</h2>
                <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

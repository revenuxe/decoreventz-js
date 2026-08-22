import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { ArrowLeft } from "lucide-react";
import { CONTACT, CONTACT_ADDRESS_FULL, SITE_NAME } from "@/lib/site";

const TITLE = "Privacy Policy";
const DESCRIPTION =
  "How Decor Eventz collects, uses, and protects your personal information when you book event decoration services.";
const LAST_UPDATED = "August 3, 2026";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/privacy" },
};

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Introduction",
    body: (
      <p>
        This Privacy Policy explains how {SITE_NAME} (&quot;{SITE_NAME}&quot;,
        &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, discloses, and
        protects your personal information when you visit our website, create an
        account, or book our event and balloon decoration services.
      </p>
    ),
  },
  {
    heading: "2. Information we collect",
    body: (
      <>
        <p>
          <strong className="text-foreground">Account &amp; contact information:</strong>{" "}
          name, email address, phone number, and venue addresses.
        </p>
        <p>
          <strong className="text-foreground">Event &amp; booking details:</strong> your
          event date, time window, venue address, and any theme, colour, or styling
          preferences you share with us to plan your decoration.
        </p>
        <p>
          <strong className="text-foreground">Order &amp; payment information:</strong>{" "}
          booking history, decoration and add-on preferences, and payment confirmation
          details. Full card or bank details are handled directly by our payment
          processor and are never stored on our servers.
        </p>
        <p>
          <strong className="text-foreground">Usage &amp; device information:</strong>{" "}
          pages visited, approximate location (from pincode checks), browser type,
          and cookies used to keep you signed in and remember your preferences.
        </p>
      </>
    ),
  },
  {
    heading: "3. How we use your information",
    body: (
      <p>
        We use your information to fulfil bookings (scheduling venue visits, planning
        and setting up your decoration, and coordinating teardown), operate your
        account, process payments, provide customer support, send order and booking
        updates, improve our services, and comply with legal obligations. We do not
        sell your personal information.
      </p>
    ),
  },
  {
    heading: "4. How we share your information",
    body: (
      <p>
        We share information only as needed to run the Service: with our decorators
        and event crew to plan and set up your event, with logistics partners to
        transport decor materials to your venue, with our payment processor to
        complete transactions, and with trusted cloud hosting and infrastructure
        providers who store data on our behalf under confidentiality obligations. We
        do not share your booking or venue details with any party outside this
        planning and delivery chain.
      </p>
    ),
  },
  {
    heading: "5. Cookies & similar technologies",
    body: (
      <p>
        We use essential cookies to keep you signed in and maintain your session,
        and limited analytics to understand how the Service is used and improve it.
        You can control cookies through your browser settings; disabling essential
        cookies may prevent you from signing in or completing an order.
      </p>
    ),
  },
  {
    heading: "6. Data retention",
    body: (
      <p>
        We retain your account and booking information for as long as your account is
        active and for a reasonable period afterwards to resolve disputes, meet
        accounting and tax obligations, and enforce our agreements. Past event and
        venue details are retained so that repeat bookings are faster, and can be
        deleted at your request as described below.
      </p>
    ),
  },
  {
    heading: "7. Data security",
    body: (
      <p>
        We use industry-standard technical and organisational measures — including
        encrypted connections and access controls — to protect your information
        against unauthorised access, alteration, disclosure, or destruction. No
        method of transmission or storage is completely secure, and we cannot
        guarantee absolute security.
      </p>
    ),
  },
  {
    heading: "8. Your rights",
    body: (
      <p>
        Subject to applicable law, including the Digital Personal Data Protection
        Act, 2023, you have the right to access, correct, or request deletion of
        your personal information, withdraw consent for future processing, and
        raise a grievance about how your data is handled. To exercise any of these
        rights, contact us using the details in Section 10 below.
      </p>
    ),
  },
  {
    heading: "9. Children's privacy",
    body: (
      <p>
        The Service is not directed to children under 18, and we do not knowingly
        collect personal information from children. If you believe a child has
        provided us with personal information, please contact us and we will delete
        it.
      </p>
    ),
  },
  {
    heading: "10. Grievance officer & contact",
    body: (
      <p>
        In accordance with Indian data protection law, questions, requests, or
        grievances regarding this Privacy Policy or your personal information can be
        directed to our Grievance Officer at{" "}
        <a href={`mailto:${CONTACT.email}`} className="font-semibold text-primary">
          {CONTACT.email}
        </a>{" "}
        or {CONTACT.phone}, or by post to {CONTACT_ADDRESS_FULL}. We aim to
        acknowledge grievances promptly and resolve them within the timelines
        required by law.
      </p>
    ),
  },
  {
    heading: "11. Changes to this policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time. The &quot;Last
        updated&quot; date at the top of this page reflects the most recent
        revision. Material changes will be communicated through the Service or by
        email where appropriate.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-background pb-24">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy" }])} />
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
            Privacy Policy
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

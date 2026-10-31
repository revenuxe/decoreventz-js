import { Check, MapPin, Palette, PartyPopper } from "lucide-react";
import { LeadLink } from "./LeadLink";
import { editorial, faqs, kidsThemes } from "./content";
import Link from "next/link";
import { CatalogImage } from "@/components/CatalogImage";
import { siteImage } from "@/data/images";
import type { BirthdayDesign } from "./DecorationGallery";
import { birthdayLandingHref } from "./navigation";

const homeOptions = [
  [
    "Simple Birthday Decoration at Home",
    "Clean balloon and backdrop setups for intimate home celebrations.",
  ],
  [
    "Birthday Room Decoration",
    "Plan a memorable birthday surprise inside a bedroom, hotel room or living space.",
  ],
  [
    "Premium Home Birthday Decoration",
    "Discuss statement backdrops, balloon installations and customized elements for larger celebrations.",
  ],
];
const steps = [
  [
    "Choose a Decoration",
    "Browse birthday decoration ideas or share an inspiration photo.",
  ],
  [
    "Share Your Event Details",
    "Tell us your event date, Bangalore location, venue and requirements.",
  ],
  [
    "Customize Your Setup",
    "Discuss your preferred colours, theme and decorative elements.",
  ],
  [
    "Confirm Your Decoration",
    "Finalize the setup and event details with the DecorEventz team.",
  ],
  [
    "We Set It Up",
    "Our team prepares the agreed decoration at your venue for the celebration.",
  ],
];

export function HomeAndKidsSections({
  designs,
}: {
  designs: BirthdayDesign[];
}) {
  const photos = designs.filter((design) => design.image);
  function photo(terms: string[], index: number) {
    return (
      photos.find((design) =>
        terms.some((term) => design.search.includes(term)),
      ) ?? photos[index % Math.max(photos.length, 1)]
    );
  }
  return (
    <>
      <section
        className="birthday-section rounded-[2rem] bg-muted p-6 md:p-10"
        aria-labelledby="home-heading"
      >
        <p className="birthday-eyebrow">Make home the occasion</p>
        <h2 id="home-heading" className="birthday-heading">
          Birthday Decoration at Home in Bangalore
        </h2>
        <p className="birthday-copy">
          Planning a birthday at home? Discuss customized birthday decorations
          for apartments, villas and homes across supported Bangalore locations.
          From simple balloon decorations and wall setups to elegant backdrops,
          room surprises and themed celebrations, plan around your space,
          preferred colours and celebration style.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {homeOptions.map(([title, copy], i) => {
            const image = photo(
              [
                ["simple", "pastel"],
                ["room", "home"],
                ["backdrop", "ring", "premium"],
              ][i],
              i,
            );
            const href = birthdayLandingHref(
              ["Simple Decoration", "Room Surprise", "Premium Decoration"][i],
            );
            return (
              <article
                key={title}
                className="overflow-hidden rounded-3xl bg-card"
              >
                <Link href={href} className="relative block aspect-[16/10]">
                  <CatalogImage
                    src={image?.image || siteImage("balloonArch")}
                    alt={image?.name || "Decorative balloon arrangement"}
                    fill
                    sizes="(max-width: 768px) 85vw, 28vw"
                    className="object-cover"
                  />
                </Link>
                <div className="p-6">
                  <span className="text-sm text-accent">0{i + 1}</span>
                  <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {copy}
                  </p>
                  <Link
                    href={href}
                    className="mt-5 inline-block text-sm font-bold"
                  >
                    Explore decoration ideas →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <LeadLink
          context="home birthday decoration"
          className="birthday-button mt-8"
        >
          Get Home Decoration Quote
        </LeadLink>
      </section>
      <section
        id="kids-themes"
        className="birthday-section scroll-mt-28"
        aria-labelledby="kids-heading"
      >
        <p className="birthday-eyebrow">Little people, big imaginations</p>
        <h2 id="kids-heading" className="birthday-heading">
          Kids Birthday Decoration in Bangalore
        </h2>
        <p className="birthday-copy">
          Turn their favourite world into a birthday they’ll remember. Discuss
          colourful kids birthday decorations with customized backdrops,
          balloons, themed elements and cake-table setups. Theme availability
          and details are confirmed with your quote.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kidsThemes.map((theme, index) => {
            const image = photo([theme.toLowerCase()], index);
            return (
              <LeadLink
                key={theme}
                context={`${theme} kids birthday theme`}
                className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-card"
              >
                <div className="relative aspect-[4/3]">
                  <CatalogImage
                    src={image?.image || siteImage("balloonArch")}
                    alt={image?.name || "Decorative balloon arrangement"}
                    fill
                    sizes="(max-width: 640px) 43vw, (max-width: 1024px) 28vw, 17vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <span className="font-semibold">{theme}</span>
                  <span className="mt-2 block text-xs text-muted-foreground">
                    Enquire about this theme ↗
                  </span>
                </div>
              </LeadLink>
            );
          })}
        </div>
        <Link
          href={birthdayLandingHref("Kids Birthday")}
          className="birthday-button mt-7"
        >
          Explore Kids Birthday Themes
        </Link>
      </section>
    </>
  );
}

export function PricingAndBooking() {
  return (
    <>
      <section className="birthday-section" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" className="birthday-heading">
          How Much Does Birthday Decoration Cost in Bangalore?
        </h2>
        <p className="birthday-copy">
          Birthday decoration costs vary depending on the decoration style,
          venue size, theme, materials, customization and setup requirements.
          Simple home decorations generally use fewer decorative elements, while
          premium backdrops, large balloon installations and customized kids
          themes can require more extensive setups.
        </p>
        <div className="mt-7 overflow-hidden rounded-3xl border border-border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Decoration styles and the celebrations they suit
            </caption>
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="p-4 md:px-6">
                  Decoration style
                </th>
                <th scope="col" className="p-4 md:px-6">
                  Best for
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Simple Birthday Decoration", "Small home celebrations"],
                ["Balloon Decoration", "Homes, apartments and party venues"],
                ["Room Decoration", "Birthday surprises"],
                ["Kids Theme Decoration", "Children’s birthday celebrations"],
                [
                  "Premium Decoration",
                  "Larger celebrations and statement setups",
                ],
              ].map(([style, best]) => (
                <tr key={style} className="border-t border-border">
                  <th scope="row" className="p-4 font-medium md:px-6">
                    {style}
                  </th>
                  <td className="p-4 text-muted-foreground md:px-6">{best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <LeadLink
          context="birthday decoration price"
          className="birthday-button mt-7"
        >
          Get Birthday Decoration Price
        </LeadLink>
      </section>
      <section className="birthday-section" aria-labelledby="booking-heading">
        <p className="birthday-eyebrow">From idea to celebration</p>
        <h2 id="booking-heading" className="birthday-heading">
          Book Your Birthday Decoration
        </h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(([title, copy], i) => (
            <li key={title} className="border-t border-border pt-5">
              <span className="font-display text-3xl text-accent">
                0{i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {copy}
              </p>
            </li>
          ))}
        </ol>
        <LeadLink
          context="plan my birthday decoration"
          className="birthday-button mt-8"
        >
          Plan My Birthday Decoration
        </LeadLink>
      </section>
    </>
  );
}

export function TrustAndContent() {
  return (
    <>
      <section className="birthday-section" aria-labelledby="why-heading">
        <h2 id="why-heading" className="birthday-heading">
          Why Choose DecorEventz for Birthday Decoration?
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              Icon: Palette,
              title: "Custom Decorations",
              copy: "Discuss a celebration around your theme, colours and preferences.",
            },
            {
              Icon: Check,
              title: "Professional Setup",
              copy: "Our team handles the agreed decoration setup so you can focus on the celebration.",
            },
            {
              Icon: PartyPopper,
              title: "Different Celebration Styles",
              copy: "Explore simple home setups, kids themes, balloon decor and premium birthday decorations.",
            },
            {
              Icon: MapPin,
              title: "Bangalore Service",
              copy: "Birthday decoration for homes and venues across supported Bangalore locations.",
            },
          ].map(({ Icon, title, copy }) => (
            <article
              key={title}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="birthday-section rounded-[2rem] bg-muted p-6 md:p-10"
        aria-labelledby="areas-heading"
      >
        <h2 id="areas-heading" className="birthday-heading">
          Birthday Decoration Services Across Bangalore
        </h2>
        <p className="birthday-copy">
          DecorEventz provides birthday decoration enquiries for homes,
          apartments, party halls and event venues across supported areas of
          Bangalore. We’re based in Mahalakshmipuram, Bengaluru. Share your
          venue address and event date to confirm coverage, access requirements
          and availability.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full border border-border bg-card px-5 py-3 text-sm">
            Mahalakshmipuram · Our base
          </span>
          <LeadLink
            context="Bangalore venue coverage"
            className="rounded-full border border-primary px-5 py-3 text-sm font-semibold"
          >
            Check your Bangalore location →
          </LeadLink>
        </div>
      </section>
      <section className="birthday-section" aria-labelledby="editorial-heading">
        <h2 id="editorial-heading" className="birthday-heading">
          Birthday Decorators in Bangalore for Every Celebration
        </h2>
        <div className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {editorial.map(([title, copy]) => (
            <article key={title}>
              <h3 className="font-display text-2xl">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="birthday-section" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="birthday-heading">
          Birthday Decoration FAQs
        </h2>
        <div className="mt-7 divide-y divide-border border-y border-border">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="cursor-pointer pr-4 text-base font-semibold focus-visible:rounded focus-visible:outline-2 focus-visible:outline-primary">
                {faq.question}
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

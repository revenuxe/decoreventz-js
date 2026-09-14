import logo from "@/assets/decor-eventz-logo.webp";
import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, YoutubeIcon, TwitterIcon, LinkedinIcon } from "@/components/SocialIcons";

const LEGAL_LINKS = [
  { href: "/contact", label: "Contact Us" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-md px-5 pt-8 pb-28 md:max-w-none md:px-12 xl:px-16 md:pb-16">
      <div className="rounded-[2rem] bg-gradient-brand p-6 text-primary-foreground shadow-elevated md:flex md:items-center md:justify-between md:gap-10 md:rounded-[3rem] md:p-12">
        <h2 className="font-display text-3xl leading-tight md:text-5xl">
          Ready to plan something<br />
          <span className="italic">unforgettable</span>?
        </h2>
        <Link
          href="/categories"
          className="mt-5 flex w-full items-center justify-center rounded-full bg-white py-3.5 text-sm font-bold text-primary shadow-glow active:scale-[0.98] md:mt-0 md:w-auto md:px-10 md:py-4 md:text-base"
        >
          Plan my event
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Image
          src={logo}
          alt="Decor Eventz — Dream, Design, Deliver"
          width={285}
          height={77}
          className="h-16 w-[236px] object-contain object-left md:h-20 md:w-[285px]"
        />
        <div className="flex gap-2">
          {[
            { Icon: InstagramIcon, href: "https://www.instagram.com/decor.eventz/", label: "Instagram" },
            { Icon: LinkedinIcon, href: "#", label: "LinkedIn" },
            { Icon: YoutubeIcon, href: "https://www.youtube.com/@DecorEventz", label: "YouTube" },
            { Icon: TwitterIcon, href: "#", label: "Twitter" },
          ].map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={href !== "#" ? "_blank" : undefined}
              rel={href !== "#" ? "noopener noreferrer" : undefined}
              aria-label={label}
              className="glass grid h-10 w-10 place-items-center rounded-full"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center border-t border-border pt-6 text-xs text-muted-foreground md:justify-end">
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2.5 md:justify-end">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Dream · Design · Deliver · © {new Date().getFullYear()} Decor Eventz
      </p>
    </footer>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Headphones, Search, UserRound, X } from "lucide-react";
import logo from "@/assets/decor-eventz-logo.webp";
import cartCheckIcon from "@/assets/cart-check.svg";
import { SearchOverlay } from "@/components/SearchOverlay";
import { useCart } from "@/lib/cart-store";
import { useMegaMenuData } from "@/lib/use-mega-menu-data";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const SEARCH_PROMPTS = ["birthday decor", "wedding decor", "baby shower", "corporate event"];
const TYPE_MS = 70;
const DELETE_MS = 40;
const HOLD_MS = 1400;

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [supabase] = useState(() => createClient());
  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | null>(null);
  const { itemCount } = useCart();
  const { categories, subcategories, products } = useMegaMenuData(true);
  const keepMenuOpen = (slug: string) => { if (closeTimer.current) window.clearTimeout(closeTimer.current); setOpenMenu(slug); };
  const scheduleMenuClose = () => { closeTimer.current = window.setTimeout(() => setOpenMenu(null), 220); };
  const mobileItem = categories.find((item) => item.slug === mobileMenu);
  const mobileSubcategories = subcategories.filter((subcategory) => subcategory.categorySlug === mobileMenu);
  const mobileProducts = products.filter((product) => product.categorySlug === mobileMenu).slice(0, 4);
  const [searchPrompt, setSearchPrompt] = useState("");
  const desktopItem = categories.find(item => item.slug === openMenu);
  const desktopChildren = subcategories.filter(child => child.categorySlug === openMenu);
  const selectedSubcategory = desktopChildren.find(child => child.slug === activeSubcategory) ?? desktopChildren[0];
  const desktopProducts = products.filter(product => product.categorySlug === openMenu && (!selectedSubcategory || product.subcategorySlug === selectedSubcategory.slug)).slice(0, 6);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => { if (!headerRef.current?.contains(event.target as Node)) { setOpenMenu(null); setMobileMenu(null); } };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        headerRef.current?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')?.focus();
        setOpenMenu(null); setMobileMenu(null);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);


  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const phrase = SEARCH_PROMPTS[phraseIndex];

      if (!deleting) {
        charIndex += 1;
        setSearchPrompt(phrase.slice(0, charIndex));

        if (charIndex === phrase.length) {
          deleting = true;
          timeout = setTimeout(tick, HOLD_MS);
          return;
        }

        timeout = setTimeout(tick, TYPE_MS);
        return;
      }

      charIndex -= 1;
      setSearchPrompt(phrase.slice(0, charIndex));

      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % SEARCH_PROMPTS.length;
      }

      timeout = setTimeout(tick, DELETE_MS);
    }

    timeout = setTimeout(tick, TYPE_MS);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (active) setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header ref={headerRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenu(null); }} className="sticky inset-x-0 top-0 z-40 border-b border-[#e8edf3] bg-white shadow-sm">
      <div className="mx-auto flex h-[72px] max-w-none items-center gap-4 px-4 md:px-12 xl:px-16">
        <Link href="/" aria-label="Decor Eventz home" className="flex h-16 shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"><Image src={logo} alt="Decor Eventz — Dream, Design, Deliver" priority width={238} height={64} className="h-14 w-[210px] object-contain object-left md:h-16 md:w-[238px]" /></Link>
        <button onClick={() => setSearchOpen(true)} className="hidden h-11 max-w-[480px] flex-1 items-center gap-3 rounded-xl border border-[#dfe6ee] bg-[#f8fafc] px-4 text-left text-sm text-muted-foreground md:flex">
          <Search className="h-5 w-5 shrink-0" />
          <span className="truncate">Search {searchPrompt || "decorations"}</span>
        </button>
        <div className="ml-auto flex items-center gap-2 md:gap-5">
          <button onClick={() => setSearchOpen(true)} aria-label="Search decorations" className="grid h-10 w-10 place-items-center rounded-full text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"><Search className="h-5 w-5" /></button>
          <Link href={user ? "/profile" : "/auth?redirect=%2Fprofile"} className="hidden items-center gap-2 text-sm font-semibold text-primary md:flex"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf7f8] text-accent"><UserRound className="h-4 w-4" /></span>{user ? "My account" : "Sign in"}</Link>
          <Link href="/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-full text-primary"><Image src={cartCheckIcon} alt="" aria-hidden className="h-6 w-6" />{itemCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{itemCount}</span>}</Link>
          <Link href="/contact" className="hidden items-center gap-2 text-sm font-medium text-primary md:flex"><Headphones className="h-5 w-5" /> Support</Link>
        </div>
      </div>
      <nav aria-label="Browse event categories" className="no-scrollbar relative flex h-11 items-center gap-5 overflow-x-auto border-t border-[#edf0f4] px-4 pr-14 md:hidden">
        {categories.map((item) => <button key={item.slug} onClick={() => setMobileMenu(item.slug)} aria-expanded={mobileMenu === item.slug} aria-controls="mobile-category-menu" className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.name}<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /></button>)}
        <Link href="/categories" className="shrink-0 text-sm font-bold text-accent">Explore all</Link>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
      </nav>
      {mobileMenu && <div id="mobile-category-menu" aria-label={`Browse ${mobileItem?.name ?? "categories"}`} className="fixed inset-x-0 bottom-0 top-[116px] z-50 overflow-y-auto overscroll-contain bg-white p-5 md:hidden"><div className="sticky -top-5 z-10 -mx-5 -mt-5 flex items-start justify-between border-b border-border bg-white p-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Explore</p><h2 className="mt-1 text-2xl font-bold text-primary">{mobileItem?.name}</h2></div><button onClick={() => setMobileMenu(null)} aria-label="Close category menu" className="grid h-10 w-10 place-items-center rounded-full border border-[#dce4ed] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="h-5 w-5" /></button></div><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Subcategories</p><div className="mt-3 grid grid-cols-2 gap-3">{mobileSubcategories.length ? mobileSubcategories.map((subcategory) => <Link key={subcategory.slug} href={`/categories/${mobileMenu}/sub/${subcategory.slug}`} onClick={() => setMobileMenu(null)} className="rounded-xl border border-[#dce4ed] px-4 py-4 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{subcategory.name}</Link>) : <Link href={`/categories/${mobileMenu}`} onClick={() => setMobileMenu(null)} className="rounded-xl border border-[#dce4ed] px-4 py-4 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View all {mobileItem?.name}</Link>}</div>{mobileProducts.length > 0 && <><p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Popular setups</p><div className="mt-3 grid grid-cols-2 gap-3">{mobileProducts.map((product) => <Link key={product.slug} href={`/categories/${mobileMenu}/${product.slug}`} onClick={() => setMobileMenu(null)} className="overflow-hidden rounded-xl border border-[#dce4ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="relative aspect-square">{product.image && <Image src={product.image} alt={product.name} fill sizes="45vw" className="object-cover" />}</div><p className="line-clamp-2 p-3 text-sm font-semibold text-primary">{product.name}</p></Link>)}</div></>}</div>}
      <nav aria-label="Browse event categories" className="hidden border-t border-[#edf0f4] md:flex">
        <div className="thin-scrollbar flex h-12 min-w-0 flex-1 items-center gap-6 overflow-x-auto overscroll-x-contain px-6 xl:px-12">
          {categories.map(item => <button key={item.slug} type="button" aria-expanded={openMenu === item.slug} aria-controls="desktop-category-menu"
            onMouseEnter={() => { keepMenuOpen(item.slug); setActiveSubcategory(null); }} onMouseLeave={scheduleMenuClose}
            onClick={() => { if (closeTimer.current) window.clearTimeout(closeTimer.current); setOpenMenu(openMenu === item.slug ? null : item.slug); setActiveSubcategory(null); }}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md text-sm font-semibold text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {item.name}<ChevronDown className={"h-3.5 w-3.5 shrink-0 transition " + (openMenu === item.slug ? "rotate-180" : "")} />
          </button>)}
        </div>
        <Link href="/categories" onClick={() => setOpenMenu(null)} className="flex shrink-0 items-center border-l border-border px-5 text-sm font-bold text-accent">Explore all</Link>
      </nav>
      {desktopItem && <div id="desktop-category-menu" key={desktopItem.slug} onMouseEnter={() => keepMenuOpen(desktopItem.slug)} onMouseLeave={scheduleMenuClose}
        className="absolute inset-x-0 top-full z-50 hidden h-[min(30rem,calc(100dvh-137px))] min-h-0 flex-col overflow-hidden rounded-b-2xl border border-[#dce4ed] bg-white shadow-elevated md:flex">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e5edf3] px-6 py-3 xl:px-12">
          <div className="min-w-0"><p className="truncate text-sm font-bold text-primary">Explore {desktopItem.name}</p><p className="text-xs text-muted-foreground">{desktopChildren.length} subcategories</p></div>
          <div className="flex shrink-0 items-center gap-3"><Link href={"/categories/" + desktopItem.slug} onClick={() => setOpenMenu(null)} className="text-xs font-bold text-accent hover:underline">View all</Link><button type="button" onClick={() => setOpenMenu(null)} aria-label="Close category menu" className="grid h-8 w-8 place-items-center rounded-full border border-border hover:bg-muted"><X className="h-4 w-4" /></button></div>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(15rem,30%)_minmax(0,1fr)]">
          <div aria-label="Subcategories" tabIndex={0} className="thin-scrollbar min-h-0 overflow-y-auto overscroll-contain border-r border-[#e5edf3] bg-[#f8fafc] p-3 [scrollbar-gutter:stable] focus-visible:outline-primary">
            {desktopChildren.length ? desktopChildren.map(child => <Link key={child.slug} href={"/categories/" + desktopItem.slug + "/sub/" + child.slug} onClick={() => setOpenMenu(null)} onMouseEnter={() => setActiveSubcategory(child.slug)} onFocus={() => setActiveSubcategory(child.slug)} className={"mb-1 block rounded-lg px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-primary " + (selectedSubcategory?.slug === child.slug ? "bg-[#edf7f8] text-accent" : "text-primary hover:bg-white")}>
              {child.name}
            </Link>) : <Link href={"/categories/" + desktopItem.slug} onClick={() => setOpenMenu(null)} className="block p-3 text-sm font-semibold text-primary">View all {desktopItem.name}</Link>}
          </div>
          <div aria-label="Popular decorations" tabIndex={0} className="thin-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain p-5 [scrollbar-gutter:stable] xl:p-6">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-accent">{selectedSubcategory?.name ?? "Popular in this collection"}</p>
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {desktopProducts.length ? desktopProducts.map(product => <Link key={product.slug} href={"/categories/" + desktopItem.slug + "/" + product.slug} onClick={() => setOpenMenu(null)} className="group flex min-w-0 items-center gap-3 rounded-xl border border-[#e5edf3] p-2 transition hover:border-accent/40 hover:shadow-card">
                {product.image && <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"><Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" /></span>}
                <span className="line-clamp-2 text-sm font-semibold text-primary group-hover:text-accent">{product.name}</span>
              </Link>) : <div className="col-span-full rounded-xl border border-dashed border-border p-6"><p className="text-sm text-muted-foreground">New decoration packages will appear here soon.</p><Link href={"/categories/" + desktopItem.slug} onClick={() => setOpenMenu(null)} className="mt-3 inline-block text-sm font-semibold text-accent">Browse all {desktopItem.name}</Link></div>}
            </div>
          </div>
        </div>
      </div>}
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}

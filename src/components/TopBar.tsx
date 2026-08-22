"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Headphones, Search, ShoppingBag, UserRound, X } from "lucide-react";
import logo from "@/assets/decor-eventz-logo.webp";
import { SearchOverlay } from "@/components/SearchOverlay";
import { useCart } from "@/lib/cart-store";
import { useMegaMenuData } from "@/lib/use-mega-menu-data";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { label: "Birthday", slug: "birthday" }, { label: "Anniversary", slug: "anniversary" }, { label: "Baby Shower", slug: "baby-shower" }, { label: "Kids Special", slug: "kids" }, { label: "Wedding Decor", slug: "wedding" }, { label: "Corporate", slug: "corporate" }, { label: "Kids Activities", slug: "kids-activities" },
];

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [supabase] = useState(() => createClient());
  const closeTimer = useRef<number | null>(null);
  const { itemCount } = useCart();
  const { subcategories, products } = useMegaMenuData(true);
  const keepMenuOpen = (slug: string) => { if (closeTimer.current) window.clearTimeout(closeTimer.current); setOpenMenu(slug); };
  const scheduleMenuClose = () => { closeTimer.current = window.setTimeout(() => setOpenMenu(null), 220); };
  const mobileItem = NAV_ITEMS.find((item) => item.slug === mobileMenu);
  const mobileSubcategories = subcategories.filter((subcategory) => subcategory.categorySlug === mobileMenu);
  const mobileProducts = products.filter((product) => product.categorySlug === mobileMenu).slice(0, 4);

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
    <header className="sticky inset-x-0 top-0 z-40 border-b border-[#e8edf3] bg-white shadow-sm">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 md:px-8">
        <Link href="/" aria-label="Decor Eventz home" className="flex h-16 shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"><Image src={logo} alt="Decor Eventz — Dream, Design, Deliver" priority width={238} height={64} className="h-14 w-[210px] object-contain object-left md:h-16 md:w-[238px]" /></Link>
        <button onClick={() => setSearchOpen(true)} className="hidden h-11 max-w-[480px] flex-1 items-center gap-3 rounded-xl border border-[#dfe6ee] bg-[#f8fafc] px-4 text-left text-sm text-muted-foreground md:flex">
          <Search className="h-5 w-5" /> Search decorations, themes and occasions...
        </button>
        <div className="ml-auto flex items-center gap-2 md:gap-5">
          <button onClick={() => setSearchOpen(true)} aria-label="Search decorations" className="grid h-10 w-10 place-items-center rounded-full text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"><Search className="h-5 w-5" /></button>
          <Link href="/contact" className="hidden items-center gap-2 text-sm font-medium text-primary md:flex"><Headphones className="h-5 w-5" /> Support</Link>
          <Link href={user ? "/profile" : "/auth?redirect=%2Fprofile"} className="hidden items-center gap-2 text-sm font-semibold text-primary md:flex"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf7f8] text-accent"><UserRound className="h-4 w-4" /></span>{user ? "My account" : "Sign in"}</Link>
          <Link href="/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-full text-primary"><ShoppingBag className="h-5 w-5" />{itemCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{itemCount}</span>}</Link>
        </div>
      </div>
      <nav aria-label="Browse event categories" className="no-scrollbar relative flex h-11 items-center gap-5 overflow-x-auto border-t border-[#edf0f4] px-4 pr-14 md:hidden">
        {NAV_ITEMS.map((item) => <button key={item.slug} onClick={() => setMobileMenu(item.slug)} aria-expanded={mobileMenu === item.slug} aria-controls="mobile-category-menu" className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.label}<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /></button>)}
        <Link href="/categories" className="shrink-0 text-sm font-bold text-accent">Explore all</Link>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
      </nav>
      {mobileMenu && <div id="mobile-category-menu" aria-label={`Browse ${mobileItem?.label ?? "categories"}`} className="fixed inset-x-0 bottom-0 top-[116px] z-50 overflow-y-auto bg-white p-5 md:hidden"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Explore</p><h2 className="mt-1 text-2xl font-bold text-primary">{mobileItem?.label}</h2></div><button onClick={() => setMobileMenu(null)} aria-label="Close category menu" className="grid h-10 w-10 place-items-center rounded-full border border-[#dce4ed] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="h-5 w-5" /></button></div><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Subcategories</p><div className="mt-3 grid grid-cols-2 gap-3">{mobileSubcategories.length ? mobileSubcategories.map((subcategory) => <Link key={subcategory.slug} href={`/categories/${mobileMenu}/sub/${subcategory.slug}`} onClick={() => setMobileMenu(null)} className="rounded-xl border border-[#dce4ed] px-4 py-4 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{subcategory.name}</Link>) : <Link href={`/categories/${mobileMenu}`} onClick={() => setMobileMenu(null)} className="rounded-xl border border-[#dce4ed] px-4 py-4 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View all {mobileItem?.label}</Link>}</div>{mobileProducts.length > 0 && <><p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Popular setups</p><div className="mt-3 grid grid-cols-2 gap-3">{mobileProducts.map((product) => <Link key={product.slug} href={`/categories/${mobileMenu}/${product.slug}`} onClick={() => setMobileMenu(null)} className="overflow-hidden rounded-xl border border-[#dce4ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="relative aspect-square">{product.image && <Image src={product.image} alt={product.name} fill sizes="45vw" className="object-cover" />}</div><p className="line-clamp-2 p-3 text-sm font-semibold text-primary">{product.name}</p></Link>)}</div></>}</div>}
      <nav aria-label="Browse event categories" className="hidden border-t border-[#edf0f4] md:block"><div className="mx-auto flex max-w-7xl items-center gap-7 px-8 py-3">{NAV_ITEMS.map((item) => {
        const children = subcategories.filter((subcategory) => subcategory.categorySlug === item.slug);
        const selectedSubcategory = activeSubcategory ?? children[0]?.slug ?? null;
        const selectedProducts = products.filter((product) => product.categorySlug === item.slug && (!selectedSubcategory || product.subcategorySlug === selectedSubcategory)).slice(0, 6);
        return <div key={item.slug} className="relative" onMouseEnter={() => { keepMenuOpen(item.slug); setActiveSubcategory(children[0]?.slug ?? null); }} onMouseLeave={scheduleMenuClose} onFocus={() => { keepMenuOpen(item.slug); setActiveSubcategory(children[0]?.slug ?? null); }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) scheduleMenuClose(); }} onKeyDown={(event) => { if (event.key === "Escape") setOpenMenu(null); }}>
          <Link href={`/categories/${item.slug}`} aria-expanded={openMenu === item.slug} className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.label}<ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition ${openMenu === item.slug ? "rotate-180" : ""}`} /></Link>
          {openMenu === item.slug && <div onMouseEnter={() => keepMenuOpen(item.slug)} onMouseLeave={scheduleMenuClose} className="fixed inset-x-0 top-[121px] z-50 border-y border-[#dce4ed] bg-white shadow-elevated"><div className="mx-auto grid min-h-72 max-w-7xl grid-cols-[18rem_1fr] px-8 py-7"><div className="border-r border-[#e5edf3] pr-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Explore {item.label}</p><div className="mt-4 space-y-1">{children.length ? children.map((child) => <Link key={child.slug} href={`/categories/${item.slug}/sub/${child.slug}`} onMouseEnter={() => setActiveSubcategory(child.slug)} className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${selectedSubcategory === child.slug ? "bg-[#edf7f8] text-accent" : "text-primary hover:bg-[#f3f8fa]"}`}>{child.name}</Link>) : <Link href={`/categories/${item.slug}`} className="block rounded-xl px-4 py-3 text-sm font-semibold text-primary hover:bg-[#f3f8fa]">Explore {item.label}</Link>}</div></div><div className="pl-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Popular in this collection</p><div className="mt-4 grid grid-cols-3 gap-4">{selectedProducts.length ? selectedProducts.map((product) => <Link key={product.slug} href={`/categories/${item.slug}/${product.slug}`} className="group flex items-center gap-3 rounded-xl border border-[#e5edf3] p-2 transition hover:border-accent/40 hover:shadow-card">{product.image && <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"><Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" /></span>}<span className="line-clamp-2 text-sm font-semibold text-primary group-hover:text-accent">{product.name}</span></Link>) : <p className="col-span-3 py-10 text-sm text-muted-foreground">New decoration packages will appear here soon.</p>}</div></div></div></div>}
        </div>;
      })}<Link href="/categories" className="text-sm font-bold text-accent">Explore all</Link></div></nav>
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Check,
  CircleHelp,
  PackageCheck,
  Pencil,
  ShoppingBag,
  Star,
  Truck,
  HeartHandshake,
  X,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { SearchBar } from "@/components/SearchBar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useCart } from "@/lib/cart-store";
import type { DecorCategory, DecorService, ServiceAddOn } from "@/data/types";

export function ServiceDetailView({
  service,
  category,
  related,
}: {
  service: DecorService;
  category: DecorCategory;
  related: DecorService[];
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [relatedQuery, setRelatedQuery] = useState("");
  const [galleryApi, setGalleryApi] = useState<CarouselApi>();
  const [activeImage, setActiveImage] = useState(0);
  const [detailTab, setDetailTab] = useState<
    "included" | "faqs" | "delivery" | "care"
  >("included");
  const [balloonChoice, setBalloonChoice] = useState("");
  const [customBalloonChoice, setCustomBalloonChoice] = useState("");

  useEffect(() => {
    if (!galleryApi) return;
    const onSelect = () => setActiveImage(galleryApi.selectedScrollSnap());
    onSelect();
    galleryApi.on("select", onSelect);
    return () => {
      galleryApi.off("select", onSelect);
    };
  }, [galleryApi]);

  const selectedAddOns = useMemo(
    () => service.addOns.filter((a) => selectedAddOnIds.includes(a.id)),
    [service.addOns, selectedAddOnIds],
  );
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const detailTabs = useMemo(
    () =>
      [
        {
          key: "included" as const,
          label: "What's included",
          icon: PackageCheck,
          visible:
            service.included.length > 0 || service.notIncluded.length > 0,
        },
        {
          key: "faqs" as const,
          label: "FAQs",
          icon: CircleHelp,
          visible: service.faqs.length > 0,
        },
        {
          key: "delivery" as const,
          label: "Delivery",
          icon: Truck,
          visible: Boolean(service.deliveryInfo),
        },
        {
          key: "care" as const,
          label: "Care info",
          icon: HeartHandshake,
          visible: Boolean(service.careInfo),
        },
      ].filter((tab) => tab.visible),
    [
      service.careInfo,
      service.deliveryInfo,
      service.faqs.length,
      service.included.length,
      service.notIncluded.length,
    ],
  );
  const activeDetailTab = detailTabs.some((tab) => tab.key === detailTab)
    ? detailTab
    : detailTabs[0]?.key;

  function toggleAddOn(addOn: ServiceAddOn) {
    setSelectedAddOnIds((ids) =>
      ids.includes(addOn.id)
        ? ids.filter((id) => id !== addOn.id)
        : [...ids, addOn.id],
    );
  }

  function buildCartItem() {
    const selectedPalette = service.balloonOptions.find(
      (option) => option.name === balloonChoice,
    );
    const selectedBalloon = balloonChoice
      ? {
          kind:
            balloonChoice === "Custom"
              ? ("custom" as const)
              : ("palette" as const),
          label:
            balloonChoice === "Custom"
              ? customBalloonChoice.trim() || "Custom colour request"
              : balloonChoice,
          colors: selectedPalette?.colors ?? [],
        }
      : undefined;
    const configurationKey = [
      selectedBalloon?.kind ?? "none",
      selectedBalloon?.label ?? "",
      ...selectedAddOns.map((addOn) => addOn.id).sort(),
    ].join("|");

    return {
      id: `${service.categorySlug}/${service.slug}/${encodeURIComponent(configurationKey)}`,
      productId: service.id,
      categorySlug: service.categorySlug,
      categoryName: category.name,
      serviceSlug: service.slug,
      serviceName: service.name,
      image: service.images[0],
      unitPrice: service.priceDiscounted,
      originalPrice: service.priceOriginal,
      addOns: selectedAddOns,
      balloonSelection: selectedBalloon,
      balloonChoice: selectedBalloon?.label,
    };
  }

  function handleAddToCart() {
    addItem(buildCartItem());
    toast.success(`${service.name} added to cart`);
  }

  function handleBookNow() {
    addItem(buildCartItem());
    router.push("/book");
  }

  return (
    <div className="min-h-dvh bg-background pb-32">
      <TopBar />
      <main className="mx-auto w-full max-w-md px-5 py-6 md:max-w-6xl md:px-8 md:py-10">
        <div className="md:grid md:grid-cols-2 md:items-start md:gap-10 lg:gap-16">
          {/* Left: Gallery + buy box */}
          <div className="md:sticky md:top-24">
            <Carousel
              setApi={setGalleryApi}
              className="overflow-hidden rounded-3xl shadow-elevated"
            >
              <CarouselContent className="-ml-0">
                {service.images.map((img, i) => (
                  <CarouselItem key={i} className="pl-0">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={img}
                        alt={`${service.name} photo ${i + 1}`}
                        fill
                        priority={i === 0}
                        sizes="(min-width: 768px) 45vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {service.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-3" />
                  <CarouselNext className="right-3" />
                </>
              )}

              {/* Floating thumbnail strip — top-right corner of the gallery image */}
              {service.images.length > 1 && (
                <div className="glass absolute top-3 right-3 z-10 flex max-h-[calc(100%-2.5rem)] flex-col gap-1.5 overflow-y-auto rounded-2xl p-1.5">
                  {service.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => galleryApi?.scrollTo(i)}
                      aria-label={`View photo ${i + 1}`}
                      className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        activeImage === i
                          ? "border-primary"
                          : "border-transparent opacity-70"
                      }`}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Carousel>

            {/* Desktop-only buy box — mirrors the mobile sticky bar below,
                filling the empty space the shorter gallery column leaves
                next to the taller details column. */}
            <div className="mt-6 hidden rounded-3xl border border-border bg-card p-5 shadow-card md:block">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Total{" "}
                    {selectedAddOns.length > 0 &&
                      `(incl. ${selectedAddOns.length} add-on${selectedAddOns.length > 1 ? "s" : ""})`}
                  </p>
                  <p className="mt-1 text-3xl font-black text-gradient-brand">
                    ₹
                    {(service.priceDiscounted + addOnsTotal).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>
                {service.discountPct > 0 && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {service.discountPct}% off
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3.5 text-sm font-bold shadow-card transition-transform active:scale-[0.98]"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </button>
                <button
                  onClick={handleBookNow}
                  className="flex-1 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-all active:scale-[0.98]"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            {/* Title + rating */}
            <div className="mt-6 md:mt-0">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">
                {category.name}
              </p>
              <h1 className="mt-1 font-display text-3xl leading-tight md:text-5xl">
                {service.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                {service.tagline}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-sm">
                <Star className="h-4 w-4 fill-current text-accent" />
                <span className="font-bold">{service.rating}</span>
                <span className="text-muted-foreground">
                  ({service.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Price — mobile only; desktop shows this in the buy box next to the gallery */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card md:hidden">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gradient-brand">
                  ₹{service.priceDiscounted.toLocaleString("en-IN")}
                </span>
                {service.priceOriginal > service.priceDiscounted && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{service.priceOriginal.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {service.discountPct > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {service.discountPct}% off
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              {service.description}
            </p>

            {service.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {service.balloonOptions.length > 0 && (
              <section className="mt-6 rounded-3xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold">Choose balloon palette</h2>
                  <span className="text-xs text-muted-foreground">
                    Tap to select
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.balloonOptions.map((option) => {
                    const selected = balloonChoice === option.name;
                    return (
                      <button
                        key={option.name}
                        onClick={() => setBalloonChoice(option.name)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${selected ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" : "border-border bg-background hover:border-primary/40"}`}
                      >
                        <span className="flex -space-x-1">
                          {option.colors.slice(0, 4).map((color, i) => (
                            <span
                              key={`${color}-${i}`}
                              className="h-3.5 w-3.5 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </span>
                        {option.name}
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setBalloonChoice("Custom")}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-2 text-sm font-semibold ${balloonChoice === "Custom" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Custom
                  </button>
                </div>
                {balloonChoice === "Custom" && (
                  <input
                    autoFocus
                    value={customBalloonChoice}
                    onChange={(e) => setCustomBalloonChoice(e.target.value)}
                    placeholder="Describe your colour palette"
                    className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </section>
            )}

            {detailTabs.length > 0 && (
              <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
                <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border p-3">
                  {detailTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setDetailTab(tab.key)}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${activeDetailTab === tab.key ? "bg-gradient-brand text-primary-foreground shadow-glow" : "border border-border bg-background"}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <div className="p-4">
                  {activeDetailTab === "included" && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-700">
                          Included · {service.included.length} items
                        </p>
                        <ul className="space-y-2.5">
                          {service.included.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2.5 text-sm"
                            >
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {service.notIncluded.length > 0 && (
                        <div>
                          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-rose-600">
                            Not included
                          </p>
                          <ul className="space-y-2.5">
                            {service.notIncluded.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2.5 text-sm text-muted-foreground"
                              >
                                <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {activeDetailTab === "faqs" && (
                    <div className="space-y-3">
                      {service.faqs.map((faq) => (
                        <details
                          key={faq.question}
                          className="rounded-xl border border-border bg-background p-3"
                        >
                          <summary className="cursor-pointer text-sm font-bold">
                            {faq.question}
                          </summary>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {faq.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  )}
                  {activeDetailTab === "delivery" && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {service.deliveryInfo}
                    </p>
                  )}
                  {activeDetailTab === "care" && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {service.careInfo}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Add-ons */}
            {service.addOns.length > 0 && (
              <section className="mt-6">
                <h2 className="text-sm font-bold">Add-ons</h2>
                <div className="mt-3 space-y-2">
                  {service.addOns.map((addOn) => {
                    const selected = selectedAddOnIds.includes(addOn.id);
                    return (
                      <button
                        key={addOn.id}
                        onClick={() => toggleAddOn(addOn)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition ${
                          selected
                            ? "border-accent ring-2 ring-accent/40 bg-accent/5"
                            : "border-border bg-card"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                              selected
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border"
                            }`}
                          >
                            {selected && <Check className="h-3 w-3" />}
                          </span>
                          <span className="text-sm font-semibold">
                            {addOn.name}
                          </span>
                        </span>
                        <span className="text-sm font-bold">
                          +₹{addOn.price.toLocaleString("en-IN")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Sticky CTAs — mobile only; desktop uses the buy box next to the gallery */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg md:hidden">
              <div className="mx-auto flex max-w-md items-center gap-3 px-5">
                <div className="flex-1">
                  <p className="text-[11px] text-muted-foreground">Total</p>
                  <p className="text-lg font-black text-gradient-brand">
                    ₹
                    {(service.priceDiscounted + addOnsTotal).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-3.5 text-sm font-bold shadow-card active:scale-[0.98]"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </button>
                <button
                  onClick={handleBookNow}
                  className="flex-1 whitespace-nowrap rounded-full bg-gradient-brand px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-all active:scale-[0.98]"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl md:text-3xl">
              You might also like
            </h2>
            <SearchBar
              className="my-4 max-w-xl"
              mode="filter"
              onQueryChange={setRelatedQuery}
              placeholder="Search these…"
            />
            {(() => {
              const q = relatedQuery.trim().toLowerCase();
              const visibleRelated = q
                ? related.filter(
                    (s) =>
                      s.name.toLowerCase().includes(q) ||
                      s.tags.some((t) => t.includes(q)),
                  )
                : related;
              return visibleRelated.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
                  {visibleRelated.map((s) => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  No results for &ldquo;{relatedQuery}&rdquo;.
                </p>
              );
            })()}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

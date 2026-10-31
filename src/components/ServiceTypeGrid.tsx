import { CatalogImage } from "@/components/CatalogImage";
import { siteImage } from "@/data/images";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { LeadLink } from "@/components/birthday/LeadLink";

type Type = { title: string; description: string; terms: string[] };
type Design = { id: string; name: string; image: string; description: string; search: string };

export function ServiceTypeGrid({ types, designs, service }: { types: Type[]; designs: Design[]; service: string }) {
  if (!types.length) return null;
  const photos = designs.filter(design => design.image);
  return <section className="birthday-section" aria-labelledby="types-heading">
    <p className="birthday-eyebrow">Choose your setup</p>
    <h2 id="types-heading" className="birthday-heading">Types of {service}</h2>
    <p className="birthday-copy">Start with the type of setup that suits your venue and celebration. Share a reference image or the details of your preferred style to discuss a customized quote.</p>
    <div className="mt-7 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
      {types.map((type, index) => {
        const image = photos.find(design => type.terms.some(term => design.search.includes(term))) ?? photos[index % Math.max(photos.length, 1)];
        return <article key={type.title} className="overflow-hidden rounded-3xl border border-border bg-card shadow-card"><div className="relative aspect-[4/3] bg-muted"><CatalogImage src={image?.image || siteImage("balloonArch")} alt={image?.name || "Event decoration arrangement"} fill sizes="(max-width:480px) 90vw,(max-width:1024px) 44vw,23vw" className="object-cover" /></div><div className="p-5"><h3 className="text-lg font-semibold">{type.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{type.description}</p><LeadLink context={`${service}: ${type.title}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary"><WhatsAppIcon className="h-5 w-5" />Discuss this setup</LeadLink></div></article>;
      })}
    </div>
  </section>;
}

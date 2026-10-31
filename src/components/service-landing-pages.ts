export const serviceLandingPages = [
  { slug: "baby-shower-decoration-bangalore", label: "Baby Shower Decoration", keyword: "Baby Shower Decoration in Bangalore", description: "Plan a beautiful baby shower decoration in Bangalore with coordinated balloons, backdrops and personalized details. Share your venue and get a custom quote.", intro: "Create a warm setting for a baby shower with a thoughtful backdrop, balloon styling and a cake or gift-table focal point planned around your home, apartment clubhouse or venue.", terms: ["baby", "shower", "pastel"], sections: [["Plan a gentle colour story", "Choose colours that suit the celebration and the venue. Soft pastels, florals or a colour-led concept can guide the backdrop and balloon arrangement without making the room feel crowded. Share a few reference images and point out the details you like so the final design can be discussed around the available space and agreed elements."], ["Create a comfortable photo and celebration area", "Place the main backdrop where family and friends can gather for photographs, games and the cake or gift table. Send a photo of the area, its approximate dimensions and any furniture that must remain in place. This helps plan a proportionate arrangement and keep walkways clear for guests."], ["Confirm venue access in advance", "For a Bangalore apartment clubhouse or party hall, check visitor access, setup timing and attachment rules before booking. Share the event date and venue address with DecorEventz to confirm availability, access requirements and the decoration options that suit the location."]], checklist: ["Event date and Bangalore venue address", "Venue photo and decoration-area dimensions", "Preferred colours and reference images", "Setup access and venue permissions"] },
  { slug: "anniversary-decoration-bangalore", label: "Anniversary Decoration", keyword: "Anniversary Decoration in Bangalore", description: "Explore anniversary decoration in Bangalore for a home celebration, room surprise or venue setup. Discuss balloons, backdrops and personal details with DecorEventz.", intro: "Celebrate an anniversary with decoration that feels personal to the occasion. Plan a romantic room surprise, a cake-cutting backdrop or a warm home arrangement around your preferred colours and meaningful details.", terms: ["anniversary", "romantic", "room", "red", "heart"], sections: [["Choose a setting that feels personal", "A bedroom, living room, restaurant corner or private venue can each create a different kind of celebration. Start with the moment you want to create, then share images of the space and the colours you prefer. A planned focal point around a cake or a message can make a simple setup feel considered."], ["Coordinate balloons, messages and the cake area", "Decide which elements matter most before selecting decorative details. A balloon arrangement, backdrop and anniversary message can work together without competing with one another. Share reference images and ask for the exact agreed elements to be included in your quote."], ["Plan access for a surprise setup", "If the arrangement is a surprise, confirm when the room will be available and who can provide access. Hotels and venues may have their own decoration rules, so obtain permission before finalizing the plan. Send your Bangalore location and timing to confirm practical setup arrangements."]], checklist: ["Celebration type and preferred reveal time", "Venue or room photo", "Colours, message and reference images", "Access contact and property permission"] },
  { slug: "wedding-decoration-bangalore", label: "Wedding Decoration", keyword: "Wedding Decoration in Bangalore", description: "Plan wedding decoration in Bangalore with carefully coordinated backdrops, entrances and celebration spaces. Share your venue details and request a DecorEventz quote.", intro: "Shape a wedding setting around the way you want guests to experience the celebration. Discuss entrance decor, stage or backdrop styling, photo spaces and coordinated details for your venue.", terms: ["wedding", "mandap", "floral", "stage", "gold"], sections: [["Start with the venue and celebration flow", "A wedding venue has several moments to plan: arrival, ceremony, stage, dining and photographs. Share the floor plan, venue photographs and event schedule before choosing elements. This helps identify where decoration will have the most visual impact while preserving guest movement and service access."], ["Build one cohesive visual direction", "Choose a palette and overall mood that can carry across focal areas. Backdrops, floral-inspired elements, balloons or fabric details should complement the venue rather than compete with it. Reference images help communicate the intended look; the final scope needs to be confirmed around venue dimensions, materials and availability."], ["Coordinate setup with the venue team", "Ask about loading access, setup windows, attachment restrictions and any venue rules before confirming your plan. Share these details with DecorEventz alongside your Bangalore location and event date. A detailed discussion allows the team to prepare a quote based on the agreed areas and decorative requirements."]], checklist: ["Venue layout and photographs", "Event schedule and guest-flow priorities", "Preferred palette and reference images", "Venue setup and loading access"] },
  { slug: "engagement-decoration-bangalore", label: "Engagement Decoration", keyword: "Engagement Decoration in Bangalore", description: "Explore engagement decoration in Bangalore for a ring ceremony, home celebration or party venue. Plan a backdrop, balloons and personalized details with DecorEventz.", intro: "Make the engagement moment feel like your own. Plan a welcoming backdrop, a ring-ceremony focal point and a photo space that works for the venue, guest list and colour story you have in mind.", terms: ["engagement", "ring", "gold", "backdrop", "couple"], sections: [["Plan the ring ceremony focal point", "The main backdrop often becomes the centre of the engagement celebration. Choose where the couple will stand, how guests will approach and where photographs will be taken. Share venue dimensions and any preferred message or initials so the design can be planned around the actual space."], ["Bring the photo area and decor together", "A clear palette and a few coordinated decorative details can create a strong visual setting. Discuss the backdrop, balloon installation, signage and cake-table area as one plan. Reference photos can communicate a mood, while the final proposal should clearly list what will be included."], ["Confirm your venue details", "Apartment clubhouses, banquet halls and outdoor venues have different access and installation needs. Check the venue rules and share the event date, Bangalore address and setup window early. DecorEventz can confirm availability and prepare a quote around the agreed requirements."]], checklist: ["Ring ceremony area and dimensions", "Couple initials or preferred message", "Colour palette and inspiration images", "Venue rules and setup timing"] },
  { slug: "corporate-event-decoration-bangalore", label: "Corporate Event Decoration", keyword: "Corporate Event Decoration in Bangalore", description: "Plan corporate event decoration in Bangalore for launches, team celebrations and office events. Discuss branding, venue details and a tailored DecorEventz quote.", intro: "Create an event setting that supports your brand and brings people together. Plan a stage, photo backdrop, welcome area or team-celebration focal point around your venue, agenda and visual identity.", terms: ["corporate", "office", "brand", "launch", "event"], sections: [["Begin with the event objective", "A product launch, team celebration and office milestone each need a different atmosphere. Share the event purpose, guest count, agenda and venue photographs so the decoration can support the moments that matter: arrival, presentations, recognition or photographs."], ["Use brand details with restraint", "A well-planned backdrop or welcome area can bring together your colours, logo placement and event message without overpowering the venue. Provide approved brand colours, artwork and wording early. Confirm any printed or customized elements in the final scope so expectations and approvals are clear."], ["Coordinate with venue operations", "Corporate venues often have fixed loading windows, security registration and setup deadlines. Share the Bangalore address, contact person, access instructions and event schedule with DecorEventz. The team can discuss practical installation requirements and quote for the agreed elements."]], checklist: ["Event objective, date and guest count", "Venue photographs and floor plan", "Approved brand colours and artwork", "Loading, security and setup schedule"] },
] as const;

export function serviceLandingHref(label: string) {
  const page = serviceLandingPages.find(page => page.label === label);
  return page ? `/decoration-services/${page.slug}` : "/categories";
}

/** Editorial copy is deliberately service-specific so each route answers a
 * different planning intent rather than duplicating the same SEO paragraph. */
export const serviceSeoContent: Record<string, { title: string; paragraphs: string[] }> = {
  "baby-shower-decoration-bangalore": {
    title: "Baby Shower Decorators in Bangalore for a Thoughtful Celebration",
    paragraphs: [
      "Baby shower decoration is often planned around a close group of family and friends, so the setting should feel welcoming as well as photograph well. Begin with the room or venue you have booked, then decide whether the main focus is the cake table, a gift table, a games corner or a dedicated photo backdrop. A simple balloon arrangement can add colour to an intimate home celebration, while a larger backdrop can help define a clubhouse or party-hall setup. When you enquire, share a wide photo of the space, the approximate dimensions and any venue rules so the proposed decoration fits naturally into the celebration.",
      "For baby shower decoration in Bangalore, colour is usually the easiest starting point. Soft neutrals, pastels or a selected theme can guide the balloons, backdrop and personalized details. Reference images help communicate the mood you prefer, but the final layout should be planned for your own venue, furniture and guest movement. Discuss the birthday-style elements you want to avoid or include, such as a welcome sign, name detail or cake-table styling. A clear quote should confirm the agreed decorative elements, setup requirements and access details before the event date.",
    ],
  },
  "anniversary-decoration-bangalore": {
    title: "Anniversary Decoration Ideas for Homes, Rooms and Intimate Venues",
    paragraphs: [
      "An anniversary decoration can be understated and personal or designed as a larger celebration backdrop. Start by choosing the space that will create the moment you want: a living room for an evening at home, a bedroom for a surprise reveal, or a reserved venue corner for family and friends. A balloon garland, message backdrop and cake area can create a clear focal point without taking over the entire room. Share the event date, Bangalore location and a photo of the available area so the team can discuss a setup that works with the room rather than against it.",
      "When planning anniversary decoration in Bangalore, it helps to decide which details matter most before you select every decorative element. A preferred colour palette, an anniversary message, a table for cake or flowers and a space for photographs give the arrangement a purpose. Hotel rooms and restaurants can have rules about outside decoration and access, so permission should be confirmed before booking. Send reference images through WhatsApp with the venue information; DecorEventz can discuss available options and confirm the final decoration scope in your quote.",
    ],
  },
  "wedding-decoration-bangalore": {
    title: "Wedding Decorators in Bangalore for Ceremony and Celebration Spaces",
    paragraphs: [
      "Wedding decoration needs to support the way a celebration moves from one moment to the next. Guests may first encounter an entrance, then a ceremony area, stage, dining space and photo backdrop. Rather than treating these as disconnected decorations, begin with the venue layout and choose the areas that should carry the visual focus. Share venue photographs, the schedule and guest-flow priorities with DecorEventz. This allows the team to discuss a coordinated setup that considers access, sightlines and the space needed for guests, photographers and venue staff.",
      "A wedding decoration in Bangalore can be guided by a colour palette, cultural details, a floral-inspired look or a more contemporary backdrop concept. Reference images are useful for showing the atmosphere you want, but their proportions and materials should be adapted to your actual venue. Ask for the agreed design areas and included elements to be described clearly in the quote. Confirm loading access, setup time, attachment restrictions and venue contacts before the event. This preparation gives everyone a shared understanding of the decoration plan and its practical requirements.",
    ],
  },
  "engagement-decoration-bangalore": {
    title: "Engagement Decorators in Bangalore for Ring Ceremonies and Celebrations",
    paragraphs: [
      "An engagement ceremony often centres on one important moment, which makes the backdrop and photo space especially useful. Choose where the couple will stand for the ring exchange, where family photographs will be taken and how guests will approach the area. A ring backdrop, coordinated balloon arrangement or personalized message can create a setting with a clear focus. Send the venue photograph, approximate dimensions and preferred ceremony time when you enquire. This helps DecorEventz discuss an arrangement suited to a home, apartment clubhouse or party venue.",
      "For engagement decoration in Bangalore, bring your colours, initials or favourite references together before deciding on individual details. A restrained palette can tie the stage, cake table and photo area together without making the venue feel crowded. Check any venue rules for wall attachments, setup timing and vendor access before finalizing your plans. Share the event date, Bangalore address and access information with the team. Your quote should identify the final decorative elements and installation requirements so the setup is clear before the celebration.",
    ],
  },
  "corporate-event-decoration-bangalore": {
    title: "Corporate Event Decorators in Bangalore for Brand and Team Moments",
    paragraphs: [
      "Corporate event decoration should make the event feel considered while serving its practical purpose. A launch, recognition event, office celebration or team gathering may need a welcome point, a presentation backdrop, a branded photo area or an informal social corner. Begin by sharing the event objective, guest count, agenda and venue layout. These details help identify where decoration supports the guest experience and where it could interfere with registration, catering or presentations. A focused setup can make a stronger impression than filling every available surface.",
      "For corporate event decoration in Bangalore, provide approved brand colours, logo artwork and event wording early in the discussion. This allows the team to confirm which personalized elements can be accommodated and how they will appear alongside the venue. Office buildings and corporate venues may require security registration, fixed loading windows and an approved setup schedule. Share a venue contact, access instructions and the event date with DecorEventz. The final quote should describe the agreed areas, materials and operational requirements before the event is confirmed.",
    ],
  },
};

export const serviceTypes: Record<string, Array<{ title: string; description: string; terms: string[] }>> = {
  "baby-shower-decoration-bangalore": [
    { title: "Baby Shower Backdrop", description: "A focused cake, gift or photo area for the celebration.", terms: ["pastel", "backdrop", "baby"] },
    { title: "Pastel Balloon Decoration", description: "Soft colour combinations for homes, clubhouses and venues.", terms: ["pastel", "balloon", "baby"] },
    { title: "Welcome & Photo Corner", description: "A warm entrance or family-photo setting with personalized details.", terms: ["welcome", "theme", "balloon"] },
    { title: "Simple Home Baby Shower", description: "A compact arrangement suited to a close celebration at home.", terms: ["simple", "home", "pastel"] },
  ],
  "anniversary-decoration-bangalore": [
    { title: "Anniversary Room Surprise", description: "A personal room setup planned around the reveal moment.", terms: ["room", "surprise", "romantic"] },
    { title: "Romantic Balloon Decoration", description: "A coordinated balloon arrangement for an intimate celebration.", terms: ["balloon", "heart", "red"] },
    { title: "Anniversary Backdrop", description: "A cake-cutting and photograph area with a clear visual focus.", terms: ["backdrop", "gold", "balloon"] },
    { title: "Home Anniversary Setup", description: "A thoughtful living-room or dining-area decoration.", terms: ["home", "simple", "room"] },
  ],
  "wedding-decoration-bangalore": [
    { title: "Wedding Stage Decoration", description: "A focal stage or backdrop planned around the venue layout.", terms: ["stage", "wedding", "backdrop"] },
    { title: "Wedding Entrance Decoration", description: "A welcoming first impression for guests arriving at the venue.", terms: ["arch", "welcome", "balloon"] },
    { title: "Wedding Photo Backdrop", description: "A dedicated setting for couple and family photographs.", terms: ["backdrop", "ring", "gold"] },
    { title: "Intimate Wedding Decor", description: "A coordinated approach for smaller home or venue celebrations.", terms: ["simple", "home", "pastel"] },
  ],
  "engagement-decoration-bangalore": [
    { title: "Ring Ceremony Backdrop", description: "A focused setting for the engagement and photographs.", terms: ["ring", "backdrop", "gold"] },
    { title: "Engagement Balloon Decoration", description: "A colourful arrangement for the couple’s celebration space.", terms: ["balloon", "ring", "gold"] },
    { title: "Engagement Stage Decor", description: "A stage or main backdrop tailored to the venue dimensions.", terms: ["stage", "backdrop", "theme"] },
    { title: "Home Engagement Setup", description: "A compact arrangement for a living room or apartment clubhouse.", terms: ["home", "simple", "balloon"] },
  ],
  "corporate-event-decoration-bangalore": [
    { title: "Corporate Photo Backdrop", description: "A branded space for team photographs and event memories.", terms: ["backdrop", "balloon", "gold"] },
    { title: "Office Celebration Decor", description: "A focused arrangement for a team milestone or office event.", terms: ["office", "balloon", "simple"] },
    { title: "Product Launch Setup", description: "A welcome, stage or display area planned around the event agenda.", terms: ["launch", "stage", "backdrop"] },
    { title: "Corporate Welcome Area", description: "A thoughtful arrival point for guests, teams or partners.", terms: ["welcome", "arch", "balloon"] },
  ],
};

// Put service types in the rendered planning grid once, at module load. This
// avoids modifying shared page data during a request or ISR revalidation.
for (const page of serviceLandingPages as unknown as Array<{
  slug: string;
  sections: Array<[string, string]>;
}>) {
  const types = serviceTypes[page.slug] ?? [];
  if (!page.sections.some(([title]) => title === types[0]?.title)) {
    types.slice().reverse().forEach(type => page.sections.unshift([type.title, type.description]));
  }
}

// The shared landing-page view renders these alongside the initial planning
// guidance, giving every service a substantial, unique editorial section.
for (const page of serviceLandingPages as unknown as Array<{
  slug: string;
  sections: Array<[string, string]>;
}>) {
  const editorial = serviceSeoContent[page.slug];
  if (editorial) {
    editorial.paragraphs.forEach((paragraph, index) =>
      page.sections.push([
        index === 0 ? editorial.title : "Practical details before you book",
        paragraph,
      ]),
    );
  }
}

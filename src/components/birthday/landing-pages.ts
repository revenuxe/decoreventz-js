export { BIRTHDAY_PATH, birthdayLandingHref } from "./navigation";

type LandingPage = {
  slug: string;
  label: string;
  keyword: string;
  description: string;
  intro: string;
  terms: string[];
  sections: { title: string; copy: string }[];
  checklist: string[];
  faq: { question: string; answer: string };
};

export const birthdayLandingPages: LandingPage[] = [
  {
    slug: "birthday-decoration-at-home",
    label: "Birthday at Home",
    keyword: "Birthday Decoration at Home in Bangalore",
    description:
      "Plan birthday decoration at home in Bangalore with balloon garlands, cake-table backdrops and personalized details. Discuss your space and get a custom quote.",
    intro:
      "Make your home the setting for a thoughtful birthday celebration. Plan a balloon arrangement, a cake-cutting corner or a coordinated backdrop around your apartment, villa or living room, with colours and details chosen for the person you’re celebrating.",
    terms: ["home", "wall", "pastel", "simple"],
    sections: [
      {
        title: "Choose the right corner for your celebration",
        copy: "Start with the space you already have. A clear wall beside the cake table can become a focal point without moving every piece of furniture. Take a straight-on photo of the area and share approximate wall width and ceiling height. Include nearby doors, fans and light fittings in the photograph so the proposed decoration can be planned around them. Leave room for family photographs and a comfortable route for guests to move between the entrance, seating and cake area.",
      },
      {
        title: "Home birthday decoration ideas to discuss",
        copy: "A compact balloon garland suits an intimate gathering, while a ring or panel backdrop creates a more defined photo space. Soft pastels, metallic accents or the birthday person’s favourite colours can guide the arrangement. Discuss whether you want a birthday message, age detail or cake-table styling, then confirm which elements are included in the quote. Reference photographs help explain the overall mood; the final setup should reflect your available space and agreed requirements.",
      },
      {
        title: "Planning setup in a Bangalore apartment",
        copy: "Check your building’s visitor access, lift availability and decoration rules before confirming a booking. If the celebration is in a shared clubhouse, ask about setup access and the time the room must be cleared. Tell the team whether attachments to walls are permitted or a freestanding arrangement is needed. Sharing your venue address and event date early helps confirm service availability and the practical details of preparing your home for the celebration.",
      },
    ],
    checklist: [
      "Photo and dimensions of the decoration area",
      "Bangalore address and apartment access",
      "Preferred colours and birthday message",
      "Cake-table position and setup access",
    ],
    faq: {
      question: "What details do you need for home birthday decoration?",
      answer:
        "Share your event date, Bangalore address, a photo of the space, approximate dimensions and preferred colours. Include building access or wall-attachment rules so the team can discuss a suitable arrangement and confirm availability.",
    },
  },
  {
    slug: "kids-birthday-decoration",
    label: "Kids Birthday",
    keyword: "Kids Birthday Decoration in Bangalore",
    description:
      "Explore kids birthday decoration in Bangalore, from favourite character ideas to colourful balloon backdrops. Discuss themes, cake-table styling and a custom quote.",
    intro:
      "Build a birthday celebration around their favourite world. Explore colour-led setups, character-inspired backdrops and cake-table decoration, with practical planning for children’s activities, family photographs and your venue.",
    terms: [
      "kids",
      "kid",
      "baby",
      "jungle",
      "unicorn",
      "frozen",
      "princess",
      "theme",
    ],
    sections: [
      {
        title: "Start with one theme they love",
        copy: "Ask which animals, characters or colours your child enjoys most, then choose one clear direction for the decoration. Jungle, princess, unicorn and superhero ideas can be starting points for a discussion rather than a fixed package. Share reference images and the child’s age to help explain your preferences. The team can confirm which themed elements are available for the date and how the idea can be adapted to your venue and budget.",
      },
      {
        title: "Bring the backdrop and cake table together",
        copy: "The cake-cutting area usually draws everyone together, so plan the backdrop and table as one composition. Consider where the cake will sit, where the family will stand and what will appear behind them in photographs. Coordinated balloons can connect the main colours without adding too many competing details. Discuss personalized names, age elements and themed props individually, and ask for a clear list of the decoration items included in your final quote.",
      },
      {
        title: "Leave room for a children’s party",
        copy: "A good kids birthday setup works alongside the party activities. Keep the main decoration away from busy entrances and leave space for games, seating and refreshments. Share any venue restrictions or concerns about access to decorative props. For a Bangalore apartment clubhouse or party hall, confirm setup access with the venue manager and send the address when enquiring. Availability, the final theme and all customization details should be agreed before you confirm the decoration.",
      },
    ],
    checklist: [
      "Child’s age and favourite theme",
      "Reference photos and preferred colours",
      "Cake-table position and play area",
      "Venue permissions and setup access",
    ],
    faq: {
      question: "Can I request a custom kids birthday theme?",
      answer:
        "Yes, share the theme idea and reference images with DecorEventz. The team will discuss available backdrops, balloons and decorative details, then confirm the final design and quote for your event date.",
    },
  },
  {
    slug: "simple-birthday-decoration",
    label: "Simple Decoration",
    keyword: "Simple Birthday Decoration in Bangalore",
    description:
      "Explore simple birthday decoration in Bangalore for intimate home parties. Plan coordinated balloons, a birthday message and a compact backdrop with DecorEventz.",
    intro:
      "A small setup can make a birthday feel special. Focus on a coordinated colour palette, a well-placed balloon arrangement and a cake corner that suits an intimate home gathering or a smaller venue.",
    terms: ["simple", "pastel", "wall", "home"],
    sections: [
      {
        title: "Keep the focal point clear",
        copy: "Simple birthday decoration works best when the main idea is easy to see. Choose a wall, a corner or the space behind your cake table, then keep the surrounding area uncluttered. A balloon cluster and birthday message may be enough for a small room. Share a photograph of the available space so the proposed arrangement stays in proportion. Consider where people will stand for photographs and leave enough room around the table for comfortable movement.",
      },
      {
        title: "Use colour to make a compact setup feel complete",
        copy: "Two or three complementary colours can give a modest arrangement a deliberate finish. Match the balloons to the room, the cake or a favourite colour, and discuss whether a metallic accent would suit the look. A reference image can help explain your preferences, but its size and materials may need adapting. Ask which balloon arrangement, lettering and supporting elements are included so the final quote describes the setup you expect.",
      },
      {
        title: "Plan around your budget and room",
        copy: "Tell the team which details matter most to you before adding extra elements. A compact garland may suit one space, while a small freestanding backdrop works better where wall attachments are restricted. Share your Bangalore venue location, event date and preferred setup time to confirm availability. Costs depend on the agreed materials, dimensions and access requirements, so request a tailored quote rather than assuming every photograph represents the same package.",
      },
    ],
    checklist: [
      "One main decoration area",
      "Two or three preferred colours",
      "Birthday message or age detail",
      "Budget and venue dimensions",
    ],
    faq: {
      question: "Can a simple birthday setup be customized?",
      answer:
        "Discuss your preferred colours, birthday message and available space with the team. The final elements and customization options will be confirmed in your quote.",
    },
  },
  {
    slug: "balloon-decoration",
    label: "Balloon Decoration",
    keyword: "Birthday Balloon Decoration in Bangalore",
    description:
      "Discover birthday balloon decoration in Bangalore, including arches, garlands, rings and balloon walls. Plan your colours, venue and a custom DecorEventz quote.",
    intro:
      "Frame your birthday celebration with balloons chosen for your space and colour story. Explore garlands, arches, ring arrangements and balloon walls for a cake area, entrance or photo backdrop.",
    terms: ["balloon", "arch", "ring", "wall"],
    sections: [
      {
        title: "Compare arches, garlands and balloon walls",
        copy: "An arch can frame an entrance or cake table, while a garland can follow the edge of a backdrop or highlight one corner. A balloon wall creates a fuller background for photographs and needs enough clear space in front. Ring arrangements offer a defined shape with room to discuss a birthday message or personalized detail. Share the look you prefer and the dimensions of the area so the team can advise on a suitable scale.",
      },
      {
        title: "Choose a balanced balloon colour palette",
        copy: "Use your cake, outfit or venue as a starting point for the colours. Pastels create a softer effect, while black and gold or other stronger combinations can give the setup a more dramatic appearance. Reference photographs help communicate the balance of colours and the fullness of the arrangement. Discuss any special finishes or personalized elements separately and confirm them in the quote rather than assuming they are included with every balloon setup.",
      },
      {
        title: "Consider installation and the venue environment",
        copy: "Tell the team whether the decoration will be indoors, in a covered area or outdoors. Access, exposure and the permitted installation method affect how an arrangement can be planned. Check whether your Bangalore venue permits wall attachments or needs a freestanding structure. Share the event date, address and setup access details with your enquiry. The agreed design, materials and installation requirements determine the quotation, with availability confirmed for your celebration.",
      },
    ],
    checklist: [
      "Arch, garland, ring or wall preference",
      "Colour combination and reference image",
      "Indoor or outdoor venue details",
      "Installation permissions and clear space",
    ],
    faq: {
      question: "Which balloon decoration suits a small birthday venue?",
      answer:
        "A compact garland or smaller ring arrangement may suit limited space. Send a photo and approximate dimensions so DecorEventz can discuss an appropriate design and confirm the setup requirements.",
    },
  },
  {
    slug: "premium-birthday-decoration",
    label: "Premium Decoration",
    keyword: "Premium Birthday Decoration in Bangalore",
    description:
      "Plan premium birthday decoration in Bangalore with statement backdrops, coordinated balloon installations and personalized styling. Discuss your venue and request a quote.",
    intro:
      "Give a milestone birthday a distinctive focal point. Discuss statement backdrops, layered decoration and coordinated balloon installations planned around your venue, celebration style and priorities.",
    terms: ["premium", "luxury", "grand", "elegant", "backdrop", "ring"],
    sections: [
      {
        title: "Design a statement backdrop with purpose",
        copy: "A premium birthday setup begins with how the space will be used. Decide whether the decoration should frame the cake table, create a separate photo area or draw attention to a stage. Layered panels and balloon arrangements can add depth, but their size should reflect the venue dimensions. Share wide photographs of the room and any architectural features to help the team discuss a composition that feels balanced rather than crowded.",
      },
      {
        title: "Coordinate the details that guests will notice",
        copy: "Choose a clear colour story and decide which personalized details matter most. A name, milestone age or birthday message can give the backdrop a personal focus. Discuss the cake-table arrangement, decorative props and any special materials individually. Ask for the proposed elements to be listed in the quote so you can compare options meaningfully. Reference images are useful for explaining a mood, with the final design confirmed around availability and your requirements.",
      },
      {
        title: "Prepare a larger venue for setup",
        copy: "Party halls and larger Bangalore venues may have specific loading access, lift restrictions and setup schedules. Confirm these details with the venue before finalizing the decoration. Share the address, available floor space and event date, along with any restrictions on attachments or freestanding structures. More elaborate arrangements can involve additional materials and preparation; the team can explain the proposed scope and provide a custom quote once the requirements are clear.",
      },
    ],
    checklist: [
      "Venue photographs and backdrop dimensions",
      "Milestone age and personalized details",
      "Colour story and priority elements",
      "Loading access and venue setup schedule",
    ],
    faq: {
      question: "What affects the cost of premium birthday decoration?",
      answer:
        "Backdrop dimensions, materials, balloon installations, personalized details and venue setup requirements influence the cost. Share your priorities and space details for a quote covering the agreed elements.",
    },
  },
  {
    slug: "birthday-room-decoration",
    label: "Room Surprise",
    keyword: "Birthday Room Decoration in Bangalore",
    description:
      "Plan birthday room decoration in Bangalore for a thoughtful surprise at home or a permitted hotel venue. Discuss balloons, colours, access and a custom quote.",
    intro:
      "Plan a birthday reveal that feels personal. Discuss balloons, a birthday message and a coordinated arrangement for a bedroom, living space or hotel room where decoration is permitted.",
    terms: ["room", "surprise", "home", "hall"],
    sections: [
      {
        title: "Plan the moment of the surprise",
        copy: "Think about what the birthday person will see first when they enter the room. A clear focal point near a wall, table or open corner can make the reveal feel considered. Share room photographs and explain the intended entry route so the arrangement can be discussed around the furniture. Favourite colours and a personal birthday message can guide the idea without needing to fill every surface with decorations.",
      },
      {
        title: "Arrange permission and discreet access",
        copy: "For a hotel-room birthday surprise, ask the property about decoration rules before making plans. Some venues restrict wall attachments, access by outside teams or particular materials. For a home setup, arrange entry with someone who can provide access and confirm when the room will be available. Share these details with your Bangalore address and event date. The team can confirm whether the proposed location and access arrangements can be accommodated.",
      },
      {
        title: "Confirm every element before the day",
        copy: "Reference photographs often contain several separate items, so discuss exactly what you want included. Ask about the balloon arrangement, lettering and any personalized details, and confirm the final list in your quotation. Mention if the room must remain usable during the celebration or if furniture cannot be moved. Setup timing and availability need to be agreed with both the venue and DecorEventz, particularly when the surprise depends on a specific access window.",
      },
    ],
    checklist: [
      "Room photos and available floor space",
      "Property permission for decoration",
      "Access contact and preferred reveal time",
      "Colours, message and agreed elements",
    ],
    faq: {
      question: "Can you plan a birthday surprise in a hotel room?",
      answer:
        "Share the hotel location, event date and decoration rules with DecorEventz. Obtain the property’s permission first; the team will confirm whether the setup and access requirements can be accommodated.",
    },
  },
  {
    slug: "birthday-theme-decoration",
    label: "Theme Decoration",
    keyword: "Birthday Theme Decoration in Bangalore",
    description:
      "Explore birthday theme decoration in Bangalore for children and adults. Coordinate colours, backdrops and personal details with a custom DecorEventz enquiry.",
    intro:
      "Give your celebration a clear visual story. From a favourite character to a colour-led milestone birthday, plan a theme that connects the backdrop, balloons and cake area without overwhelming your space.",
    terms: ["theme", "frozen", "princess", "jungle", "unicorn"],
    sections: [
      {
        title: "Turn an idea into a practical decoration plan",
        copy: "A theme can begin with a character, a hobby, a favourite colour or the mood you want for the party. Gather a few reference images and point out the details you like in each. Explain whether the priority is the backdrop, the colour combination or a personalized message. This gives the team a clearer starting point than asking for an exact copy of a photograph taken in a different venue.",
      },
      {
        title: "Keep the cake area and backdrop connected",
        copy: "Choose a small set of colours and repeat them across the main decorative elements. The cake-table position, backdrop proportions and balloon arrangement should work together in photographs. Discuss names, age details and themed props separately, and confirm which can be supplied for your date. A consistent theme does not require every surface to carry a graphic; leaving some visual space can help the main birthday arrangement stand out.",
      },
      {
        title: "Adapt your theme to the Bangalore venue",
        copy: "The same idea may need a different arrangement in an apartment, clubhouse or party hall. Send venue photographs and dimensions before confirming the design. Include wall-attachment rules, access arrangements and your preferred setup window. Customization depends on the agreed materials and available elements, so ask the team to confirm the final scope and quotation. Advance discussion is recommended when a theme needs personalized preparation or venue coordination.",
      },
    ],
    checklist: [
      "Theme idea and reference photographs",
      "Preferred colours and personalized text",
      "Backdrop and cake-table dimensions",
      "Event date and customization priorities",
    ],
    faq: {
      question: "Can a birthday theme be adapted for an adult celebration?",
      answer:
        "Yes, discuss a colour-led theme, hobby inspiration or milestone birthday idea with the team. Share references and venue details so available customization options and the final setup can be confirmed.",
    },
  },
  {
    slug: "first-birthday-decoration",
    label: "1st Birthday",
    keyword: "1st Birthday Decoration in Bangalore",
    description:
      "Plan 1st birthday decoration in Bangalore with a coordinated backdrop, balloons and personalized details. Explore first birthday ideas and request a custom quote.",
    intro:
      "Create a thoughtful setting for their first birthday. Explore soft colour palettes, playful theme ideas and a family-friendly cake area with personalized details discussed around your venue and celebration.",
    terms: ["1st", "first", "one", "baby"],
    sections: [
      {
        title: "Choose a first birthday colour story",
        copy: "Start with the colours or theme you would like to see in family photographs. Pastels, brighter combinations or a simple coordinated palette can all work, depending on the room and the mood of the celebration. Share reference images and explain whether you prefer a compact home arrangement or a more defined venue backdrop. Discuss any name or age details with the team and confirm which personalized elements can be included.",
      },
      {
        title: "Make space for family photographs",
        copy: "Plan where the family will stand during cake cutting and leave clear space in front of the backdrop. A table that sits too close to the main arrangement can make the area feel cramped. Share the table dimensions and any seating that needs to stay nearby. Consider guest movement and keep decorative elements positioned away from busy walkways. Tell the team about any particular placement concerns so the layout can be discussed in advance.",
      },
      {
        title: "Coordinate the celebration with your venue",
        copy: "Whether the first birthday is at home, in an apartment clubhouse or at a party hall, confirm when the decoration area will be available. Check venue rules for attachments and freestanding structures, along with lift or loading access. Send the Bangalore address, event date and available dimensions with your enquiry. Ask for an itemized description of the agreed decoration so the colours, personalized details and setup arrangements are clear before you confirm.",
      },
    ],
    checklist: [
      "Preferred first birthday theme and colours",
      "Name and age details to discuss",
      "Family photo space and cake-table position",
      "Venue access and event schedule",
    ],
    faq: {
      question: "What should I include in a first birthday decoration enquiry?",
      answer:
        "Send your event date, Bangalore venue address, space photographs, preferred theme and any name or age details. The team can discuss a suitable layout, confirm available elements and provide a custom quote.",
    },
  },
];

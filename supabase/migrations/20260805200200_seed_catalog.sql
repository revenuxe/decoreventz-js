-- Seeds the initial catalog content (generated from the former src/data mock).
-- Regenerate via: npx tsx scripts/generate-seed.ts

INSERT INTO public.categories (slug, name, tagline, image_url, accent, sort_order, is_active) VALUES
  ('birthday', 'Birthday', 'Balloon arches, theme decor, cake tables', 'https://images.unsplash.com/photo-1756621716318-9eec89d42715?q=80&w=1200&auto=format&fit=crop', 'from-fuchsia-500/70 to-purple-700/70', 1, true),
  ('kids-theme', 'Kids Theme Party', 'Cartoon, superhero & princess themes', 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?q=80&w=1200&auto=format&fit=crop', 'from-amber-500/70 to-pink-600/70', 2, true),
  ('baby-shower', 'Baby Shower', 'Pastel balloon decor for mom-to-be', 'https://images.unsplash.com/photo-1587160728015-924483626a1a?q=80&w=1200&auto=format&fit=crop', 'from-sky-400/70 to-purple-500/70', 3, true),
  ('newborn-welcome', 'Newborn Welcome', 'Welcome home decor for your little one', 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?q=80&w=1200&auto=format&fit=crop', 'from-pink-400/70 to-rose-600/70', 4, true),
  ('naming-ceremony', 'Naming Ceremony', 'Traditional decor for the big day', 'https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop', 'from-amber-400/70 to-orange-600/70', 5, true),
  ('annaprashan', 'Annaprashan', 'First-rice-ceremony decor, done right', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop', 'from-yellow-500/70 to-amber-700/70', 6, true),
  ('wedding', 'Wedding', 'From Haldi to Honeymoon', 'https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop', 'from-rose-500/70 to-purple-700/70', 7, true),
  ('anniversary', 'Anniversary', 'Romantic setups to relive the day', 'https://images.unsplash.com/photo-1550951956-017f785756a9?q=80&w=1200&auto=format&fit=crop', 'from-red-500/70 to-pink-700/70', 8, true),
  ('corporate-events', 'Corporate Events', 'Product launches, office parties & more', 'https://images.unsplash.com/photo-1599739291127-15c456e459ee?q=80&w=1200&auto=format&fit=crop', 'from-slate-800/70 to-indigo-700/70', 9, true),
  ('car-boot-decoration', 'Car Boot Decoration', 'Surprise reveals & car boot proposals', 'https://images.unsplash.com/photo-1691343327025-4b0cc1dc053f?q=80&w=1200&auto=format&fit=crop', 'from-purple-600/70 to-fuchsia-700/70', 10, true),
  ('canopy-decoration', 'Canopy Decoration', 'Outdoor tent & canopy styling', 'https://images.unsplash.com/photo-1618106494700-4b0049e83ed8?q=80&w=1200&auto=format&fit=crop', 'from-emerald-600/70 to-teal-800/70', 11, true),
  ('proposal-decoration', 'Proposal Decoration', 'Say yes, in style', 'https://images.unsplash.com/photo-1769230359465-815291dc92f4?q=80&w=1200&auto=format&fit=crop', 'from-red-500/70 to-rose-700/70', 12, true),
  ('bachelorette', 'Bachelorette', 'Last night of freedom, decked out', 'https://images.unsplash.com/photo-1587160728015-924483626a1a?q=80&w=1200&auto=format&fit=crop', 'from-purple-500/70 to-pink-700/70', 13, true),
  ('first-night', 'First Night', 'Romantic room decor for the first night', 'https://images.unsplash.com/photo-1769230359465-815291dc92f4?q=80&w=1200&auto=format&fit=crop', 'from-rose-600/70 to-red-800/70', 14, true),
  ('aqiqah', 'Aqiqah Decoration', 'Elegant decor for the Aqiqah ceremony', 'https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop', 'from-emerald-500/70 to-green-700/70', 15, true);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'birthday'), 'balloon-arch-decoration', 'Balloon Arch Decoration', 'A grand entrance for the birthday star', 'A floor-to-ceiling balloon arch in colors of your choice, built with premium double-stuffed balloons for a fuller, longer-lasting look. Includes a matching name banner and a styled photo corner so every guest gets the perfect shot.', ARRAY['https://images.unsplash.com/photo-1756621716318-9eec89d42715?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?q=80&w=1200&auto=format&fit=crop']::text[], 4999, 3499, ARRAY['12ft balloon arch, custom colors', 'Happy Birthday name banner', 'Styled photo corner', 'Setup & teardown by our team']::text[], '{}', false, true, true, 4.8, 612, 1);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'balloon-arch-decoration'), 'Themed cake (1kg)', 899, 0),
  ((SELECT id FROM public.products WHERE slug = 'balloon-arch-decoration'), '1-hour photography', 1499, 1),
  ((SELECT id FROM public.products WHERE slug = 'balloon-arch-decoration'), 'LED fairy lights upgrade', 499, 2);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'birthday'), 'theme-birthday-decor', 'Theme Birthday Decor', 'Pick a theme, we bring it to life', 'Full-room theme decoration — from jungle safari to unicorn dreams — with matching balloon clusters, cutout standees, table runners and backdrop. Tell us the theme and age, and we handle the rest.', ARRAY['https://images.unsplash.com/photo-1587160728015-924483626a1a?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1756621716318-9eec89d42715?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop']::text[], 8999, 6499, ARRAY['Theme backdrop with cutout standees', 'Matching balloon clusters', 'Table & chair styling', 'Entry gate decoration']::text[], '{}', false, false, true, 4.7, 348, 2);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'theme-birthday-decor'), 'Themed cake (1kg)', 899, 0),
  ((SELECT id FROM public.products WHERE slug = 'theme-birthday-decor'), '1-hour photography', 1499, 1),
  ((SELECT id FROM public.products WHERE slug = 'theme-birthday-decor'), 'Bluetooth speaker & mic', 799, 2);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'birthday'), 'simple-balloon-decor', 'Simple Balloon Decor', 'Budget-friendly, still beautiful', 'A compact balloon bunch setup for smaller spaces or last-minute celebrations — two balloon clusters, a name banner, and basic streamer styling, ready in under 90 minutes.', ARRAY['https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1756621716318-9eec89d42715?q=80&w=1200&auto=format&fit=crop']::text[], 1999, 1499, ARRAY['2 balloon clusters', 'Name banner', 'Streamer styling']::text[], '{}', false, false, true, 4.6, 501, 3);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'simple-balloon-decor'), 'Themed cake (1kg)', 899, 0);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'kids-theme'), 'cartoon-theme-decor', 'Cartoon Theme Decor', 'Their favourite characters, everywhere', 'A full cartoon-themed setup with licensed-style character cutouts, matching balloon colors and a dessert table backdrop — built around whichever show your child loves most.', ARRAY['https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1756621716318-9eec89d42715?q=80&w=1200&auto=format&fit=crop']::text[], 7499, 5499, ARRAY['Character cutout standees', 'Themed balloon arch', 'Dessert table backdrop', 'Party hats for up to 10 kids']::text[], '{}', false, false, true, 4.7, 289, 4);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'cartoon-theme-decor'), 'Themed cake (1kg)', 899, 0),
  ((SELECT id FROM public.products WHERE slug = 'cartoon-theme-decor'), 'Bluetooth speaker & mic', 799, 1),
  ((SELECT id FROM public.products WHERE slug = 'cartoon-theme-decor'), '1-hour photography', 1499, 2);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'kids-theme'), 'superhero-theme-decor', 'Superhero Theme Decor', 'Save the day in style', 'City-skyline backdrop, superhero-color balloon towers and a comic-style name banner — everything your little hero needs for an epic celebration.', ARRAY['https://images.unsplash.com/photo-1756621716318-9eec89d42715?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1587160728015-924483626a1a?q=80&w=1200&auto=format&fit=crop']::text[], 7999, 5999, ARRAY['City-skyline backdrop', 'Superhero balloon towers', 'Comic-style name banner', 'Photo booth props']::text[], '{}', false, false, true, 4.8, 214, 5);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'superhero-theme-decor'), 'Themed cake (1kg)', 899, 0),
  ((SELECT id FROM public.products WHERE slug = 'superhero-theme-decor'), '1-hour photography', 1499, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'baby-shower'), 'pastel-baby-shower-decor', 'Pastel Baby Shower Decor', 'Soft colors for a special glow', 'A dreamy pastel balloon backdrop with a mom-to-be sash, matching centerpiece styling and a welcome sign — designed for beautiful photos all afternoon.', ARRAY['https://images.unsplash.com/photo-1587160728015-924483626a1a?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?q=80&w=1200&auto=format&fit=crop']::text[], 6499, 4999, ARRAY['Pastel balloon backdrop', 'Mom-to-be sash & tiara', 'Centerpiece styling', 'Welcome signage']::text[], '{}', false, true, true, 4.9, 176, 6);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'pastel-baby-shower-decor'), '1-hour photography', 1499, 0),
  ((SELECT id FROM public.products WHERE slug = 'pastel-baby-shower-decor'), 'Themed cake (1kg)', 899, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'baby-shower'), 'gender-reveal-decor', 'Gender Reveal Decor', 'Pink or blue — build the moment', 'A dramatic reveal setup with a confetti-pop balloon and a black-and-gold backdrop, so the big surprise gets the stage it deserves.', ARRAY['https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop']::text[], 5999, 4499, ARRAY['Confetti reveal balloon', 'Black & gold backdrop', 'Guess-the-gender signage']::text[], '{}', false, false, true, 4.8, 132, 7);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'gender-reveal-decor'), '1-hour photography', 1499, 0),
  ((SELECT id FROM public.products WHERE slug = 'gender-reveal-decor'), 'Bluetooth speaker & mic', 799, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'newborn-welcome'), 'welcome-home-baby-decor', 'Welcome Home Baby Decor', 'A warm balloon welcome at your doorstep', 'Door and living-room balloon styling to welcome your newborn home, with a personalized name banner and soft pastel tones that suit newborn photos.', ARRAY['https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop']::text[], 3999, 2999, ARRAY['Doorway balloon styling', 'Personalized name banner', 'Living room accents']::text[], '{}', false, false, true, 4.9, 241, 8);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'welcome-home-baby-decor'), '1-hour photography', 1499, 0);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'newborn-welcome'), 'cradle-ceremony-decor', 'Cradle Ceremony Decor', 'Traditional decor for the cradle ceremony', 'Marigold and balloon styling around the cradle, with a decorated swing frame and rangoli-style floor art for a traditional, festive welcome.', ARRAY['https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?q=80&w=1200&auto=format&fit=crop']::text[], 5499, 3999, ARRAY['Cradle & swing styling', 'Marigold garlands', 'Floor rangoli art']::text[], '{}', false, false, true, 4.7, 98, 9);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'cradle-ceremony-decor'), '1-hour photography', 1499, 0),
  ((SELECT id FROM public.products WHERE slug = 'cradle-ceremony-decor'), 'Bluetooth speaker & mic', 799, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'naming-ceremony'), 'traditional-naming-ceremony-decor', 'Traditional Naming Ceremony Decor', 'A festive stage for the big day', 'A traditional stage setup with marigold garlands, a decorated name-announcement board and floor seating arrangements for the full ceremony.', ARRAY['https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop']::text[], 8999, 6999, ARRAY['Stage backdrop with marigold garlands', 'Name announcement board', 'Guest seating styling']::text[], '{}', false, false, true, 4.8, 156, 10);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'traditional-naming-ceremony-decor'), '1-hour photography', 1499, 0),
  ((SELECT id FROM public.products WHERE slug = 'traditional-naming-ceremony-decor'), 'Bluetooth speaker & mic', 799, 1),
  ((SELECT id FROM public.products WHERE slug = 'traditional-naming-ceremony-decor'), 'Entry gate decoration', 999, 2);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'annaprashan'), 'annaprashan-stage-decor', 'Annaprashan Stage Decor', 'Celebrate the first rice ceremony', 'A festive stage with marigold-and-gold balloon styling and a themed backdrop for the Annaprashan rituals, along with a decorated plate-of-choices setup.', ARRAY['https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop']::text[], 7999, 5999, ARRAY['Stage backdrop', 'Marigold & balloon styling', 'Decorated ritual-plate setup']::text[], '{}', false, false, true, 4.7, 87, 11);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'annaprashan-stage-decor'), '1-hour photography', 1499, 0),
  ((SELECT id FROM public.products WHERE slug = 'annaprashan-stage-decor'), 'Themed cake (1kg)', 899, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'wedding'), 'haldi-decor', 'Haldi Decor', 'Marigold, mustard, sunshine', 'A vibrant marigold-and-mustard themed Haldi setup with a floral swing, umbrella backdrop and floor seating — designed for the perfect turmeric-ceremony photos.', ARRAY['https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop']::text[], 12999, 9999, ARRAY['Marigold backdrop & swing', 'Umbrella decor', 'Floor seating styling']::text[], '{}', false, true, true, 4.9, 421, 12);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'haldi-decor'), '1-hour photography', 1499, 0),
  ((SELECT id FROM public.products WHERE slug = 'haldi-decor'), 'Bluetooth speaker & mic', 799, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'wedding'), 'mehndi-decor', 'Mehndi Decor', 'Colorful, joyful, unforgettable', 'A riot of color for the Mehndi function — fabric drapes, floral chandeliers and a dedicated mehndi-artist corner styled to match your palette.', ARRAY['https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1587160728015-924483626a1a?q=80&w=1200&auto=format&fit=crop']::text[], 13999, 10999, ARRAY['Fabric drape backdrop', 'Floral chandeliers', 'Mehndi artist corner styling']::text[], '{}', false, false, true, 4.8, 356, 13);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'mehndi-decor'), '1-hour photography', 1499, 0),
  ((SELECT id FROM public.products WHERE slug = 'mehndi-decor'), 'Bluetooth speaker & mic', 799, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'wedding'), 'bridal-shower-decor', 'Bridal Shower', 'A celebration for the bride-to-be', 'An elegant balloon-and-floral backdrop with a bride sash, personalized seating and a dessert table — built for a picture-perfect bridal shower.', ARRAY['https://images.unsplash.com/photo-1587160728015-924483626a1a?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop']::text[], 8999, 6999, ARRAY['Balloon & floral backdrop', 'Bride sash & tiara', 'Dessert table styling']::text[], '{}', false, false, true, 4.8, 203, 14);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'bridal-shower-decor'), '1-hour photography', 1499, 0),
  ((SELECT id FROM public.products WHERE slug = 'bridal-shower-decor'), 'Themed cake (1kg)', 899, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'wedding'), 'wedding-car-decoration', 'Wedding Car Decoration', 'Arrive in style', 'Fresh flower styling for the wedding car — garlands, hood arrangement and ribbon detailing in colors that match your wedding theme.', ARRAY['https://images.unsplash.com/photo-1691343327025-4b0cc1dc053f?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop']::text[], 4999, 3499, ARRAY['Fresh flower garlands', 'Hood & bonnet arrangement', 'Ribbon detailing']::text[], '{}', false, false, true, 4.7, 268, 15);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'wedding-car-decoration'), '1-hour photography', 1499, 0);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'wedding'), 'bride-welcome-decor', 'Bride Welcome Decor', 'A grand welcome to her new home', 'A flower-petal pathway and decorated entrance to welcome the bride home, with a rangoli floor design and a photo-ready welcome arch.', ARRAY['https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop']::text[], 6999, 5499, ARRAY['Flower-petal pathway', 'Welcome arch', 'Rangoli floor design']::text[], '{}', false, false, true, 4.8, 189, 16);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'bride-welcome-decor'), '1-hour photography', 1499, 0),
  ((SELECT id FROM public.products WHERE slug = 'bride-welcome-decor'), 'Candle path setup', 699, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'wedding'), 'first-night-room-decor', 'First Night Room Decor', 'Set the mood, we''ll set the room', 'A romantic room styled with a rose-petal heart on the bed, candle pathway and fairy-light canopy — the classic first-night setup, done tastefully.', ARRAY['https://images.unsplash.com/photo-1769230359465-815291dc92f4?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1550951956-017f785756a9?q=80&w=1200&auto=format&fit=crop']::text[], 5999, 4499, ARRAY['Rose-petal bed decor', 'Candle pathway', 'Fairy-light canopy']::text[], '{}', false, false, true, 4.9, 312, 17);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'first-night-room-decor'), 'Candle path setup', 699, 0),
  ((SELECT id FROM public.products WHERE slug = 'first-night-room-decor'), 'LED fairy lights upgrade', 499, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'anniversary'), 'romantic-anniversary-decor', 'Romantic Anniversary Decor', 'Relive the day you said yes', 'A candlelit setup with rose petals, a personalized number balloon backdrop and fairy lights — perfect for a private at-home anniversary celebration.', ARRAY['https://images.unsplash.com/photo-1550951956-017f785756a9?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop']::text[], 5499, 3999, ARRAY['Candle & rose petal styling', 'Number balloon backdrop', 'Fairy light accents']::text[], '{}', false, true, true, 4.9, 274, 18);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'romantic-anniversary-decor'), 'Candle path setup', 699, 0),
  ((SELECT id FROM public.products WHERE slug = 'romantic-anniversary-decor'), '1-hour photography', 1499, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'anniversary'), 'anniversary-party-decor', 'Anniversary Party Decor', 'Celebrate big with family & friends', 'A full party setup with a gold balloon backdrop, personalized banner and table styling — built for a larger anniversary celebration with guests.', ARRAY['https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1550951956-017f785756a9?q=80&w=1200&auto=format&fit=crop']::text[], 8999, 6999, ARRAY['Gold balloon backdrop', 'Personalized banner', 'Table & seating styling']::text[], '{}', false, false, true, 4.7, 143, 19);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'anniversary-party-decor'), 'Bluetooth speaker & mic', 799, 0),
  ((SELECT id FROM public.products WHERE slug = 'anniversary-party-decor'), 'Themed cake (1kg)', 899, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'corporate-events'), 'office-party-decor', 'Office Party Decor', 'Festive touches for the workplace', 'Balloon and banner styling for office celebrations — birthdays, festivals or team milestones — installed quickly with minimal disruption.', ARRAY['https://images.unsplash.com/photo-1599739291127-15c456e459ee?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop']::text[], 6999, 4999, ARRAY['Balloon backdrop', 'Branded banner (your logo)', 'Table styling']::text[], '{}', false, false, true, 4.6, 118, 20);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'office-party-decor'), 'Bluetooth speaker & mic', 799, 0),
  ((SELECT id FROM public.products WHERE slug = 'office-party-decor'), 'LED fairy lights upgrade', 499, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'corporate-events'), 'product-launch-backdrop', 'Product Launch Backdrop', 'A stage worthy of the big reveal', 'A branded stage backdrop with LED accent lighting and a reveal-ready product pedestal, built to your brand colors and logo.', ARRAY['https://images.unsplash.com/photo-1599739291127-15c456e459ee?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop']::text[], 24999, 18999, ARRAY['Branded stage backdrop', 'LED accent lighting', 'Product reveal pedestal']::text[], '{}', false, false, true, 4.8, 64, 21);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'product-launch-backdrop'), 'LED fairy lights upgrade', 499, 0),
  ((SELECT id FROM public.products WHERE slug = 'product-launch-backdrop'), '1-hour photography', 1499, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'corporate-events'), 'customer-service-week-setup', 'Customer Service Week Setup', 'Celebrate the team that shows up daily', 'A themed balloon arch and podium backdrop for Customer Service Week celebrations, styled in your brand''s colors.', ARRAY['https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1599739291127-15c456e459ee?q=80&w=1200&auto=format&fit=crop']::text[], 5999, 4499, ARRAY['Themed balloon arch', 'Podium backdrop', 'Table styling']::text[], '{}', false, false, true, 4.7, 52, 22);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'customer-service-week-setup'), 'Bluetooth speaker & mic', 799, 0);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'car-boot-decoration'), 'car-boot-surprise-decor', 'Car Boot Surprise Decor', 'The reveal starts before they even get out', 'A balloon-and-flower styled car boot setup — perfect for birthday surprises, proposals or anniversary reveals on the go.', ARRAY['https://images.unsplash.com/photo-1691343327025-4b0cc1dc053f?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1756621716318-9eec89d42715?q=80&w=1200&auto=format&fit=crop']::text[], 3999, 2999, ARRAY['Balloon boot styling', 'Fresh flower accents', 'LED fairy lights']::text[], '{}', false, false, true, 4.7, 96, 23);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'car-boot-surprise-decor'), '1-hour photography', 1499, 0),
  ((SELECT id FROM public.products WHERE slug = 'car-boot-surprise-decor'), 'Candle path setup', 699, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'canopy-decoration'), 'outdoor-canopy-decor', 'Outdoor Canopy Decor', 'Garden and terrace events, styled', 'A full canopy tent setup with drape styling, fairy lights and floor seating — ideal for garden parties, outdoor birthdays and small gatherings.', ARRAY['https://images.unsplash.com/photo-1618106494700-4b0049e83ed8?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop']::text[], 14999, 11999, ARRAY['Canopy tent setup', 'Drape & fairy light styling', 'Floor seating']::text[], '{}', false, false, true, 4.7, 78, 24);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'outdoor-canopy-decor'), 'LED fairy lights upgrade', 499, 0),
  ((SELECT id FROM public.products WHERE slug = 'outdoor-canopy-decor'), 'Bluetooth speaker & mic', 799, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'proposal-decoration'), 'rooftop-proposal-decor', 'Rooftop Proposal Decor', 'Say yes under the stars', 'A heart-shaped rose petal layout with a fairy-light canopy and a ''Marry Me'' balloon backdrop — set up at your chosen rooftop or terrace.', ARRAY['https://images.unsplash.com/photo-1769230359465-815291dc92f4?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1550951956-017f785756a9?q=80&w=1200&auto=format&fit=crop']::text[], 7999, 5999, ARRAY['Heart-shaped petal layout', 'Fairy-light canopy', '''Marry Me'' balloon backdrop']::text[], '{}', false, true, true, 4.9, 187, 25);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'rooftop-proposal-decor'), 'Candle path setup', 699, 0),
  ((SELECT id FROM public.products WHERE slug = 'rooftop-proposal-decor'), '1-hour photography', 1499, 1),
  ((SELECT id FROM public.products WHERE slug = 'rooftop-proposal-decor'), 'Bluetooth speaker & mic', 799, 2);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'proposal-decoration'), 'home-proposal-decor', 'Home Proposal Decor', 'The most personal place to ask', 'A living-room proposal setup with candle pathways, a rose petal heart and personalized signage — private, intimate, unforgettable.', ARRAY['https://images.unsplash.com/photo-1550951956-017f785756a9?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1769230359465-815291dc92f4?q=80&w=1200&auto=format&fit=crop']::text[], 5499, 3999, ARRAY['Candle pathway', 'Rose petal heart', 'Personalized signage']::text[], '{}', false, false, true, 4.8, 121, 26);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'home-proposal-decor'), 'Candle path setup', 699, 0),
  ((SELECT id FROM public.products WHERE slug = 'home-proposal-decor'), '1-hour photography', 1499, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'bachelorette'), 'bachelorette-suite-decor', 'Bachelorette Suite Decor', 'Last hurrah before the big day', 'A fun, glam bachelorette setup with a rose-gold balloon backdrop, ''Bride Tribe'' sashes and a photo-booth prop table.', ARRAY['https://images.unsplash.com/photo-1587160728015-924483626a1a?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512412646187-ea209a3cd3a6?q=80&w=1200&auto=format&fit=crop']::text[], 6999, 5499, ARRAY['Rose-gold balloon backdrop', 'Bride Tribe sashes', 'Photo-booth props']::text[], '{}', false, false, true, 4.8, 165, 27);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'bachelorette-suite-decor'), 'Bluetooth speaker & mic', 799, 0),
  ((SELECT id FROM public.products WHERE slug = 'bachelorette-suite-decor'), '1-hour photography', 1499, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'first-night'), 'romantic-first-night-suite', 'Romantic First Night Suite', 'Every detail, just right', 'A premium first-night setup — rose petal bed art, a candlelit path, drape ceiling canopy and personalized name balloons.', ARRAY['https://images.unsplash.com/photo-1769230359465-815291dc92f4?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1550951956-017f785756a9?q=80&w=1200&auto=format&fit=crop']::text[], 7999, 5999, ARRAY['Rose petal bed art', 'Candlelit pathway', 'Drape ceiling canopy']::text[], '{}', false, false, true, 4.9, 298, 28);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'romantic-first-night-suite'), 'Candle path setup', 699, 0),
  ((SELECT id FROM public.products WHERE slug = 'romantic-first-night-suite'), 'LED fairy lights upgrade', 499, 1);

INSERT INTO public.products (category_id, slug, name, tagline, description, images, price, sale_price, included, tags, is_trending, is_featured, is_active, rating, review_count, sort_order) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'aqiqah'), 'aqiqah-ceremony-decor', 'Aqiqah Ceremony Decor', 'Elegant, traditional, welcoming', 'A tasteful green-and-gold themed setup for the Aqiqah ceremony, with a name announcement backdrop and floor seating for guests.', ARRAY['https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?q=80&w=1200&auto=format&fit=crop']::text[], 7999, 5999, ARRAY['Green & gold backdrop', 'Name announcement signage', 'Guest seating styling']::text[], '{}', false, false, true, 4.8, 74, 29);
INSERT INTO public.product_addons (product_id, name, price, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'aqiqah-ceremony-decor'), '1-hour photography', 1499, 0),
  ((SELECT id FROM public.products WHERE slug = 'aqiqah-ceremony-decor'), 'Bluetooth speaker & mic', 799, 1);


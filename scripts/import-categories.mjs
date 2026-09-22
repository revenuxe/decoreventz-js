import { createClient } from '@supabase/supabase-js';

const taxonomy = `Birthday|Birthday Decoration|Kids Birthday|Adult Birthday|First Birthday|Milestone Birthday|Birthday Room Decoration|Birthday Balloon Decoration|Birthday Backdrop Decoration|Birthday Party Decoration|Birthday Outdoor Decoration|Birthday Terrace Decoration|Birthday Hall Decoration|Birthday Car Decoration|Birthday Surprise Decoration
Anniversary|Anniversary Decoration|Anniversary Room Decoration|Anniversary Balloon Decoration|Anniversary Backdrop Decoration|Romantic Anniversary|Anniversary Surprise|First Anniversary|Milestone Anniversary|Silver Jubilee|Golden Jubilee|Anniversary Car Decoration
Baby Shower|Baby Shower Decoration|Baby Shower Balloon Decoration|Baby Shower Backdrop|Baby Shower Room Decoration|Baby Shower Stage Decoration|Baby Shower Floral Decoration|Boy Baby Shower|Girl Baby Shower|Couple Baby Shower|Gender Reveal Decoration
Newborn Welcome|Welcome Baby Boy|Welcome Baby Girl|Baby Homecoming|Hospital Welcome|Home Welcome|Newborn Room Decoration|Newborn Balloon Decoration
Kids Special|Kids Birthday|Kids Theme Decoration|Kids Party Decoration|Kids Room Decoration|Kids Ceremony Decoration|Kids Entertainment
Baby Ceremonies|Naming Ceremony|Annaprashan|Aqiqah|Mundan Ceremony|Chhathi Ceremony|Cradle Ceremony|Seemantham
Wedding & Pre-Wedding|Engagement|Roka|Haldi|Mehndi|Sangeet|Bridal Shower|Bride-to-Be|Groom-to-Be|Bachelorette|Bachelor Party|Proposal|Wedding|Reception|Bride Welcome|Wedding Car|First Night
Romantic|Proposal|Romantic Room|Candlelight|Couple Decoration|First Night|Honeymoon|Romantic Surprise
Balloon Decoration|Balloon Wall|Balloon Arch|Balloon Ring|Balloon Backdrop|Balloon Ceiling|Balloon Room|Balloon Table|Balloon Canopy|Balloon Column|Balloon Gate|Balloon Bouquet
Room Decoration|Bedroom|Living Room|Kids Room|Hotel Room|Couple Room|Birthday Room|Anniversary Room|Romantic Room|First Night Room|Surprise Room
Backdrop Decoration|Balloon Backdrop|Floral Backdrop|Sequin Backdrop|Fabric Backdrop|Ring Backdrop|LED Backdrop|Neon Backdrop|Photo Backdrop
Canopy Decoration|Balloon Canopy|Bed Canopy|Romantic Canopy|Birthday Canopy|Anniversary Canopy|Wedding Canopy|Baby Shower Canopy
Car Decoration|Birthday Car|Anniversary Car|Wedding Car|Proposal Car|Surprise Car|Car Boot|New Car|Bride Car|Groom Car
Corporate|Corporate Decoration|Office Birthday|Employee Celebration|Work Anniversary|Farewell|Retirement|Office Party|Corporate Event|Product Launch|Office Welcome
Festivals & Special Occasions|Valentine's Day|Mother's Day|Father's Day|Raksha Bandhan|Diwali|Ganesh Chaturthi|Christmas|New Year|Holi|Friendship Day|Women's Day|Children's Day|Teacher's Day`.split('\n').map(line => line.split('|'));

const slugify = name => name.toLowerCase().replace(/'/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
async function result(query) {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}
const existingCategories = await result(client.from('categories').select('*'));
const existingSubs = await result(client.from('subcategories').select('*'));
const categories = taxonomy.map(([name], index) => {
  const existing = existingCategories.find(row => row.name.toLowerCase() === name.toLowerCase() || row.slug === slugify(name));
  return { ...(existing ? { id: existing.id } : {}), name, slug: existing?.slug ?? slugify(name), sort_order: index + 1, is_active: true };
});
const apply = process.argv.includes('--apply');
if (!apply) {
  console.log(JSON.stringify({ categories: categories.length, subcategories: taxonomy.reduce((sum, row) => sum + row.length - 1, 0), mode: 'preview' }));
  process.exit(0);
}
const saved = await result(client.from('categories').upsert(categories, { onConflict: 'slug', defaultToNull: false }).select());
const subcategories = taxonomy.flatMap(([name, ...children]) => {
  const parent = saved.find(row => row.name === name);
  const rows = children.map((child, index) => {
    const existing = existingSubs.find(row => row.category_id === parent.id && (row.name.toLowerCase() === child.toLowerCase() || row.slug === slugify(child)));
    return { ...(existing ? { id: existing.id } : {}), category_id: parent.id, name: child, slug: existing?.slug ?? slugify(child), sort_order: index + 1, is_active: true };
  });
  const extras = existingSubs.filter(row => row.category_id === parent.id && !rows.some(item => item.slug === row.slug)).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  return [...rows, ...extras.map((row, index) => ({ id: row.id, category_id: row.category_id, name: row.name, slug: row.slug, is_active: row.is_active, sort_order: children.length + index + 1 }))];
});
await result(client.from('subcategories').upsert(subcategories, { onConflict: 'category_id,slug', defaultToNull: false }));
const verifiedCategories = await result(client.from('categories').select('*'));
const verifiedSubs = await result(client.from('subcategories').select('*'));
for (const [table, expected, actual] of [['categories', categories, verifiedCategories], ['subcategories', subcategories, verifiedSubs]]) {
  for (const row of expected) {
    const found = actual.find(item => item.slug === row.slug && (!row.category_id || item.category_id === row.category_id));
    if (!found || found.name !== row.name || found.sort_order !== row.sort_order || found.is_active !== row.is_active) throw new Error(`Verification failed: ${table} ${row.name}`);
  }
}
console.log(JSON.stringify({ verified: true, categories: categories.length, requestedSubcategories: taxonomy.reduce((sum, row) => sum + row.length - 1, 0), preservedExtraSubcategories: subcategories.length - taxonomy.reduce((sum, row) => sum + row.length - 1, 0) }));


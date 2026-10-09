// Fetches deck entries from Archidekt / ManaBox / Moxfield links. Returns [{ name, qty, categories }].
// Requests go through the dev proxy in vite.config.js because these sites block browser (CORS) requests.
import { parseManaboxHtml } from './manaboxParser';

const SKIP_CATEGORIES = ['Sideboard', 'Maybeboard', 'Commander'];

async function get(url, site) {
  const res = await fetch(url);
  if (res.status === 403) {
    throw new Error(`${site} blocks automated requests. Export the deck there and use "Paste list" instead.`);
  }
  if (!res.ok) throw new Error(`Could not load the ${site} deck (${res.status}). Check the link is public.`);
  return res;
}

export async function importArchidekt(url) {
  const id = url.match(/decks\/(\d+)/)?.[1];
  if (!id) throw new Error('Not a valid Archidekt deck link.');
  const data = await (await get(`/proxy/archidekt/api/decks/${id}/`, 'Archidekt')).json();
  return data.cards
    .filter((c) => !c.categories?.some((cat) => SKIP_CATEGORIES.includes(cat)))
    .map((c) => ({ name: c.card.oracleCard.name, qty: c.quantity, categories: c.categories ?? [] }));
}

export async function importManabox(url) {
  const id = url.match(/decks\/([\w-]+)/)?.[1];
  if (!id) throw new Error('Not a valid ManaBox deck link.');
  const html = await (await get(`/proxy/manabox/decks/${id}`, 'ManaBox')).text();
  const entries = parseManaboxHtml(html);
  if (!entries.length) {
    throw new Error('Could not read this ManaBox page. Export the deck as text in ManaBox and use "Paste list".');
  }
  return entries; // ManaBox pages only group by card type, so there are no custom categories
}

export async function importMoxfield(url) {
  const id = url.match(/decks\/([\w-]+)/)?.[1];
  if (!id) throw new Error('Not a valid Moxfield deck link.');
  const data = await (await get(`/proxy/moxfield/v2/decks/all/${id}`, 'Moxfield')).json();
  const boards = { ...data.commanders, ...data.mainboard };
  return Object.values(boards).map((c) => ({ name: c.card.name, qty: c.quantity, categories: [] }));
}

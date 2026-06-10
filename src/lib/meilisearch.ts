/**
 * Meilisearch client singleton — server-side only.
 *
 * Environment variables:
 *   MEILISEARCH_HOST   — e.g. http://localhost:7700 or https://ms.yourdomain.com
 *   MEILISEARCH_KEY    — Master or search API key
 *
 * Returns null when env vars are absent so all callers can fall back
 * to mock/Supabase search gracefully.
 */
import { MeiliSearch } from 'meilisearch';

let _client: MeiliSearch | null = null;

export function getMeilisearchClient(): MeiliSearch | null {
  const host = process.env.MEILISEARCH_HOST;
  const key  = process.env.MEILISEARCH_KEY;

  if (!host || !key) return null;

  if (!_client) {
    _client = new MeiliSearch({ host, apiKey: key });
  }

  return _client;
}

/** Index name used for the members collection. */
export const MEMBERS_INDEX = 'members';

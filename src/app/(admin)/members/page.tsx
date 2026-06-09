/**
 * /members — Member Directory page (Day 12).
 *
 * MemberDirectory handles its own data fetching via GET /api/members.
 * Skeleton loading state shows during the initial request.
 * Pagination is built in.
 *
 * When Supabase is not configured, the API falls back to mock data
 * from src/lib/site.ts so the page works in dev without credentials.
 */
import { MemberDirectory } from '@/components/members/MemberDirectory';

export default function MembersPage() {
  return <MemberDirectory />;
}

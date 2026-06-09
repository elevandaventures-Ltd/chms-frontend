/**
 * /members — Member Directory page (Day 11).
 *
 * Uses mock data for now. When Supabase is configured and the members
 * table migration has been applied, replace mockMembers with a real
 * data fetch from the `members` table.
 *
 * SQL migration in: supabase/migrations/20260606_members.sql
 */
import { MemberDirectory } from '@/components/members/MemberDirectory';
import { mockMembers } from '@/lib/site';

export default function MembersPage() {
  return <MemberDirectory members={mockMembers} />;
}

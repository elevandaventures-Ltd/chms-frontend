/**
 * Household types + a deterministic synthesiser used by GET /api/households.
 *
 * Real household data lives in the `households` table (Day 14 migration) with
 * members linked via `household_id`. Until that table is populated, the API
 * synthesises plausible family households from the member list so the standalone
 * household view has something meaningful to render.
 */
import type { Member, MemberStatus, AgeGroup, UserRole } from '@/lib/site';

export type HouseholdRelation = 'head' | 'spouse' | 'child' | 'other';

export const RELATION_LABELS: Record<HouseholdRelation, string> = {
  head:   'Head',
  spouse: 'Spouse',
  child:  'Child',
  other:  'Relative',
};

export type HouseholdMember = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  status: MemberStatus;
  role: UserRole;
  ageGroup?: AgeGroup;
  relation: HouseholdRelation;
};

export type Household = {
  id: string;
  name: string;
  zone?: string;
  memberCount: number;
  members: HouseholdMember[];
};

function surname(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : parts[0] ?? 'Household';
}

const YOUNG: AgeGroup[] = ['child', 'youth'];

// Assign a relation within a household chunk: index 0 is the head; the first
// non-young adult becomes the spouse; young members are children; rest relatives.
function assignRelations(members: Member[]): HouseholdMember[] {
  let spouseTaken = false;
  return members.map((m, i): HouseholdMember => {
    let relation: HouseholdRelation;
    if (i === 0) {
      relation = 'head';
    } else if (m.ageGroup && YOUNG.includes(m.ageGroup)) {
      relation = 'child';
    } else if (!spouseTaken) {
      relation = 'spouse';
      spouseTaken = true;
    } else {
      relation = 'other';
    }
    return {
      id: m.id,
      fullName: m.fullName,
      email: m.email,
      phone: m.phone,
      photoUrl: m.photoUrl,
      status: m.status,
      role: m.role,
      ageGroup: m.ageGroup,
      relation,
    };
  });
}

/**
 * Group members into households. Members are bucketed by zone, then chunked into
 * small family-sized groups. Deterministic for a given member ordering.
 */
export function synthesizeHouseholds(members: Member[], chunkSize = 3): Household[] {
  const byZone = new Map<string, Member[]>();
  for (const m of members) {
    const zone = m.zone ?? 'Unzoned';
    if (!byZone.has(zone)) byZone.set(zone, []);
    byZone.get(zone)!.push(m);
  }

  const households: Household[] = [];
  for (const [zone, zoneMembers] of byZone) {
    for (let i = 0; i < zoneMembers.length; i += chunkSize) {
      const chunk = zoneMembers.slice(i, i + chunkSize);
      const withRelations = assignRelations(chunk);
      households.push({
        id: `hh-${zone}-${i / chunkSize}`.toLowerCase().replace(/\s+/g, '-'),
        name: `The ${surname(chunk[0].fullName)} Household`,
        zone: zone === 'Unzoned' ? undefined : zone,
        memberCount: chunk.length,
        members: withRelations,
      });
    }
  }

  return households;
}

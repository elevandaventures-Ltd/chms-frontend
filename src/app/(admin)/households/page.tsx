/**
 * /households — standalone family household view (Day 20).
 *
 * Shows household cards listing every member with their relationship. Data comes
 * from GET /api/households (real households table when populated, otherwise
 * synthesised from the member list / mock data).
 */
import { HouseholdsView } from '@/components/households/HouseholdsView';

export default function HouseholdsPage() {
  return <HouseholdsView />;
}

/**
 * POST   /api/members/groups  — assign a member to a group
 * DELETE /api/members/groups  — remove a member from a group
 *
 * Body: { memberId: string; groupId: string; role?: 'leader'|'co_leader'|'member' }
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type Body = { memberId: string; groupId: string; role?: 'leader' | 'co_leader' | 'member' };

function makeSupabase(request: NextRequest, response: NextResponse) {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookies: { name: string; value: string; options?: CookieOptions }[]) {
        cookies.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options ?? {}),
        );
      },
    },
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<Body>;
  const { memberId, groupId, role = 'member' } = body;

  if (!memberId || !groupId) {
    return NextResponse.json({ error: 'memberId and groupId are required' }, { status: 400 });
  }

  const response = NextResponse.next();
  const supabase = makeSupabase(request, response);

  if (!supabase) {
    // Dev mock — no Supabase configured
    return NextResponse.json({ memberId, groupId, role }, { status: 201 });
  }

  const { error } = await supabase
    .from('member_groups')
    .upsert({ member_id: memberId, group_id: groupId, role }, { onConflict: 'member_id,group_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ memberId, groupId, role }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json()) as Partial<Body>;
  const { memberId, groupId } = body;

  if (!memberId || !groupId) {
    return NextResponse.json({ error: 'memberId and groupId are required' }, { status: 400 });
  }

  const response = NextResponse.next();
  const supabase = makeSupabase(request, response);

  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase
    .from('member_groups')
    .delete()
    .eq('member_id', memberId)
    .eq('group_id', groupId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

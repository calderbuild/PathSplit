import { storeProfile, findCounterfactualMatch, searchZhihu, seedDemoProfiles } from '@/lib/crossroad-store';
import type { CrossroadProfile } from '@/lib/types';

export const runtime = 'nodejs';

let seeded = false;

export async function POST(request: Request) {
  if (!seeded) {
    seedDemoProfiles();
    seeded = true;
  }

  const profile = (await request.json()) as CrossroadProfile;

  storeProfile(profile);

  const match = findCounterfactualMatch(profile);

  if (match) {
    return Response.json({
      matched: true,
      match,
    });
  }

  const zhihuResults = searchZhihu(profile.topic);

  return Response.json({
    matched: false,
    zhihuFallback: zhihuResults,
  });
}

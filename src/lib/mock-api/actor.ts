import { currentProfile } from "@/components/profile/profile-data";

import type { MockApiActor } from "./types";

export function getMockApiActor(): MockApiActor {
  return {
    id: currentProfile.id,
    name: currentProfile.name,
  };
}

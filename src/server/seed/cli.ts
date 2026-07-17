import { eq } from 'drizzle-orm'

import { db } from '../db/client'
import { organizations } from '../db/schema'
import { seedMeridian } from './meridian'

/** CLI: pnpm db:seed <org-slug> — seeds the Meridian dataset into an existing org. */
async function main() {
  const slug = process.argv[2]
  if (!slug) {
    console.error('Usage: pnpm db:seed <org-slug>')
    process.exit(1)
  }

  const [org] = await db
    .select({ id: organizations.id, name: organizations.name })
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1)

  if (!org) {
    console.error(`Organization with slug "${slug}" not found.`)
    process.exit(1)
  }

  console.log(`Seeding Meridian dataset into "${org.name}"…`)
  const started = Date.now()
  const summary = await seedMeridian(db, org.id)
  console.log(`Done in ${Date.now() - started}ms:`, summary)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

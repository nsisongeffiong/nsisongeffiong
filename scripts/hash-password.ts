/**
 * Print a bcrypt hash for a password, for use as ADMIN_PASSWORD_HASH.
 *
 * Usage: npx tsx scripts/hash-password.ts <password>
 */

import bcrypt from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.error('Usage: npx tsx scripts/hash-password.ts <password>')
  process.exit(1)
}

bcrypt.hash(password, 10).then((hash) => {
  console.log(hash)
  console.log('\nNext.js expands $-prefixed tokens in .env values — escape every')
  console.log('literal $ as \\$ when pasting this into ADMIN_PASSWORD_HASH:')
  console.log(hash.replace(/\$/g, '\\$'))
})

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupRevokedTokens() {
  const result = await prisma.revoked_tokens.deleteMany({
    where: { expires_at: { lt: new Date() } }
  });
  console.log(`[Cleanup] Deleted ${result.count} expired revoked tokens at ${new Date().toISOString()}`);
}

module.exports = cleanupRevokedTokens; 
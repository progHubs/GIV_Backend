const { PrismaClient } = require('../generated/prisma');
const emailService = require('../services/email.service.js');
const prisma = new PrismaClient();

async function sendEventReminders() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  // Find events starting in the next 24 hours (but not already started)
  const events = await prisma.events.findMany({
    where: {
      event_date: {
        gte: now,
        lte: in24h
      },
      deleted_at: null
    }
  });
  for (const event of events) {
    // Find all registered participants for this event
    const participants = await prisma.event_participants.findMany({
      where: {
        event_id: event.id,
        status: 'registered'
      },
      include: {
        users: true
      }
    });
    for (const participant of participants) {
      const user = participant.users;
      if (!user || !user.email) continue;
      if (participant.status !== 'confirmed') continue;
      try {
        await emailService.sendEventReminder(user.email, user.full_name, event);
        await prisma.event_participants.update({
          where: {
            id: participant.id
          },
          data: {
            status: 'confirmed'
          }
        });
        console.log(`[Event Reminder] Sent to ${user.email} for event ${event.title}`);
      } catch (e) {
        console.error(`[Event Reminder] Failed for ${user.email} - ${event.title}:`, e);
      }
    }
  }
}

module.exports = sendEventReminders; 
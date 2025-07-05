const { PrismaClient } = require('../generated/prisma');
const emailService = require('../services/email.service.js');
const prisma = new PrismaClient();

async function sendEventFeedbackRequests() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  // Find events that ended in the last 24 hours
  const events = await prisma.events.findMany({
    where: {
      event_date: {
        gte: yesterday,
        lte: now
      },
      deleted_at: null
    }
  });
  for (const event of events) {
    // Find all attended participants for this event
    const participants = await prisma.event_participants.findMany({
      where: {
        event_id: event.id,
        status: 'attended'
      },
      include: {
        users: true
      }
    });
    for (const participant of participants) {
      const user = participant.users;
      if (!user || !user.email) continue;
      // Placeholder feedback URL (should be replaced with real link)
      const feedbackUrl = `https://givsociety.org/feedback?event=${event.id}&user=${user.id}`;
      try {
        await emailService.sendEventFeedbackRequest(user.email, user.full_name, event, feedbackUrl);
        console.log(`[Event Feedback] Sent to ${user.email} for event ${event.title}`);
      } catch (e) {
        console.error(`[Event Feedback] Failed for ${user.email} - ${event.title}:`, e);
      }
    }
  }
}

module.exports = sendEventFeedbackRequests; 
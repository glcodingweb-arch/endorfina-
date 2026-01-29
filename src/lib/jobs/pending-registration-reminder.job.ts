import { findEligiblePendingRegistrations, hasBeenSentRecently, countEmailsToday, getAutomationSettings } from '@/lib/services/db.service';
import { sendEmail, logEmail } from '@/lib/services/email.service';


export async function runPendingRegistrationReminderJob() {
  const settings = await getAutomationSettings();
  const { minHoursSinceCreation, minHoursBetweenEmails } = settings.pendingRegistration;
  const maxEmailsPerDay = settings.abandonedCart.maxEmailsPerDay; // Assuming same limit for all emails to a user

  const { participants, orders, races } = await findEligiblePendingRegistrations(minHoursSinceCreation);

  if (participants.length === 0) {
    return { success: true, message: 'No eligible pending registrations to process.' };
  }

  const participantsByOrder = participants.reduce((acc, p) => {
    if (!acc[p.orderId]) {
      acc[p.orderId] = [];
    }
    acc[p.orderId].push(p);
    return acc;
  }, {} as Record<string, typeof participants>);

  let sentCount = 0;
  let skippedCount = 0;

  for (const orderId in participantsByOrder) {
    const order = orders[orderId];
    if (!order) continue;

    const userEmail = order.responsibleEmail;
    const participantsInOrder = participantsByOrder[orderId];
    const firstParticipant = participantsInOrder[0];
    const race = races[firstParticipant.raceId];

    // Check if any reminder was sent recently for this order's participants
    const alreadySent = participantsInOrder.some(p => 
      hasBeenSentRecently(p.emailHistory || [], 'pendingRegistration', minHoursBetweenEmails)
    );

    if (alreadySent) {
      skippedCount++;
      continue;
    }

    const dailyCount = await countEmailsToday(userEmail);
    if (dailyCount >= maxEmailsPerDay) {
      skippedCount++;
      continue;
    }
    
    try {
      await sendEmail({
        to: userEmail,
        type: 'identificationPending',
        data: {
          customerName: order.responsibleName,
          raceName: race?.name || 'seu evento',
          pendingCount: participantsInOrder.length,
          dashboardUrl: `https://www.endorfinaesportes.com/dashboard/subscriptions`
        }
      });
      
      // Log for all participants in this reminder
      for (const participant of participantsInOrder) {
        await logEmail(participant.id, 'participants', userEmail, 'pendingRegistration');
      }
      sentCount++;
    } catch (error: any) {
        console.error(`Failed to process order ${orderId}:`, error);
        for (const participant of participantsInOrder) {
            await logEmail(participant.id, 'participants', userEmail, 'pendingRegistration', 'failed', error.message);
        }
    }
  }

  return { 
    success: true, 
    message: `Job finished. Reminder emails sent for ${sentCount} orders. Orders skipped: ${skippedCount}.`
  };
}

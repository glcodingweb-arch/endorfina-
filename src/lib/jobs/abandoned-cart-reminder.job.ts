import { findEligibleAbandonedCarts, hasBeenSentRecently, countEmailsToday, getAutomationSettings } from '@/lib/services/db.service';
import { sendEmail, logEmail } from '@/lib/services/email.service';

export async function runAbandonedCartReminderJob() {
  const settings = await getAutomationSettings();
  const { minHoursSinceUpdate, minHoursBetweenEmails, maxEmailsPerDay } = settings.abandonedCart;

  const eligibleCarts = await findEligibleAbandonedCarts(minHoursSinceUpdate);
  
  if (eligibleCarts.length === 0) {
    return { success: true, message: 'No eligible abandoned carts to process.' };
  }

  let sentCount = 0;
  let skippedCount = 0;

  for (const cart of eligibleCarts) {
    const userEmail = cart.customerEmail;
    
    // 1. Check if a reminder was sent recently for THIS SPECIFIC cart
    if (hasBeenSentRecently(cart.emailHistory || [], 'abandonedCart', minHoursBetweenEmails)) {
      skippedCount++;
      continue;
    }

    // 2. Check the daily sending limit for THIS USER
    const dailyCount = await countEmailsToday(userEmail);
    if (dailyCount >= maxEmailsPerDay) {
      skippedCount++;
      continue;
    }

    // 3. Send the email
    try {
      const raceName = cart.items.length > 0 ? cart.items[0].raceName : 'seu evento';
      await sendEmail({
        to: userEmail,
        type: 'abandonedCart',
        data: {
          customerName: cart.customerName || 'Atleta',
          raceName,
          checkoutUrl: `https://www.endorfinaesportes.com/cart` // Use o link real do seu site
        }
      });

      // 4. Log the successful sending
      await logEmail(cart.id, 'abandonedCarts', userEmail, 'abandonedCart');
      sentCount++;
    } catch (error: any) {
      console.error(`Failed to process cart ${cart.id}:`, error);
      await logEmail(cart.id, 'abandonedCarts', userEmail, 'abandonedCart', 'failed', error.message);
    }
  }

  return { 
    success: true, 
    message: `Job finished. Emails sent: ${sentCount}. Carts skipped: ${skippedCount}.`
  };
}

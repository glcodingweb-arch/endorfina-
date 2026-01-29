import { collection, getDocs, query, where, Timestamp, getDoc, doc } from 'firebase/firestore';
import { initializeFirebaseApp } from '@/firebase/server-init';
import { getFirestore } from 'firebase/firestore';
import type { AbandonedCart, Participant, EmailLog, Order, Race, AutomationSettings } from '@/lib/types';

// Helper to get Firestore instance
function getDb() {
    const app = initializeFirebaseApp();
    return getFirestore(app);
}

const defaultAutomationSettings: AutomationSettings = {
  abandonedCart: {
    minHoursSinceUpdate: 2,
    minHoursBetweenEmails: 24,
    maxEmailsPerDay: 2,
  },
  pendingRegistration: {
    minHoursSinceCreation: 48,
    minHoursBetweenEmails: 48,
  },
};

/**
 * Fetches the automation settings from Firestore.
 * @returns The automation settings, or default values if not found.
 */
export async function getAutomationSettings(): Promise<AutomationSettings> {
  const db = getDb();
  const settingsRef = doc(db, 'automationSettings', 'emailConfig');
  try {
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
      // Merge with defaults to ensure all properties are present
      const data = docSnap.data() as Partial<AutomationSettings>;
      return {
        abandonedCart: { ...defaultAutomationSettings.abandonedCart, ...data.abandonedCart },
        pendingRegistration: { ...defaultAutomationSettings.pendingRegistration, ...data.pendingRegistration },
      };
    }
    return defaultAutomationSettings;
  } catch (error) {
    console.error("Error fetching automation settings, using defaults:", error);
    return defaultAutomationSettings;
  }
}


/**
 * Finds abandoned carts that are eligible for a reminder email.
 * @param minHours - The minimum number of hours since the cart's last activity.
 * @returns An array of eligible AbandonedCart objects.
 */
export async function findEligibleAbandonedCarts(minHours: number): Promise<AbandonedCart[]> {
  const db = getDb();
  const cartsRef = collection(db, 'abandonedCarts');

  const threshold = new Date();
  threshold.setHours(threshold.getHours() - minHours);
  
  const q = query(
    cartsRef,
    where('status', '==', 'ACTIVE'),
    where('lastActivityAt', '<=', Timestamp.fromDate(threshold))
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AbandonedCart));
}

/**
 * Finds participants with pending identification status who are eligible for a reminder.
 * @param minHours - Minimum hours since the registration was created.
 * @returns An object containing lists of participants, their orders, and races.
 */
export async function findEligiblePendingRegistrations(minHours: number) {
  const db = getDb();
  const participantsRef = collection(db, 'participants');
  
  const threshold = new Date();
  threshold.setHours(threshold.getHours() - minHours);
  
  const q = query(
    participantsRef,
    where('status', '==', 'PENDENTE_IDENTIFICACAO'),
    where('createdAt', '<=', Timestamp.fromDate(threshold))
  );

  const snapshot = await getDocs(q);
  const participants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));

  if (participants.length === 0) {
    return { participants: [], orders: {}, races: {} };
  }

  // Fetch related orders and races efficiently
  const orderIds = [...new Set(participants.map(p => p.orderId))];
  const raceIds = [...new Set(participants.map(p => p.raceId))];

  const orders: Record<string, Order> = {};
  const races: Record<string, Race> = {};
  
  // Batch fetch orders
  if (orderIds.length > 0) {
      const orderDocs = await Promise.all(orderIds.map(id => getDoc(doc(db, 'orders', id))));
      orderDocs.forEach(doc => {
          if (doc.exists()) orders[doc.id] = { id: doc.id, ...doc.data() } as Order;
      });
  }

  // Batch fetch races
  if (raceIds.length > 0) {
      const raceDocs = await Promise.all(raceIds.map(id => getDoc(doc(db, 'races', id))));
      raceDocs.forEach(doc => {
          if (doc.exists()) races[doc.id] = { id: doc.id, ...doc.data() } as Race;
      });
  }

  return { participants, orders, races };
}


/**
 * Checks if a specific type of email has been sent recently.
 * @param history - The email history array from a document.
 * @param type - The type of email to check for.
 * @param hours - The time window in hours to check against.
 * @returns True if a recent email of the specified type was found, false otherwise.
 */
export function hasBeenSentRecently(history: EmailLog[], type: EmailLog['type'], hours: number): boolean {
  if (!history || history.length === 0) return false;

  const threshold = new Date();
  threshold.setHours(threshold.getHours() - hours);

  return history.some(log => 
    log.type === type &&
    log.status === 'sent' &&
    (log.timestamp as any).toDate() > threshold
  );
}

/**
 * Counts how many emails have been sent to a specific recipient today.
 * @param recipientEmail - The email address of the recipient.
 * @returns The number of emails sent today.
 */
export async function countEmailsToday(recipientEmail: string): Promise<number> {
  const db = getDb();
  const logsRef = collection(db, 'emailLogs');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

  const q = query(
    logsRef,
    where('recipientEmail', '==', recipientEmail),
    where('status', '==', 'sent'),
    where('timestamp', '>=', Timestamp.fromDate(today)),
    where('timestamp', '<', Timestamp.fromDate(tomorrow))
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

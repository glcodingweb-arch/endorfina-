import { initializeFirebaseApp } from '@/firebase/server-init';
import { getFirestore, collection, addDoc, serverTimestamp, updateDoc, arrayUnion, doc } from 'firebase/firestore';

interface EmailParams {
  to: string;
  type: string;
  data: any;
}

/**
 * Sends an email by calling the send-email API route.
 * @param params - The email parameters.
 */
export async function sendEmail(params: EmailParams) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.details || errorData.error || 'Failed to send email');
  }

  return response.json();
}

/**
 * Logs an email sending attempt in the central emailLogs collection
 * and updates the history on the source document (e.g., cart or participant).
 * @param sourceDocId - The ID of the document that triggered the email (e.g., cartId).
 * @param sourceCollection - The name of the source collection (e.g., 'abandonedCarts').
 * @param recipientEmail - The email address of the recipient.
 * @param type - The type of email sent.
 * @param status - The status of the sending attempt.
 * @param error - Any error message if the sending failed.
 */
export async function logEmail(
  sourceDocId: string,
  sourceCollection: 'abandonedCarts' | 'participants',
  recipientEmail: string,
  type: 'abandonedCart' | 'pendingRegistration',
  status: 'sent' | 'failed' = 'sent',
  error?: string
) {
  const db = getFirestore(initializeFirebaseApp());
  
  const logData = {
    recipientEmail,
    type,
    status,
    timestamp: serverTimestamp(),
    ...(error && { error }),
  };

  // 1. Add to central log
  const logRef = await addDoc(collection(db, 'emailLogs'), logData);

  // 2. Add reference to the source document's history
  const sourceDocRef = doc(db, sourceCollection, sourceDocId);
  await updateDoc(sourceDocRef, {
    emailHistory: arrayUnion({
        logId: logRef.id,
        ...logData
    })
  });
}

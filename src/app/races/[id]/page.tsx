
import { getFirebaseConfig } from '@/firebase/config';
import { Race, Combo } from '@/lib/types';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, Timestamp, query, where } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { RaceDetailsClient } from '@/components/race-details-client';

// Helper function to initialize Firebase Admin on the server-side for data fetching.
// This is separate from the client-side Firebase initialization.
const initializeServerSideFirebase = () => {
    if (getApps().length) {
        return getApps()[0];
    }
    const firebaseConfig = getFirebaseConfig();
    return initializeApp(firebaseConfig, 'server-side');
};

function sanitizeData(data: any) {
    if (data === null || typeof data !== 'object') {
        return data;
    }

    if (data instanceof Timestamp) {
        return data.toDate().toISOString();
    }
    
    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }

    const sanitizedData: { [key: string]: any } = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            sanitizedData[key] = sanitizeData(data[key]);
        }
    }
    return sanitizedData;
}


// Function to fetch a single race
async function getRace(id: string): Promise<Race | null> {
    const firebaseApp = initializeServerSideFirebase();
    const db = getFirestore(firebaseApp);
    const raceDoc = await getDoc(doc(db, 'races', id));
    if (!raceDoc.exists()) {
        return null;
    }
    const data = raceDoc.data();
    const sanitizedData = sanitizeData(data);
    return { id: raceDoc.id, ...sanitizedData } as Race;
}

// Function to fetch related combos
async function getRelatedCombos(raceId: string): Promise<Combo[]> {
    const firebaseApp = initializeServerSideFirebase();
    const db = getFirestore(firebaseApp);
    const combosRef = collection(db, 'combos');
    const q = query(combosRef, where('eventId', '==', raceId), where('active', '==', true));
    const comboSnapshot = await getDocs(q);

    return comboSnapshot.docs.map(doc => {
        const data = doc.data();
        const sanitizedData = sanitizeData(data);
        return { id: doc.id, ...sanitizedData } as Combo;
    });
}

// Function to fetch all race IDs for generateStaticParams
async function getAllRaceIds() {
    const firebaseApp = initializeServerSideFirebase();
    const db = getFirestore(firebaseApp);
    const racesCollection = collection(db, 'races');
    const raceSnapshot = await getDocs(racesCollection);
    return raceSnapshot.docs.map(doc => ({ id: doc.id }));
}

export async function generateStaticParams() {
    const raceIds = await getAllRaceIds();
    return raceIds;
}

export default async function RacePage({ params }: { params: { id: string } }) {
    const race = await getRace(params.id);
    if (!race) {
        notFound();
    }
    
    const combos = await getRelatedCombos(params.id);

    return <RaceDetailsClient race={race} combos={combos} />;
}

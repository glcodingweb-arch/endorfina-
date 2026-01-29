// This is a script to seed your Firestore database with initial data.
// It's not meant to be run in the browser, but from a Node.js environment
// or a custom admin script.

// To use this script, you would typically do the following:
// 1. Set up Firebase Admin SDK in a Node.js project.
// 2. Initialize the Firebase app with your service account credentials.
// 3. Import RACES_DATA and this function.
// 4. Call seedDatabase().

import { collection, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { RACES_DATA } from './races';

export async function seedDatabase(db: Firestore) {
    const racesCollection = collection(db, 'races');

    // Optional: Clear existing data
    console.log('Clearing existing race data...');
    const existingDocs = await getDocs(racesCollection);
    const deleteBatch = writeBatch(db);
    existingDocs.forEach(doc => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log('Existing data cleared.');

    // Create a new batch
    const batch = writeBatch(db);

    RACES_DATA.forEach(race => {
        // In a real app, you might want to create a document without a specific ID
        // and let Firestore generate one, but for seeding, using the existing ID is fine.
        const docRef = collection(db, 'races').doc(race.id);
        batch.set(docRef, race);
    });

    try {
        console.log('Seeding database...');
        await batch.commit();
        console.log(`${RACES_DATA.length} races successfully seeded!`);
    } catch (error) {
        console.error('Error seeding database: ', error);
    }
}

// Example of how you might run this (do not uncomment in the app)
/*
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseConfig } from '../firebase/config';
import { seedDatabase } from './seed';

async function main() {
    const firebaseConfig = getFirebaseConfig();
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    await seedDatabase(db);
}

main().catch(console.error);
*/

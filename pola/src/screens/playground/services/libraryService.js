// libraryService.js
import { addDoc, collection } from 'firebase/firestore';
import db, { auth } from '../../firebase/config';

export async function createUserLibrary(libraryName, uploadedDocuments) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');
    
    const userId = user.uid;
    
    // Map both document IDs and paths
    const documents = uploadedDocuments.map(doc => ({
      id: doc.document_id,
      path: doc.file_path,
      name: doc.file_name
    }));
    
    const libraryData = {
      userId,
      libraryName,
      documents,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'libraries'), libraryData);
    console.log('Library created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating library:', error);
    throw error;
  }
}
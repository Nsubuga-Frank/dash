// firebaseTokens.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import db from "../../firebase/config";

/**
 * Sanitizes an ID string to be safe for Firebase document IDs
 * @param {string} id - The ID to sanitize
 * @returns {string} - A safe document ID
 */
function sanitizeForFirebase(id) {
    // Replace invalid characters with underscores
    // This includes: /, ., [, ], #, $, and other special characters
    return id.replace(/[/.#$\[\]]/g, '_').replace(/-/g, '_');
}

/**
 * Creates a safe document ID from user and model IDs
 * @param {string} userId - The user ID
 * @param {string} modelId - The model ID
 * @returns {string} - A safe document ID
 */
function createSafeDocId(userId, modelId) {
    const safeUserId = sanitizeForFirebase(userId.toLowerCase());
    const safeModelId = sanitizeForFirebase(modelId.toLowerCase());
    return `${safeUserId}__${safeModelId}`;
}

export async function getSavedToken(userId, modelId) {
    if (!userId || !modelId) {
        console.warn('getSavedToken called without userId or modelId');
        return null;
    }

    try {
        const docId = createSafeDocId(userId, modelId);
        const tokenDocRef = doc(db, "tokens", docId);
        console.log('Fetching token for document:', docId);
        const docSnap = await getDoc(tokenDocRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Token found:', data);
            return data.token;
        } else {
            console.log('No token found for:', userId.toLowerCase(), modelId.toLowerCase());
            return null;
        }
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
}

export async function saveToken(userId, modelId, token) {
    if (!userId || !modelId || !token) {
        console.error('saveToken called with missing parameters');
        return;
    }

    try {
        const docId = createSafeDocId(userId, modelId);
        const tokenDocRef = doc(db, "tokens", docId);
        console.log('Saving token for:', docId);
        
        await setDoc(tokenDocRef, {
            user_id: userId.toLowerCase(),
            model_id: modelId.toLowerCase(),
            token: token,
            timestamp: new Date()
        });
        
        console.log('Token saved successfully');
    } catch (error) {
        console.error('Error saving token:', error);
        throw error;
    }
}
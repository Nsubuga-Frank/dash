// hooks/useUserLibraries.js
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import db, { auth } from '../../firebase/config';

export const useUserLibraries = () => {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    
    if (!user) {
      setError('No user logged in');
      setLoading(false);
      return;
    }

    try {
      const librariesRef = collection(db, 'libraries');
      const userLibrariesQuery = query(
        librariesRef,
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(userLibrariesQuery, (snapshot) => {
        const librariesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          documents: doc.data().documents || []
        }));
        
        setLibraries(librariesData);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching libraries:', err);
        setError(err.message);
        setLoading(false);
      });

      // Cleanup subscription
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up libraries listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  return { libraries, loading, error };
};
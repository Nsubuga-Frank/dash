// useChatApi.js

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import db from '../../firebase/config'; // Ensure this path is correct based on your project structure

const API_BASE_URL = 'https://polaris-ai-tool.onrender.com';

/**
 * Custom hook to manage chat-related API interactions.
 * @param {Object} selectedChatModel - The currently selected chat model.
 * @returns {Object} - Functions and states related to chat operations.
 */
const useChatApi = (selectedChatModel) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  /**
   * Listen for authentication state changes and update currentUser accordingly.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        console.warn('useChatApi: User is not authenticated.');
      }
    });
    return () => unsubscribe();
  }, [auth]);

  /**
   * Fetches the API key for a given model ID and user from Firestore.
   * @param {string} modelId - The ID of the model.
   * @returns {Promise<string>} - The API key associated with the model.
   */
  const getModelApiKey = useCallback(async (modelId) => {
    console.log(`getModelApiKey: Initiating API key fetch for modelId: ${modelId}`);
    try {
      if (!modelId) {
        console.error('getModelApiKey: Missing modelId parameter.');
        throw new Error('Model ID is required');
      }

      if (!currentUser) {
        console.error('getModelApiKey: User is not authenticated.');
        throw new Error('User authentication is required to fetch API key');
      }

      const apiKeysRef = collection(db, 'api_keys');

      // Query for the matching modelId and userId document
      const q = query(
        apiKeysRef,
        where('modelId', '==', modelId),
        where('userId', '==', currentUser.uid)
      );
      console.log(
        `getModelApiKey: Executing Firestore query for modelId: ${modelId} and userId: ${currentUser.uid}`
      );

      const querySnapshot = await getDocs(q);
      console.log(`getModelApiKey: QuerySnapshot size: ${querySnapshot.size}`);

      if (!querySnapshot.empty) {
        // Get the first matching document
        const docSnap = querySnapshot.docs[0];
        const { key } = docSnap.data();
        console.log(
          `getModelApiKey: Retrieved API key for modelId ${modelId}: ${
            key ? 'Available' : 'Missing'
          }`
        );
        if (key) {
          // For security, avoid logging the full key
          console.log(`getModelApiKey: API key is available.`);
          return key;
        } else {
          console.warn(`getModelApiKey: 'key' field is missing in document for modelId: ${modelId}`);
          throw new Error('API key is required');
        }
      }

      console.warn(`getModelApiKey: No API key found for modelId: ${modelId} and userId: ${currentUser.uid}`);
      throw new Error('API key is required');
    } catch (err) {
      console.error('getModelApiKey: Error fetching API key:', err);
      throw err;
    }
  }, [currentUser]);

  /**
   * Handles API errors by parsing the response and throwing appropriate errors.
   * @param {Response} response - The fetch response object.
   */
  const handleApiError = useCallback(async (response) => {
    console.error(`handleApiError: Received error response with status ${response.status}`);
    try {
      const errorData = await response.json().catch(() => null);
      if (errorData?.message) {
        console.error(`handleApiError: Server error message: ${errorData.message}`);
        throw new Error(errorData.message);
      }
      throw new Error(`Server error: ${response.status}`);
    } catch (err) {
      if (response.status === 500) {
        console.error('handleApiError: Server is temporarily unavailable.');
        throw new Error('Server is temporarily unavailable. Please try again later.');
      }
      throw err;
    }
  }, []);

  /**
   * Creates a new chat session.
   * @param {string} [name='New Chat'] - The name of the new chat.
   * @returns {Promise<Object>} - The newly created chat object.
   */
  const createNewChat = useCallback(async (name = 'New Chat') => {
    console.log(`createNewChat: Creating new chat with name: "${name}"`);
    try {
      if (!currentUser) {
        console.error('createNewChat: User is not authenticated.');
        throw new Error('Please sign in to create a new chat');
      }
  
      if (!selectedChatModel?.model_id) {
        console.error('createNewChat: No chat model selected.');
        throw new Error('No model selected');
      }
  
      setIsLoading(true);
      setError(null);
  
      // Get API key for the selected model
      const apiKey = await getModelApiKey(selectedChatModel.model_id);
  
      // Create chat through the API instead of direct Firestore access
      const response = await fetch(`${API_BASE_URL}/chat/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.uid,
          name: name,
          model_id: selectedChatModel.model_id?.toLowerCase(),
          api_key: apiKey
        })
      });
  
      if (!response.ok) {
        await handleApiError(response);
      }
  
      const chatData = await response.json();
      console.log(`createNewChat: New chat created with ID: ${chatData.chat_id}`);
  
      return {
        id: chatData.chat_id,
        name: name,
        model_id: selectedChatModel.model_id?.toLowerCase(),
        messages: []
      };
    } catch (err) {
      console.error('createNewChat: Error creating new chat:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
      console.log('createNewChat: isLoading set to false');
    }
  }, [currentUser, selectedChatModel, getModelApiKey, handleApiError]);

  /**
   * Loads the chat history for the current user.
   * @returns {Promise<Array>} - An array of grouped chat sessions.
   */
  const loadChatHistory = useCallback(async () => {
    console.log('loadChatHistory: Loading chat history');
    try {
      if (!currentUser) {
        console.warn('loadChatHistory: User is not authenticated.');
        return [];
      }

      setIsLoading(true);
      setError(null);

      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('userId', '==', currentUser.uid));
      console.log(`loadChatHistory: Executing Firestore query for userId: ${currentUser.uid}`);

      const querySnapshot = await getDocs(q);
      console.log(`loadChatHistory: Retrieved ${querySnapshot.size} chats`);

      if (querySnapshot.empty) {
        console.warn('loadChatHistory: No chats found.');
        return [];
      }

      const chats = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      console.log('loadChatHistory: Retrieved chats:', chats);

      // Group chats by date
      const groupedChats = chats.reduce((acc, chat) => {
        const date = new Date(chat.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            sessions: [],
          };
        }
        acc[date].sessions.push({
          id: chat.id,
          name: chat.name,
          messages: chat.messages || [],
          model: chat.model_id,
          created_at: chat.created_at,
        });
        return acc;
      }, {});

      // Sort groups and sessions
      const sortedGroupedChats = Object.values(groupedChats)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((group) => ({
          ...group,
          sessions: group.sessions.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          ),
        }));

      console.log('loadChatHistory: Grouped and sorted chats:', sortedGroupedChats);
      return sortedGroupedChats;
    } catch (err) {
      console.error('loadChatHistory: Error loading chat history:', err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
      console.log('loadChatHistory: isLoading set to false');
    }
  }, [currentUser]);

  /**
   * Loads the messages for a specific chat.
   * @param {string} chatId - The ID of the chat to load messages for.
   * @returns {Promise<Object>} - The chat object with loaded messages.
   */
  const loadChatMessages = useCallback(async (chatId) => {
    console.log(`loadChatMessages: Loading messages for chatId: ${chatId}`);
    try {
      if (!currentUser) {
        console.warn('loadChatMessages: User is not authenticated.');
        throw new Error('Please sign in to view messages');
      }
  
      if (!chatId) {
        console.error('loadChatMessages: Missing chatId parameter.');
        throw new Error('Chat ID is required');
      }
  
      setIsLoading(true);
      setError(null);
  
      // Use the API endpoint instead of direct Firestore access
      const response = await fetch(`${API_BASE_URL}/chat/history?chat_id=${chatId}&user_id=${currentUser.uid}`);
      
      if (!response.ok) {
        await handleApiError(response);
      }
  
      const chatData = await response.json();
      console.log(`loadChatMessages: Retrieved chat data:`, chatData);
  
      return {
        id: chatId,
        name: chatData.chat.name,
        model: chatData.chat.model_id,
        messages: chatData.messages.map(msg => ({
          id: msg.id,
          type: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }))
      };
  
    } catch (err) {
      console.error('loadChatMessages: Error loading messages:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
      console.log('loadChatMessages: isLoading set to false');
    }
  }, [currentUser, handleApiError]);

  /**
   * Sends a message within a chat.
   * @param {string} chatId - The ID of the chat.
   * @param {string} message - The message content to send.
   * @returns {Promise<Object>} - The assistant's response.
   */
  const sendMessage = useCallback(async (chatId, message) => {
    console.log(`sendMessage: Called with chatId: ${chatId}, message: "${message}"`);
    try {
      if (!currentUser) {
        console.error('sendMessage: User is not authenticated.');
        throw new Error('Please sign in to send messages');
      }
  
      if (!chatId || !message) {
        console.error('sendMessage: Missing chatId or message.');
        throw new Error('Chat ID and message are required');
      }
  
      setIsLoading(true);
      setError(null);
  
      // Get API key
      const apiKey = await getModelApiKey(selectedChatModel.model_id);
  
      const requestBody = {
        chat_id: chatId,
        user_id: currentUser.uid,
        message,
        api_key: apiKey,
        model_id: selectedChatModel.model_id?.toLowerCase()
      };
  
      console.log('sendMessage: Sending POST request with body:', {
        ...requestBody,
        api_key: 'REDACTED' // Don't log the API key
      });
  
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      console.log(`sendMessage: Received response with status ${response.status}`);
  
      if (!response.ok) {
        await handleApiError(response);
      }
  
      const data = await response.json();
      console.log('sendMessage: Response data:', data);
  
      return {
        type: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error('sendMessage: Error sending message:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
      console.log('sendMessage: isLoading set to false');
    }
  }, [currentUser, selectedChatModel, getModelApiKey, handleApiError]);

  /**
   * Renames an existing chat.
   * @param {string} chatId - The ID of the chat to rename.
   * @param {string} newName - The new name for the chat.
   * @returns {Promise<Object>} - The updated chat object.
   */
  const renameChat = useCallback(async (chatId, newName) => {
    console.log(`renameChat: Renaming chatId: ${chatId} to newName: "${newName}"`);
    try {
      if (!currentUser) {
        console.error('renameChat: User is not authenticated.');
        throw new Error('Please sign in to rename chats');
      }

      if (!chatId || !newName) {
        console.error('renameChat: Missing chatId or newName.');
        throw new Error('Chat ID and new name are required');
      }

      if (!selectedChatModel?.model_id) {
        console.error('renameChat: No chat model selected.');
        throw new Error('No model selected');
      }

      setIsLoading(true);
      setError(null);

      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, { name: newName });

      console.log(`renameChat: Successfully renamed chatId: ${chatId} to "${newName}"`);

      // Fetch the updated chat
      const updatedChat = await loadChatMessages(chatId);
      return updatedChat;
    } catch (err) {
      console.error('renameChat: Error renaming chat:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
      console.log('renameChat: isLoading set to false');
    }
  }, [currentUser, selectedChatModel, loadChatMessages]);

  /**
   * Deletes an existing chat.
   * @param {string} chatId - The ID of the chat to delete.
   * @returns {Promise<boolean>} - Returns true if deletion was successful.
   */
  const deleteChat = useCallback(async (chatId) => {
    console.log(`deleteChat: Attempting to delete chatId: ${chatId}`);
    try {
      if (!currentUser) {
        console.error('deleteChat: User is not authenticated.');
        throw new Error('Please sign in to delete chats');
      }

      if (!chatId) {
        console.error('deleteChat: Missing chatId parameter.');
        throw new Error('Chat ID is required');
      }

      setIsLoading(true);
      setError(null);

      const chatRef = doc(db, 'chats', chatId);
      await fetch(`${API_BASE_URL}/chat/delete?chat_id=${chatId}&user_id=${currentUser.uid}`, {
        method: 'DELETE',
      });

      console.log(`deleteChat: Successfully deleted chatId: ${chatId}`);
      return true;
    } catch (err) {
      console.error('deleteChat: Error deleting chat:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
      console.log('deleteChat: isLoading set to false');
    }
  }, [currentUser]);

  /**
   * Sends a custom query to the backend API.
   *
   * @param {Object} payload - The payload containing query details.
   * @param {string} payload.query - The user's query.
   * @param {Array<string>} payload.document_ids - Array of document IDs to reference.
   * @param {string} payload.model_id - The ID of the model to use.
   * @returns {Promise<Object>} - The response from the backend.
   */
  const sendQuery = useCallback(async (payload) => {
    console.log('sendQuery: Sending query with payload:', payload);
    try {
      if (!currentUser) {
        console.error('sendQuery: User is not authenticated.');
        throw new Error('Please sign in to send queries');
      }

      if (!payload?.model_id) {
        console.error('sendQuery: No model_id provided.');
        throw new Error('No model selected');
      }

      if (!payload.query) {
        console.error('sendQuery: Missing query field.');
        throw new Error('Query is required');
      }

      setIsLoading(true);
      setError(null);

      // Get API key
      const apiKey = await getModelApiKey(payload.model_id);

      // Include api_key in the payload
      const enrichedPayload = {
        ...payload,
        api_key: apiKey
      };

      console.log('sendQuery: Sending POST request with payload:', {
        ...enrichedPayload,
        api_key: apiKey // Avoid logging sensitive API keys
      });

      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Include Authorization header if required
          // 'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(enrichedPayload),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      console.log('sendQuery: Received response:', result);
      return result;
    } catch (err) {
      console.error('sendQuery: Error sending query:', err);
      setError(err.message);
      throw err; // Re-throw to allow further handling
    } finally {
      setIsLoading(false);
      console.log('sendQuery: isLoading set to false');
    }
  }, [currentUser, getModelApiKey, handleApiError]);

  /**
   * Clears any existing error messages.
   */
  const clearErrorFunc = useCallback(() => {
    console.log('clearError: Clearing error state.');
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    clearError: clearErrorFunc,
    createNewChat,
    loadChatHistory,
    loadChatMessages,
    sendMessage,
    renameChat,
    deleteChat,
    sendQuery, // Expose the new sendQuery method
  };
};

export default useChatApi;

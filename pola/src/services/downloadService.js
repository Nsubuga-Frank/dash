import { getDownloadURL, getMetadata, ref } from 'firebase/storage';
import { storage } from '../screens/firebase/config';

/**
 * Get download information for an app based on platform
 * @param {string} platform - 'Windows' or 'Linux'
 * @returns {Promise<{url: string, size: number, name: string}>} - Download info
 */
export const getAppDownloadInfo = async (platform) => {
  try {
    let filePath;
    let fileName;
    
    if (platform === 'Windows') {
      filePath = 'deskapps/windows/AI Studio_0.1.0_x64-setup.exe';
      fileName = 'AI Studio_0.1.0_x64-setup.exe';
    } else if (platform === 'Linux') {
      filePath = 'deskapps/linux/AI Studio_0.1.0_amd64.AppImage';
      fileName = 'AI Studio_0.1.0_amd64.AppImage';
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    
    // Get file reference
    const fileRef = ref(storage, filePath);
    
    // Get download URL
    const url = await getDownloadURL(fileRef);
    
    // Get file metadata (including size)
    const metadata = await getMetadata(fileRef);
    
    return {
      url,
      size: metadata.size, // File size in bytes
      name: fileName
    };
  } catch (error) {
    console.error(`Error getting download info for ${platform}:`, error);
    throw error;
  }
};

/**
 * Format bytes to a human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size (e.g. "4.2 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 
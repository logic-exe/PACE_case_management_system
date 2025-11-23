import { useState, useEffect } from 'react';
import { authAPI } from '../services/apiService';
import toast from 'react-hot-toast';

const DRIVE_TOKEN_KEY = 'pace_drive_access_token';
const DRIVE_TOKEN_EXPIRY_KEY = 'pace_drive_token_expiry';

export const useDriveAuth = () => {
  const [driveToken, setDriveToken] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Load token from localStorage
    const storedToken = localStorage.getItem(DRIVE_TOKEN_KEY);
    const expiry = localStorage.getItem(DRIVE_TOKEN_EXPIRY_KEY);
    
    if (storedToken && expiry && new Date(expiry) > new Date()) {
      setDriveToken(storedToken);
    } else {
      // Token expired or doesn't exist
      localStorage.removeItem(DRIVE_TOKEN_KEY);
      localStorage.removeItem(DRIVE_TOKEN_EXPIRY_KEY);
    }
  }, []);

  const connectGoogleDrive = async () => {
    setIsConnecting(true);
    try {
      const response = await authAPI.getGoogleAuthUrl();
      const authUrl = response.data.authUrl;
      
      // Redirect to OAuth URL (simpler approach)
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      toast.error('Failed to connect Google Drive');
      setIsConnecting(false);
    }
  };

  const handleCallback = async (code) => {
    try {
      const response = await authAPI.handleGoogleCallback(code);
      const { accessToken, expiresIn } = response.data;
      if (accessToken) {
        saveToken(accessToken, expiresIn);
        toast.success('Google Drive connected successfully!');
        return true;
      } else {
        toast.error('No access token received from Google');
        return false;
      }
    } catch (error) {
      console.error('Failed to exchange code:', error);
      toast.error(error.response?.data?.error || 'Failed to connect Google Drive');
      return false;
    }
  };

  const saveToken = (token, expiresIn) => {
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + (expiresIn || 3600));
    
    localStorage.setItem(DRIVE_TOKEN_KEY, token);
    localStorage.setItem(DRIVE_TOKEN_EXPIRY_KEY, expiryDate.toISOString());
    setDriveToken(token);
  };

  const disconnectGoogleDrive = () => {
    localStorage.removeItem(DRIVE_TOKEN_KEY);
    localStorage.removeItem(DRIVE_TOKEN_EXPIRY_KEY);
    setDriveToken(null);
    toast.success('Google Drive disconnected');
  };

  const isConnected = !!driveToken;

  return {
    driveToken,
    isConnected,
    isConnecting,
    connectGoogleDrive,
    disconnectGoogleDrive,
    handleCallback
  };
};


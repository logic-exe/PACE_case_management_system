import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDriveAuth } from '../hooks/useDriveAuth';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useDriveAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (processedRef.current) return;
    
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      processedRef.current = true;
      console.error('OAuth error:', error);
      if (error === 'access_denied') {
        alert('Access denied. Please add your email as a test user in Google Cloud Console.');
      }
      navigate('/dashboard', { replace: true });
      return;
    }

    if (code) {
      processedRef.current = true;
      handleCallback(code).then((success) => {
        navigate('/dashboard', { replace: true });
      }).catch((err) => {
        console.error('Callback error:', err);
        navigate('/dashboard', { replace: true });
      });
    } else {
      processedRef.current = true;
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate, handleCallback]);

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Connecting Google Drive...</p>
    </div>
  );
};

export default GoogleCallback;


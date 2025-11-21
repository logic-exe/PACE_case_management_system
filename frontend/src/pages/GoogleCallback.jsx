import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDriveAuth } from '../hooks/useDriveAuth';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useDriveAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      if (error === 'access_denied') {
        alert('Access denied. Please add your email as a test user in Google Cloud Console. See GOOGLE_OAUTH_FIX.md for instructions.');
      }
      navigate('/dashboard');
      return;
    }

    if (code) {
      handleCallback(code).then((success) => {
        if (success) {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      }).catch((err) => {
        console.error('Callback error:', err);
        navigate('/dashboard');
      });
    } else {
      navigate('/dashboard');
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


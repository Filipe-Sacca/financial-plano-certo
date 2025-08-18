// Componente para logs globais de navegação
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/App';

export const NavigationLogger = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  useEffect(() => {
    console.log('🧭 [NAVIGATION] Mudança de rota detectada');
    console.log('📍 [NAVIGATION] Pathname:', location.pathname);
    console.log('🔍 [NAVIGATION] Search:', location.search);
    console.log('🏷️ [NAVIGATION] Hash:', location.hash);
    console.log('👤 [NAVIGATION] User autenticado:', !!user);
    console.log('🆔 [NAVIGATION] User ID:', user?.id || 'N/A');
    console.log('📧 [NAVIGATION] User email:', user?.email || 'N/A');
    console.log('⏰ [NAVIGATION] Timestamp:', new Date().toISOString());
    console.log('═'.repeat(50));
  }, [location, user]);
  
  // Log quando o componente é montado
  useEffect(() => {
    console.log('🚀 [APP START] NavigationLogger montado');
    console.log('📱 [APP START] User Agent:', navigator.userAgent);
    console.log('🌐 [APP START] URL atual:', window.location.href);
    console.log('📦 [APP START] Local Storage items:', Object.keys(localStorage));
    console.log('🍪 [APP START] Session Storage items:', Object.keys(sessionStorage));
  }, []);

  return null; // Componente invisível, apenas para logs
};

export default NavigationLogger;
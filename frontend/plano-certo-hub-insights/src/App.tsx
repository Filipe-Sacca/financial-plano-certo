import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Recuperar from "./pages/auth/Recuperar";
import { DeliveryTracking } from "./pages/DeliveryTracking";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import NavigationLogger from "@/components/NavigationLogger";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

// Contexto de autenticação
const AuthContext = createContext({ user: null });

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 [AUTH INIT] Inicializando autenticação...');
    
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      
      console.log('📋 [SESSION] Sessão obtida:', data.session ? 'Ativa' : 'Nenhuma');
      console.log('👤 [SESSION] Usuário:', sessionUser ? sessionUser.id : 'Nenhum');
      console.log('📧 [SESSION] Email:', sessionUser?.email || 'N/A');
      
      setUser(sessionUser);
      setLoading(false);
    });
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      
      console.log('🔄 [AUTH CHANGE] Evento de mudança de auth:', _event);
      console.log('👤 [AUTH CHANGE] Novo usuário:', sessionUser ? sessionUser.id : 'Nenhum');
      console.log('📧 [AUTH CHANGE] Email:', sessionUser?.email || 'N/A');
      
      setUser(sessionUser);
      setLoading(false);
    });
    
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg text-gray-600">Carregando...</div>;
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

export { useAuth };

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();
  if (user === null) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="plano-certo-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
        <BrowserRouter>
          <NavigationLogger />
          <Routes>
            <Route path="/auth" element={<Login />} />
            <Route path="/auth/cadastro" element={<Register />} />
            <Route path="/auth/recuperar" element={<Recuperar />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            {/* Rota pública para entregadores */}
            <Route path="/delivery/:orderId" element={<DeliveryTracking />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

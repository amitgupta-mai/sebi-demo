import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './pages/dashboard';
import Market from './pages/market';
import Wallet from './pages/wallet';
import Settings from './pages/settings';
import Tokenize from './pages/tokenize';
import Trading from './pages/trading';
import Convert from './pages/convert';
import Portfolio from './pages/portfolio';
import Transactions from './pages/transactions';
import Login from './pages/login';
import Signup from './pages/signup';
import NotFound from './pages/not-found';
import RootRedirect from './components/RootRedirect';

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path='/' component={RootRedirect} />
      <Route path='/login' component={Login} />
      <Route path='/signup' component={Signup} />

      {/* Protected routes */}
      <ProtectedRoute path='/dashboard' component={Dashboard} />
      <ProtectedRoute path='/market' component={Market} />
      <ProtectedRoute path='/wallet' component={Wallet} />
      <ProtectedRoute path='/tokenize' component={Tokenize} />
      <ProtectedRoute path='/trading' component={Trading} />
      <ProtectedRoute path='/convert' component={Convert} />
      <ProtectedRoute path='/portfolio' component={Portfolio} />
      <ProtectedRoute path='/transactions' component={Transactions} />
      <ProtectedRoute path='/settings' component={Settings} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Router />
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

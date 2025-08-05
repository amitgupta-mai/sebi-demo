import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp, Coins, ArrowRightLeft } from 'lucide-react';

export default function Landing() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      setLocation('/dashboard');
    }
  }, [user, isLoading, setLocation]);

  // Show loading or redirect if user is authenticated
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render landing page if user is authenticated
  if (user) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center'>
                <Coins className='text-white text-lg' />
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-900'>
                  NSE Tokenization Platform
                </h1>
                <p className='text-sm text-gray-500'>
                  Professional Share Trading & Tokenization
                </p>
              </div>
            </div>

            <Button
              onClick={() => (window.location.href = '/login')}
              className='bg-primary hover:bg-blue-700'
            >
              Login to Continue
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className='max-w-7xl mx-auto px-6 py-16'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-gray-900 mb-6'>
            Transform Your Share Trading Experience
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto mb-8'>
            Tokenize your NSE-listed shares for enhanced liquidity and seamless
            trading. Convert between shares and tokens with complete security
            and transparency.
          </p>
          <Button
            size='lg'
            onClick={() => (window.location.href = '/login')}
            className='bg-primary hover:bg-blue-700 px-8 py-3 text-lg'
          >
            Get Started Today
          </Button>
        </div>

        {/* Features */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
          <Card className='text-center'>
            <CardHeader>
              <div className='w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <Coins className='text-primary text-xl' />
              </div>
              <CardTitle className='text-lg'>Share Tokenization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-600'>
                Convert your physical shares into digital tokens for enhanced
                liquidity and fractional trading.
              </p>
            </CardContent>
          </Card>

          <Card className='text-center'>
            <CardHeader>
              <div className='w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <TrendingUp className='text-secondary text-xl' />
              </div>
              <CardTitle className='text-lg'>Advanced Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-600'>
                Trade tokenized shares with real-time pricing and advanced order
                management features.
              </p>
            </CardContent>
          </Card>

          <Card className='text-center'>
            <CardHeader>
              <div className='w-12 h-12 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <ArrowRightLeft className='text-warning text-xl' />
              </div>
              <CardTitle className='text-lg'>Seamless Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-600'>
                Convert tokens back to physical shares anytime with instant
                processing.
              </p>
            </CardContent>
          </Card>

          <Card className='text-center'>
            <CardHeader>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <Shield className='text-green-600 text-xl' />
              </div>
              <CardTitle className='text-lg'>Secure & Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-600'>
                Bank-grade security with full NSE compliance and regulatory
                oversight for your peace of mind.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className='bg-white rounded-xl shadow-lg p-8 mb-16'>
          <h3 className='text-2xl font-bold text-gray-900 text-center mb-8'>
            Why Choose Our Platform?
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div>
              <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                For Individual Investors
              </h4>
              <ul className='space-y-3 text-gray-600'>
                <li className='flex items-start'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 mr-3'></div>
                  Enhanced liquidity for your share portfolio
                </li>
                <li className='flex items-start'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 mr-3'></div>
                  Fractional trading capabilities
                </li>
                <li className='flex items-start'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 mr-3'></div>
                  Real-time portfolio tracking and analytics
                </li>
                <li className='flex items-start'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 mr-3'></div>
                  Lower transaction costs compared to traditional brokers
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                Platform Benefits
              </h4>
              <ul className='space-y-3 text-gray-600'>
                <li className='flex items-start'>
                  <div className='w-2 h-2 bg-secondary rounded-full mt-2 mr-3'></div>
                  NSE-approved and regulated platform
                </li>
                <li className='flex items-start'>
                  <div className='w-2 h-2 bg-secondary rounded-full mt-2 mr-3'></div>
                  Instant settlement and clearing
                </li>
                <li className='flex items-start'>
                  <div className='w-2 h-2 bg-secondary rounded-full mt-2 mr-3'></div>
                  24/7 customer support
                </li>
                <li className='flex items-start'>
                  <div className='w-2 h-2 bg-secondary rounded-full mt-2 mr-3'></div>
                  Advanced security and fraud protection
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className='text-center'>
          <h3 className='text-2xl font-bold text-gray-900 mb-4'>
            Ready to Transform Your Investment Strategy?
          </h3>
          <p className='text-gray-600 mb-8'>
            Join thousands of investors who have already embraced the future of
            share trading.
          </p>
          <Button
            size='lg'
            onClick={() => (window.location.href = '/login')}
            className='bg-primary hover:bg-blue-700 px-8 py-3 text-lg'
          >
            Start Trading Now
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center'>
            <div className='flex items-center justify-center space-x-3 mb-4'>
              <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                <Coins className='text-white text-sm' />
              </div>
              <span className='text-lg font-bold'>
                NSE Tokenization Platform
              </span>
            </div>
            <p className='text-gray-400'>
              Regulated by NSE | SEBI Registered | ISO 27001 Certified
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

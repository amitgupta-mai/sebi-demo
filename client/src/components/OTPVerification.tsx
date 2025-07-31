import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import OtpInput from 'react-otp-input';

interface OTPVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
  title?: string;
  description?: string;
  showDirectLogin?: boolean;
  password?: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onSuccess,
  onBack,
  title = 'Verify Your Email',
  description = 'Enter the 6-digit code sent to your email',
  showDirectLogin = false,
  password = '',
}) => {
  const { verifyEmail, sendOTP, login, isLoading } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000
      );
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setError('');
    setSuccess('');

    const result = await verifyEmail(email, otp);

    if (result.success) {
      setSuccess(result.message || 'Email verified successfully!');
      setVerificationSuccess(true);

      // If we have password and showDirectLogin is true, try to login directly
      if (showDirectLogin && password) {
        setTimeout(async () => {
          const loginResult = await login(email, password);
          if (loginResult.success) {
            onSuccess();
          } else {
            setError(
              'Verification successful but login failed. Please try logging in again.'
            );
            setVerificationSuccess(false);
          }
        }, 1500);
      } else {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } else {
      setError(result.message || 'Verification failed');
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setResendDisabled(true);
    setResendCountdown(60); // 60 seconds cooldown

    const result = await sendOTP(email);

    if (result.success) {
      setSuccess('OTP resent successfully!');
    } else {
      setError(result.message || 'Failed to resend OTP');
      setResendDisabled(false);
      setResendCountdown(0);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (error) setError('');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center space-x-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onBack}
              className='p-0 h-auto'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <CardTitle className='text-2xl font-bold'>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <Mail className='h-4 w-4' />
            <span>{email}</span>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className='h-4 w-4' />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Enter OTP</label>
              <OtpInput
                value={otp}
                onChange={handleOtpChange}
                numInputs={6}
                renderSeparator={<span className='mx-1'>-</span>}
                renderInput={(props) => (
                  <input
                    {...props}
                    className='w-10 h-10 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                    }}
                  />
                )}
                shouldAutoFocus
                inputType='text'
                inputStyle={{
                  width: '40px',
                  height: '40px',
                  margin: '0 4px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                }}
              />
            </div>

            <Button
              onClick={handleVerify}
              className='w-full'
              disabled={isLoading || otp.length !== 6 || verificationSuccess}
            >
              {isLoading
                ? 'Verifying...'
                : verificationSuccess
                ? 'Verifying...'
                : 'Verify Email'}
            </Button>

            <div className='text-center'>
              <Button
                variant='link'
                onClick={handleResendOTP}
                disabled={resendDisabled || isLoading}
                className='text-sm'
              >
                {resendDisabled
                  ? `Resend in ${resendCountdown}s`
                  : "Didn't receive the code? Resend"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;

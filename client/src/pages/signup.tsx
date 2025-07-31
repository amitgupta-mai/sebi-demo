import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, Mail, User, Lock, Eye, EyeOff } from 'lucide-react';
import OTPVerification from '../components/OTPVerification';

const SignupPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { signup, isLoading } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      const result = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        setSignupEmail(formData.email);
        setShowOTPVerification(true);
      } else {
        setError(
          result.message || 'Failed to create account. Please try again.'
        );
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleOTPSuccess = () => {
    // Redirect to dashboard after successful verification and login
    setLocation('/dashboard');
  };

  const handleOTPBack = () => {
    setShowOTPVerification(false);
  };

  if (showOTPVerification) {
    return (
      <OTPVerification
        email={signupEmail}
        onSuccess={handleOTPSuccess}
        onBack={handleOTPBack}
        title='Verify Your Email'
        description="We've sent a verification code to your email. Please enter it below to complete your registration."
        showDirectLogin={true}
        password={formData.password}
      />
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center space-x-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setLocation('/login')}
              className='p-0 h-auto'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <CardTitle className='text-2xl font-bold'>Create Account</CardTitle>
          </div>
          <CardDescription>
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>First Name</Label>
                <div className='relative'>
                  <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='firstName'
                    type='text'
                    placeholder='John'
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange('firstName', e.target.value)
                    }
                    className='pl-10'
                    required
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>Last Name</Label>
                <div className='relative'>
                  <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='lastName'
                    type='text'
                    placeholder='Doe'
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange('lastName', e.target.value)
                    }
                    className='pl-10'
                    required
                  />
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='email'
                  type='email'
                  placeholder='john.doe@example.com'
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className='pl-10'
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  className='pl-10 pr-10'
                  required
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Confirm your password'
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  className='pl-10 pr-10'
                  required
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className='text-center text-sm text-gray-600'>
              Already have an account?{' '}
              <Button
                variant='link'
                className='p-0 h-auto font-semibold'
                onClick={() => setLocation('/login')}
              >
                Sign in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;

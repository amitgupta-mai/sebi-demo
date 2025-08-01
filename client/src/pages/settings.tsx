import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Shield,
  Key,
  CreditCard,
  Eye,
  Bell,
  Globe,
  HelpCircle,
  Save,
  Upload,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  walletAddress?: string;
  profileImageUrl?: string;
  phone?: string;
  investorId?: string;
  kycStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  email: string;
}

interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [profileData, setProfileData] = useState<ProfileUpdateData>({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordUpdateData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Get current user profile
  const { data: userProfileResponse, isLoading: profileLoading } = useQuery<{
    success: boolean;
    message: string;
    data: UserProfile;
  }>({
    queryKey: ['/api/auth/me'],
  });

  // Extract user profile from response
  const userProfile = userProfileResponse?.data;

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await apiRequest(
        'PUT',
        `${baseUrl}/api/users/profile`,
        data
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }

      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
      // Invalidate the user profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await apiRequest(
        'PUT',
        `${baseUrl}/api/users/password`,
        data
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update password');
      }

      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password updated successfully!',
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password',
        variant: 'destructive',
      });
    },
  });

  // Initialize profile data when user data is loaded
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
      });
    }
  }, [userProfile]);

  const handleProfileUpdate = () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordUpdate = () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast({
        title: 'Error',
        description: 'Please fill all password fields',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  if (profileLoading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex'>
          <Sidebar />
          <main className='flex-1 p-6'>
            <div className='flex items-center justify-center h-64'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Settings</h1>
            <p className='text-gray-600'>
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-6'
          >
            <TabsList className='grid grid-cols-5 gap-4 h-auto p-1 bg-white rounded-lg shadow-sm'>
              <TabsTrigger
                value='profile'
                className='flex items-center space-x-2 p-3'
              >
                <User className='h-4 w-4' />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value='security'
                className='flex items-center space-x-2 p-3'
              >
                <Shield className='h-4 w-4' />
                <span>Security</span>
              </TabsTrigger>
              {/* Hidden for now - can be enabled later */}
              {/* <TabsTrigger value="api" className="flex items-center space-x-2 p-3">
                <Key className="h-4 w-4" />
                <span>API Keys</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center space-x-2 p-3">
                <CreditCard className="h-4 w-4" />
                <span>Payment</span>
              </TabsTrigger> */}
              <TabsTrigger
                value='appearance'
                className='flex items-center space-x-2 p-3'
              >
                <Eye className='h-4 w-4' />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger
                value='notifications'
                className='flex items-center space-x-2 p-3'
              >
                <Bell className='h-4 w-4' />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger
                value='region'
                className='flex items-center space-x-2 p-3'
              >
                <Globe className='h-4 w-4' />
                <span>Region</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value='profile'>
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <Card className='lg:col-span-2'>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className='flex items-center space-x-6'>
                      <Avatar className='h-20 w-20'>
                        <AvatarImage
                          src={userProfile?.profileImageUrl || ''}
                          alt='Profile'
                        />
                        <AvatarFallback className='text-lg'>
                          {userProfile?.firstName?.[0]}
                          {userProfile?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant='outline' size='sm' className='mb-2'>
                          <Upload className='h-4 w-4 mr-2' />
                          Change Photo
                        </Button>
                        <p className='text-sm text-gray-500'>
                          JPG, GIF or PNG. 1MB max.
                        </p>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label htmlFor='firstName'>First Name</Label>
                        <Input
                          id='firstName'
                          value={profileData.firstName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor='lastName'>Last Name</Label>
                        <Input
                          id='lastName'
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor='walletAddress'>Wallet Address</Label>
                      <Input
                        id='walletAddress'
                        value={userProfile?.walletAddress || ''}
                        disabled
                        className='bg-gray-50 text-gray-600'
                        placeholder='No wallet address available'
                      />
                    </div>

                    <div>
                      <Label htmlFor='email'>Email Address</Label>
                      <Input
                        id='email'
                        type='email'
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor='phone'>Phone Number</Label>
                      <Input
                        id='phone'
                        type='tel'
                        value={userProfile?.phone || ''}
                        disabled
                      />
                    </div>

                    <Button
                      className='w-full'
                      onClick={handleProfileUpdate}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      ) : (
                        <Save className='h-4 w-4 mr-2' />
                      )}
                      {updateProfileMutation.isPending
                        ? 'Saving...'
                        : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Investor ID</span>
                      <Badge variant='outline'>
                        {userProfile?.investorId || 'N/A'}
                      </Badge>
                    </div>
                    <Separator />
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>KYC Status</span>
                      <Badge
                        variant='default'
                        className='bg-green-100 text-green-800'
                      >
                        {userProfile?.kycStatus || 'Not Verified'}
                      </Badge>
                    </div>
                    <Separator />
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Account Type</span>
                      <Badge variant='outline'>Premium</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value='security'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <Label htmlFor='currentPassword'>Current Password</Label>
                      <Input
                        id='currentPassword'
                        type='password'
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='newPassword'>New Password</Label>
                      <Input
                        id='newPassword'
                        type='password'
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='confirmPassword'>
                        Confirm New Password
                      </Label>
                      <Input
                        id='confirmPassword'
                        type='password'
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      className='w-full'
                      onClick={handlePasswordUpdate}
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending ? (
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      ) : (
                        <Save className='h-4 w-4 mr-2' />
                      )}
                      {updatePasswordMutation.isPending
                        ? 'Updating...'
                        : 'Update Password'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>SMS Authentication</p>
                        <p className='text-sm text-gray-500'>
                          Receive codes via SMS
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>App Authentication</p>
                        <p className='text-sm text-gray-500'>
                          Use authenticator app
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Hidden for now - can be enabled later */}
            {/* API Keys Tab */}
            {/* <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Keys Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> Keep your API keys secure. Never share them publicly.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Trading API Key</p>
                        <p className="text-sm text-gray-500">Used for automated trading</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Regenerate</Button>
                        <Button variant="destructive" size="sm">Revoke</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Webhook API Key</p>
                        <p className="text-sm text-gray-500">For webhook notifications</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Regenerate</Button>
                        <Button variant="destructive" size="sm">Revoke</Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full">Generate New API Key</Button>
                </CardContent>
              </Card>
            </TabsContent> */}

            {/* Payment Methods Tab */}
            {/* <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Bank Account</p>
                          <p className="text-sm text-gray-500">****1234 - HDFC Bank</p>
                        </div>
                      </div>
                      <Badge variant="default">Primary</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">UPI</p>
                          <p className="text-sm text-gray-500">demo@paytm</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                  
                  <Button className="w-full">Add Payment Method</Button>
                </CardContent>
              </Card>
            </TabsContent> */}

            {/* Appearance Tab */}
            <TabsContent value='appearance'>
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div>
                    <Label htmlFor='theme'>Theme</Label>
                    <Select defaultValue='light'>
                      <SelectTrigger>
                        <SelectValue placeholder='Select theme' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='light'>Light</SelectItem>
                        <SelectItem value='dark'>Dark</SelectItem>
                        <SelectItem value='system'>System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='currency'>Currency Display</Label>
                    <Select defaultValue='inr'>
                      <SelectTrigger>
                        <SelectValue placeholder='Select currency' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='inr'>Indian Rupee (₹)</SelectItem>
                        <SelectItem value='usd'>US Dollar ($)</SelectItem>
                        <SelectItem value='eur'>Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Compact Layout</p>
                      <p className='text-sm text-gray-500'>
                        Use more compact spacing
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <Button className='w-full'>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value='notifications'>
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>Email Notifications</p>
                        <p className='text-sm text-gray-500'>
                          Receive updates via email
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>Price Alerts</p>
                        <p className='text-sm text-gray-500'>
                          Get notified of price changes
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>Transaction Updates</p>
                        <p className='text-sm text-gray-500'>
                          Notifications for transactions
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>Marketing Communications</p>
                        <p className='text-sm text-gray-500'>
                          Product updates and news
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Language & Region Tab */}
            <TabsContent value='region'>
              <Card>
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div>
                    <Label htmlFor='language'>Language</Label>
                    <Select defaultValue='en'>
                      <SelectTrigger>
                        <SelectValue placeholder='Select language' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='en'>English</SelectItem>
                        <SelectItem value='hi'>Hindi</SelectItem>
                        <SelectItem value='mr'>Marathi</SelectItem>
                        <SelectItem value='gu'>Gujarati</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='timezone'>Timezone</Label>
                    <Select defaultValue='ist'>
                      <SelectTrigger>
                        <SelectValue placeholder='Select timezone' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='ist'>
                          India Standard Time (IST)
                        </SelectItem>
                        <SelectItem value='utc'>UTC</SelectItem>
                        <SelectItem value='est'>
                          Eastern Standard Time
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='dateFormat'>Date Format</Label>
                    <Select defaultValue='dd/mm/yyyy'>
                      <SelectTrigger>
                        <SelectValue placeholder='Select date format' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='dd/mm/yyyy'>DD/MM/YYYY</SelectItem>
                        <SelectItem value='mm/dd/yyyy'>MM/DD/YYYY</SelectItem>
                        <SelectItem value='yyyy-mm-dd'>YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className='w-full'>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

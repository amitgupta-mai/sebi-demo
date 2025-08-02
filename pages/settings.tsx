import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { PageLoading } from '@/components/LoadingSpinner';

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

  // Get current user profile
  const {
    data: userProfileResponse,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery<{
    success: boolean;
    message: string;
    data: UserProfile;
  }>({
    queryKey: ['/api/auth/me'],
    retry: false, // Don't retry on failure to prevent infinite loops
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
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

  if (profileLoading) {
    return <PageLoading />;
  }

  if (profileError) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex'>
          <Sidebar />
          <main className='flex-1 p-6'>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Settings
              </h1>
              <p className='text-gray-600'>
                Manage your account settings and preferences
              </p>
            </div>
            <Card>
              <CardContent className='p-6'>
                <div className='text-center'>
                  <p className='text-gray-600 mb-4'>
                    Unable to load profile information. Please try refreshing
                    the page.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <TabsList className='grid grid-cols-1 gap-4 h-auto p-1 bg-white rounded-lg shadow-sm'>
              <TabsTrigger
                value='profile'
                className='flex items-center space-x-2 p-3'
              >
                <User className='h-4 w-4' />
                <span>Profile</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value='profile'>
              <Card>
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
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

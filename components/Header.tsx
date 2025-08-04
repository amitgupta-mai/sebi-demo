import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Coins, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50'>
      <div className='max-w-full px-4 sm:px-6 py-3 sm:py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2 sm:space-x-4'>
            <div className='flex items-center space-x-2 sm:space-x-3'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center'>
                <Coins className='text-white text-sm sm:text-lg' />
              </div>
              <div className='hidden sm:block'>
                <h1 className='text-lg sm:text-xl font-bold text-gray-900'>
                  Tokenized Share
                </h1>
                <p className='text-xs sm:text-sm text-gray-500'>
                  Share Tokenization and Trading Platform
                </p>
              </div>
              <div className='sm:hidden'>
                <h1 className='text-lg font-bold text-gray-900'>TS</h1>
              </div>
            </div>
          </div>

          <div className='flex items-center space-x-2 sm:space-x-4'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2'
                >
                  <Avatar className='h-6 w-6 sm:h-8 sm:w-8'>
                    <AvatarImage src='' alt='User Avatar' />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='hidden sm:block text-sm text-left'>
                    <p className='font-medium text-gray-900'>
                      {`${user?.firstName || ''} ${user?.lastName || ''}`}
                    </p>
                    <p className='text-gray-500'>{user?.email || ''}</p>
                  </div>
                  <ChevronDown className='h-4 w-4 text-gray-400' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuItem className='flex items-center'>
                  <User className='mr-2 h-4 w-4' />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className='flex items-center'>
                  <Settings className='mr-2 h-4 w-4' />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='flex items-center text-red-600'
                  onClick={logout}
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Wallet,
  ArrowRightLeft,
  Coins,
  Undo2,
  History,
  Settings,
} from 'lucide-react';

const mobileNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Market', href: '/market', icon: TrendingUp },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Tokenize', href: '/tokenize', icon: Coins },
  { name: 'Trading', href: '/trading', icon: ArrowRightLeft },
  { name: 'Convert', href: '/convert', icon: Undo2 },
  { name: 'History', href: '/transactions', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50'>
      <div className='flex items-center justify-between px-4 py-2 overflow-x-auto'>
        {mobileNavigation.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== '/' && location.startsWith(item.href));

          return (
            <Link key={item.name} href={item.href}>
              <span
                className={cn(
                  'flex flex-col items-center space-y-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'text-primary bg-blue-50'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                )}
              >
                <item.icon className='h-4 w-4' />
                <span>{item.name}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

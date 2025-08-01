import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Coins,
  ArrowRightLeft,
  Undo2,
  Briefcase,
  History,
  UserCheck,
  TrendingUp,
  Wallet,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Market', href: '/market', icon: TrendingUp },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Tokenize Shares', href: '/tokenize', icon: Coins },
  { name: 'Token Trading', href: '/trading', icon: ArrowRightLeft },
  { name: 'Convert to Shares', href: '/convert', icon: Undo2 },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Transaction History', href: '/transactions', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className='w-64 bg-white shadow-sm h-screen sticky top-16 overflow-y-auto flex flex-col'>
      <nav className='p-6 flex-1'>
        <ul className='space-y-2'>
          {navigation.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== '/' && location.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <span
                    className={cn(
                      'flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors cursor-pointer',
                      isActive
                        ? 'text-primary bg-blue-50'
                        : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                    )}
                  >
                    <item.icon className='h-5 w-5' />
                    <span>{item.name}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Powered by Kalp Studio */}
      <div className='p-6 pt-0'>
        <div className='flex flex-col items-center justify-center space-y-1 text-gray-500'>
          <span className='text-xs font-medium'>Powered by</span>
          <img
            src='https://dev-ks-website.s3.ap-south-1.amazonaws.com/assets/kalp-digital.svg'
            alt='Kalp Studio'
            className='h-6 w-auto'
          />
        </div>
      </div>
    </aside>
  );
}

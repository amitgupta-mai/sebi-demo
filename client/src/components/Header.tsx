import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Bell, Coins, ChevronDown, User, Settings, Shield, Key, CreditCard, Eye, Globe, HelpCircle, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  // Demo user data (no authentication required)
  const demoUser = {
    firstName: "Demo",
    lastName: "Investor", 
    email: "demo@investor.com",
    investorId: "INV-DEMO-001",
    profileImageUrl: null
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Coins className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tokenized Share</h1>
                <p className="text-sm text-gray-500">Share Tokenization and Trading Platform</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0">
                  3
                </Badge>
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={demoUser.profileImageUrl || ""} alt="User Avatar" />
                    <AvatarFallback>
                      {demoUser.firstName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm text-left">
                    <p className="font-medium text-gray-900">
                      {`${demoUser.firstName} ${demoUser.lastName}`}
                    </p>
                    <p className="text-gray-500">{demoUser.investorId}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{demoUser.firstName} {demoUser.lastName}</p>
                  <p className="text-xs text-gray-500">{demoUser.email}</p>
                </div>
                <DropdownMenuItem className="py-3">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-3">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>General Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Security & Privacy</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3">
                  <Key className="mr-2 h-4 w-4" />
                  <span>API Keys</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Payment Methods</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3">
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Appearance</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3">
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Language & Region</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-3">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
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

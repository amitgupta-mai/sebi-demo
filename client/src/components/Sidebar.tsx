import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Coins, 
  ArrowRightLeft, 
  Undo2, 
  Briefcase, 
  History, 
  UserCheck 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Tokenize Shares", href: "/tokenize", icon: Coins },
  { name: "Token Trading", href: "/trading", icon: ArrowRightLeft },
  { name: "Convert to Shares", href: "/convert", icon: Undo2 },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Transaction History", href: "/transactions", icon: History },
  { name: "KYC Status", href: "/kyc", icon: UserCheck },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm h-screen sticky top-16 overflow-y-auto">
      <nav className="p-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-primary bg-blue-50"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

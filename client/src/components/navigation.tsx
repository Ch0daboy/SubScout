import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, Bell, User, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last) || 'U';
  };

  const getDisplayName = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }
    return email?.split('@')[0] || 'User';
  };

  const navItems = [
    { path: '/', label: 'Dashboard', active: location === '/' },
    { path: '/subreddits', label: 'Subreddits', active: location === '/subreddits' },
    { path: '/insights', label: 'Insights', active: location === '/insights' },
    { path: '/posts', label: 'Posts', active: location === '/posts' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Search className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold text-gray-900" data-testid="text-logo">
                SubScout
              </span>
            </div>
            <div className="hidden md:ml-8 md:flex space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className={`px-1 pt-1 pb-4 text-sm font-medium border-b-2 transition-colors ${
                    item.active
                      ? 'text-primary border-primary'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5 text-gray-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl ?? undefined} alt="User avatar" />
                    <AvatarFallback data-testid="text-user-initials">
                      {getInitials(user?.firstName ?? undefined, user?.lastName ?? undefined)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 hidden md:block" data-testid="text-user-name">
                    {getDisplayName(user?.firstName ?? undefined, user?.lastName ?? undefined, user?.email ?? undefined)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" data-testid="dropdown-user-menu">
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'} data-testid="menuitem-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

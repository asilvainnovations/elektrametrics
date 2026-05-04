import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, Menu, Search, Sparkles, LogOut, User, Settings } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Props { onMenuClick: () => void; onNavigate: (v: string) => void; }

export const Header: React.FC<Props> = ({ onMenuClick, onNavigate }) => {
  const { user, profile, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-white/30">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-white/40">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full pulse-ring" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg leading-tight tracking-tight">ElektraMetrics</h1>
              <p className="text-[10px] text-muted-foreground font-condensed uppercase tracking-wider">AI Electoral Intelligence</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search surveys, regions, insights..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-white/40 backdrop-blur-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-white/40">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
          </button>
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/40 transition">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                  {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium leading-tight">{profile.full_name || 'User'}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{profile.role}</div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-strong w-56">
                <div className="px-2 py-2 text-xs text-muted-foreground">{profile.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('profile')}><User className="w-4 h-4 mr-2" />Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('settings')}><Settings className="w-4 h-4 mr-2" />Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600"><LogOut className="w-4 h-4 mr-2" />Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setAuthOpen(true)} className="gradient-primary text-white border-0 shadow-md">Sign In</Button>
          )}
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
};

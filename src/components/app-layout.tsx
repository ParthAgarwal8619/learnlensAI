import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { useAccessibility } from '@/contexts/accessibility-context';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import {
  LayoutDashboard,
  FileText,
  Map,
  ClipboardCheck,
  Calendar,
  MessageSquare,
  PenSquare,
  TrendingUp,
  LogOut,
  Settings,
  VolumeX,
  Volume2,
  Type,
  Contrast,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/upload', label: 'Add Subject', icon: FileText },
  { to: '/app/knowledge-map', label: 'Knowledge Map', icon: Map },
  { to: '/app/diagnostic', label: 'Diagnostic Test', icon: ClipboardCheck },
  { to: '/app/learning-plan', label: 'Learning Plan', icon: Calendar },
  { to: '/app/tutor', label: 'AI Tutor', icon: MessageSquare },
  { to: '/app/practice', label: 'Practice', icon: PenSquare },
  { to: '/app/progress', label: 'Progress', icon: TrendingUp },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { fontSize, contrastMode, setFontSize, setContrastMode, speak, stopSpeaking } = useAccessibility();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-primary lg:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary-foreground">LearnLens AI</h1>
            <p className="text-xs text-primary-foreground/60">Find what you don't know</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-primary-foreground/10 p-3">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/30 text-sm font-semibold text-white">
              {user?.email?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-xs font-medium text-primary-foreground">
                {user?.email || 'student@learnlens.ai'}
              </p>
              <p className="text-xs text-primary-foreground/50">Student</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="mt-2 w-full justify-start text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b bg-primary px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-white" />
          <span className="font-bold text-primary-foreground">LearnLens AI</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuSeparator />
            {navItems.map((item) => (
              <DropdownMenuItem key={item.to} onClick={() => navigate(item.to)}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile nav */}
      <div className="flex overflow-x-auto border-b bg-card px-2 py-2 lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive ? 'bg-accent text-white' : 'text-muted-foreground hover:bg-muted'
              }`
            }
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar with accessibility controls */}
        <div className="sticky top-0 z-30 flex items-center justify-end gap-2 border-b bg-background/80 px-6 py-3 backdrop-blur">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Text Size</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFontSize('small')}>Small {fontSize === 'small' && '✓'}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize('medium')}>Medium {fontSize === 'medium' && '✓'}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize('large')}>Large {fontSize === 'large' && '✓'}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setContrastMode(contrastMode === 'normal' ? 'high' : 'normal')}
          >
            <Contrast className="h-4 w-4" />
            <span className="hidden sm:inline">Contrast</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => stopSpeaking()}
          >
            <VolumeX className="h-4 w-4" />
            <span className="hidden sm:inline">Stop Audio</span>
          </Button>
        </div>

        <main className="min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}

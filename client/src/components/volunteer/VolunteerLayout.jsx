import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function VolunteerLayout({ children }) {
  const { user, isVolunteer, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not a volunteer
  useEffect(() => {
    if (!isLoading && (!user || !isVolunteer)) {
      navigate('/auth', { replace: true });
    }
  }, [user, isVolunteer, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isVolunteer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/40 dark:bg-background flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-50 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between px-4 md:px-6 transition-colors duration-300">
        
        {/* Left Side: Logo & Title*/}
        <Link 
          to="/volunteer" 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="bg-muted p-1.5 rounded-full border border-border shadow-sm">
             <img src="/favicon.ico" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            Volunteer<span className="hidden sm:inline"> Panel</span>
          </h1>
        </Link>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* Profile Button */}
          <Button 
            asChild
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 gap-2 cursor-pointer transition-colors"
          >
            <Link to="/profile">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Profile</span>
            </Link>
          </Button>

          <div className="hidden md:flex flex-col items-end border-l border-border pl-4 ml-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Logged in as</span>
            <span className="text-sm font-semibold text-foreground">{user.email}</span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 ml-1"
          >
            <LogOut className="w-4 h-5" />
            <span className="hidden sm:inline font-medium text-destructive">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* Mobile User Info Card */}
        <div className="md:hidden mb-6 flex items-center gap-2 text-muted-foreground bg-card p-3 rounded-lg border border-border shadow-sm">
            <div className="bg-primary/10 p-2 rounded-full">
                <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-xs uppercase font-bold text-muted-foreground">Welcome</span>
                <span className="text-sm font-medium text-card-foreground truncate">{user.email}</span>
            </div>
        </div>

        {children}
      </main>
    </div>
  );
}
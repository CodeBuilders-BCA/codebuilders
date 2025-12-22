import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 👈 Import Link
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isVolunteer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 md:px-6">
        
        {/* Left Side: Logo & Title*/}
        <Link 
          to="/volunteer" 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="bg-gray-50 p-1.5 rounded-full border border-gray-100 shadow-sm">
             <img src="/favicon.ico" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            Volunteer<span className="hidden sm:inline"> Panel</span>
          </h1>
        </Link>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* 👇 UPDATED: Profile Button using 'asChild' and 'Link' */}
          <Button 
            asChild
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-primary hover:bg-primary/5 gap-2 cursor-pointer"
          >
            <Link to="/profile">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Profile</span>
            </Link>
          </Button>

          <div className="hidden md:flex flex-col items-end border-l border-gray-200 pl-4 ml-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Logged in as</span>
            <span className="text-sm font-semibold text-gray-800">{user.email}</span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 ml-1"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="md:hidden mb-6 flex items-center gap-2 text-gray-500 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <div className="bg-primary/10 p-2 rounded-full">
                <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-xs uppercase font-bold">Welcome</span>
                <span className="text-sm font-medium text-gray-900 truncate">{user.email}</span>
            </div>
        </div>

        {children}
      </main>
    </div>
  );
}
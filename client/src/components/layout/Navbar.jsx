import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/speakers", label: "Speakers" },
  { href: "/memories", label: "Memories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 

  const handleLogout = () => {
    logout();
    navigate("/auth");
    setIsOpen(false);
  };

  // Helper to get the correct dashboard path based on role
  const getDashboardPath = () => {
    if (user?.role === 'admin') return "/admin";
    if (user?.role === 'volunteer') return "/volunteer";
    return "/profile";
  };

  // Helper to check if user has access to a panel
  const canAccessDashboard = user?.role === 'admin' || user?.role === 'volunteer';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <img className="w-6 h-6 text-primary" src="/favicon.ico" alt="Logo" />
            </div>
            <span className="font-bold text-xl">
              Code<span className="text-gradient">Builders</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              // ✅ LOGGED IN: User Dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{user.name || "My Account"}</span>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56">
                  {/* Using onClick directly instead of inner Link to fix navigation issues */}
                  {canAccessDashboard && (
                     <DropdownMenuItem 
                       onClick={() => navigate(getDashboardPath())}
                       className="cursor-pointer"
                     >
                       <LayoutDashboard className="w-4 h-4 mr-2" />
                       {user.role === 'admin' ? 'Admin Dashboard' : 'Volunteer Panel'}
                     </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // ❌ GUEST
              <Link to="/events?filter=upcoming">
                <Button variant="glow" size="sm">
                  Register Now
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in bg-background">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary px-2 py-2 ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 border-t border-gray-100">
                {user ? (
                  // ✅ MOBILE: Logged In View
                  <>
                    <div className="flex items-center gap-2 px-2 py-2 mb-2 bg-muted/50 rounded-md">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                      </div>
                    </div>
                    
                    {/* Mobile Navigation */}
                    {canAccessDashboard && (
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start" 
                          onClick={() => { navigate(getDashboardPath()); setIsOpen(false); }}
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          {user.role === 'admin' ? 'Admin Dashboard' : 'Volunteer Panel'}
                        </Button>
                    )}
                    
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/profile"); setIsOpen(false); }}>
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </Button>
                    
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  // ❌ MOBILE: Guest View
                  <Link to="/events?filter=upcoming" onClick={() => setIsOpen(false)}>
                    <Button variant="glow" className="w-full mt-2">
                      Register Now
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
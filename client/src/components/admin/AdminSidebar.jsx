import { Calendar, Image, Users, UserCheck, Mic, LogOut, LayoutDashboard, Mail, User } from 'lucide-react';
import { NavLink } from 'react-router-dom'; 
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Events', url: '/admin/events', icon: Calendar },
  { title: 'Memories', url: '/admin/memories', icon: Image },
  { title: 'Speakers', url: '/admin/speakers', icon: Mic },
  { title: 'Registrations', url: '/admin/registrations', icon: Users },
  { title: 'Volunteers', url: '/admin/volunteers', icon: UserCheck },
  { title: 'Messages', url: '/admin/messages', icon: Mail },
];

export function AdminSidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-semibold text-xs uppercase tracking-widest mb-4 mt-2">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-transparent transition-none">
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium w-full transition-all duration-200 ${
                          isActive 
                            /* Active State: Black Text (readable on Primary) */
                            ? "bg-primary text-black shadow-md shadow-primary/25 hover:bg-primary/90" 
                            /* Inactive State: Gray Text */
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-4 bg-white space-y-4">
        
        {/* 👇 NEW: Profile Button */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/profile" 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full border transition-colors ${
                    isActive 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`
                }
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex flex-col gap-1">
           <span className="text-xs font-medium text-gray-400 uppercase">Logged in as</span>
           <span className="text-sm font-semibold text-gray-800 truncate" title={user?.email}>
             {user?.email}
           </span>
        </div>
        
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
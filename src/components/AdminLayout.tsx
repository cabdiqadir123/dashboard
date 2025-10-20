import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FolderOpen,
  Calendar,
  CreditCard,
  Ticket,
  MessageSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
  Settings,
  Bell,
  BookOpen,
  Star,
  UserSquare2,
  Mail,
  Shield,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Workers", href: "/workers", icon: UserCheck },
  { name: "Categories", href: "/categories", icon: FolderOpen },
  { name: "Sub-Services", href: "/sub-services", icon: Settings },
  { name: "Bookings", href: "/bookings", icon: Calendar },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Promo Codes", href: "/promos", icon: Ticket },
  { name: "Complaints", href: "/complaints", icon: MessageSquare },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Blog Posts", href: "/blog", icon: BookOpen },
  { name: "Testimonials", href: "/testimonials", icon: Star },
  { name: "Team Members", href: "/team-members", icon: UserSquare2 },
  { name: "Contact Messages", href: "/contact-messages", icon: Mail },
  { name: "Privacy Policy", href: "/privacy-policy", icon: Shield },
  { name: "Account Deletions", href: "/account-deletions", icon: UserX },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };


  console.log('email', user.email);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="mx-auto w-fill h-40 bg-white flex-row flex items-center justify-center">
              {/* <Shield className="h-6 w-6 text-white" /> */}
              <img
                src="src/assets/Xirfadsan-logo.png"
                alt="quote"
                className="w-6 h-6 object-contain"
              />
              <h1 className="text-xl font-bold text-sidebar-foreground">ServiceAdmin</h1>
            </div>
            {/* <h1 className="text-xl font-bold text-sidebar-foreground">ServiceAdmin</h1> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="px-4 space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                  location.pathname === item.href && "bg-sidebar-accent text-sidebar-primary"
                )}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar border-r border-sidebar-border px-6">

          <div className="flex h-16 gap-2 shrink-0 items-center border-b border-border shadow-sm">
            <div className="mx-auto w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <img
                src="src/assets/Xirfadsan-logo.png"
                alt="quote"
                className="w-6 h-6 object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Xirfadsan Admin</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Button
                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                      location.pathname === item.href && "bg-sidebar-accent text-sidebar-primary"
                    )}
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>

                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* light and dark */}
              <ThemeToggle />
              {/* logout and profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={'https://back-end-for-xirfadsan.onrender.com/api/user/image/'+user.id} alt="Admin" />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
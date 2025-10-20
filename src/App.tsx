// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import AdminLayout from "./components/AdminLayout";
// import Dashboard from "./pages/Dashboard";
// import Users from "./pages/Users";
// import Workers from "./pages/Workers";
// import Categories from "./pages/Categories";
// import Bookings from "./pages/Bookings";
// import Payments from "./pages/Payments";
// import Promos from "./pages/Promos";
// import Complaints from "./pages/Complaints";
// import Reports from "./pages/Reports";
// import SubServices from "./pages/SubServices";
// import Notifications from "./pages/Notifications";
// import Blog from "./pages/Blog";
// import Testimonials from "./pages/Testimonials";
// import TeamMembers from "./pages/TeamMembers";
// import ContactMessages from "./pages/ContactMessages";
// import PrivacyPolicy from "./pages/PrivacyPolicy";
// import AccountDeletions from "./pages/AccountDeletions";
// import Login from "./pages/Login";
// import NotFound from "./pages/NotFound";
// import { AuthProvider } from "./hooks/useAuth";
// import { ThemeProvider } from "./components/theme-provider";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <ThemeProvider defaultTheme="light" storageKey="homeserve-theme">

//       <AuthProvider>
//         <TooltipProvider>
//           <Toaster />
//           <Sonner />
//           <BrowserRouter>
//             <Routes>
//               <Route path="/login" element={<Login />} />
//               <Route path="/" element={<AdminLayout />}>
//                 <Route index element={<Dashboard />} />
//                 <Route path="/users" element={<Users />} />
//                 <Route path="/workers" element={<Workers />} />
//                 <Route path="/categories" element={<Categories />} />
//                 <Route path="/bookings" element={<Bookings />} />
//                 <Route path="/payments" element={<Payments />} />
//                 <Route path="/promos" element={<Promos />} />
//                 <Route path="/complaints" element={<Complaints />} />
//                 <Route path="/reports" element={<Reports />} />
//                 <Route path="/sub-services" element={<SubServices />} />
//                 <Route path="/notifications" element={<Notifications />} />
//                 <Route path="/blog" element={<Blog />} />
//                 <Route path="/testimonials" element={<Testimonials />} />
//                 <Route path="/team-members" element={<TeamMembers />} />
//                 <Route path="/contact-messages" element={<ContactMessages />} />
//                 <Route path="/privacy-policy" element={<PrivacyPolicy />} />
//                 <Route path="/account-deletions" element={<AccountDeletions />} />
//                 {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
//               </Route>
//               <Route path="*" element={<NotFound />} />
//             </Routes>
//           </BrowserRouter>
//         </TooltipProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   </QueryClientProvider>
// );

// export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Workers from "./pages/Workers";
import Categories from "./pages/Categories";
import Bookings from "./pages/Bookings";
import Payments from "./pages/Payments";
import Promos from "./pages/Promos";
import Complaints from "./pages/Complaints";
import Reports from "./pages/Reports";
import SubServices from "./pages/SubServices";
import Notifications from "./pages/Notifications";
import Blog from "./pages/Blog";
import Testimonials from "./pages/Testimonials";
import TeamMembers from "./pages/TeamMembers";
import ContactMessages from "./pages/ContactMessages";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AccountDeletions from "./pages/AccountDeletions";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./components/theme-provider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="homeserve-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/workers" element={<Workers />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/promos" element={<Promos />} />
                <Route path="/complaints" element={<Complaints />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/sub-services" element={<SubServices />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/team-members" element={<TeamMembers />} />
                <Route path="/contact-messages" element={<ContactMessages />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/account-deletions" element={<AccountDeletions />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  PiggyBank, 
  Settings, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  LogOut, 
  Search,
  Menu,
  X
} from 'lucide-react';

type AdminData = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  admin_role_id: number;
  // Add other fields as needed
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Retrieve admin data from localStorage
    const adminDataString = localStorage.getItem('collo-admin-data');
    if (adminDataString) {
      try {
        const data = JSON.parse(adminDataString);
        setAdminData(data);
      } catch (error) {
        console.error('Failed to parse admin data:', error);
      }
    }
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const baseNavLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/dashboard/user-management', icon: UserCog },
    { name: 'Financial Overview', href: '/dashboard/financial-overview', icon: PiggyBank },
    { name: 'System Settings', href: '/dashboard/system-settings', icon: Settings },
    { name: 'Settings', href: '/dashboard/settings', icon: Sliders },
  ];

  // Conditionally add Staff link if admin role is 1 (super admin)
  const navLinks = [
    ...baseNavLinks.slice(0, 1), // Overview
    ...(adminData?.admin_role_id === 1 ? [
      { name: 'Staff', href: '/dashboard/staff', icon: Users }
    ] : []),
    ...baseNavLinks.slice(1) // Rest of the links
  ];

  return (
    <div className="flex h-screen bg-[#F7FAFC]">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <div 
        className={`fixed inset-y-0 left-0 transform z-50 lg:hidden transition-transform duration-300 ease-in-out w-64 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-[#1A365D] text-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#2D4A77]">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center text-[#1A365D] font-bold mr-2">
                C
              </div>
              <h1 className="text-xl font-semibold">Collo Admin</h1>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-[#2D4A77] focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group ${
                      isActive 
                        ? 'bg-[#2D4A77] text-white' 
                        : 'text-gray-300 hover:bg-[#2D4A77] hover:text-white'
                    }`}
                  >
                    <Icon size={20} className={`mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="p-4 border-t border-[#2D4A77]">
            <button className="flex w-full items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-[#2D4A77] rounded-lg transition-colors duration-200">
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div 
        className={`hidden lg:flex flex-col bg-[#1A365D] text-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center h-16 px-4 border-b border-[#2D4A77]">
          {sidebarOpen ? (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center text-[#1A365D] font-bold mr-2">
                C
              </div>
              <h1 className="text-xl font-semibold">Collo Admin</h1>
            </div>
          ) : (
            <div className="h-8 w-8 mx-auto rounded-md bg-white flex items-center justify-center text-[#1A365D] font-bold">
              C
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="px-2 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center ${sidebarOpen ? 'px-4' : 'justify-center'} py-3 rounded-lg transition-colors duration-200 group ${
                    isActive 
                      ? 'bg-[#2D4A77] text-white' 
                      : 'text-gray-300 hover:bg-[#2D4A77] hover:text-white'
                  }`}
                  title={!sidebarOpen ? link.name : undefined}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                  {sidebarOpen && <span className="ml-3">{link.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 flex justify-center border-t border-[#2D4A77]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-[#2D4A77] focus:outline-none transition-colors duration-200"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                <Menu size={24} />
              </button>
              <h2 className="ml-2 lg:ml-0 text-lg font-semibold text-[#1A365D]">
                {navLinks.find((link) => link.href === pathname)?.name || 'Dashboard'}
              </h2>
            </div>

            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 mx-4 flex-1 max-w-md">
              <Search size={18} className="text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none w-full focus:outline-none text-gray-700"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors duration-200">
                  <Bell size={20} />
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-[#E53E3E] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-[#1A365D] border-2 border-white shadow-sm flex items-center justify-center text-white font-medium">
                  {adminData?.first_name?.[0] || 'A'}
                </div>
                <div className="ml-2 hidden md:block">
                  <p className="text-sm font-medium text-gray-700">
                    {adminData?.first_name} {adminData?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {adminData?.admin_role_id === 1 ? 'Super Administrator' : 'Administrator'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
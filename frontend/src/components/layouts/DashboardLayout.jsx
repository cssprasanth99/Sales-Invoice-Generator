import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate, useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ChevronLeft, // Icon for collapsing
  ChevronRight, // Icon for expanding
} from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { NAVIGATION_MENU } from "../../utils/data";

const NavigationItem = ({ item, isActive, onClick, isCollapsed }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-all group
      ${
        isActive
          ? "bg-blue-50 text-blue-900 shadow- shadow-blue-50"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <Icon
        className={`h-5 w-5 flex-shrink-0 ${
          isActive ? "text-blue-900" : "text-gray-500 group-hover:text-gray-900"
        }`}
      />
      {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
    </button>
  );
};

const DashboardLayout = ({ children, activeMenu }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setSidebarOpen] = useState(false); // Controls mobile sidebar visibility
  const [activeNavItem, setActiveNavItem] = useState(activeMenu || "dashboard");
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Controls desktop sidebar collapse

  // handle resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // If switching from mobile to desktop, ensure sidebar is not "open" in mobile sense
      // but desktop collapse state is preserved.
      if (!mobile) {
        setSidebarOpen(false); // Ensures mobile overlay is gone
      } else {
        // If on mobile, ensure desktop collapse state doesn't interfere
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileDropdownElement =
        document.getElementById("profile-dropdown");
      if (
        profileDropdown &&
        profileDropdownElement &&
        !profileDropdownElement.contains(event.target)
      ) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileDropdown]);

  const handleNavigation = (itemId) => {
    setActiveNavItem(itemId);
    navigate(`/${itemId}`);
    if (isMobile) {
      setSidebarOpen(false); // Close mobile sidebar after navigation
    }
  };

  const toggleMobileSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleDesktopSidebarCollapse = () =>
    setSidebarCollapsed(!sidebarCollapsed);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const navItems = NAVIGATION_MENU;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Conditional Rendering based on isMobile */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 transform
        ${
          isMobile
            ? isSidebarOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full w-64" // Mobile: Full sidebar width when open
            : sidebarCollapsed
            ? "w-16"
            : "w-64" // Desktop: Collapsed or full width
        }
        bg-white border-r border-gray-200 flex flex-col`}
      >
        {/* Company Logo & Collapse/Expand Button */}
        <div className="flex items-center h-16 border-b border-gray-200 px-4">
          <Link
            to="/dashboard"
            onClick={() => {
              if (isMobile) {
                setSidebarOpen(false); // Close mobile sidebar on logo click
              } else {
                setSidebarCollapsed(true); // Collapse desktop sidebar on logo click
              }
            }}
            className="flex items-center space-x-2 flex-grow" // flex-grow to push button to end
          >
            <div className="h-9 w-9 bg-gradient-to-b from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-gray-900 font-bold text-xl whitespace-nowrap">
                Invoice App
              </span>
            )}
          </Link>

          {/* Desktop Sidebar Collapse Toggle */}
          {!isMobile && (
            <button
              onClick={toggleDesktopSidebarCollapse}
              className="ml-auto p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavigationItem
              key={index}
              item={item}
              isActive={activeNavItem === item.id}
              onClick={handleNavigation}
              isCollapsed={sidebarCollapsed && !isMobile} // Only collapse on desktop
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-gray-900" />
            {!sidebarCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0  bg-opacity-40 z-30"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300
        ${isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"}`}
      >
        {/* Top navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-4">
            {/* Mobile Hamburger Menu Button */}
            {isMobile && (
              <button
                onClick={toggleMobileSidebar}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Open sidebar"
              >
                {isSidebarOpen ? ( // Show X when sidebar is open, hamburger when closed
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                Welcome back, {user?.name || "User"}
              </h1>
              <p className="text-sm text-gray-500 whitespace-nowrap max-sm:hidden">
                Here&apos;s your invoice overview
              </p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <ProfileDropdown
            id="profile-dropdown"
            isOpen={profileDropdown}
            onToggle={(e) => {
              e.stopPropagation();
              setProfileDropdown(!profileDropdown);
            }}
            avatar={user?.avatar || ""}
            companyName={user?.name || ""}
            email={user?.email || ""}
            onLogout={logout}
          />
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

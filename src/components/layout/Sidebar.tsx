import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  ArrowRightLeft,
  FileCheck,
  Bell,
  Activity,
  Zap,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  FileText,
  DollarSign,
  Building2,
  Phone,
  BarChart2,
  GitBranch,
  UserCog,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Headphones,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patients", label: "Patient Registry", icon: Users },
  { to: "/scheduling", label: "Scheduling", icon: Calendar },
  {
    to: "/care-plans",
    label: "Care Plans",
    icon: ClipboardList,
    roles: ["care_coordinator", "clinician", "admin"],
  },
  {
    to: "/care-gaps",
    label: "Care Gaps",
    icon: TrendingUp,
    roles: ["care_coordinator", "chw_supervisor", "admin"],
  },
  {
    to: "/referrals",
    label: "Referrals",
    icon: ArrowRightLeft,
    roles: ["care_coordinator", "admin"],
  },
  {
    to: "/consent",
    label: "Consent Management",
    icon: FileCheck,
    roles: ["care_coordinator", "admin"],
  },
  {
    to: "/reminders",
    label: "Reminders",
    icon: Bell,
    roles: ["care_coordinator", "admin"],
  },
  {
    to: "/clinical",
    label: "Clinical Data",
    icon: Activity,
    roles: ["clinician", "admin"],
  },
  {
    to: "/clinical",
    label: "CDS Alerts",
    icon: Zap,
    roles: ["clinician", "admin"],
  },
  {
    to: "/chw-visits",
    label: "CHW Field Visits",
    icon: MapPin,
    roles: ["chw_supervisor", "admin"],
  },
  {
    to: "/chw-visits",
    label: "Escalation Queue",
    icon: AlertTriangle,
    roles: ["chw_supervisor", "admin"],
  },
  {
    to: "/insurance",
    label: "Insurance & Eligibility",
    icon: ShieldCheck,
    roles: ["billing", "admin"],
  },
  {
    to: "/prior-auth",
    label: "Prior Authorization",
    icon: FileText,
    roles: ["billing", "admin"],
  },
  {
    to: "/claims",
    label: "Claims & RCM",
    icon: DollarSign,
    roles: ["billing", "admin"],
  },
  {
    to: "/providers",
    label: "Provider Directory",
    icon: Building2,
    roles: ["admin"],
  },
  {
    to: "/ai-voice",
    label: "AI Voice Outreach",
    icon: Phone,
    roles: ["admin"],
  },
  {
    to: "/ringcentral",
    label: "Human Outreach",
    icon: Headphones,
    roles: ["admin", "care_coordinator"],
  },
  { to: "/reports", label: "Reports", icon: BarChart2, roles: ["admin"] },
  {
    to: "/admin/openfn",
    label: "OpenFn Monitor",
    icon: GitBranch,
    roles: ["admin"],
  },
  { to: "/admin", label: "User Management", icon: UserCog, roles: ["admin"] },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebarCollapse, sidebarOpen } = useUIStore();

  const visible = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  // Deduplicate by 'to' path for display (CDS Alerts and Escalation Queue share paths)
  const seen = new Set<string>();
  const deduped = visible.filter((item) => {
    const key = `${item.to}-${item.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black/40 lg:hidden transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => useUIStore.getState().setSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-60"} ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b border-gray-100 flex-shrink-0">
          {sidebarCollapsed ? (
            <img
              src={logo}
              alt="RxCEI"
              className="h-8 w-8 object-contain mx-auto"
            />
          ) : (
            <img src={logo} alt="RxCEI" className="h-20 object-contain" />
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {deduped.map((item) => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                } ${sidebarCollapsed ? "justify-center" : ""}`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={toggleSidebarCollapse}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

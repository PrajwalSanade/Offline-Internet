import { Outlet, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Store, Network, Radio } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/messaging", icon: MessageSquare, label: "Messages" },
  { to: "/marketplace", icon: Store, label: "Market" },
  { to: "/network", icon: Network, label: "Network" },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-primary">
              <Radio className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none tracking-tight">Offline Internet</h1>
              <p className="text-[10px] text-muted-foreground font-mono">EMERGENCY COMMS</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="status-dot status-dot-connected" />
              <span className="text-xs text-muted-foreground font-mono">ONLINE</span>
            </div>
            <span className="text-xs font-mono bg-secondary px-2 py-1 rounded-md text-foreground">
              DEV-X1F9
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="container py-4 pb-20 md:pb-6"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Bottom Nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="fixed left-0 top-14 bottom-0 z-40 hidden w-16 flex-col items-center gap-2 border-r border-border bg-card/50 pt-4 md:flex">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg p-2 text-[10px] font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

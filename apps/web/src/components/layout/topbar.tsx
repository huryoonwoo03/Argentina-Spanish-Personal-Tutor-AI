import { Flame, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/features/dashboard/use-dashboard";
import { supabase } from "@/lib/supabase";

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { data } = useDashboard();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4 md:px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Flame className="size-4 text-primary" />
        <span>{data ? `${data.streak} day streak` : "…"}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => supabase.auth.signOut()}
          aria-label="Sign out"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}

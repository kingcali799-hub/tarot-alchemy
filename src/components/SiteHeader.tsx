import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

const navLinkClass =
  "text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-gold";

export function SiteHeader() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gold/15 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-gradient-gold text-xl">☥</span>
          <span className="font-display text-lg tracking-[0.3em] text-foreground">ORACLE</span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link to="/" className={navLinkClass} activeProps={{ className: "text-gold" }} activeOptions={{ exact: true }}>
            Reading
          </Link>
          <Link to="/cards" className={navLinkClass} activeProps={{ className: "text-gold" }}>
            Cards
          </Link>
          <Link to="/spreads" className={navLinkClass} activeProps={{ className: "text-gold" }}>
            Spreads
          </Link>
          <Link to="/builder" className={navLinkClass} activeProps={{ className: "text-gold" }}>
            Builder
          </Link>
          {user ? (
            <>
              <Link to="/journal" className={navLinkClass} activeProps={{ className: "text-gold" }}>
                Journal
              </Link>
              <button onClick={signOut} className={navLinkClass}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className={navLinkClass} activeProps={{ className: "text-gold" }}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
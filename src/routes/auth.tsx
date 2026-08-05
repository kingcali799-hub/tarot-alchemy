import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Keep Your Readings | Oracle" },
      { name: "description", content: "Sign in to save your tarot readings, notes and custom spreads to your private journal." },
      { property: "og:title", content: "Sign In to Oracle" },
      { property: "og:description", content: "Keep every reading in a private journal." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/journal", replace: true });
  }, [user, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Try again.");
      return;
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-center text-3xl text-foreground">
        {mode === "signin" ? "Return to the table" : "Open your journal"}
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Readings, notes and custom spreads, kept privately for you.
      </p>

      {checkEmail ? (
        <p className="mt-8 rounded-md border border-gold/25 bg-card/60 p-5 text-center text-sm text-foreground/90">
          Check your email to confirm your account, then come back and sign in.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={google}
            className="mt-8 rounded-md border border-gold/50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-secondary"
          >
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" ? (
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Name you read under"
                maxLength={60}
                className="w-full rounded-md border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-gold/60"
              />
            ) : null}
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              maxLength={255}
              className="w-full rounded-md border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-gold/60"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-md border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-gold/60"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-[image:var(--gradient-gold)] px-4 py-3 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
            >
              {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold"
          >
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </>
      )}
    </div>
  );
}
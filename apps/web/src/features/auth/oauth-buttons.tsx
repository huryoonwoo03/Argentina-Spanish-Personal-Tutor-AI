import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

async function signInWithProvider(provider: "google" | "apple") {
  await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
}

export function OAuthButtons() {
  return (
    <div className="grid gap-2">
      <Button variant="outline" type="button" onClick={() => signInWithProvider("google")}>
        Continue with Google
      </Button>
      <Button variant="outline" type="button" onClick={() => signInWithProvider("apple")}>
        Continue with Apple
      </Button>
    </div>
  );
}

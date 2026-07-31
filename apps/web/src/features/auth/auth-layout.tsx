import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="text-xl font-semibold tracking-tight">
            Che, <span className="text-primary">Speak!</span>
          </span>
          <p className="mt-1 text-sm text-muted-foreground">
            Stop studying Spanish. Start living Argentina.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

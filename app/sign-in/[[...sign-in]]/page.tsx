import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-[var(--background)] px-4 transition-colors duration-300">
      <div className="w-full max-w-md border border-[var(--border)] bg-[var(--card)] p-8 rounded-lg shadow-xl relative overflow-hidden transition-colors duration-300">
        {/* Accent top border */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[var(--accent)]" />
        
        <div className="mb-6 text-center">
          <h2 className="font-serif-editorial text-3xl font-semibold text-[var(--foreground)]">Welcome Back</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-2 uppercase tracking-widest">Byte & Build Access Portal</p>
        </div>
        
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-none border-none bg-transparent p-0 w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)]",
              formButtonPrimary: "bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 border-none transition-all text-xs uppercase tracking-widest font-semibold h-11",
              formFieldInput: "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--accent)] focus:ring-0",
              formFieldLabel: "text-[var(--foreground)] text-xs uppercase tracking-wide",
              footerActionLink: "text-[var(--accent)] hover:underline",
              identityPreviewText: "text-[var(--foreground)]",
              formFieldInputShowPasswordButton: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              footer: "bg-transparent",
              userButtonPopoverCard: "bg-[var(--card)] border border-[var(--border)]",
            },
          }}
        />
      </div>
    </div>
  );
}

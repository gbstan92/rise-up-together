import Link from "next/link";
import { Inter } from "next/font/google";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/server/auth-actions";
import {
  Home,
  Trophy,
  FileText,
  Users,
  Inbox,
  Images,
  LogOut,
} from "lucide-react";
import "../../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const nav = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/submissions/registrations", label: "Registrations", icon: Inbox },
  { href: "/admin/media", label: "Media", icon: Images },
];

export const metadata = {
  title: { default: "Admin · Rise Up Together", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground font-sans">
        {session?.user ? (
          <div className="min-h-screen flex">
            <aside className="w-60 border-r bg-card flex flex-col">
              <div className="px-5 py-5 border-b">
                <p className="text-lg font-semibold">Rise Up Together</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <nav className="flex-1 px-2 py-3 space-y-0.5">
                {nav.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                ))}
              </nav>
              <form action={logoutAction} className="border-t p-3">
                <div className="mb-2 px-2 text-xs text-muted-foreground truncate">
                  {session.user.email}
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
            </aside>
            <main className="flex-1 bg-background">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}

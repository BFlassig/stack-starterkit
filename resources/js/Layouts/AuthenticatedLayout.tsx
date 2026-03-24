import { Button } from '@/components/ui/button';
import { dashboard, logout } from '@/lib/wayfinder/routes';
import profile from '@/lib/wayfinder/routes/profile';
import { LayoutDashboard, LogOut, User } from '@/lib/icons/lucide';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, type ReactNode, useState } from 'react';

type AuthenticatedLayoutProps = PropsWithChildren<{
    header?: ReactNode;
}>;

export default function AuthenticatedLayout({
    header,
    children,
}: AuthenticatedLayoutProps) {
    const user = usePage<PageProps>().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen">
            <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-5">
                        <Link href="/" className="font-mono text-xs font-semibold tracking-[0.18em] text-muted-foreground">
                            STACK STARTER
                        </Link>

                        <Link
                            href={dashboard.url()}
                            className="hidden items-center gap-2 text-sm font-medium text-foreground/90 transition hover:text-foreground sm:inline-flex"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            {user?.email}
                        </span>

                        <Button variant="ghost" asChild>
                            <Link href={profile.edit.url()}>
                                Profile
                            </Link>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={logout.url()} method="post" as="button">
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Link>
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="sm:hidden"
                        onClick={() => setShowingNavigationDropdown((previous) => !previous)}
                        aria-label="Toggle navigation"
                    >
                        {showingNavigationDropdown ? 'Close' : 'Menu'}
                    </Button>
                </div>

                {showingNavigationDropdown ? (
                    <div className="border-t border-border px-4 py-3 sm:hidden">
                        <div className="flex flex-col gap-2">
                            <Link href={dashboard.url()} className="text-sm font-medium">
                                Dashboard
                            </Link>
                            <Link href={profile.edit.url()} className="text-sm font-medium">
                                Profile
                            </Link>
                            <Link
                                href={logout.url()}
                                method="post"
                                as="button"
                                className="text-left text-sm font-medium"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>
                ) : null}
            </nav>

            {header ? (
                <header className="mx-auto w-full max-w-7xl px-4 pb-2 pt-8 sm:px-6 lg:px-8">
                    {header}
                </header>
            ) : null}

            <main className="mx-auto w-full max-w-7xl px-4 pb-14 pt-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}

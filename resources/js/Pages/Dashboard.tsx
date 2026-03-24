import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageHeader } from '@/components/shared/page-header';
import { StatusChip } from '@/components/shared/status-chip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ShieldCheck, Sparkles } from '@/lib/icons/lucide';
import api from '@/lib/wayfinder/routes/api';
import { Head, Link } from '@inertiajs/react';
import profile from '@/lib/wayfinder/routes/profile';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Workspace"
                    description="Inertia for internal flows, `/api/v1` for external consumers."
                    action={<StatusChip label="Session active" tone="success" />}
                />
            }
        >
            <Head title="Dashboard" />

            <div className="grid gap-6 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Starterkit is ready</CardTitle>
                        <CardDescription>
                            Auth runs through the official Laravel Inertia React setup, with versioned APIs at `/api/v1`.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/35 p-4">
                            <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                            <p className="text-sm text-muted-foreground">
                                Internal screens use Inertia Page Props without a separate fetch or axios client.
                            </p>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/35 p-4">
                            <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                            <p className="text-sm text-muted-foreground">
                                A dedicated API client for external integrations is available in
                                <code className="mx-1 rounded bg-background px-1.5 py-0.5">resources/js/lib/api</code>
                                .
                            </p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <a className="rounded-xl border border-border/60 bg-secondary/35 p-4 text-sm hover:bg-secondary/55" href="/">
                                <p className="font-semibold">Runtime board</p>
                                <p className="mt-1 text-muted-foreground">Open the home page to inspect service health and available routes.</p>
                            </a>
                            <a
                                className="rounded-xl border border-border/60 bg-secondary/35 p-4 text-sm hover:bg-secondary/55"
                                href={api.v1.health.url()}
                            >
                                <p className="font-semibold">API health endpoint</p>
                                <p className="mt-1 text-muted-foreground">{api.v1.health.url()}</p>
                            </a>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Next step</CardTitle>
                        <CardDescription>
                            Open your profile and start extending domain modules.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link
                            href={profile.edit.url()}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                        >
                            Open profile
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

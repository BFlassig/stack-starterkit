import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusChip } from '@/components/shared/status-chip';
import { fetchApiHealth } from '@/lib/api/v1';
import api from '@/lib/wayfinder/routes/api';
import { dashboard, login, register } from '@/lib/wayfinder/routes';
import { CheckCircle2, CircleAlert, CircleCheckBig, LayoutDashboard, Link2, Server, ShieldCheck, Sparkles } from '@/lib/icons/lucide';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useState } from 'react';

type OverviewItem = {
    name: string;
    ok: boolean;
    message: string;
};

type ServiceItem = OverviewItem & {
    target: string;
};

type OverviewPage = {
    label: string;
    url: string | null;
    kind: 'internal' | 'external';
    section: 'Core' | 'Data' | 'Ops' | 'Docs';
    requiresAuth: boolean;
};

type OverviewStats = {
    servicesHealthy: number;
    servicesTotal: number;
    modulesHealthy: number;
    modulesTotal: number;
    pagesAvailable: number;
    pagesTotal: number;
};

type WelcomeProps = PageProps<{
    stackOverview: {
        generatedAt: string;
        services: ServiceItem[];
        modules: OverviewItem[];
        pages: OverviewPage[];
        stats: OverviewStats;
    };
}>;

type ApiProbeState =
    | { status: 'idle' | 'loading' }
    | { status: 'ok'; message: string; checkedAt: string }
    | { status: 'error'; message: string; checkedAt: string };

export default function Welcome({ auth, stackOverview }: WelcomeProps) {
    const [apiProbe, setApiProbe] = useState<ApiProbeState>({ status: 'idle' });
    const pageSections: Array<OverviewPage['section']> = ['Core', 'Data', 'Ops', 'Docs'];

    const runApiProbe = useCallback(async () => {
        setApiProbe({ status: 'loading' });
        try {
            const response = await fetchApiHealth();
            setApiProbe({
                status: 'ok',
                message: `API responded with "${response.status}" (${response.version})`,
                checkedAt: response.timestamp,
            });
        } catch (error) {
            setApiProbe({
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown API probe error',
                checkedAt: new Date().toISOString(),
            });
        }
    }, []);

    const allHealthy = stackOverview.stats.servicesHealthy === stackOverview.stats.servicesTotal;
    const groupedPages = stackOverview.pages.reduce<Record<OverviewPage['section'], OverviewPage[]>>(
        (groups, page) => {
            groups[page.section].push(page);
            return groups;
        },
        { Core: [], Data: [], Ops: [], Docs: [] },
    );

    return (
        <>
            <Head title="Welcome" />

            <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
                <header className="flex items-center justify-between">
                    <p className="font-mono text-xs font-semibold tracking-[0.2em] text-muted-foreground">
                        LARAVEL + REACT STARTER
                    </p>

                    <div className="flex items-center gap-2">
                        {auth.user ? (
                            <Button asChild>
                                <Link href={dashboard.url()}>
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href={login.url()}>Login</Link>
                                </Button>
                                <Button asChild>
                                    <Link href={register.url()}>Register</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                <main className="mt-16 grid gap-6 md:grid-cols-2">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5 text-primary" />
                                Runtime overview
                            </CardTitle>
                            <CardDescription>Immediate status after clone and startup, powered by server checks and a browser API probe.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <StatusChip
                                    label={allHealthy ? 'System health: green' : 'System health: red'}
                                    tone={allHealthy ? 'success' : 'danger'}
                                />
                                <StatusChip
                                    label={`Services ${stackOverview.stats.servicesHealthy}/${stackOverview.stats.servicesTotal}`}
                                    tone={stackOverview.stats.servicesHealthy === stackOverview.stats.servicesTotal ? 'success' : 'danger'}
                                />
                                <StatusChip
                                    label={`Modules ${stackOverview.stats.modulesHealthy}/${stackOverview.stats.modulesTotal}`}
                                    tone={stackOverview.stats.modulesHealthy === stackOverview.stats.modulesTotal ? 'success' : 'danger'}
                                />
                                <StatusChip label={`Pages ${stackOverview.stats.pagesAvailable}/${stackOverview.stats.pagesTotal}`} />
                                <span className="text-xs text-muted-foreground">
                                    Generated: <code className="rounded bg-secondary px-1.5 py-0.5">{stackOverview.generatedAt}</code>
                                </span>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                {stackOverview.services.map((service) => (
                                    <div
                                        key={service.name}
                                        className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/35 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold">{service.name}</p>
                                            <p className="text-xs text-muted-foreground">{service.message}</p>
                                            <p className="truncate text-xs text-muted-foreground">Target: {service.target}</p>
                                        </div>
                                        {service.ok ? (
                                            <CircleCheckBig className="h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <CircleAlert className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Browser API probe
                            </CardTitle>
                            <CardDescription>
                                Checks `/api/v1/health` from this browser via the external API client.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex flex-wrap items-center gap-2">
                                {apiProbe.status === 'ok' && <StatusChip label="Probe online" tone="success" />}
                                {apiProbe.status === 'error' && <StatusChip label="Probe failed" tone="danger" />}
                                {apiProbe.status === 'loading' && <StatusChip label="Probe running" />}
                                {apiProbe.status === 'idle' && <StatusChip label="Probe idle" />}
                            </div>
                            {apiProbe.status === 'ok' || apiProbe.status === 'error' ? (
                                <>
                                    <p>{apiProbe.message}</p>
                                    <p>
                                        Last check:
                                        <code className="ml-2 rounded bg-secondary px-2 py-1 text-secondary-foreground">
                                            {apiProbe.checkedAt}
                                        </code>
                                    </p>
                                </>
                            ) : (
                                <p>Click "Probe again" to test API reachability from the current browser session.</p>
                            )}
                            <Button variant="outline" onClick={() => void runApiProbe()} disabled={apiProbe.status === 'loading'}>
                                Probe again
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Internal app flows
                            </CardTitle>
                            <CardDescription>
                                Data is delivered server-side through Inertia Page Props.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                No internal REST client is used for page flows. Controllers pass data directly into React views.
                            </p>
                            <p>
                                Health endpoint:
                                <code className="ml-2 rounded bg-secondary px-2 py-1 text-secondary-foreground">
                                    {api.v1.health.url()}
                                </code>
                            </p>
                            <p>
                                External API authentication uses Sanctum tokens (`auth:sanctum`) where endpoints require auth.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                Enabled modules
                            </CardTitle>
                            <CardDescription>Core project capabilities and their state.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {stackOverview.modules.map((module) => (
                                <div key={module.name} className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="text-sm font-medium">{module.name}</p>
                                        <p className="text-xs text-muted-foreground">{module.message}</p>
                                    </div>
                                    <StatusChip label={module.ok ? 'online' : 'offline'} tone={module.ok ? 'success' : 'danger'} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Link2 className="h-5 w-5 text-primary" />
                                Available pages and endpoints
                            </CardTitle>
                            <CardDescription>
                                Grouped by area (`Core`, `Data`, `Ops`, `Docs`). `Protected` means authentication is required, not an error.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {pageSections.map((section) => (
                                <div key={section} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">{section}</p>
                                        <StatusChip label={`${groupedPages[section].length} entries`} />
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {groupedPages[section].map((page) => (
                                            <div key={`${section}-${page.label}`} className="rounded-lg border p-3">
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{page.label}</p>
                                                    <StatusChip label={page.kind} />
                                                </div>
                                                <div className="mb-2">
                                                    <StatusChip
                                                        label={page.requiresAuth ? 'protected' : 'public'}
                                                        tone={page.requiresAuth ? 'warning' : 'success'}
                                                    />
                                                </div>
                                                {page.url ? (
                                                    <a className="mt-1 block break-all text-sm font-medium text-primary hover:underline" href={page.url}>
                                                        {page.url}
                                                    </a>
                                                ) : (
                                                    <p className="mt-1 text-sm text-muted-foreground">Not available</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}

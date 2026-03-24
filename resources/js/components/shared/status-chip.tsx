import { Activity } from '@/lib/icons/lucide';
import { cn } from '@/lib/utils/cn';

type StatusChipProps = {
    label: string;
    tone?: 'neutral' | 'success' | 'danger' | 'warning';
};

export function StatusChip({ label, tone = 'neutral' }: StatusChipProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
                tone === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : tone === 'danger'
                      ? 'border-red-200 bg-red-50 text-red-700'
                    : tone === 'warning'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-border bg-secondary text-secondary-foreground',
            )}
        >
            <Activity className="h-3.5 w-3.5" />
            {label}
        </span>
    );
}

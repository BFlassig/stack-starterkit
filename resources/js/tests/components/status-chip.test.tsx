import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusChip } from '@/components/shared/status-chip';

describe('StatusChip', () => {
    it('renders a label and success styles', () => {
        render(<StatusChip label="API online" tone="success" />);

        const chip = screen.getByText('API online');

        expect(chip).toBeInTheDocument();
        expect(chip).toHaveClass('text-emerald-700');
    });
});

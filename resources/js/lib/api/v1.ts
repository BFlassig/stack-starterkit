import api from '@/lib/wayfinder/routes/api';
import { apiRequest } from './client';

export type HealthResponse = {
    status: string;
    version: string;
    timestamp: string;
};

export async function fetchApiHealth() {
    return apiRequest<HealthResponse>(api.v1.health.url());
}

import { ValidationPipe } from '@nestjs/common';

export const realtimeGatewayOptions = {
    namespace: '/realtime',
    cors: {
        origin: '*',
    },
} as const;

export const realtimeValidationPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
});
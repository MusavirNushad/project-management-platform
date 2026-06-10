import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger(RequestLoggingMiddleware.name);

    use(req: Request, res: Response, next: NextFunction): void {
        const { method, originalUrl } = req;
        const startTime = Date.now();
        const requestId = req.get('x-request-id') ?? randomUUID();
        const ip = req.ip;
        const userAgent = req.get('user-agent') ?? 'Unknown';

        res.setHeader('x-request-id', requestId);
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const { statusCode } = res;

            const message = `Request-ID: ${requestId} - Request: ${method} ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms - IP: ${ip} - User-Agent: ${userAgent}`;


            if (statusCode >= 500) {
                this.logger.error(message);
            } else if (statusCode >= 400) {
                this.logger.warn(message);
            }
            else {
                this.logger.log(message);
            }

        });

        next();
    }
}

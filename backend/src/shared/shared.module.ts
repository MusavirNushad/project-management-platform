
import { Module } from '@nestjs/common';

// Import your IdentityModule (adjust the path based on your folder structure)
import { IdentityModule } from '../modules/identity/identity.module';

import { SocketAuthenticationService } from './infrastructure/realtime/services/socket-authentication.service';
import { RealtimeAuthenticatedGuard } from './infrastructure/realtime/guards/realtime-authenticated.guard';

@Module({
    imports: [
        IdentityModule // <-- 1. Import it here so SharedModule can resolve TOKEN_SERVICE
    ],
    providers: [
        SocketAuthenticationService,
        RealtimeAuthenticatedGuard
    ],
    exports: [
        SocketAuthenticationService,
        RealtimeAuthenticatedGuard
    ]
})
export class SharedModule { }
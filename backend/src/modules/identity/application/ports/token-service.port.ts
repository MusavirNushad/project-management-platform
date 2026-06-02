export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export type GenerateAuthTokensInput = {
    userId: string;
    email: string;
};

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

export type AuthTokenPayload = {
    userId: string;
    email: string;
};

export interface TokenServicePort {
    generateAuthTokens(input: GenerateAuthTokensInput): Promise<AuthTokens>;

    verifyAccessToken(token: string): Promise<AuthTokenPayload>;

    verifyRefreshToken(token: string): Promise<AuthTokenPayload>;
}
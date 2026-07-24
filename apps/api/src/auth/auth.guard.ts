import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface AuthedUser {
  id: number;
}

function extractUser(request: Request, jwtService: JwtService): AuthedUser | null {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  if (type !== 'Bearer' || !token) {
    return null;
  }

  try {
    const payload = jwtService.verify<{ sub: number }>(token);
    return { id: payload.sub };
  } catch {
    return null;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthedUser }>();
    const user = extractUser(request, this.jwtService);
    if (!user) {
      throw new UnauthorizedException();
    }
    request.user = user;
    return true;
  }
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthedUser }>();
    request.user = extractUser(request, this.jwtService) ?? undefined;
    return true;
  }
}

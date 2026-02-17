import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * handleRequest is called after Passport validates the JWT.
   * If there is an error or no user is found, we throw 401 Unauthorized.
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err) {
      // If Passport returned an error
      throw err;
    }

    if (!user) {
      // No valid JWT found
      throw new UnauthorizedException('Invalid or missing JWT token');
    }

    // Return the validated user payload
    return user;
  }
}

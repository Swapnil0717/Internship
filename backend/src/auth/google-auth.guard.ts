import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  // Force role and prompt dynamically
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const state = request.query.state;

    if (!state) {
      throw new Error('Role not selected');
    }

    return {
      state,                // pass role to Google
      prompt: 'select_account', // force account chooser
      accessType: 'offline',    // get refresh token
    };
  }
}

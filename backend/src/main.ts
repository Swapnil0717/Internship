import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import passport from 'passport';
import session from 'express-session';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.static(join(__dirname, '..', 'public')));

  app.use(
    session({
      secret: 'oauth-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // <--- critical for localhost
        maxAge: 1000 * 60 * 10,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
  console.log('Server running on http://localhost:3000/login.html');
}
bootstrap();

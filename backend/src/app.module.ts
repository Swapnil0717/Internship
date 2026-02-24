import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppointmentModule } from './appointment/appointment.module';

import { User } from './user/user.entity';
import { Appointment } from './appointment/appointment.entity';
import { Slot } from './slots/slot.entity';
import { SlotModule } from './slots/slots.module';

@Module({
  imports: [
    // ENV CONFIG
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // DATABASE
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT')!, 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Slot, Appointment],
        synchronize: true, // ❗ true for dev only
      }),
    }),

    // MODULES
    AuthModule,
    UserModule,
    SlotModule,
    AppointmentModule,
  ],
})
export class AppModule {}

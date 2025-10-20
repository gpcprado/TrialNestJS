// I add import jwtConstants that is contains the secret key or config.
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret, // I add this from constants.ts -
      signOptions: { expiresIn: '1h' }, // And also this signOptions for Token expiry time.
    }),
  ],
  providers: [AuthService, JwtStrategy], 
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

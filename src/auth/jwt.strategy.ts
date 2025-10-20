// I add import JwtConstants that is contains the secret key or config.
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { jwtConstants } from './constants'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    //payload contains {sub, username, role}
    // return { userId: payload.sub, username: payload.username, role: payload.role };
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}

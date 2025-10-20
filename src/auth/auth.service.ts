import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService, private jwtService: JwtService) {}
  
  async validateUser(username: string, pass: string): Promise<any> {
  const user = await this.userService.findByUsername(username);

  if (!user) {
    // Added code. If user not found, log and return null
    console.error('User not found:', username);
    return null;
  }
  // Added code "if (!user.password)". If password field is missing, log and return null
  if (!user.password) {
    console.error('User password is undefined for:', username);
    return null;
  }
  // Added code. Compare entered password with hashed password in database
  const isMatch = await bcrypt.compare(pass, user.password);
  // Added code, If passwords don't match, log and return null
  if (!isMatch) {
    console.error('Password mismatch for:', username);
    return null;
  }
  const { password, ...result } = user;
  return result;
}

  async login(user: { id: number; username: string; role: string }) {
    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // create refresh token using separate secret so you can revoke access by changing refresh secret
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret', {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    });

    // store refresh token in DB (plain text or hashed)
    // for better security, hash the refresh token before storing. Here we'll store plain for simplicity.
    await this.userService.setRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(userId: number) {
    await this.userService.setRefreshToken(userId, null);
    return { ok: true };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret');
      const user = await this.userService.findById(decoded.sub);
      if (!user) throw new UnauthorizedException('Invalid refresh token');

      // check if stored token matches
      const stored = await this.userService.findById(decoded.sub);
      const possible = await this.userService.findById(decoded.sub);

      // if we need to check stored refreshToken
      // we could call this.userService.findById(decoded.sub);
      // instead of repeated calls, use method that fetches refresh token
      const found = await this.userService.findByRefreshToken(refreshToken);
      if (!found) throw new UnauthorizedException('Invalid refresh token (not found)');

      const payload = { sub: found.id, username: found.username, role: found.role };
      const accessToken = this.jwtService.sign(payload);
      const newRefresh = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret', {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      });

      await this.userService.setRefreshToken(found.id, newRefresh);
      return { accessToken, refreshToken: newRefresh };
    } catch (err) {
      throw new UnauthorizedException('Could not refresh tokens');
    }
  }
}

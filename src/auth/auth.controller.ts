import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private usersService: UsersService) {}

    @Post('register')
    async register(@Body() body: { username: string; password: string}) {
        return this.usersService.createUser(body.username, body.password);
    }

    @Post('login')
    async login(@Body() body: { username: string; password: string }) {
        const user = await this.authService.validateUser(body.username, body.password);
        if (!user) return { error: 'Invalid credentials' };
        return this.authService.login(user);
    }
    // I Add this to protects the route using JWT strategy
    // To GET /profile endpoint
    // To returns the user payload from the JWT
      @UseGuards(AuthGuard('jwt')) 
      @Get('profile')
      getProfile(@Request() req: any) {
          return req.user; 
  }

    @Post('logout')
        async logout(@Body() body: { userId: number }) {
        return this.authService.logout(body.userId);
    }

    @Post('refresh')
    async refresh(@Body() body: { refreshToken: string }) {
        return this.authService.refreshTokens(body.refreshToken);
    }
}
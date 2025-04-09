import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dtos';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signUp(@Body() registerUserDto: RegisterUserDto) {
        return await this.authService.signUp(registerUserDto);
    }

    @Post('signin')
    async signIn(@Body() loginUserDto: LoginUserDto) {
        const user = await this.authService.validateUser(loginUserDto);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.authService.signIn(user);
    }
}

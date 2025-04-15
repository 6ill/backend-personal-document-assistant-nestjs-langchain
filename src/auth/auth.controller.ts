import { Body, Controller, Get, HttpCode, HttpStatus, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dtos';
import { JwtGuard } from './guard/jwt.guard';
import { User } from 'src/common/decorators';
import { UserSession } from 'src/common/interfaces';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signUp(@Body() registerUserDto: RegisterUserDto) {
        return await this.authService.signUp(registerUserDto);
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() loginUserDto: LoginUserDto) {
        const user = await this.authService.validateUser(loginUserDto);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.authService.signIn(user);
    }

    @Get('check')
    @UseGuards(JwtGuard)
    async check(@User() user: UserSession) {
        return {
            user
        }
    }
    
}

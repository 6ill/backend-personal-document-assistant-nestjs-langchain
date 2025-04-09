import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities';
import { Repository } from 'typeorm';
import { LoginUserDto, RegisterUserDto } from './dtos';
import * as bcrypt from 'bcrypt';
import { Payload } from 'src/common/interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService
    ) {}

    async signUp({username, fullName, password}: RegisterUserDto): Promise<Payload> {
        const existingUser = await this.usersRepository.findOne({
            where: {username}
        })
        if(existingUser) throw new ConflictException('Username already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.usersRepository.create({ username, fullName, hashedPassword });
        await this.usersRepository.save(newUser);

        return {message: 'User created successfully'};
    }

    async validateUser({username, password}: LoginUserDto): Promise<User> {
        const user = await this.usersRepository.findOneBy({username});
        if(user && await bcrypt.compare(password, user.hashedPassword)) {
            return user;
        }

        return null;
    }

    async signIn(user: User) {
        const payload = {username: user.username, sub: user.id};
        return {
            accessToken: this.jwtService.sign(payload)
        }
    }
}

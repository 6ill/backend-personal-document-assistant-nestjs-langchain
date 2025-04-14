import { Body, Controller, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatDto } from './dtos';
import { User } from 'src/common/decorators';
import { UserSession } from 'src/common/interfaces';
import { DocumentsService } from 'src/documents/documents.service';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('chats')
@UseGuards(JwtGuard)
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Post()
  async handleChat(@Body() chatDto: ChatDto, @User() user: UserSession) {
    const collection = await this.documentsService.getColletion(chatDto.documentId);
    if(collection.metadata.userId != user.userId) {
      throw new UnauthorizedException('You are not authorized to access this collection.');
    }

    const response = await this.chatsService.handleChat(chatDto, collection);
    return {
      response
    }
  }

  @Post('stream')
  async handleStreamingChat(@Body() chatDto: ChatDto, @User() user: UserSession) {
    const collection = await this.documentsService.getColletion(chatDto.documentId);
    if(collection.metadata.userId != user.userId) {
      throw new UnauthorizedException('You are not authorized to access this collection.');
    }

    return this.chatsService.handleStreamingChat(chatDto, collection);
  }
}

import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatDto } from './dtos';
import { User } from 'src/common/decorators';
import { UserSession } from 'src/common/interfaces';
import { DocumentsService } from 'src/documents/documents.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Response } from 'express';

@Controller('chats')
@UseGuards(JwtGuard)
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Get(':documentId')
  async getAllMessagesByDoc(@Param('documentId', ParseUUIDPipe) documentId: string, @User() user: UserSession) {
    const document = await this.documentsService.getDocumentById(documentId)
    if(document.user.id != user.userId) {
      throw new UnauthorizedException('Document not found!')
    }

    const messages =  await this.chatsService.getAllMessagesByDoc(documentId);
    return { messages }
  }


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
  async handleStreamingChat(@Body() chatDto: ChatDto, @User() user: UserSession, @Res() res: Response) {
    const collection = await this.documentsService.getColletion(chatDto.documentId);
    if(collection.metadata.userId != user.userId) {
      throw new UnauthorizedException('You are not authorized to access this collection.');
    }

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    try {
      for await (const chunk of this.chatsService.handleStreamingChat(chatDto, collection)) {
        res.write(chunk);
      }
      res.end();
    } catch (error) {
      return res.status(500).end('Streaming error: ' + error.message);
    }
  }
}

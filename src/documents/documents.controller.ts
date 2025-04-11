import { Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { User } from 'src/common/decorators';
import { UserSession } from 'src/common/interfaces';

@Controller('documents')
@UseGuards(JwtGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @User() user: UserSession) {
    return await this.documentsService.uploadDocument(user.userId, file)
  }

  @Get('list')
  async listDocuments(@User() user: UserSession) {
    return await this.documentsService.listDocuments(user.userId)
  }
}

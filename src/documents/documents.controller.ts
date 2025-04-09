import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @UseGuards(JwtGuard)
  async getDocuments(@Req() req) {
    return `Hello ${req.user.username}, here are your documents.`;
  }
}

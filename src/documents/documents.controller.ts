import { BadRequestException, Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/common/decorators';
import { UserSession } from 'src/common/interfaces';
import { PDFFileValidationPipe } from './validators/pdf-file.validator';
import { DocumentDto } from './dtos';

@Controller('documents')
@UseGuards(JwtGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile(PDFFileValidationPipe) file: Express.Multer.File, @User() user: UserSession) {
    if (!file) {
      throw new BadRequestException('Check if the file is a PDF and less than 20MB');
    }
    return await this.documentsService.uploadDocument(user.userId, file)
  }

  @Get('list')
  async listDocuments(@User() user: UserSession) {
    const documents = await this.documentsService.listDocuments(user.userId);
    return { documents }
  }

  @Post('delete')
  async deleteFile(@Body() {id}: DocumentDto, @User() user: UserSession){
    return await this.documentsService.deleteDocument(user.userId, id)
  }

  @Get('list-collections')
  async listCollections(@User() user: UserSession) {
    const collections = await this.documentsService.listCollections(user.userId);
    return { collections }
  }
}

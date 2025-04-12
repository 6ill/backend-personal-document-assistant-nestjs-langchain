import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doc } from 'src/database/entities';
import { ChromaClient } from 'chromadb';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doc])
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    {
      provide: 'CHROMA_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new ChromaClient({
          path: configService.get<string>('CHROMA_URL'),
        })
      }
    }
  ],
})
export class DocumentsModule {}

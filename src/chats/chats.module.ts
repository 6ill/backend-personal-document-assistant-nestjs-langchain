import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { DocumentsModule } from 'src/documents/documents.module';
import { OllamaModule } from 'src/ollama/ollama.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/database/entities';

@Module({
  imports: [
    DocumentsModule, 
    OllamaModule,
    TypeOrmModule.forFeature([Message])
  ],
  controllers: [ChatsController],
  providers: [
    ChatsService
  ],
})
export class ChatsModule {}

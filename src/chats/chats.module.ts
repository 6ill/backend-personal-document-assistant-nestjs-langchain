import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { DocumentsModule } from 'src/documents/documents.module';
import { OllamaModule } from 'src/ollama/ollama.module';

@Module({
  imports: [
    DocumentsModule, 
    OllamaModule
  ],
  controllers: [ChatsController],
  providers: [
    ChatsService
  ],
})
export class ChatsModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { DocumentsModule } from './documents/documents.module';
import { ChatsModule } from './chats/chats.module';
import { OllamaModule } from './ollama/ollama.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    AuthModule,
    DatabaseModule,
    DocumentsModule,
    ChatsModule,
    OllamaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

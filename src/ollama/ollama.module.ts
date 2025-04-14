import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { ConfigService } from '@nestjs/config';
import { ChatOllama } from '@langchain/ollama';

@Module({
  providers: [
    OllamaService,
    {
      provide: 'OLLAMA_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new ChatOllama({
          model: configService.get<string>('LLAMA_MODEL'),
          temperature:Number(configService.get('LLAMA_TEMPERATURE')),
        })
      }
    }
  ],
  exports: [OllamaService]
})
export class OllamaModule {}

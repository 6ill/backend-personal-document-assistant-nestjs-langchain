import { Injectable } from '@nestjs/common';
import { ChatDto } from './dtos';
import { DocumentsService } from 'src/documents/documents.service';
import { Collection } from 'chromadb';
import { OllamaService } from 'src/ollama/ollama.service';

@Injectable()
export class ChatsService {
    constructor(
        private readonly documentsService: DocumentsService,
        private readonly ollamaService: OllamaService
    ) {}

    async handleChat(chatDto: ChatDto, collection: Collection): Promise<string> {
        const prompt = await this.createExpandedQueryPrompt(chatDto, collection);
        const finalAnswer = await this.ollamaService.generateResponse(prompt);
        
        return finalAnswer;
    }

    async *handleStreamingChat(chatDto: ChatDto, collection: Collection): AsyncGenerator<string> {
        const prompt = await this.createExpandedQueryPrompt(chatDto, collection);
  
        for await (const chunk of this.ollamaService.generateStreamingResponse(prompt)) {
            yield chunk;
        }
    }

    private async createExpandedQueryPrompt(chatDto: ChatDto, collection: Collection): Promise<string> {
        const expandedQueries = await this.ollamaService.generateQueryExpansions(chatDto.query, 2);
        let aggregatedResults = [];
        for (const query of expandedQueries) {
            const relevantDocs = await this.documentsService.queryRelevantDocuments(query, collection);
            aggregatedResults = aggregatedResults.concat(relevantDocs);
        }
        const context = aggregatedResults.join('\n');
        const finalPrompt = `Given the following document context:\n\n${context}\n\nPlease answer the question: "${chatDto.query}"`;

        return finalPrompt;
    }
}

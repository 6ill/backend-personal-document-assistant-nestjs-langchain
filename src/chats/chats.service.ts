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
        const expandedQueries = await this.ollamaService.generateQueryExpansions(chatDto.query, 2);
        let aggregatedResults = [];
        for (const query of expandedQueries) {
            const relevantDocs = await this.documentsService.queryRelevantDocuments(query, collection);
            aggregatedResults = aggregatedResults.concat(relevantDocs);
        }
        const context = aggregatedResults.join('\n');
        const finalPrompt = `Given the following document context:\n\n${context}\n\nPlease answer the question: "${chatDto.query}"`;
  
        // Step 4: Get the final answer from the LLM (using Ollama, or through a dedicated LLM service).
        const finalAnswer = await this.ollamaService.generateResponse(finalPrompt);
        
        return finalAnswer;
    }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChatDto } from './dtos';
import { DocumentsService } from 'src/documents/documents.service';
import { Collection } from 'chromadb';
import { OllamaService } from 'src/ollama/ollama.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from 'src/database/entities';
import { MessageRole } from 'src/common/enums';

@Injectable()
export class ChatsService {
    constructor(
        private readonly documentsService: DocumentsService,
        private readonly ollamaService: OllamaService,
        @InjectRepository(Message)
        private readonly messagesRepository: Repository<Message>
    ) {}

    async getAllMessagesByDoc(documentId: string): Promise<Message[]> {
        return await this.messagesRepository.find({
            where: {
                doc: { id: documentId }
            },
            select: {content: true, creator:true}
        });
    }

    async handleChat(chatDto: ChatDto, collection: Collection): Promise<string> {
        const prompt = await this.createExpandedQueryPrompt(chatDto, collection);
        const finalAnswer = await this.ollamaService.generateResponse(prompt);
        await this.createMessages(chatDto.documentId, chatDto.query, finalAnswer);
        
        return finalAnswer;
    }

    async *handleStreamingChat(chatDto: ChatDto, collection: Collection): AsyncGenerator<string> {
        const prompt = await this.createExpandedQueryPrompt(chatDto, collection);
        let finalAnswer = '';
        for await (const chunk of this.ollamaService.generateStreamingResponse(prompt)) {
            finalAnswer += chunk;
            yield chunk;
        }

        await this.createMessages(chatDto.documentId, chatDto.query, finalAnswer);
    }

    private async createMessages(documentId:string, userQuery: string, botAnswer:string): Promise<void>{
        try {
            const userMessage = this.messagesRepository.create({
                creator: MessageRole.USER,
                content: userQuery,
                doc: { id: documentId }
            })
    
            const botMessage = this.messagesRepository.create({
                creator: MessageRole.BOT,
                content: botAnswer,
                doc: { id: documentId }
            })
            await this.messagesRepository.save([userMessage, botMessage])
        } catch (error) {
            throw new InternalServerErrorException('Unexpected error unable to create message: ', error.message)
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

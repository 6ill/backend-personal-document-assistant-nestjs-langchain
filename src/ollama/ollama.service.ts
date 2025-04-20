import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOllama } from '@langchain/ollama';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class OllamaService {
    constructor(
        @Inject('OLLAMA_CLIENT')
        private readonly ollamaClient: ChatOllama
    ) {}

    async generateQueryExpansions(query: string, count: number): Promise<string[]> {
        try {
            
            const prompt = ChatPromptTemplate.fromMessages([
                ["system", "Generate {count} diverse variations of the following query for better search retrieval from user query. And each variation is separated by new line or \n. Please you just generate the variations without any other text."],
                ["human", "{query}"]
            ])
            const chain = prompt.pipe(this.ollamaClient);
            const response = await chain.invoke({
                count,
                query
            });
            const expandedQueryText = response.content as string;
            return expandedQueryText.split('\n').map(s => s.trim()).filter(Boolean).slice(0, count);
        } catch (error) {
            throw new InternalServerErrorException(
                `Error generating query expansions: ${error.message}`,
            );
        }
    }

    async generateResponse(prompt: string): Promise<string> {
        try {
            const response = await this.ollamaClient.invoke(prompt);
            return response.content as string;
        } catch (error) {
            throw new InternalServerErrorException('Error processing response: ' + error.message);
        }
    }

    async *generateStreamingResponse(prompt: string): AsyncGenerator<string> {
        try {
            const response = await this.ollamaClient.stream(prompt);
            for await (const chunk of response) {
                yield chunk.content as string;
            }
        } catch (error) {
            throw new InternalServerErrorException('Error processing response: ' + error.message);
        }
    }
}

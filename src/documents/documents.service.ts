import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doc } from 'src/database/entities';
import { Repository } from 'typeorm';
import * as pdfParse from 'pdf-parse'
import { Payload } from 'src/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { ChromaClient, Collection, DefaultEmbeddingFunction, IncludeEnum } from 'chromadb';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { CollectionMetadata } from './interfaces';

@Injectable()
export class DocumentsService {

    constructor(
        @InjectRepository(Doc)
        private readonly documentsRepository: Repository<Doc>,
        private readonly configService: ConfigService,
        @Inject('CHROMA_CLIENT')
        private readonly chromaClient: ChromaClient
    ) {}

    private async canUserUpload(userId: string): Promise<boolean> {
        const count = await this.documentsRepository.count({
            where: {
                user: {
                    id: userId
                }
            }
        })

        return count < 3;
    }

    async getDocumentById(documentId:string): Promise<Doc> {
        return await this.documentsRepository.findOne({
            where: {
                id: documentId
            },
            relations: {
                user: true
            }
        });
    }

    async uploadDocument(userId: string, file: Express.Multer.File): Promise<Payload> {
        const canUpload = await this.canUserUpload(userId);
        if (!canUpload) {
            throw new BadRequestException('User has reached the maximum number of uploads.');
        }
        let extractedText: string = '';
        const fileType = file.mimetype;
    
        try {
            const data = await pdfParse(file.buffer);
            extractedText = data.text;
        } catch (error) {
            throw new BadRequestException('Error processing PDF document.');
        }
        
        // Create new document record
        const doc = this.documentsRepository.create({
            filename: file.originalname,
            fileType,
            user: {id: userId}
        });
        
        const savedDoc = await this.documentsRepository.save(doc);

        await this.processDocument(userId, savedDoc.id, extractedText);
        return { message: 'Document uploaded and procenpssed successfully'};
    }

    async listDocuments(userId: string): Promise<Doc[]> {
        return await this.documentsRepository.findBy({
            user: {
                id: userId
            }
        })
    }

    async deleteDocument(userId:string, documentId:string) {
        const doc = await this.documentsRepository.findOneBy({
            id: documentId,
            user: {
                id: userId
            }
        })

        if (!doc) {
            throw new BadRequestException('Document not found.');
        }

        await this.documentsRepository.delete(doc.id);
        try {
            await this.chromaClient.deleteCollection({name: documentId});
        } catch (error) {
            throw new InternalServerErrorException('Error deleting the collection. Maybe it does not exist.');
        }

        return { message: 'Document deleted successfully'}
    }

    async queryRelevantDocuments(query: string, collection: Collection) {
        const results = await collection.query({
            queryTexts: query,
            nResults:3,
        });
        // const results = await collection.get({limit:10})
        return results.documents;
    }

    async getColletion(documentId:string): Promise<Collection> {
        try {
            return await this.chromaClient.getCollection({name: documentId});
        } catch (error) {
            throw new BadRequestException('Document not found');
        }
    }

    private async processDocument(userId: string, documentId: string, extractedText: string) {
        const chunks = await this.splitTextIntoChunks(extractedText);

        const chunkIds = chunks.map((_, index) => `chunk_${index}`);
       
        const collection = await this.createCollection(userId, documentId);
        await this.addEmbeddingsToCollection(collection, chunks, chunkIds);
    }

    private async createCollection(userId: string, documentId:string): Promise<Collection> {
        try {
            return await this.chromaClient.createCollection({
                name:documentId,
                embeddingFunction: new DefaultEmbeddingFunction(),
                metadata: {
                    userId,
                    documentId
                }   
            })
        } catch (error) {
            throw new InternalServerErrorException('Server error!');
        }
    }

    async listCollections(userId:string): Promise<Collection[]> {
        const allCollections = await this.chromaClient.listCollectionsAndMetadata();
        const userCollections = allCollections.filter((collection) => {
            return collection.metadata.userId == userId;
        });
        return userCollections as Collection[];
    }

    private async addEmbeddingsToCollection(
        collection: Collection,
        texts: string[],
        ids: string[]
    ): Promise<void> {
        try {
            await collection.add({
                ids: ids,
                documents: texts, 
            });
        } catch (error) {
            throw new InternalServerErrorException('Error adding embeddings to the collection.');
        }
      }

    private async splitTextIntoChunks(text: string): Promise<string[]> {
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,       
          chunkOverlap: 200,     
        });
      
        const chunks = await splitter.splitText(text);
        return chunks;
    }
}

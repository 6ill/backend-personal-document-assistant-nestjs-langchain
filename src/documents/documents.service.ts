import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doc } from 'src/database/entities';
import { Repository } from 'typeorm';
import * as pdfParse from 'pdf-parse'
import { Payload } from 'src/common/interfaces';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(Doc)
        private readonly documentsRepository: Repository<Doc>,
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

    async uploadDocument(userId: string, file: Express.Multer.File): Promise<Payload> {
        const canUpload = await this.canUserUpload(userId);
        if (!canUpload) {
            throw new BadRequestException('User has reached the maximum number of uploads.');
        }

        let extractedText: string = '';
        const fileType = file.mimetype;

        if (fileType === 'application/pdf') {
            try {
                const data = await pdfParse(file.buffer);
                extractedText = data.text;
            } catch (error) {
                throw new BadRequestException('Error processing PDF document.');
            }
        } else {
            extractedText = 'Text extraction for this file type is not yet implemented.';
        }
        
        // Create new document record
        const doc = this.documentsRepository.create({
            filename: file.originalname,
            fileType,
            fileContent: file.buffer, // if needed
            extractedText,
            user: {id: userId}
        });
        
        await this.documentsRepository.save(doc);
        
        return { message: 'Document uploaded and processed successfully'};
    }

    async listDocuments(userId: string): Promise<Doc[]> {
        return await this.documentsRepository.findBy({
            user: {
                id: userId
            }
        })
    }
}

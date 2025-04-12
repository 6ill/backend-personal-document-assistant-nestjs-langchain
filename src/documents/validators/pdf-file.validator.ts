
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class PDFFileValidationPipe implements PipeTransform {
    transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
        // "value" is an object containing the file's attributes and metadata
        const maxSize= 20 * 1024 * 1024; // 20 MB
        const allowedMimeTypes = ['application/pdf'];
        const isAllowed = value.size <= maxSize && allowedMimeTypes.includes(value.mimetype)
        return isAllowed ? value : null;
    }
}

import { IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";

export class ChatDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    documentId:string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(600)
    query:string;
}
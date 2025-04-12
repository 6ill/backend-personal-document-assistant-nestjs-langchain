import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class DocumentDto {
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    id:string;
}
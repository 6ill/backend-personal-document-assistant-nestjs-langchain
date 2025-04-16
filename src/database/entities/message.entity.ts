import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Doc } from "./document.entity";
import { MessageRole } from "src/common/enums";

@Entity({name: 'messages'})
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Doc, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'doc_id'})
    doc: Doc;

    @Column()
    content: string;

    @Column({
        type: 'enum',
        enum: MessageRole
    })
    creator: MessageRole;

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;   
}
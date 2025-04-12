import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({name: 'documents'})
export class Doc {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filename: string;

    @Column({name: 'file_type'})
    fileType: string;   

    @CreateDateColumn({name: 'uploaded_at'})
    uploadedAt: Date;

    @ManyToOne(() => User, (user) => user.docs, {onDelete: 'CASCADE'})
    user: User;
}
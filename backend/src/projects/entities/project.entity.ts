import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity({name: 'projects'})
export class Project {
    @ObjectIdColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    configuration: any;
}

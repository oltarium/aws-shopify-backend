
import {
    Entity, ManyToOne, PrimaryKey,
    Property,
} from '@mikro-orm/core';

@Entity({ tableName: 'users' })
export class UserEntity {
    @PrimaryKey()
    id: number;

    @Property({ name: 'name' })
    name : string;

    @Property({ name: 'username' })
    username : string;

    @Property({ name: 'password' })
    password : string;

    constructor(
        username: string,
        password: string,
        name: string,
    ) {
        this.username = username;
        this.password = password;
        this.name = name;
    }
}

import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {User} from '../models';
import {InjectRepository} from "@mikro-orm/nestjs";
import {EntityRepository} from "@mikro-orm/core";
import {UserEntity} from "../user.entity";
import {CartService} from "../../cart";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: EntityRepository<UserEntity>,
        private readonly cardService: CartService,
    ) {
    }

    async login(username: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({username, password});
        if (!user) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }
        let cardId;
        try {
            const card = await this.cardService.getCard(`${user.id}`as any as number);
            cardId = card.id;
        } catch (e) {
            cardId = await this.cardService.addCard({
                user_id: user.id,
                updated_at: new Date(),
                created_at: new Date(),
            });
        }
        return {
            user,
            cardId,
        };
    }

    findOneBy(userId: number): Promise<UserEntity> {
        return this.userRepository.findOneOrFail({id: userId});
    }

    async signup(name, password, username): Promise<any> {
        const newUser = new UserEntity(username, password, name);
        const user = await this.userRepository.create(newUser);

        const a = await this.userRepository.persist(user).flush();
    }
}

import { Injectable } from "@nestjs/common";
import { UserEntity } from "src/domain/user/user.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UserRepository extends Repository<UserEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(UserEntity, dataSource.createEntityManager());
    }

    async createUser(body: Partial<UserEntity>): Promise<UserEntity> {
        const user = this.create(body);
        return await this.save(user);
    }

    async findByUuid(uuid: string): Promise<UserEntity | null> {
        return await this.findOne({
            where: { uuid },
            select: {
                email: true,
                username: true,
                uuid: true,
                role: true,
            },
        });
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return await this.findOne({
            where: { email },
            select: {
                email: true,
                username: true,
                uuid: true,
                password: true,
                role: true,
            },
        });
    }
}
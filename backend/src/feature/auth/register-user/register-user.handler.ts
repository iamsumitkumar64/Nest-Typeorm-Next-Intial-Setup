import { BadRequestException, Injectable } from "@nestjs/common";
import { UserRepository } from "src/infrastructure/repository/user.repository";
import { BcryptService } from "src/infrastructure/service/bcrypt.service";
import { JwtHelperService } from "src/infrastructure/service/jwt.service";
import { RegisterUserDto } from "./register-user.dto";

@Injectable()
export class RegisterUserHandler {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly jwtHelperService: JwtHelperService,
        private readonly bcryptService: BcryptService
    ) { }

    async handle(body: RegisterUserDto) {
        //check if already exists using this email
        const isUserExists = await this.userRepo.findByEmail(body.email);
        if (isUserExists) {
            throw new BadRequestException('User Already Exists with this Email');
        }

        //hashed password using bcrypt
        body.password = await this.bcryptService.hashPassword(body.password);

        //register user in DB
        const RegisteredUser = await this.userRepo.createUser(body);

        // generate token for accessing resources
        const token = await this.jwtHelperService.generateJwtToken(RegisteredUser);
        return {
            message: "Registered User",
            access_token: token,
            user: {
                username: RegisteredUser.username,
                email: RegisteredUser.email,
                role: RegisteredUser.role,
                uid: RegisteredUser.uuid,
            }
        }
    }
}

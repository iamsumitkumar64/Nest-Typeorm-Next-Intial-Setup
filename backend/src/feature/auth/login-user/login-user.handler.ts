import { BadRequestException, Injectable } from "@nestjs/common";
import { UserRepository } from "src/infrastructure/repository/user.repository";
import { BcryptService } from "src/infrastructure/service/bcrypt.service";
import { JwtHelperService } from "src/infrastructure/service/jwt.service";
import { LoginUserDto } from "./login-user.dto";

@Injectable()
export class LoginUserHandler {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly jwtHelperService: JwtHelperService,
        private readonly bcryptService: BcryptService
    ) { }

    async handle(body: LoginUserDto) {
        //check if already exists using this email
        const isUserExists = await this.userRepo.findByEmail(body.email);
        if (!isUserExists) {
            throw new BadRequestException('User not Exists with this Email ');
        }

        //matching password
        const isValid = await this.bcryptService.verifyPassword(body.password, isUserExists.password);
        if (!isValid) {
            throw new BadRequestException('Mismatched email or password');
        }

        const token = await this.jwtHelperService.generateJwtToken(isUserExists);
        return {
            message: "Logged In User",
            access_token: token,
            user: {
                username: isUserExists.username,
                email: isUserExists.email,
                role: isUserExists.role,
                uid: isUserExists.uuid,
            }
        }
    }
}

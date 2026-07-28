import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { UserRoleEnum } from 'src/domain/user/user.enum';

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(3)
    password: string;

    @IsEnum(UserRoleEnum)
    role: UserRoleEnum;
}
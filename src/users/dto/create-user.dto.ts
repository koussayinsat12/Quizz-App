import {IsEmail, IsNotEmpty, Matches, MinLength} from "class-validator";
import ErrorMessages from "../../utils/error.messages";
import { UserRoleEnum } from "../../enums/user-role.enum";

export class CreateUserDto {
    // username field
    @IsNotEmpty({message:ErrorMessages.usernameRequired})
    @MinLength(4,{message:ErrorMessages.invalidLengthUsername})
    username: string;
    
    // email field
    @IsNotEmpty({message:ErrorMessages.emailRequired})
    @IsEmail({}, { message:ErrorMessages.invalidEmail})
    email: string;
    
    // password field
    @IsNotEmpty({ message: ErrorMessages.passwordRequired })
    @MinLength(6, { message:ErrorMessages.invalidLengthPassword})
    @Matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{6,}$/, {
      message:ErrorMessages.invalidPassword,
    })
    password: string;

    // role field
    role?:UserRoleEnum;
}

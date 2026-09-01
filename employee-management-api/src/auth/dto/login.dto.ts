import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class RegisterDto {

    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsString()
    @IsNotEmpty()
    username: string;
}
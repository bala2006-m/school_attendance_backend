import { IsIn, IsNotEmpty, IsString, IsNumberString } from 'class-validator';
export enum Gender {
  M = 'M',
  F = 'F',
  O = 'O',
}
export class RegisterDesignationDto {

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  designation: string;


  email: string;

  @IsNumberString()
  @IsNotEmpty()
  school_id: string;


  classId: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsIn(['admin', 'staff', 'students'])
  table: string;


  name: string;


  gender: Gender;


  password: string;

}

import { TestDifficultyLevelEnum } from "../enums/test.enum";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateTestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(TestDifficultyLevelEnum, {
    message: "Notog‘ri tur(TestDifficultyLevelEnum) tanlandi",
  })
  difficulty_level?: TestDifficultyLevelEnum;

  @IsOptional()
  @IsBoolean()
  active: boolean;
}

export class UpdateTestDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(TestDifficultyLevelEnum, {
    message: "Notog‘ri tur(TestDifficultyLevelEnum) tanlandi",
  })
  difficulty_level?: TestDifficultyLevelEnum;

  @IsOptional()
  @IsBoolean()
  active: boolean;
}

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsNumber()
  test_id: number;

  @IsNotEmpty()
  @IsString()
  question: string;

  @IsOptional()
  @IsNumber()
  question_score: number;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsNumber()
  test_id: number;

  @IsOptional()
  @IsString()
  question: string;

  @IsOptional()
  @IsNumber()
  question_score: number;
}

export class CreateOptionDto {
  @IsNotEmpty()
  @IsNumber()
  question_id: number;

  @IsOptional()
  @IsString()
  option: string;

  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;
}

export class UpdateOptionDto {
  @IsOptional()
  @IsNumber()
  question_id: number;

  @IsOptional()
  @IsString()
  option: string;

  @IsOptional()
  @IsBoolean()
  isCorrect: boolean;
}

import { TestDifficultyLevelEnum } from "../enums/test.enum";
import QuestionsModel from "../test/models/questions.model";
import TestsModel from "../test/models/tests.model";
import OptionsModel from "../test/models/options.model";
import Users from "../auth/auth.model";
import UserTestAssignments from "../test/models/user_test_assignments.model";

export interface ITopic {
  id: number;
  name: string;
  description: string;
  active: boolean;
  tests?: ITest[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITest {
  id: number;
  topic_id: number;
  topic: ITopic;
  name: string;
  difficulty_level: TestDifficultyLevelEnum;
  active: boolean;
  questions?: QuestionsModel[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuestion {
  id: number;
  test_id: number;
  test?: TestsModel;
  question: string;
  question_score: number;
  options?: OptionsModel[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOptions {
  id: number;
  question_id: number;
  question?: QuestionsModel;
  option: string;
  isCorrect: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFilterTest {
  difficulty_level?: TestDifficultyLevelEnum;
}

export interface IUserTestAssign {
  id: number;
  user_id: number;
  user?: Users;
  test_id: number;
  test?: TestsModel;
  started: boolean;
  startedAt: Date;
  finished: boolean;
  finishedAt: Date;
  currentQuestionIndex: number;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  diff_time: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserAnswerAssign {
  id: number;
  user_test_id: number;
  userTest?: UserTestAssignments;
  question_id: number;
  question?: QuestionsModel;
  option_id: number;
  option?: OptionsModel;
  createdAt?: Date;
  updatedAt?: Date;
}

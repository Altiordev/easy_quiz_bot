import CoreRepo from "../core/core.repo";
import UserTestAssignments from "./models/user_test_assignments.model";
import UserAnswerAssignments from "./models/user_answer_assignments.model";
import {
  IUserAnswerAssign,
  IUserTestAssign,
} from "../interfaces/test.interface";
import OptionsModel from "./models/options.model";
import QuestionsModel from "./models/questions.model";
import testsModel from "./models/tests.model";
import {
  IGetAll,
  IGetAllResponse,
  IPaginationOptions,
} from "../interfaces/interfaces";
import AuthModel from "../auth/auth.model";
import { NotFoundError } from "../errors/errors";

export default class UserTestService {
  private repo: CoreRepo = new CoreRepo();
  private userTestAssignments = UserTestAssignments;
  private userAnswerAssignments = UserAnswerAssignments;

  public async getAnswersWithDetails(
    userTestId: number,
  ): Promise<IUserAnswerAssign[]> {
    const answers = await this.userAnswerAssignments.findAll({
      where: { user_test_id: userTestId },
      include: [{ model: QuestionsModel }, { model: OptionsModel }],
    });

    return answers as IUserAnswerAssign[];
  }

  public async startTest(
    user_id: number,
    test_id: number,
  ): Promise<IUserTestAssign> {
    // Yoki avval "bor-yo'qligini" tekshirib, agar yakunlanmagan bo'lsa, xabar berish
    return await this.repo.create({
      model: this.userTestAssignments,
      newData: {
        user_id,
        test_id,
        started: true,
        startedAt: new Date(),
      },
      // agar xohlasangiz, "where: { user_id, test_id }" bilan oldin bosilgan-bosilmaganini tekshirishingiz mumkin
    });
  }

  public async answerQuestion(
    userTestId: number,
    question_id: number,
    option_id: number,
    isFirstQuestion: boolean,
  ): Promise<void> {
    await this.repo.create({
      model: this.userAnswerAssignments,
      newData: {
        user_test_id: userTestId,
        question_id,
        option_id,
      },
    });

    const userTest = await this.repo.findByPK({
      model: this.userTestAssignments,
      id: userTestId,
    });
    if (userTest) {
      if (!isFirstQuestion) {
        userTest.currentQuestionIndex += 1;
      }
      await userTest.save();
    }
  }

  public async finishTest(userTestId: number): Promise<IUserTestAssign> {
    const userTest = await this.repo.findByPK({
      model: this.userTestAssignments,
      id: userTestId,
      include: [{ model: testsModel }],
    });
    if (!userTest) throw new NotFoundError("Test Assignment");

    const answers: IUserAnswerAssign[] =
      await this.userAnswerAssignments.findAll({
        where: { user_test_id: userTestId },
        include: [OptionsModel, QuestionsModel],
      });

    let totalScore: number = 0;
    let totalCorrectAnswers: number = 0;
    let totalWrongAnswers: number = 0;

    for (const ans of answers) {
      const questionScore: number = ans.question?.question_score || 0;
      const isCorr: boolean = ans.option?.isCorrect === true;
      if (isCorr) {
        totalScore += questionScore;
        totalCorrectAnswers += 1;
      } else {
        totalWrongAnswers += 1;
      }
    }

    userTest.score = totalScore;
    userTest.finished = true;
    userTest.finishedAt = new Date();
    userTest.correct_answers = totalCorrectAnswers;
    userTest.wrong_answers = totalWrongAnswers;

    const diffMs = userTest.finishedAt.getTime() - userTest.startedAt.getTime();
    const totalSec = Math.floor(diffMs / 1000);

    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    let timeText: string;
    if (hours > 0) {
      timeText = `${hours} soat ${minutes} daqiqa ${seconds} soniya`;
    } else if (minutes > 0) {
      timeText = `${minutes} daqiqa ${seconds} soniya`;
    } else {
      timeText = `${seconds} soniya`;
    }

    userTest.diff_time = timeText;

    await userTest.save();

    return userTest;
  }

  public async getUserFinishedTests(
    user_id: number,
    pagination: IPaginationOptions,
  ): Promise<IGetAllResponse<IUserTestAssign>> {
    const { rows, count }: IGetAll<IUserTestAssign> = await this.repo.getAll({
      model: this.userTestAssignments,
      pagination,
      where: {
        user_id,
        finished: true,
      },
      include: [{ model: testsModel }],
      order: [["finishedAt", "DESC"]],
    });

    return {
      data: rows,
      totalCount: count,
      totalPages: Math.ceil(count / pagination.limit),
      currentPage: pagination.page,
    };
  }

  public async getDetailedResult(user_test_id: number): Promise<{
    userTest: UserTestAssignments;
    answers: IUserAnswerAssign[];
  }> {
    const userTest = await this.userTestAssignments.findOne({
      where: { id: user_test_id, finished: true }, // finished bo'lishi ham mumkin
      include: [{ model: testsModel }, { model: AuthModel }], // test: { name, ... }
    });
    if (!userTest) {
      throw new NotFoundError("Ushbu test topilmadi yoki tugallanmagan!");
    }

    const answers = await this.userAnswerAssignments.findAll({
      where: { user_test_id },
      include: [QuestionsModel, OptionsModel],
    });

    return {
      userTest,
      answers,
    };
  }
}

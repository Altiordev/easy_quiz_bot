import TestsModel from "./models/tests.model";
import QuestionsModel from "./models/questions.model";
import OptionsModel from "./models/options.model";
import CoreRepo from "../core/core.repo";
import {
  IFilterTest,
  IOptions,
  IQuestion,
  ITest,
} from "../interfaces/test.interface";
import { ErrorMessage } from "../enums/error-message.enum";
import {
  IGetAll,
  IGetAllResponse,
  IPaginationOptions,
} from "../interfaces/interfaces";
import { Sequelize } from "sequelize-typescript";
// import { Sequelize } from "sequelize-typescript";

const getIncludeOptions = (isAdmin?: boolean) => {
  return [
    {
      model: OptionsModel,
      attributes: {
        exclude: isAdmin ? [] : ["isCorrect", "createdAt", "updatedAt"],
      },
    },
  ];
};

export default class TestService {
  private testModel = TestsModel;
  private questionModel = QuestionsModel;
  private optionModel = OptionsModel;
  private repo: CoreRepo = new CoreRepo();

  public async getTests(
    filter: IFilterTest,
    pagination: IPaginationOptions,
    isAdmin: boolean,
  ): Promise<IGetAllResponse<ITest>> {
    const { rows, count }: IGetAll<ITest> = await this.repo.getAll({
      model: this.testModel,
      pagination,
      include: [
        {
          model: this.questionModel,
        },
      ],
      order: [[`createdAt`, "ASC"]],
    });

    return {
      data: rows,
      totalCount: count,
      totalPages: Math.ceil(count / pagination.limit),
      currentPage: pagination.page,
    };
  }

  public async getTestsForBot(
    pagination: IPaginationOptions,
  ): Promise<IGetAllResponse<ITest>> {
    const { rows, count }: IGetAll<ITest> = await this.repo.getAll({
      model: this.testModel,
      where: {
        active: true,
      },
      pagination,
      include: [
        {
          model: this.questionModel,
        },
      ],
      order: [[`createdAt`, "ASC"]],
    });

    return {
      data: rows,
      totalCount: count,
      totalPages: Math.ceil(count / pagination.limit),
      currentPage: pagination.page,
    };
  }

  public async getTestById(test_id: number): Promise<ITest | null> {
    return await this.repo.findByPK({
      model: this.testModel,
      id: test_id,
      include: [
        {
          model: this.questionModel,
          as: "questions",
          include: getIncludeOptions(true),
        },
      ],
      order: [
        [{ model: QuestionsModel, as: "questions" }, "createdAt", "DESC"],
        [
          { model: QuestionsModel, as: "questions" },
          { model: OptionsModel, as: "options" },
          "createdAt",
          "DESC",
        ],
      ],
    });
  }

  public async createTest(data: Partial<ITest>): Promise<ITest> {
    return await this.repo.create({
      model: this.testModel,
      newData: data,
      where: {
        name: data.name,
      },
      existInstanceErrorMsg: ErrorMessage.TestAlreadyExists,
    });
  }

  public async updateTest(
    test_id: number,
    updateData: Partial<ITest>,
  ): Promise<void> {
    await this.repo.update({
      model: this.testModel,
      updateData,
      where: {
        id: test_id,
      },
      checkWhere: {
        name: updateData.name,
      },
    });
  }

  public async deleteTest(test_id: number): Promise<void> {
    await this.repo.delete({
      model: this.testModel,
      where: {
        id: test_id,
      },
    });
  }

  public async getQuestionsByTestId(
    test_id: number,
    isAdmin: boolean = false,
  ): Promise<IQuestion[]> {
    return await this.repo.getAllNoPagination({
      model: this.questionModel,
      include: getIncludeOptions(isAdmin),
      where: {
        test_id,
      },
      order: [
        [{ model: OptionsModel, as: "options" }, "createdAt", "DESC"],
        [`createdAt`, "DESC"],
      ],
    });
  }

  public async createQuestion(data: Partial<IQuestion>): Promise<IQuestion> {
    return await this.repo.create({
      model: this.questionModel,
      newData: data,
    });
  }

  public async updateQuestion(
    question_id: number,
    updateData: Partial<IQuestion>,
  ): Promise<void> {
    await this.repo.update({
      model: this.questionModel,
      updateData,
      where: {
        id: question_id,
      },
    });
  }

  public async deleteQuestion(question_id: number): Promise<void> {
    await this.repo.delete({
      model: this.questionModel,
      where: {
        id: question_id,
      },
    });
  }

  public async createOption(data: Partial<IOptions>): Promise<IOptions> {
    return await this.repo.create({
      model: this.optionModel,
      newData: { ...data },
    });
  }

  public async updateOption(
    option_model: number,
    updateData: Partial<IOptions>,
  ): Promise<void> {
    await this.repo.update({
      model: this.optionModel,
      updateData,
      where: {
        id: option_model,
      },
    });
  }

  public async deleteOption(option_model: number): Promise<void> {
    await this.repo.delete({
      model: this.optionModel,
      where: {
        id: option_model,
      },
    });
  }
}

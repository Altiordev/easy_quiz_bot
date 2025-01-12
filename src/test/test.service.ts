import TestsModel from "./models/tests.model";
import QuestionsModel from "./models/questions.model";
import OptionsModel from "./models/options.model";
import CoreRepo from "../core/core.repo";
import {
  IOptions,
  IQuestion,
  ITest,
  ITopic,
} from "../interfaces/test.interface";
import { ErrorMessage } from "../enums/error-message.enum";
import {
  IGetAll,
  IGetAllResponse,
  IPaginationOptions,
} from "../interfaces/interfaces";
import TopicsModel from "./models/topics.model";

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
  private topicsModel = TopicsModel;
  private testModel = TestsModel;
  private questionModel = QuestionsModel;
  private optionModel = OptionsModel;
  private repo: CoreRepo = new CoreRepo();

  public async getTopics(
    pagination: IPaginationOptions,
  ): Promise<IGetAllResponse<ITopic>> {
    const { rows, count }: IGetAll<ITopic> = await this.repo.getAll({
      model: this.topicsModel,
      pagination,
      include: [
        {
          model: this.testModel,
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

  public async getTopicsForBot(
    pagination: IPaginationOptions,
  ): Promise<IGetAllResponse<ITopic>> {
    const { rows, count }: IGetAll<ITopic> = await this.repo.getAll({
      model: this.topicsModel,
      where: {
        active: true,
      },
      pagination,
      include: [
        {
          model: this.testModel,
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

  public async getTopicById(topic_id: number): Promise<ITopic | null> {
    return await this.repo.findByPK({
      model: this.topicsModel,
      id: topic_id,
      include: [
        {
          model: this.testModel,
          include: [{ model: this.questionModel }],
        },
      ],
      order: [[{ model: TestsModel, as: "tests" }, "createdAt", "DESC"]],
    });
  }

  public async createTopic(data: Partial<ITopic>): Promise<ITopic> {
    return await this.repo.create({
      model: this.topicsModel,
      newData: data,
      where: {
        name: data.name,
      },
      existInstanceErrorMsg: ErrorMessage.TopicAlreadyExists,
    });
  }

  public async updateTopic(
    topic_id: number,
    updateData: Partial<ITopic>,
  ): Promise<void> {
    await this.repo.update({
      model: this.topicsModel,
      updateData,
      where: {
        id: topic_id,
      },
      checkWhere: {
        name: updateData.name,
      },
    });
  }

  public async deleteTopic(topic_Id: number): Promise<void> {
    await this.repo.delete({
      model: this.topicsModel,
      where: {
        id: topic_Id,
      },
    });
  }

  public async getTests(
    pagination: IPaginationOptions,
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
    topic_id: number,
    pagination: IPaginationOptions,
  ): Promise<IGetAllResponse<ITest>> {
    const { rows, count }: IGetAll<ITest> = await this.repo.getAll({
      model: this.testModel,
      where: {
        topic_id,
        active: true,
      },
      pagination,
      include: [
        { model: this.topicsModel },
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

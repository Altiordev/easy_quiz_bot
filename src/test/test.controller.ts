import { NextFunction, Request, Response } from "express";
import TestService from "./test.service";
import { checkEnum } from "../utils/enum.util";
import { TestDifficultyLevelEnum } from "../enums/test.enum";
import {
  IFilterTest,
  IOptions,
  IQuestion,
  ITest,
} from "../interfaces/test.interface";
import { IGetAllResponse, IPaginationOptions } from "../interfaces/interfaces";
import { StatusCode } from "../enums/status-code.enum";
import { validation } from "../utils/validation.util";
import {
  CreateOptionDto,
  CreateQuestionDto,
  CreateTestDto,
  UpdateOptionDto,
  UpdateQuestionDto,
  UpdateTestDto,
} from "./test.dto";
import { BadRequestError } from "../errors/errors";

export default class TestController {
  private service: TestService = new TestService();

  public getAllTests = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { difficulty_lvl, page = 1, limit = 100 } = req.query;
      if (difficulty_lvl) {
        checkEnum(difficulty_lvl, TestDifficultyLevelEnum);
      }
      const pagination: IPaginationOptions = {
        page: +page,
        limit: +limit,
      };

      const response: IGetAllResponse<ITest> = await this.service.getTests(
        {
          difficulty_level: difficulty_lvl,
        } as IFilterTest,
        pagination,
        true,
      );

      res.status(StatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getTestById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (isNaN(Number(req.params.test_id)))
        return next(new BadRequestError("Invalid test ID"));

      const response: ITest | null = await this.service.getTestById(
        Number(req.params.test_id),
      );

      res.status(StatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createTest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await validation(CreateTestDto, req.body);

      const result: ITest = await this.service.createTest(req.body);
      res.status(StatusCode.Created).json(result);
    } catch (error) {
      next(error);
    }
  };

  public updateTest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (isNaN(Number(req.params.id))) {
        next(new BadRequestError("Invalid test ID"));
      }

      await validation(UpdateTestDto, req.body);

      const result: void = await this.service.updateTest(
        Number(req.params.id),
        req.body,
      );
      res.status(StatusCode.Ok).json(result);
    } catch (error) {
      next(error);
    }
  };

  public deleteTest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (isNaN(Number(req.params.id)))
        return next(new BadRequestError("Invalid test ID"));

      await this.service.deleteTest(Number(req.params.id));

      res.status(StatusCode.NoContent).send();
    } catch (error) {
      next(error);
    }
  };

  public getQuestionsByTestId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (isNaN(Number(req.params.test_id)))
        return next(new BadRequestError("Invalid test ID"));

      const response: IQuestion[] = await this.service.getQuestionsByTestId(
        Number(req.params.test_id),
        true,
      );

      res.status(StatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await validation(CreateQuestionDto, req.body);

      const result: IQuestion = await this.service.createQuestion(req.body);
      res.status(StatusCode.Created).json(result);
    } catch (error) {
      next(error);
    }
  };

  public updateQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (isNaN(Number(req.params.id)))
        return next(new BadRequestError("Invalid question ID"));

      await validation(UpdateQuestionDto, req.body);

      const result: void = await this.service.updateQuestion(
        Number(req.params.id),
        req.body,
      );
      res.status(StatusCode.Ok).json(result);
    } catch (error) {
      next(error);
    }
  };

  public deleteQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (isNaN(Number(req.params.id))) {
        next(new BadRequestError("Invalid question ID"));
      }

      await this.service.deleteQuestion(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  public createOption = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await validation(CreateOptionDto, req.body);

      const result: IOptions = await this.service.createOption(req.body);
      res.status(StatusCode.Created).json(result);
    } catch (error) {
      next(error);
    }
  };

  public updateOption = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (isNaN(Number(req.params.id)))
        return next(new BadRequestError("Invalid option ID"));

      await validation(UpdateOptionDto, req.body);

      const result: void = await this.service.updateOption(
        Number(req.params.id),
        req.body,
      );
      res.status(StatusCode.Ok).json(result);
    } catch (error) {
      next(error);
    }
  };

  public deleteOption = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (isNaN(Number(req.params.id)))
        return next(new BadRequestError("Invalid option ID"));

      await this.service.deleteOption(Number(req.params.id));

      res.status(StatusCode.NoContent).send();
    } catch (error) {
      next(error);
    }
  };
}

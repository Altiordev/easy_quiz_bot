/** @format */
import { Router } from "express";
import TestController from "./test.controller";
import { checkAdminMiddleware } from "../middleware/checkAdmin.middleware";

export default class TestRoute {
  public path: string = "/tests";
  public router: Router = Router();
  private controller: TestController = new TestController();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/test", checkAdminMiddleware, this.controller.getAllTests);
    this.router.get(
      "/test/:test_id",
      checkAdminMiddleware,
      this.controller.getTestById,
    );
    this.router.post("/test", checkAdminMiddleware, this.controller.createTest);
    this.router.put(
      "/test/:id",
      checkAdminMiddleware,
      this.controller.updateTest,
    );
    this.router.delete(
      "/test/:id",
      checkAdminMiddleware,
      this.controller.deleteTest,
    );

    this.router.get(
      "/question/:test_id",
      checkAdminMiddleware,
      this.controller.getQuestionsByTestId,
    );
    this.router.post(
      "/question",
      checkAdminMiddleware,
      this.controller.createQuestion,
    );
    this.router.put(
      "/question/:id",
      checkAdminMiddleware,
      this.controller.updateQuestion,
    );
    this.router.delete(
      "/question/:id",
      checkAdminMiddleware,
      this.controller.deleteQuestion,
    );

    this.router.post(
      "/option",
      checkAdminMiddleware,
      this.controller.createOption,
    );
    this.router.put(
      "/option/:id",
      checkAdminMiddleware,
      this.controller.updateOption,
    );
    this.router.delete(
      "/option/:id",
      checkAdminMiddleware,
      this.controller.deleteOption,
    );
  }
}

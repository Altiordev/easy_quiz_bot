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
    this.router.get(
      "/topic",
      checkAdminMiddleware,
      this.controller.getAllTopics,
    );
    this.router.get(
      "/topic/:topic_id",
      checkAdminMiddleware,
      this.controller.getTopicById,
    );
    this.router.post(
      "/topic",
      checkAdminMiddleware,
      this.controller.createTopic,
    );
    this.router.put(
      "/topic/:id",
      checkAdminMiddleware,
      this.controller.updateTopic,
    );
    this.router.delete(
      "/topic/:id",
      checkAdminMiddleware,
      this.controller.deleteTopic,
    );

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

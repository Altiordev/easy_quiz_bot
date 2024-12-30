/** @format */
import { Router } from "express";
import AuthController from "./auth.controller";

export default class AuthRouter {
  public path: string = "/auth";
  public router: Router = Router();
  private controller: AuthController = new AuthController();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/:chat_id", this.controller.login);
  }
}

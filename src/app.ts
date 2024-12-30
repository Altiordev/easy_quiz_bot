/** @format */
import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import bodyparser from "body-parser";
import path from "path";
import psql from "./database/sequelize";
import { BotController } from "./bot/bot.controller";
import dotenv from "dotenv";
import { IRoute } from "./interfaces/interfaces";
import TestRoute from "./test/test.route";
import { errorHandler } from "./middleware/errorHandler.middleware";
import AuthRouter from "./auth/auth.route";

dotenv.config();

const corsOptions = {
  origin: "*", // Frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

class App {
  private app: Application;
  private readonly port: number;
  private botController: BotController;
  private routes: IRoute[];

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 4040;
    this.botController = new BotController();
    this.routes = [new TestRoute(), new AuthRouter()];

    this.initDB();
    this.initMiddlewares();
    this.initRoutes();
    this.initBotWebhook();
    this.app.use(errorHandler);
    this.initServer();
  }

  private async initDB() {
    await psql();
  }

  private initMiddlewares() {
    this.app.use(bodyparser.json());
    this.app.use(cors(corsOptions));
    this.app.options("*", cors(corsOptions));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use("/public", express.static(path.join(__dirname, "public")));
  }

  private initRoutes() {
    this.routes.forEach((route: IRoute) => {
      this.app.use("/api" + route.path, route.router);
    });

    this.app.use(this.botController.getMiddleware());
  }

  private async initBotWebhook() {
    const domain: string | undefined = process.env.SERVER_URL;
    const webhookPath: string = "/telegram-webhook";
    const fullUrl: string = domain + webhookPath;

    try {
      await this.botController.bot.telegram.setWebhook(fullUrl);
      console.log("Webhook muvaffaqiyatli o‘rnatildi =>", fullUrl);
    } catch (error) {
      console.error("Webhookni sozlashda xatolik:", error);
    }
  }

  private initBotPolling() {
    this.botController.launchPolling();
  }

  private initServer() {
    this.app.listen(this.port, () => {
      console.log("===============================");
      console.log("  SERVER READY AT PORT:", this.port);
      console.log("===============================");
    });
  }
}

const app: App = new App();

/** @format */
import { Telegraf, Scenes, session } from "telegraf";
import {
  BotKeyboardTxtEnum,
  BotMsgEnum,
  BotSceneIdEnum,
  UserStatesEnum,
} from "../enums/bot.enum";
import { keyboards, inline_keyboards } from "./bot.keyboards";
import AuthService from "../auth/auth.service";
import { IUser } from "../interfaces/auth.interface";
import { createRegisterScene } from "./scenes/register.scene";
import { GlobalSceneContext } from "../interfaces/bot.interface";
import { createUpdateScene } from "./scenes/update_profile.scene";
import BotService from "./bot.service";
import TestService from "../test/test.service";
import { IGetAllResponse } from "../interfaces/interfaces";
import { ITest, ITopic, IUserTestAssign } from "../interfaces/test.interface";
import UserTestService from "../test/user-test.service";
import { createTestFlowScene } from "./scenes/test_flow.scene";
import { createGetAdminScene } from "./scenes/get_admin.scene";

export class BotController {
  public bot: Telegraf<GlobalSceneContext>;
  private readonly authService: AuthService;
  private readonly botService: BotService;
  private readonly testService: TestService;
  private readonly userTestService: UserTestService;

  constructor() {
    this.authService = new AuthService();
    this.botService = new BotService();
    this.testService = new TestService();
    this.userTestService = new UserTestService();

    this.bot = new Telegraf<GlobalSceneContext>(
      process.env.BOT_TOKEN as string,
    );

    const registerScene = createRegisterScene(
      this.authService,
      this.botService,
    );
    const updateScene = createUpdateScene(this.authService, this.botService);
    const testFlowScene = createTestFlowScene(
      this.testService,
      this.userTestService,
      this.botService,
    );
    const getAdminScene = createGetAdminScene(
      this.authService,
      this.botService,
    );

    const stage = new Scenes.Stage<GlobalSceneContext>([
      registerScene,
      updateScene,
      testFlowScene,
      getAdminScene,
    ]);

    this.bot.use(session());
    this.bot.use(stage.middleware());

    // ========== START ==========
    this.bot.start(async (ctx) => {
      const chatId: number | undefined = ctx.chat?.id;
      if (!chatId) return;

      let user: IUser | null = await this.authService.findUserByChatId(chatId);

      if (!user) {
        const username: string = ctx.from?.username || "";
        const fullName: string = `${ctx.from?.first_name || ""} ${
          ctx.from?.last_name || ""
        }`.trim();
        user = await this.authService.createUser({
          username,
          phone_number: "",
          full_name: fullName,
          chat_id: chatId,
          user_state: UserStatesEnum.START,
          active: true,
        });
      }

      if (!user.active) {
        await this.authService.updateUser(chatId, { active: true });
        user.active = true;
      }

      if (user.user_state === UserStatesEnum.UPDATE) {
        await this.botService.safeReply(ctx, BotMsgEnum.AFTER_DELETE_UPDATE);

        return ctx.scene.enter("update");
      }

      // Agar user ro‘yxatdan o‘tgan bo‘lsa
      if (user.user_state === UserStatesEnum.USER) {
        await this.botService.safeReply(ctx, BotMsgEnum.ALREADY_REGISTERED, {
          reply_markup: {
            keyboard: keyboards.main_keyboards,
            resize_keyboard: true,
          },
        });
        return;
      }

      // Aks holda start yoki register
      await this.botService.safeReply(ctx, BotMsgEnum.START, {
        reply_markup: {
          inline_keyboard: inline_keyboards.start,
        },
        remove_keyboard: true,
        parse_mode: "HTML",
      });
    });

    // ========== Ro‘yxatdan o‘tish action ==========
    this.bot.action("register", async (ctx) => {
      const chatId = ctx.chat?.id;
      if (chatId) {
        await this.authService.updateUser(chatId, {
          user_state: UserStatesEnum.REGISTER,
        });
      }
      await ctx.scene.enter(BotSceneIdEnum.REGISTER);
    });

    // ========== MAVZULAR bo‘limi ==========
    this.bot.hears(BotKeyboardTxtEnum.TOPICS, async (ctx) => {
      //@ts-ignore
      if (ctx.session.testsMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testsMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testsMessageId = undefined;
      }
      //@ts-ignore
      if (ctx.session.testMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testMessageId = undefined;
      }

      const response: IGetAllResponse<ITopic> =
        await this.testService.getTopicsForBot({ page: 1, limit: 3 });

      if (!response.data || response.data.length === 0) {
        await this.botService.safeReply(ctx, "Hozircha mavzular mavjud emas!");
        return;
      }

      //@ts-ignore
      ctx.session.topicsData = response;

      const { text, inline_keyboard } =
        this.botService.buildTopicPageHTML(response);

      // Xabar yuborib, message_id saqlash
      const sent = await this.botService.safeReply(ctx, text, {
        reply_markup: { inline_keyboard },
        parse_mode: "HTML",
      });

      if (sent) {
        //@ts-ignore
        ctx.session.topicsMessageId = sent.message_id;
      }
    });

    // ========== MAVZULAR navigatsiya ==========
    this.bot.action(/topic_nav_.+/, async (ctx) => {
      //@ts-ignore
      const oldData: IGetAllResponse<ITopic> = ctx.session.topicsData;
      if (!oldData) {
        return ctx.answerCbQuery("Mavzular topilmadi");
      }

      // callback_data: "test_nav_next", "test_nav_prev", "test_nav_page_2", ...
      const cbData = ctx.match[0];
      let newPage = oldData.currentPage;

      if (cbData.includes("next")) {
        newPage = oldData.currentPage + 1;
      } else if (cbData.includes("prev")) {
        newPage = oldData.currentPage - 1;
      } else if (cbData.includes("page_")) {
        const splitted = cbData.split("_"); // ["test", "nav", "page", "2"]
        newPage = Number(splitted[3]);
      }

      // Yangi sahifaga getTests
      const limit = 3;
      const newData = await this.testService.getTopicsForBot({
        page: newPage,
        limit,
      });

      if (!newData.data || newData.data.length === 0) {
        await ctx.answerCbQuery("Bu sahifada mavzu topilmadi!");
        return;
      }

      //@ts-ignore
      ctx.session.topicsData = newData;

      const { text, inline_keyboard } =
        this.botService.buildTopicPageHTML(newData);

      // Xabarni yangilash
      try {
        await ctx.editMessageText(text, {
          parse_mode: "HTML",
          reply_markup: { inline_keyboard },
        });
      } catch (err) {
        console.error("editMessageText error:", err);
      }

      await ctx.answerCbQuery();
    });

    // ========== MAVZUNI TANLASH ==========
    this.bot.action(/topic_id_(\d+)/, async (ctx) => {
      const callbackData: string = ctx.match[0];
      const splitted: string[] = callbackData.split("_");
      const topicId: number = Number(splitted[2]);

      //@ts-ignore
      if (ctx.session.testsMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testsMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testsMessageId = undefined;
      }

      //@ts-ignore
      if (ctx.session.topicsMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.topicsMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.topicsMessageId = undefined;
      }

      const topicData: ITopic | null =
        await this.testService.getTopicById(topicId);
      if (!topicData) {
        await this.botService.safeReply(ctx, BotMsgEnum.TOPIC_NOT_FOUND);
        return;
      }

      const testsCount: number = topicData.tests?.length || 0;
      const sent = await this.botService.safeReply(
        ctx,
        `<b>Mavzuning nomi:</b> “${topicData.name}” \n\n<b>Mavzu haqida:</b> ${topicData.description} \n\n🏁 <b><i>Mavzuga doir testlarni tanlash uchun quyidagi tugmani bosing.</i></b>`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: inline_keyboards.getTestsByTopicId(
              topicId,
              testsCount,
            ),
          },
        },
      );

      if (sent) {
        //@ts-ignore
        ctx.session.topicMessageId = sent.message_id;
      }
    });

    // ========== TESTLAR bo‘limi ==========
    this.bot.action(/(\d+)_tests/, async (ctx) => {
      const callbackData: string = ctx.match[0];
      const splitted: string[] = callbackData.split("_");
      const topicId: number = Number(splitted[0]);

      //@ts-ignore
      if (ctx.session.testsMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testsMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testsMessageId = undefined;
      }
      //@ts-ignore
      if (ctx.session.testMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testMessageId = undefined;
      }
      //@ts-ignore
      if (ctx.session.topicMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.topicMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.topicMessageId = undefined;
      }

      const response: IGetAllResponse<ITest> =
        await this.testService.getTestsForBot(topicId, { page: 1, limit: 3 });

      if (!response.data || response.data.length === 0) {
        await this.botService.safeReply(ctx, "Hozircha testlar mavjud emas!");
        return;
      }

      //@ts-ignore
      ctx.session.testsData = response;

      const { text, inline_keyboard } =
        this.botService.buildTestPageHTML(response);

      // Xabar yuborib, message_id saqlash
      const sent = await this.botService.safeReply(ctx, text, {
        reply_markup: { inline_keyboard },
        parse_mode: "HTML",
      });

      if (sent) {
        //@ts-ignore
        ctx.session.testsMessageId = sent.message_id;
      }
    });

    // ========== TESTLAR navigatsiya ==========
    this.bot.action(/test_nav_.+/, async (ctx) => {
      //@ts-ignore
      const oldData: IGetAllResponse<ITest> = ctx.session.testsData;
      if (!oldData) {
        return ctx.answerCbQuery("Testlar topilmadi");
      }

      // callback_data: "test_nav_next", "test_nav_prev", "test_nav_page_2", ...
      const cbData = ctx.match[0];
      let newPage = oldData.currentPage;

      if (cbData.includes("next")) {
        newPage = oldData.currentPage + 1;
      } else if (cbData.includes("prev")) {
        newPage = oldData.currentPage - 1;
      } else if (cbData.includes("page_")) {
        const splitted = cbData.split("_"); // ["test", "nav", "page", "2"]
        newPage = Number(splitted[3]);
      }

      // Yangi sahifaga getTests
      const limit = 3;
      const newData = await this.testService.getTestsForBot(
        oldData.data[0].topic_id,
        {
          page: newPage,
          limit,
        },
      );

      if (!newData.data || newData.data.length === 0) {
        await ctx.answerCbQuery("Bu sahifada test topilmadi!");
        return;
      }

      //@ts-ignore
      ctx.session.testsData = newData;

      const { text, inline_keyboard } =
        this.botService.buildTestPageHTML(newData);

      // Xabarni yangilash
      try {
        await ctx.editMessageText(text, {
          parse_mode: "HTML",
          reply_markup: { inline_keyboard },
        });
      } catch (err) {
        console.error("editMessageText error:", err);
      }

      await ctx.answerCbQuery();
    });

    // ========== TESTNI TANLASH ==========
    this.bot.action(/test_id_(\d+)/, async (ctx) => {
      const callbackData: string = ctx.match[0];
      const splitted: string[] = callbackData.split("_");
      const testId: number = Number(splitted[2]);

      //@ts-ignore
      if (ctx.session.testsMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testsMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testsMessageId = undefined;
      }

      const testData: ITest | null = await this.testService.getTestById(testId);
      if (!testData) {
        await this.botService.safeReply(ctx, BotMsgEnum.TEST_NOT_FOUND);
        return;
      }

      const questionCount: number = testData.questions?.length || 0;
      const sent = await this.botService.safeReply(
        ctx,
        `🎲 <b>“${testData.name}”</b> testiga tayyormisiz?\n\n🖊 ${questionCount} ta savol\n❗ <i>${testData.difficulty_level || "noma'lum"}</i> darajada\n\n🏁 Tayyor boʻlganingizda quyidagi tugmani bosing.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: inline_keyboards.start_test(testId),
          },
        },
      );

      if (sent) {
        //@ts-ignore
        ctx.session.testMessageId = sent.message_id;
      }
    });

    // ========== Testni boshlash callback ==========
    this.bot.action(/start_test_(\d+)/, async (ctx) => {
      const callbackData: string = ctx.match[0];
      const splitted: string[] = callbackData.split("_");
      const testId: number = Number(splitted[2]);

      const chatId: number | undefined = ctx.chat?.id;
      if (!chatId) return;

      const message = ctx.update.callback_query?.message;
      if (message) {
        const msgId = message.message_id;
        //@ts-ignore
        await ctx.telegram.editMessageReplyMarkup(chatId, msgId, undefined, {});
      }

      const user = await this.authService.findUserByChatId(chatId);
      if (!user) {
        await ctx.answerCbQuery(BotMsgEnum.USER_NOT_FOUND);
        return;
      }
      //@ts-ignore
      ctx.session.selectedTestId = testId; //@ts-ignore
      ctx.session.user_id = user.id;

      // 1) 3 soniyalik teskari sanoq jarayonini boshlaymiz
      // Avval bitta xabar yuborib, message_id ni olamiz
      const initialMsg = await ctx.reply(
        "⏳ <b>Tayyorlaning, test 3 soniya so‘ng boshlanadi…</b>",
        {
          parse_mode: "HTML",
          // reply_markup: {
          //   remove_keyboard: true,
          // }, mumkin emas bu yerda yoqilasligi kerak rmeove keyboard
        },
      );
      const msgId: number = initialMsg.message_id;

      // 2) 1 soniya kutish, xabarni "2 soniya qoldi" deyish
      await this.botService.delay(1000);
      await ctx.telegram.editMessageText(
        chatId,
        msgId,
        undefined,
        "⏳ <b>Tayyorlaning, test 2 soniya qoldi…</b>",
        { parse_mode: "HTML" },
      );

      // 3) yana 1 soniya kutish, "1 soniya qoldi"
      await this.botService.delay(1000);
      await ctx.telegram.editMessageText(
        chatId,
        msgId,
        undefined,
        "⏳ <b>Tayyorlaning, test 1 soniya qoldi…</b>",
        { parse_mode: "HTML" },
      );

      // 4) oxirgi 1 soniya
      await this.botService.delay(1000);
      await ctx.telegram.editMessageText(
        chatId,
        msgId,
        undefined,
        "✅ <b>Boshladik!</b>",
        { parse_mode: "HTML" },
      );

      // 5) 3 soniya tugadi -> sahnaga kirish
      await ctx.scene.enter(BotSceneIdEnum.TEST_FLOW);
    });

    // ==========  Shaxsiy natijalar  ==========
    this.bot.hears(BotKeyboardTxtEnum.RESULT, async (ctx) => {
      //@ts-ignore
      if (ctx.session.testsMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testsMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testsMessageId = undefined;
      }
      //@ts-ignore
      if (ctx.session.testMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testMessageId = undefined;
      }

      const chatId: number = ctx.chat?.id;
      if (!chatId) return;

      const user = await this.authService.findUserByChatId(chatId);
      if (!user) {
        await this.botService.safeReply(ctx, BotMsgEnum.USER_NOT_FOUND);
        return;
      }

      const response: IGetAllResponse<IUserTestAssign> =
        await this.userTestService.getUserFinishedTests(user.id, {
          page: 1,
          limit: 10,
        });

      if (!response.data || response.data.length === 0) {
        await this.botService.safeReply(
          ctx,
          "Siz hali bironta ham test yechmagansiz!",
        );
        return;
      }
      //@ts-ignore
      ctx.session.resultsData = response;

      const { text, inline_keyboard } =
        this.botService.buildResultPageHTML(response);

      await this.botService.safeReply(ctx, text, {
        reply_markup: { inline_keyboard },
        parse_mode: "HTML",
      });
    });

    // ========== Shaxsiy natijalar navigatsiya ==========
    this.bot.action(/myresults_nav_.+/, async (ctx) => {
      //@ts-ignore
      if (ctx.session.testsMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testsMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testsMessageId = undefined;
      }
      //@ts-ignore
      if (ctx.session.testMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testMessageId = undefined;
      }
      //@ts-ignore
      const oldData: IGetAllResponse<IUserTestAssign> = ctx.session.resultsData;
      if (!oldData) {
        return ctx.answerCbQuery("Shaxsiy natijalar topilmadi");
      }

      // callback_data: "test_nav_next", "test_nav_prev", "test_nav_page_2", ...
      const cbData = ctx.match[0];
      let newPage = oldData.currentPage;

      if (cbData.includes("next")) {
        newPage = oldData.currentPage + 1;
      } else if (cbData.includes("prev")) {
        newPage = oldData.currentPage - 1;
      } else if (cbData.includes("page_")) {
        const splitted = cbData.split("_"); // ["test", "nav", "page", "2"]
        newPage = Number(splitted[3]);
      }

      const limit = 10;
      const newData = await this.userTestService.getUserFinishedTests(
        oldData.data[0].user_id,
        { page: newPage, limit },
      );

      if (!newData.data || newData.data.length === 0) {
        await ctx.answerCbQuery("Bu sahifada natijalar topilmadi!");
        return;
      }
      //@ts-ignore
      ctx.session.resultsData = newData;

      const { text, inline_keyboard } =
        this.botService.buildResultPageHTML(newData);

      try {
        await ctx.editMessageText(text, {
          parse_mode: "HTML",
          reply_markup: { inline_keyboard },
        });
      } catch (err) {
        console.error("editMessageText error:", err);
      }

      await ctx.answerCbQuery();
    });

    // ========== Shaxsiy natijalar (bitta test) detali ==========
    this.bot.hears(/\/result_(\d+)/, async (ctx) => {
      //@ts-ignore
      if (ctx.session.testsMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testsMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testsMessageId = undefined;
      }
      //@ts-ignore
      if (ctx.session.testMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testMessageId = undefined;
      }

      const chatId = ctx.from?.id;
      if (!chatId) return;

      const cbData = ctx.match[0];
      const splitted = cbData.split("_");
      const userTestId = Number(splitted[1]);

      try {
        const { userTest, answers } =
          await this.userTestService.getDetailedResult(userTestId);

        if (userTest.user.chat_id != chatId) {
          await this.botService.safeReply(ctx, "Bunday test mavjud emas!");
          return;
        }

        const testName = userTest.test?.name || "Noma'lum test";
        const score = userTest.score || 0;
        const finishedAt =
          userTest.finishedAt?.toLocaleString("uz-UZ") || "...";

        // xabar matnini tuzamiz
        let text =
          `📝 <b>${testName}</b> testi.\n` +
          `📊 Natija: <b>${score} ball</b>\n` +
          `📅 Tugallangan: ${finishedAt}\n\n`;

        // Har bir javob (answers)
        for (let i = 0; i < answers.length; i++) {
          const ans = answers[i];
          const questionText =
            ans.question?.question || `Savol #${ans.question_id}`;
          const optText = ans.option?.option || "...";
          const isCorrect = ans.option?.isCorrect ? "✅ To‘g‘ri" : "❌ Xato";

          text +=
            `<b>${i + 1})</b> ${questionText}\n` +
            `   ${isCorrect}: <i>${optText}</i>\n\n`;
        }

        await this.botService.safeReply(ctx, text, { parse_mode: "HTML" });
      } catch (err) {
        console.error("detailed_result error:", err);
        if (ctx.update && "callback_query" in ctx.update) {
          await ctx.answerCbQuery(
            "Natijalar topilmadi yoki test tugallanmagan!",
          );
        } else {
          await this.botService.safeReply(
            ctx,
            "Natijalar topilmadi yoki test tugallanmagan!",
          );
        }
      }
    });

    // ========== Profil ma'lumotlarim ==========
    this.bot.hears(BotKeyboardTxtEnum.PROFILE, async (ctx) => {
      //@ts-ignore
      if (ctx.session.testsMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testsMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testsMessageId = undefined;
      }
      //@ts-ignore
      if (ctx.session.testMessageId) {
        //@ts-ignore
        await ctx.deleteMessage(ctx.session.testMessageId).catch(() => {});
        //@ts-ignore
        ctx.session.testMessageId = undefined;
      }

      const chatId = ctx.chat?.id;
      if (!chatId) return;
      const user = await this.authService.findUserByChatId(chatId);
      if (!user) {
        await this.botService.safeReply(ctx, BotMsgEnum.USER_NOT_FOUND);
        return;
      }

      const { full_name } = user;
      await this.botService.safeReply(
        ctx,
        `Sizning ma'lumotlaringiz:\n` + `Ism: ${full_name}`,
        {
          reply_markup: {
            inline_keyboard: inline_keyboards.edit_profile,
          },
        },
      );
    });

    // ========== Profilni Tahrirlash action ==========
    this.bot.action("edit_profile", async (ctx) => {
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      // user_state -> update
      await this.authService.updateUser(chatId, {
        user_state: UserStatesEnum.UPDATE,
      });

      await ctx.scene.enter(BotSceneIdEnum.UPDATE);
    });

    // ========== ADMIN HUQUQINI OLISH ==========
    this.bot.command("getadmin", async (ctx) => {
      await ctx.scene.enter(BotSceneIdEnum.GET_ADMIN);
    });

    // ========== FALLBACK HANDLER ==========
    this.bot.on("message", async (ctx) => {
      await ctx
        .deleteMessage(ctx.message.message_id)
        .catch((err) => console.error("deleteMessage error:", err));

      await this.botService.safeReply(
        ctx,
        "Noto‘g‘ri buyruq yoki matn yuborildi!",
        {
          reply_markup: {
            keyboard: keyboards.main_keyboards,
            resize_keyboard: true,
          },
        },
      );
    });
  }

  // Webhook
  public getMiddleware() {
    return this.bot.webhookCallback("/telegram-webhook");
  }
  // Polling
  public launchPolling() {
    this.bot
      .launch()
      .then(() => console.log("Telegram bot 'POLLING'da ishga tushdi!"))
      .catch((e) =>
        console.log("Telegram bot 'POLLING'da ishga tushishda xatolik: ", e),
      );
  }
}

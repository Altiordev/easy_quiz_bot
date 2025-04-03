import AuthService from "../auth/auth.service";
import { Scenes } from "telegraf";
import { IGetAllResponse } from "../interfaces/interfaces";
import { ITest, ITopic, IUserTestAssign } from "../interfaces/test.interface";
import { inline_keyboards } from "./bot.keyboards";
import escapeHtml from "../utils/escape-html.util";

export default class BotService {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public async safeReply(ctx: Scenes.WizardContext, text: string, extra?: any) {
    try {
      const escapedHtmlText:string = escapeHtml(text);
      return await ctx.reply(escapedHtmlText, extra);
    } catch (err: any) {
      if (
        err?.message?.includes("403") &&
        err?.message?.includes("bot was blocked by the user")
      ) {
        console.log("User blocked the bot, setting active=false");
        await this.authService.updateUser(ctx.chat?.id!, { active: false });
      } else {
        console.error("Xabar yuborishda xatolik:", err);
      }
    }
  }

  public buildTopicPageHTML(response: IGetAllResponse<ITopic>) {
    const { data: topics, totalCount, totalPages, currentPage } = response;

    let text: string = `<b>📚 Mavzular ro‘yxati</b>\n`;
    text += `Umumiy mavzular soni: <b>${totalCount} ta</b>\n`;
    text += `Sahifa: <b>${currentPage}</b> / <b>${totalPages}</b>\n\n`;

    const limit: number = 3;
    const startIndex: number = (currentPage - 1) * limit + 1;

    topics.forEach((topic: ITopic, idx: number) => {
      const globalIndex: number = startIndex + idx;
      text += `<b>${globalIndex}) Mavzuning nomi:</b> <i>${topic.name}</i>\n`;
      const testsCount: number = topic.tests ? topic.tests.length : 0;
      text += `<b>Testlar soni:</b> <i>${testsCount}</i>\n\n`;
    });

    text +=
      "Mavzuni <b>tartib raqamini</b> tanlang⬇️ \n" +
      "yoki boshqa sahifaga o‘ting.";

    const inline_keyboard: any[][] = [];

    const rowTopicIds: any[] = [];
    topics.forEach((topic: ITopic, idx: number) => {
      const globalIndex: number = startIndex + idx;
      rowTopicIds.push({
        text: String(globalIndex),
        callback_data: `topic_id_${topic.id}`,
      });
    });

    if (rowTopicIds.length > 0) {
      inline_keyboard.push(rowTopicIds);
    }

    const navRow: any[] = [];

    if (currentPage > 1) {
      navRow.push(inline_keyboards.topicPaginationBack);
    }

    if (currentPage < totalPages) {
      navRow.push(inline_keyboards.topicPaginationNext);
    }

    if (navRow.length > 0) {
      inline_keyboard.push(navRow);
    }

    return { text, inline_keyboard };
  }

  public buildTestPageHTML(response: IGetAllResponse<ITest>) {
    const { data: tests, totalCount, totalPages, currentPage } = response;

    let text: string = `<b>📎 Testlar ro'yxati</b>\n`;
    text += `Umumiy testlar soni: <b>${totalCount} ta</b>\n`;
    text += `Sahifa: <b>${currentPage}</b> / <b>${totalPages}</b>\n\n`;

    const limit: number = 3;
    const startIndex: number = (currentPage - 1) * limit + 1;

    tests.forEach((test: ITest, idx: number) => {
      const globalIndex: number = startIndex + idx;
      text += `<b>${globalIndex}) Testning nomi:</b> <i>${test.name}</i>\n`;
      if (test.difficulty_level) {
        text += `<b>Qiyinlik darajasi:</b> <i>${test.difficulty_level}</i>\n`;
      }
      const questionCount: number = test.questions ? test.questions.length : 0;
      text += `<b>Savollar soni:</b> <i>${questionCount}</i>\n\n`;
    });

    text +=
      "Yechmoqchi bo‘lgan testingizni <b>tartib raqamini</b> tanlang⬇️ \n" +
      "yoki boshqa sahifaga o‘ting.";

    const inline_keyboard: any[][] = [];

    const rowTestIds: any[] = [];
    tests.forEach((test: ITest, idx: number) => {
      const globalIndex: number = startIndex + idx;
      rowTestIds.push({
        text: String(globalIndex),
        callback_data: `test_id_${test.id}`,
      });
    });

    if (rowTestIds.length > 0) {
      inline_keyboard.push(rowTestIds);
    }

    const navRow: any[] = [];

    if (currentPage > 1) {
      navRow.push(inline_keyboards.testPaginationBack);
    }

    if (currentPage < totalPages) {
      navRow.push(inline_keyboards.testPaginationNext);
    }

    if (navRow.length > 0) {
      inline_keyboard.push(navRow);
    }

    return { text, inline_keyboard };
  }

  public buildResultPageHTML(response: IGetAllResponse<IUserTestAssign>) {
    const limit = 10;

    const { data, totalCount, totalPages, currentPage } = response;

    let text: string = `<b>Shaxsiy natijalar</b>\n`;
    text += `Umumiy tugallangan testlar: <b>${totalCount}</b>\n`;
    text += `Sahifa: <b>${currentPage}</b> / <b>${totalPages}</b>\n\n`;

    const startIndex: number = (currentPage - 1) * limit + 1;
    data.forEach((assign, idx) => {
      const globalIndex: number = startIndex + idx;
      const testName: string = assign.test?.name || "Noma'lum test";

      text += `${globalIndex}. <b>${testName}</b>\n`;
      text += `✅ <b>${assign.correct_answers} ta</b> · ❌ <b>${assign.wrong_answers} ta</b> \n`;
      text += `⏱️ <b>${assign.diff_time}</b> ichida yechgansiz\n`;
      text += `Batafsil: /result_${assign.id}\n\n`;
    });

    const inline_keyboard: any[][] = [];
    const navRow: any[] = [];

    if (currentPage > 1) {
      navRow.push(inline_keyboards.resultPaginationBack);
    }
    if (currentPage < totalPages) {
      navRow.push(inline_keyboards.resultPaginationNext);
    }
    if (navRow.length > 0) {
      inline_keyboard.push(navRow);
    }

    return { text, inline_keyboard };
  }

  public delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

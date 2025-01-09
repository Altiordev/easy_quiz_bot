import { Scenes } from "telegraf";
import { GlobalSceneContext } from "../../interfaces/bot.interface";
import TestService from "../../test/test.service";
import BotService from "../bot.service";
import {
  ITest,
  IQuestion,
  IUserTestAssign,
} from "../../interfaces/test.interface";
import { keyboards } from "../bot.keyboards";
import { BotSceneIdEnum } from "../../enums/bot.enum";
import UserTestService from "../../test/user-test.service";

export function createTestFlowScene(
  testService: TestService,
  userTestService: UserTestService,
  botService: BotService,
): Scenes.WizardScene<GlobalSceneContext> {
  return new Scenes.WizardScene<GlobalSceneContext>(
    BotSceneIdEnum.TEST_FLOW,

    // 1-BOSQICH: testni boshlash, DBda startTest(...),
    // session.testData=..., session.questionIndex=0, birinchi savol
    async (ctx) => {
      try {
        //@ts-ignore
        const userId = ctx.session.user_id;
        //@ts-ignore
        const testId = ctx.session.selectedTestId;

        if (!userId || !testId) {
          await botService.safeReply(
            ctx,
            "Xatolik: foydalanuvchi yoki test topilmadi",
          );
          return ctx.scene.leave();
        }

        const userTest: IUserTestAssign = await userTestService.startTest(
          userId,
          testId,
        );
        //@ts-ignore
        ctx.session.userTestId = userTest.id;

        const testData: ITest | null = await testService.getTestById(testId);
        if (
          !testData ||
          !testData.questions ||
          testData.questions.length === 0
        ) {
          await botService.safeReply(ctx, "Bu testda savollar topilmadi!");
          return ctx.scene.leave();
        }
        //@ts-ignore
        ctx.session.testData = testData;
        //@ts-ignore
        ctx.session.questionIndex = 0; // 0 => birinchi savol

        showQuestion(ctx, testData, 0, botService);

        return ctx.wizard.next();
      } catch (err) {
        console.error("Scene START error:", err);
        await botService.safeReply(ctx, "Xatolik yuz berdi!");
        return ctx.scene.leave();
      }
    },

    // 2-BOSQICH: user variant tanladi => session.questionIndex++ => keyingi savol yoki finish
    async (ctx) => {
      try {
        if ("message" in ctx.update) {
          const msgId: number = ctx.update.message.message_id;
          await ctx.deleteMessage(msgId).catch(() => {});
          await botService.safeReply(ctx, "Iltimos, variantni tanlang!");
          return;
        }

        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
          return;
        }

        const data: string = ctx.callbackQuery.data;
        if (!data.startsWith("answer_")) {
          return;
        }

        const splitted: string[] = data.split("_");
        const questionStr: string = splitted[1].replace("question", "");
        const optionStr: string = splitted[2].replace("option", "");

        const questionIndex: number = Number(questionStr);
        const chosenOptionIndex: number = Number(optionStr);
        //@ts-ignore
        const testData = ctx.session.testData;
        if (!testData || !testData.questions?.length) {
          await ctx.answerCbQuery("Savollar topilmadi!");
          return ctx.scene.leave();
        }
        //@ts-ignore
        await ctx.editMessageReplyMarkup({});

        await markUserAnswerInMessage(
          ctx,
          testData,
          questionIndex,
          chosenOptionIndex,
        );

        const questionId = testData.questions[questionIndex].id;
        const optionId =
          testData.questions[questionIndex].options[chosenOptionIndex].id;

        const isFirstQuestion: boolean = questionIndex === 0;
        //@ts-ignore
        const userTestId = ctx.session.userTestId;
        if (userTestId) {
          await userTestService.answerQuestion(
            userTestId,
            questionId,
            optionId,
            isFirstQuestion,
          );
        }
        //@ts-ignore
        ctx.session.questionIndex = (ctx.session.questionIndex || 0) + 1;
        //@ts-ignore
        const newIndex = ctx.session.questionIndex;

        if (newIndex >= testData.questions.length) {
          await finishTestScene(ctx, userTestService, botService);
          return ctx.scene.leave();
        } else {
          showQuestion(ctx, testData, newIndex, botService);
        }

        await ctx.answerCbQuery();
      } catch (err) {
        console.error("Scene PROCESS error:", err);
        await ctx.answerCbQuery("Xatolik yuz berdi!");
      }
    },
  );
}

function showQuestion(
  ctx: GlobalSceneContext,
  testData: ITest,
  questionIndex: number,
  botService: BotService,
) {
  if (questionIndex >= (testData.questions || []).length) return;

  const question: IQuestion | undefined = testData.questions?.[questionIndex];
  if (!question?.options?.length) {
    botService.safeReply(
      ctx,
      `Savol #${questionIndex + 1} variantlari topilmadi!`,
    );
    return;
  }

  const total: number = testData.questions?.length || 0;
  let text: string = `<b>[${questionIndex + 1}/${total} | ${question.question_score} ball] ${question.question}</b>`;

  const inline_keyboard: any[][] = [];
  question.options.forEach((opt, optIdx) => {
    inline_keyboard.push([
      {
        text: opt.option,
        callback_data: `answer_question${questionIndex}_option${optIdx}`,
      },
    ]);
  });

  botService.safeReply(ctx, text, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard },
  });
}

async function markUserAnswerInMessage(
  ctx: GlobalSceneContext,
  testData: ITest,
  questionIndex: number,
  chosenOptionIndex: number,
) {
  const question: IQuestion | undefined = testData.questions?.[questionIndex];
  if (!question) return;

  const total: number = testData.questions?.length || 0;

  let newText: string = `<b>[${questionIndex + 1}/${total} | ${question.question_score} ball] ${question.question}</b>\n\n`;

  (question.options || []).forEach((opt, idx) => {
    const prefix = opt.isCorrect ? "✅" : "❌";

    let suffix: string = "";
    if (idx === chosenOptionIndex) {
      suffix = " 📌";
    }

    newText += `${prefix} ${opt.option}${suffix}\n`;
  });

  await ctx.editMessageText(newText, {
    parse_mode: "HTML",
  });
}

async function finishTestScene(
  ctx: GlobalSceneContext,
  userTestService: UserTestService,
  botService: BotService,
) {
  //@ts-ignore
  const userTestId = ctx.session.userTestId;
  if (!userTestId) {
    await botService.safeReply(ctx, "Test session not found");
    return;
  }

  const finished: IUserTestAssign =
    await userTestService.finishTest(userTestId);

  const finalText: string = `
🏁 “<b>${finished.test?.name}</b>” testi yakunlandi!

Siz <b>${finished.score}</b> ball to‘pladingiz:

✅ To‘g‘ri javoblar – <b>${finished.correct_answers} ta</b>
❌ Xato javoblar – <b>${finished.wrong_answers} ta</b>
⏱️ <b>${finished.diff_time}</b> ichida yechdingiz

<i>Sizga barcha testlarda omad tilaymiz!</i>
`.trim();

  await botService.safeReply(ctx, finalText, {
    parse_mode: "HTML",
    reply_markup: {
      keyboard: keyboards.main_keyboards,
      resize_keyboard: true,
    },
  });
}

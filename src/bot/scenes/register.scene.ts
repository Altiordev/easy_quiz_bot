/** @format */
import { Scenes } from "telegraf";
import {
  BotMsgEnum,
  BotSceneIdEnum,
  UserStatesEnum,
} from "../../enums/bot.enum";
import { keyboards } from "../bot.keyboards";
import AuthService from "../../auth/auth.service";
import { GlobalSceneContext } from "../../interfaces/bot.interface";
import BotService from "../bot.service";

export function createRegisterScene(
  authService: AuthService,
  botService: BotService,
): Scenes.WizardScene<GlobalSceneContext> {
  return new Scenes.WizardScene<GlobalSceneContext>(
    BotSceneIdEnum.REGISTER,

    // 1-QADAM
    async (ctx) => {
      const chatId = ctx.chat?.id;
      if (chatId) {
        await authService.updateUser(chatId, {
          user_state: UserStatesEnum.REGISTER,
        });
      }

      await botService.safeReply(ctx, BotMsgEnum.ENTER_NUMBER, {
        reply_markup: {
          keyboard: keyboards.enter_number,
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });

      return ctx.wizard.next();
    },

    // 2-QADAM
    async (ctx) => {
      if (!ctx.message || !("contact" in ctx.message)) {
        await botService.safeReply(ctx, BotMsgEnum.BY_PRESSING_NUMBER_BUTTON);
        return;
      }

      const phoneNumber: string = ctx.message.contact?.phone_number;
      if (!phoneNumber) {
        await botService.safeReply(ctx, "Kontakt ichida raqam topilmadi");
        return;
      }

      ctx.scene.session.phone_number = phoneNumber;

      await botService.safeReply(ctx, BotMsgEnum.ENTER_NAME, {
        reply_markup: {
          remove_keyboard: true,
        },
      });
      return ctx.wizard.next();
    },

    // 3-QADAM
    async (ctx) => {
      if (!ctx.scene.session.phone_number) {
        await botService.safeReply(ctx, BotMsgEnum.SEND_FIRST_NUMBER);
        return;
      }

      if (!ctx.message || !("text" in ctx.message)) {
        await botService.safeReply(ctx, "Iltimos, matn yozing.");
        return;
      }

      const full_name: string = ctx.message.text;
      ctx.scene.session.full_name = full_name;

      try {
        const chat_id = ctx.chat?.id;
        const username = ctx.from?.username;

        if (chat_id) {
          await authService.updateUser(chat_id, {
            username,
            phone_number: ctx.scene.session.phone_number,
            full_name,
            user_state: UserStatesEnum.USER,
          });
        }

        await botService.safeReply(ctx, BotMsgEnum.SUCCESSFULLY_REGISTERED, {
          reply_markup: {
            keyboard: keyboards.main_keyboards,
            resize_keyboard: true,
            remove_keyboard: true,
          },
        });

        return ctx.scene.leave();
      } catch (error) {
        console.error("Xatolik:", error);
        await botService.safeReply(ctx, BotMsgEnum.ERROR_IN_REGISTER);
        return ctx.scene.leave();
      }
    },
  );
}

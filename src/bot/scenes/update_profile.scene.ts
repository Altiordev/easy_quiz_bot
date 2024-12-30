/** @format */
import { Scenes } from "telegraf";
import {
  BotMsgEnum,
  BotSceneIdEnum,
  UserStatesEnum,
} from "../../enums/bot.enum";
import AuthService from "../../auth/auth.service";
import { keyboards } from "../bot.keyboards";
import { GlobalSceneContext } from "../../interfaces/bot.interface";
import BotService from "../bot.service";

export function createUpdateScene(
  authService: AuthService,
  botService: BotService,
): Scenes.WizardScene<GlobalSceneContext> {
  return new Scenes.WizardScene<GlobalSceneContext>(
    BotSceneIdEnum.UPDATE,

    // 1-QADAM: Ism-familiyani so‘rash
    async (ctx) => {
      await botService.safeReply(ctx, BotMsgEnum.UPDATE_ENTER_NAME, {
        reply_markup: {
          remove_keyboard: true,
        },
      });
      return ctx.wizard.next();
    },

    // 2-QADAM: Yangi ismni qabul qilish va DB’ni update qilish
    async (ctx) => {
      if (!ctx.message || !("text" in ctx.message)) {
        await botService.safeReply(ctx, "Iltimos, matn kiriting.");
        return;
      }

      const newFullName = ctx.message.text.trim();

      if (newFullName === "/start") {
        await botService.safeReply(ctx, BotMsgEnum.AFTER_DELETE_UPDATE);
        return;
      }

      const chatId = ctx.chat?.id;
      if (!chatId) {
        await botService.safeReply(ctx, "chat id topilmadi. Xatolik!");
        return ctx.scene.leave();
      }

      try {
        // user_state -> user
        await authService.updateUser(chatId, {
          user_state: UserStatesEnum.USER,
          full_name: newFullName,
        });

        await botService.safeReply(ctx, BotMsgEnum.SUCCESSFULLY_UPDATED, {
          reply_markup: {
            keyboard: keyboards.main_keyboards,
            resize_keyboard: true,
          },
        });
      } catch (error) {
        console.error("Xatolik:", error);
        await botService.safeReply(
          ctx,
          "Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.",
        );
      }

      return ctx.scene.leave();
    },
  );
}

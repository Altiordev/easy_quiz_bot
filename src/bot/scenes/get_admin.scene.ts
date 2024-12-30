/** @format */

import { Scenes } from "telegraf";
import { GlobalSceneContext } from "../../interfaces/bot.interface";
import AuthService from "../../auth/auth.service";
import BotService from "../bot.service";
import { BotSceneIdEnum } from "../../enums/bot.enum";
import { keyboards } from "../bot.keyboards";
import dotenv from "dotenv";

dotenv.config();

export function createGetAdminScene(
  authService: AuthService,
  botService: BotService,
): Scenes.WizardScene<GlobalSceneContext> {
  return new Scenes.WizardScene<GlobalSceneContext>(
    BotSceneIdEnum.GET_ADMIN,

    // 1-BOSQICH: “Parolni kiriting”
    async (ctx) => {
      const chatId = ctx.chat?.id;
      if (chatId) {
        const user = await authService.findUserByChatId(chatId);
        if (user && user.isAdmin) {
          await botService.safeReply(ctx, "Siz allaqachon adminsiz!");
          return ctx.scene.leave();
        }
      }

      await botService.safeReply(ctx, "Admin parolini kiriting:");
      return ctx.wizard.next(); // -> 2-BOSQICH
    },

    // 2-BOSQICH: foydalanuvchi matn kiritadi, env bilan solishtiramiz
    async (ctx) => {
      //@ts-ignore
      if (!("text" in ctx.message)) {
        await botService.safeReply(
          ctx,
          "Iltimos, matn shaklida parol kiriting.",
        );
        return;
      }

      const enteredPass = ctx.message.text.trim();
      const correctPass = process.env.GET_ADMIN_PASS || "secret123"; // misol

      if (enteredPass === correctPass) {
        const chatId = ctx.chat?.id;
        if (chatId) {
          const user = await authService.findUserByChatId(chatId);
          if (user) {
            user.isAdmin = true;
            await user.save();
          }
        }

        await botService.safeReply(
          ctx,
          "Tabriklaymiz! Siz admin huquqiga ega bo‘ldingiz.",
          {
            reply_markup: {
              keyboard: keyboards.main_keyboards,
              resize_keyboard: true,
            },
          },
        );
      } else {
        await botService.safeReply(ctx, "Parol xato, admin bo‘la olmaysiz!", {
          reply_markup: {
            keyboard: keyboards.main_keyboards,
            resize_keyboard: true,
          },
        });
      }

      return ctx.scene.leave();
    },
  );
}

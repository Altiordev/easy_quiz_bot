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
          let text: string = "Siz allaqachon adminsiz!\n";
          text += `Testlarni boshqarish uchun sayt: ${process.env.DASHBOARD_URL}\n`;
          text += `Saytga kirish uchun login(chat_id): <code>${ctx.from?.id}</code>\n\n`;
          text += `-------------------\n\n`;
          text += `Вы уже являетесь администратором!\n`;
          text += `Сайт для управления тестами: ${process.env.DASHBOARD_URL}\n`;
          text += `Для входа на сайт используйте логин (chat_id): <code>${ctx.from?.id}</code>`;

          await botService.safeReply(ctx, text, { parse_mode: "HTML" });
          return ctx.scene.leave();
        }
      }

      await botService.safeReply(
        ctx,
        "Admin parolini kiriting:\n\n-------------------\n\nВведите пароль администратора:",
      );
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

        let text: string = "Tabriklaymiz! Siz admin huquqiga ega bo‘ldingiz.\n";
        text += `Testlarni boshqarish uchun sayt: ${process.env.DASHBOARD_URL}\n`;
        text += `Saytga kirish uchun login(chat_id): <code>${ctx.from?.id}</code>\n\n`;
        text += `-------------------\n\n`;
        text += `Поздравляем! Вы получили права администратора.\n`;
        text += `Сайт для управления тестами: ${process.env.DASHBOARD_URL}\n`;
        text += `Для входа на сайт используйте логин (chat_id): <code>${ctx.from?.id}</code>`;

        await botService.safeReply(ctx, text, {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: keyboards.main_keyboards,
            resize_keyboard: true,
          },
        });
      } else {
        await botService.safeReply(
          ctx,
          "Parol xato, admin bo‘la olmaysiz!\n\n-------------------\n\nНеверный пароль, вы не можете стать администратором!",
          {
            reply_markup: {
              keyboard: keyboards.main_keyboards,
              resize_keyboard: true,
            },
          },
        );
      }

      return ctx.scene.leave();
    },
  );
}

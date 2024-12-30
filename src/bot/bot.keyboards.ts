import { BotKeyboardTxtEnum } from "../enums/bot.enum";

const inline_keyboards = {
  start: [[{ text: BotKeyboardTxtEnum.REGISTER, callback_data: "register" }]],
  edit_profile: [
    [{ text: BotKeyboardTxtEnum.UPDATE, callback_data: "edit_profile" }],
  ],
  testPaginationBack: {
    text: "⬅️ Oldingi sahifa",
    callback_data: "test_nav_prev",
  },
  testPaginationNext: {
    text: "Keyingi sahifa ➡️️",
    callback_data: "test_nav_next",
  },
  resultPaginationBack: {
    text: "⬅️ Oldingi sahifa",
    callback_data: `myresults_nav_prev`,
  },
  resultPaginationNext: {
    text: "Keyingi sahifa ➡️️",
    callback_data: `myresults_nav_next`,
  },
  start_test: (test_id: number) => [
    [
      {
        text: "Testni boshlash",
        callback_data: `start_test_${test_id}`,
      },
    ],
  ],
};

const keyboards = {
  main_keyboards: [
    [BotKeyboardTxtEnum.TESTS],
    [BotKeyboardTxtEnum.RESULT],
    [BotKeyboardTxtEnum.PROFILE],
  ],
  enter_number: [
    [
      {
        text: BotKeyboardTxtEnum.SEND_NUMBER,
        request_contact: true,
      },
    ],
  ],
};

export { inline_keyboards, keyboards };

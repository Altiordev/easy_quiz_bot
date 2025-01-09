import { BotKeyboardTxtEnum } from "../enums/bot.enum";

const inline_keyboards = {
  start: [[{ text: BotKeyboardTxtEnum.REGISTER, callback_data: "register" }]],
  edit_profile: [
    [{ text: BotKeyboardTxtEnum.UPDATE, callback_data: "edit_profile" }],
  ],
  topicPaginationBack: {
    text: "⬅️ Oldingi sahifa",
    callback_data: "topic_nav_prev",
  },
  topicPaginationNext: {
    text: "Keyingi sahifa ➡️️",
    callback_data: "topic_nav_next",
  },
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
  getTestsByTopicId: (topic_id: number, testsCount: number) => [
    [
      {
        text: `📎 Testlar (${testsCount ? testsCount : 0})`,
        callback_data: `${topic_id}_tests`,
      },
    ],
  ],
};

const keyboards = {
  main_keyboards: [
    [BotKeyboardTxtEnum.TOPICS],
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

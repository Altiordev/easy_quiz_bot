export enum BotMsgEnum {
  START = "Assalomu alaykum, <b>Easy Quiz</b> botiga xush kelibsiz! \n" +
    "Botdan foydalanish uchun ro‘yhatdan o‘ting.",
  ENTER_NUMBER = "Telefon raqamingizni yuborish uchun quyidagi tugmani bosing.",
  ENTER_NAME = "Rahmat! Endi ism va familiyangizni kiriting:",
  BY_PRESSING_NUMBER_BUTTON = "Telefon raqamini tugmani bosish orqali yuboring.",
  SEND_FIRST_NUMBER = "Avval telefon raqamingizni yuboring.",
  SUCCESSFULLY_REGISTERED = "Tabriklaymiz! Siz muvaffaqiyatli ro‘yxatdan o‘tdingiz",
  ERROR_IN_REGISTER = "Ro‘yxatdan o‘tishda xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.",
  AFTER_DELETE_UPDATE = "Siz profil tahrirlash jarayonida edingiz. \n" +
    "Ismingiz va familiyangizni yangilash uchun kiriting:",
  ALREADY_REGISTERED = "Siz allaqachon ro‘yxatdan o‘tib bo‘lgansiz!",
  USER_NOT_FOUND = "Foydalanuvchi topilmadi",
  UPDATE_ENTER_NAME = "Ismingiz va familiyangizni yangilash uchun kiriting:",
  SUCCESSFULLY_UPDATED = "Profil muvaffaqiyatli yangilandi!",
  STARTING_TEST = "Test boshlandi, iltimos variantlarni tanlab javob bering...",
  TEST_NOT_FOUND = "Test topilmadi",
  TOPIC_NOT_FOUND = "Mavzu topilmadi",
}

export enum BotKeyboardTxtEnum {
  REGISTER = "Ro‘yxatdan o‘tish",
  UPDATE = "Tahrirlash",
  PROFILE = "👤 Profil ma'lumotlarim",
  RESULT = "🏆 Shaxsiy natijalar",
  TOPICS = "📚 Mavzular",
  SEND_NUMBER = "Telefon raqamini jo‘natish",
}

export enum UserStatesEnum {
  START = "start",
  REGISTER = "register",
  UPDATE = "update",
  USER = "user",
}

export enum BotSceneIdEnum {
  REGISTER = "register",
  UPDATE = "update",
  TEST_FLOW = "test_flow",
  GET_ADMIN = "get_admin",
}

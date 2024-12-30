import { UserStatesEnum } from "../enums/bot.enum";

export interface IAuthUser {
  chat_id?: number | null;
  username?: string | null;
  full_name: string;
  phone_number: string;
  active?: boolean;
  user_state: UserStatesEnum;
}

export interface IUser {
  id: number;
  username: string | null;
  chat_id: number;
  full_name: string;
  phone_number: string;
  active: boolean;
  user_state: UserStatesEnum;
}

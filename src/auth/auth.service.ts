import AuthModel from "./auth.model";
import { IAuthUser, IUser } from "../interfaces/auth.interface";
import CoreRepo from "../core/core.repo";
import { ErrorMessage } from "../enums/error-message.enum";

export default class AuthService {
  private model = AuthModel;
  private repo: CoreRepo = new CoreRepo();

  public async getUser(user_id: number): Promise<IUser | null> {
    return await this.repo.findByPK({
      model: this.model,
      id: user_id,
    });
  }

  public async createUser(data: IAuthUser): Promise<IUser> {
    return await this.repo.create({
      model: this.model,
      newData: data,
      where: {
        chat_id: data.chat_id,
      },
      existInstanceErrorMsg: ErrorMessage.UserAlreadyExists,
    });
  }

  public async updateUser(
    chat_id: number,
    updateData: Partial<IAuthUser>,
  ): Promise<void> {
    const user: IUser | null = await this.repo.findOne({
      model: this.model,
      where: {
        chat_id,
      },
      notFoundErrorMsg: ErrorMessage.UserWithChatIdNotFound,
    });

    user &&
      (await this.repo.update({
        model: this.model,
        where: {
          id: user.id,
        },
        updateData,
      }));
  }

  public async findUserByChatId(chat_id: number): Promise<AuthModel | null> {
    return await this.repo.findOne({
      model: this.model,
      where: { chat_id },
    });
  }
}

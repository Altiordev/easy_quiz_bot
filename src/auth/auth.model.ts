import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  AutoIncrement,
  Default,
  BelongsToMany,
} from "sequelize-typescript";
import { UserStatesEnum } from "../enums/bot.enum";
import TestsModel from "../test/models/tests.model";
import User_test_assignmentsModel from "../test/models/user_test_assignments.model";

@Table({
  timestamps: true,
  schema: "Auth",
  tableName: "Users",
})
class Users extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.STRING)
  username: string;

  @Column(DataType.BIGINT)
  chat_id: number;

  @Column(DataType.STRING)
  full_name: string;

  @Column(DataType.STRING)
  phone_number: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active: boolean;

  @Column({
    type: DataType.ENUM,
    values: Object.values(UserStatesEnum),
  })
  user_state: UserStatesEnum;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isAdmin: boolean;

  @BelongsToMany(() => TestsModel, () => User_test_assignmentsModel)
  tests: TestsModel[];
}

export default Users;

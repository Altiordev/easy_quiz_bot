import {
  Table,
  Column,
  Model,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
  DataType,
  Default,
  BelongsTo,
} from "sequelize-typescript";
import Users from "../../auth/auth.model";
import TestsModel from "./tests.model";

@Table({
  timestamps: true,
  schema: "Test",
  tableName: "user_test_assignments",
})
class UserTestAssignments extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  user_id: number;

  @BelongsTo(() => Users, "user_id")
  user: Users;

  @ForeignKey(() => TestsModel)
  @Column(DataType.INTEGER)
  test_id: number;

  @BelongsTo(() => TestsModel, "test_id")
  test: TestsModel;

  @Default(false)
  @Column(DataType.BOOLEAN)
  started: boolean;

  @Column(DataType.DATE)
  startedAt: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  finished: boolean;

  @Column(DataType.DATE)
  finishedAt: Date;

  @Default(1)
  @Column(DataType.INTEGER)
  currentQuestionIndex: number;

  @Column(DataType.FLOAT)
  score: number;

  @Column(DataType.INTEGER)
  correct_answers: number;

  @Column(DataType.INTEGER)
  wrong_answers: number;

  @Column(DataType.STRING)
  diff_time: string;
}

export default UserTestAssignments;

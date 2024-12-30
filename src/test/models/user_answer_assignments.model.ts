import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import QuestionsModel from "./questions.model";
import OptionsModel from "./options.model";
import UserTestAssignments from "./user_test_assignments.model";

@Table({
  timestamps: true,
  schema: "Test",
  tableName: "user_answer_assignments",
})
export default class UserAnswerAssignments extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => UserTestAssignments)
  @Column(DataType.INTEGER)
  user_test_id: number;

  @BelongsTo(() => UserTestAssignments, "user_test_id")
  userTest: UserTestAssignments;

  @ForeignKey(() => QuestionsModel)
  @Column(DataType.INTEGER)
  question_id: number;

  @BelongsTo(() => QuestionsModel, "question_id")
  question: QuestionsModel;

  @ForeignKey(() => OptionsModel)
  @Column(DataType.INTEGER)
  option_id: number;

  @BelongsTo(() => OptionsModel, "option_id")
  option: OptionsModel;
}

import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import QuestionsModel from "./questions.model";

@Table({
  timestamps: true,
  schema: "Test",
  tableName: "Options",
})
class OptionsModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => QuestionsModel)
  question_id: number;

  @BelongsTo(() => QuestionsModel, "question_id")
  question: QuestionsModel;

  @Column(DataType.TEXT)
  option: string;

  @Column(DataType.BOOLEAN)
  isCorrect: boolean;
}

export default OptionsModel;

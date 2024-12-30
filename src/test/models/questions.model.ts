import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
} from "sequelize-typescript";
import TestsModel from "./tests.model";
import OptionsModel from "./options.model";

@Table({
  timestamps: true,
  schema: "Test",
  tableName: "Questions",
})
class QuestionsModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => TestsModel)
  test_id: number;

  @BelongsTo(() => TestsModel, "test_id")
  test: TestsModel;

  @Column(DataType.TEXT)
  question: string;

  @Default(1)
  @Column(DataType.FLOAT)
  question_score: number;

  @HasMany(() => OptionsModel)
  options: OptionsModel[];
}

export default QuestionsModel;

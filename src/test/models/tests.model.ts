import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  AutoIncrement,
  Default,
  HasMany,
  BelongsToMany,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { TestDifficultyLevelEnum } from "../../enums/test.enum";
import QuestionsModel from "./questions.model";
import User_test_assignmentsModel from "./user_test_assignments.model";
import AuthModel from "../../auth/auth.model";
import TopicsModel from "./topics.model";

@Table({
  timestamps: true,
  schema: "Test",
  tableName: "Tests",
})
class TestsModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => TopicsModel)
  topic_id: number;

  @BelongsTo(() => TopicsModel, "topic_id")
  topic: TopicsModel;

  @Column(DataType.STRING)
  name: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(TestDifficultyLevelEnum),
  })
  difficulty_level: TestDifficultyLevelEnum;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active: boolean;

  @HasMany(() => QuestionsModel, "test_id")
  questions: QuestionsModel[];

  @BelongsToMany(() => AuthModel, () => User_test_assignmentsModel)
  users: AuthModel[];
}

export default TestsModel;

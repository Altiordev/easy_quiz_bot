import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  AutoIncrement,
  Default,
  HasMany,
} from "sequelize-typescript";
import TestsModel from "./tests.model";

@Table({
  timestamps: true,
  schema: "Test",
  tableName: "Topics",
})
class TopicsModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active: boolean;

  @HasMany(() => TestsModel, "topic_id")
  tests: TestsModel[];
}

export default TopicsModel;

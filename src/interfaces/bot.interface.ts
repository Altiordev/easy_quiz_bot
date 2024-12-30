import { Scenes } from "telegraf";
import { ITest } from "./test.interface";
import { IGetAllResponse } from "./interfaces";

interface WizardSessionData extends Scenes.WizardSessionData {
  phone_number?: string;
  full_name?: string;
  testsMessageId?: number;
  tests?: ITest[];
  currentTestPage?: number;
  testsData?: IGetAllResponse<ITest>;
}

export type GlobalSceneContext = Scenes.WizardContext<WizardSessionData>;

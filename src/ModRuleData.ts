export interface ModRuleData {
  ratingClass: string;
  note: string;
}

export interface RuleExportData {
  name: string;
  ratingClass: string;
  note: string;
}


export interface TroublesomeMod {
  modName: string;
  threat: string;
  reason: string;
}

export interface TroublesomeModsDatabase {
  [key: string]: TroublesomeMod;
}

export interface TroublesomeModsDatabaseDTO {
  TroublesomeModsDatabase: TroublesomeModsDatabase;
}


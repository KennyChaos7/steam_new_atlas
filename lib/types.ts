export const GENRES = ['动作','RPG','策略','模拟经营','冒险解谜','恐怖','卡牌','生存','其他'] as const;
export type Chinese = 'supported' | 'unsupported' | 'unknown';
export interface Game {
  appId:number; name:string; cover:string|null; storeUrl:string; genres:string[]; tags:string[];
  chinese:Chinese; platforms:string[]; demoIds:number[]; releaseDate:number|null;
  comingSoon:boolean; description:string; developer:string; registration:'verified'|'preview'; updatedAt:string;
}
export interface Catalog {
  edition:string; updatedAt:string; eventStart:string; eventEnd:string; eventId:string;
  previewStart:string; previewEnd:string; scheduleSourceUrl:string;
  status:'preview'; region:string; sourceTitle:string; sourceUrl:string; publicUrl:string;
  candidateCount:number; retrievedCount:number; registrationVerifiedCount:number; missingAppIds:number[];
  failedAppIds:number[]; metadataUnavailableAppIds:number[]; games:Game[];
}

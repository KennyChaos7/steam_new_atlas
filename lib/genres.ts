// Match the official Simplified Chinese tags used by both snapshots and collection.
export const GENRE_DEFINITIONS = [
  {name:'动作',symbol:'✦',tags:['动作','动作冒险']},
  {name:'RPG',symbol:'◇',tags:['角色扮演','动作角色扮演','日系角色扮演','策略角色扮演']},
  {name:'策略',symbol:'♜',tags:['策略','回合战略','即时战略','大战略','即时战术','回合制战术']},
  {name:'模拟经营',symbol:'▧',tags:['模拟','建造','管理']},
  {name:'冒险',symbol:'⌘',tags:['冒险','动作冒险']},
  {name:'解谜',symbol:'▦',tags:['解谜','平台解谜']},
  {name:'恐怖',symbol:'◈',tags:['恐怖','心理恐怖','生存恐怖']},
  {name:'卡牌',symbol:'▱',tags:['卡牌游戏','牌组构建','卡牌战斗','牌组构建式类 Rogue']},
  {name:'生存',symbol:'△',tags:['生存','开放世界生存制作']},
  {name:'射击',symbol:'⊕',tags:['射击','第一人称射击','第三人称射击','清版射击','双摇杆射击','弹幕射击']},
  {name:'平台跳跃',symbol:'↗',tags:['平台游戏','2D 平台','3D 平台','精确平台','平台解谜']},
  {name:'Roguelike',symbol:'⟳',tags:['类 Rogue','轻度 Rogue','动作类 Rogue','传统类 Rogue','牌组构建式类 Rogue']},
  {name:'塔防',symbol:'♖',tags:['塔防']},
  {name:'视觉小说',symbol:'▤',tags:['视觉小说']},
  {name:'休闲放松',symbol:'☼',tags:['休闲','放松','温馨惬意']},
  {name:'挂机增量',symbol:'＋',tags:['挂机游戏','增量']},
  {name:'建造沙盒',symbol:'▣',tags:['建造','基地建设','城市营造','沙盒']},
  {name:'体育竞速',symbol:'⚑',tags:['体育','竞速','战斗竞速','时间竞速']},
  {name:'音乐节奏',symbol:'♪',tags:['音乐','节奏']},
  {name:'农场生活',symbol:'❀',tags:['农场模拟','农场管理','农业','生活模拟']},
  {name:'自动化',symbol:'⚙',tags:['自动化']},
  {name:'其他',symbol:'⊞',tags:[]},
];

export const GENRES = GENRE_DEFINITIONS.map(genre=>genre.name);

export function classifyGenres(tags:readonly string[]):string[] {
  const genres=GENRE_DEFINITIONS.filter(genre=>genre.tags.some(tag=>tags.includes(tag))).map(genre=>genre.name);
  return genres.length?genres:['其他'];
}

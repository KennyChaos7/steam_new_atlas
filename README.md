# NEXT ATLAS · Steam 2026 十月新品节图鉴

Next.js 16 / React 19 / TypeScript / Tailwind CSS 4。静态网页，数据采集与界面完全分离。所有游戏都来自官方预览配置；项目不含虚构的游戏条目、人工猜测的 App ID 或合成封面。

## 本地运行

使用 Node.js 24 和 pnpm 11（本次验证版本为 Node.js 24.19.0、pnpm 11.25.0）。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

打开 `http://127.0.0.1:3000/steam_new_atlas/`。已附带本次真实采集快照，不必重新采集即可运行。

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm start
```

`pnpm start` 服务于构建后的 `out/`，默认仅监听本机。`PORT` 可更换端口。

## 更新数据

```sh
pnpm sync
pnpm build
```

强制绕过 24 小时缓存：`pnpm sync --refresh`。GitHub Actions 每天北京时间 08:00、16:00、22:00 自动采集并发布；页面显示实际采集完成时间。GitHub 定时任务可能排队延迟，计划时间不是精确的上线时间。浏览器本身不执行采集。

采集脚本按 80 个 App ID 分批、最多 2 个并发请求，成功批次缓存在 `.cache/`。超时批次进行一次每批 20 个 ID 的有界补取，之后仍失败则记录具体 ID，不会填入假数据。再次执行会复用有效批次；失败批次因为没有缓存会重新请求。空目录、错届活动或全部元数据请求失败会直接失败并保留上次图鉴。部分失败可以生成快照，缺失数量会显示在网页中。

## 来源和覆盖边界

- 官方日程：<https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/2026october>
- 官方公开首页：<https://store.steampowered.com/sale/nextfest?l=schinese>
- 本次名单来源：Steam 官方 2026 年 10 月媒体预玩页面的嵌入式活动配置。准确来源 URL、活动 ID、抓取时间和所有候选 ID 位于 `data/membership.json`，网页底部也保留来源入口。
- 元数据：`https://api.steampowered.com/IStoreBrowseService/GetItems/v1/`，以 `input_json` 传入 `ids`、`context`、`data_request`。标签字典：`IStoreService/GetTagList/v1/`。两者均为 Steam 网站使用的公开接口，非稳定服务承诺，未来字段或可访问性可能变化。

采集首先验证活动配置的 `sale_opt_in_page_name` 必须为 `sale_nextfest_october_2026`，从 `tagged_items` 中读取本体候选 ID；若该字段未提供，则读取活动分区中的游戏 capsule。再用详情里的 `optin_registration_tags` 核对本届标记。网页仅显示带本届登记标记的游戏；无标记条目仍作为预览候选保留在原始数据快照中，不进入搜索、分类计数或分页。默认按公布发售日从早到晚排序，未公布日期排在最后。登记已核对不等于最终参展保证。

**名单为官方活动前预览候选池，非最终参展保证。** 即使所有候选详情都取得，也只能宣称“已遍历该候选池”，不能宣称最终阵容覆盖 100%。退展、延期、地区差异、隐藏或尚未公开条目可能影响实际名单。详情请求使用 US 地区和简体中文界面；不绕过 Steam 登录或访问限制。

名称优先采用 API 的简体中文本地化结果；无中文名保留官方原名，不自行翻译。封面使用 `assets.asset_url_format` 和官方文件名，不拼接猜测文件名。`demoIds` 只表示有关联 Demo，不保证当前可安装、可玩。中文状态区分支持、未列出和未知；没有语言数组时绝不标记为不支持。

## 数据模型与代码

| 文件 | 职责 |
|---|---|
| `scripts/sync.ts` | 采集、24 小时缓存、失败记录、原子更新快照 |
| `lib/steam.ts` | 官方活动解析与商店数据归一化 |
| `lib/genres.ts` | 22 类名称、图标及官方标签映射，供采集、筛选和统计共用 |
| `lib/types.ts` | Game / Catalog 类型契约 |
| `lib/query.ts` | 搜索、类型多选取交集、跨条件 AND、排序和分页 |
| `data/membership.json` | 本次官方候选 ID 与来源证据 |
| `data/catalog.json` | 采集后的唯一规范数据快照 |
| `public/catalog.json` | 自动生成的网页可下载副本，勿手工修改 |
| `app/page.tsx` | 静态预渲染首批游戏与来源统计 |
| `components/Atlas.tsx` | 浏览器端完整目录及交互 |
| `app/globals.css` | 深色主题与移动适配 |

Game：`appId / name / cover / storeUrl / genres / tags / chinese / platforms / demoIds / releaseDate / comingSoon / description / developer / registration / updatedAt`。

Catalog：正式活动起止时间、媒体预玩起止时间、日程来源、快照时间、地区、来源、候选池数量、详情数量、登记已核对数量、失败 ID、不可用详情 ID、Game 列表。`data/membership.json` 保留完整候选名单；缺失 ID 也保存在下载快照中。正式新品节为北京时间 2026 年 10 月 20 日 01:00 至 10 月 27 日 01:00。

类型依据前 20 个官方商店标签归类，同一款游戏可有多个类型；不能归入指定类型的保留“其他”。共 22 类：动作、RPG、策略、模拟经营、冒险、解谜、恐怖、卡牌、生存、射击、平台跳跃、Roguelike、塔防、视觉小说、休闲放松、挂机增量、建造沙盒、体育竞速、音乐节奏、农场生活、自动化、其他。分类名称、图标及标签规则统一维护在 `lib/genres.ts`；快照与后续采集使用同一规则。排序仅提供简中支持、名称、已公布发售日和 App ID，未虚构热度或评分。

## 部署

部署目标：<https://kennychaos7.github.io/steam_new_atlas/>。源码仓库：<https://github.com/KennyChaos7/steam_new_atlas>。

`.github/workflows/pages.yml` 在每天北京时间 08:00、16:00、22:00（`Asia/Shanghai`）、`master` 分支收到推送或手动运行时触发。流程使用 Node 24 和 pnpm 11.25.0 安装锁定依赖，执行 `pnpm sync --refresh` 获取新数据，再运行测试、静态构建并通过 GitHub Pages 官方 Actions 发布 `out/`。采集、测试或构建失败时不发布，已上线页面及其数据时间保持不变。仓库的 Settings → Pages → Source 使用 **GitHub Actions**。

`lib/deployment.ts` 中的 `BASE_PATH` 是仓库路径 `/steam_new_atlas` 的唯一配置来源；Next.js 资源和本地预览服务器共用它。游戏目录通过相对 URL `./catalog.json` 加载、下载，兼容仓库子路径。更换仓库名或自定义域名时，修改此配置并重新构建。

无需 API 密钥、数据库或常驻 Next 服务。每次发布前都会重新采集，避免代码推送把线上数据回退到仓库内的旧快照。自动采集结果随静态页面与下载目录一起发布，不自动提交回仓库；仓库内快照仍供本地开发和离线验证使用。现有 `.openai/hosting.json` 仅保留原 Sites 项目身份，GitHub Pages 发布不使用它。

封面由浏览器直接从 Steam CDN 读取，CDN/地区网络异常时显示“封面暂不可用”。Steam 名称、标识和游戏美术归相应权利人所有；本项目不是 Steam 官方网站。

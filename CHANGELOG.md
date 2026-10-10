# Changelog

按提交记录 GenV4 自己的改动，新的在上面。哈希可以在仓库里打开对应提交。

## 2026-10-10

* 展示站改用 GenV4 图标字体，并补上图标和图标按钮页
  * `tokens/_md-comp-icon.scss`
  * `catalog/site/_includes/default.html`
  * `catalog/site/stories/stories.html`
  * `catalog/src/components/top-app-bar.ts`
  * `docs/components/icon.md`
  * `docs/components/icon-button.md`
  * `catalog/src/hydration-entrypoints/components/icon.ts`
  * `catalog/src/hydration-entrypoints/components/icon-button.ts`
  * `iconbutton/internal/icon-button.ts`
  * `iconbutton/demo/stories.ts`
  * `scripts/analyzer/element-docs-map.ts`
  * `scripts/analyzer/update-docs.ts`
  * `scripts/update-button-theme-docs.mjs`
  * `package.json`

## 2026-10-09

* 增加新会话约定，CHANGELOG 改为按 GenV4 自己的提交记录
  * `AGENTS.md`
  * `CHANGELOG.md`

* 更新色阶对应关系，示意图上的角色亮暗色用同一档 ([6a2763b2c](https://github.com/CTOO-UXD/Web-GenV4/commit/6a2763b2c))
  * `tokens/genv4/_sys-color-scheme.scss`
  * `catalog/site/css/system-colors.css`
  * `docs/theme.md`

## 2026-09-29

* 展示页改用 GenV4 系统颜色，不再用种子色生成主题 ([c857d92c7](https://github.com/CTOO-UXD/Web-GenV4/commit/c857d92c7))
  * `catalog/site/css/system-colors.css`
  * `catalog/site/_includes/default.html`
  * `catalog/site/stories/stories.html`
  * `catalog/src/pages/global.ts`
* 用 Figma 主题色补上设计稿里缺的表面色阶，不改角色对应哪一档 ([5e64c6ad8](https://github.com/CTOO-UXD/Web-GenV4/commit/5e64c6ad8))
  * `tokens/genv4/_ref-palette.scss`
  * `tokens/genv4/_sys-color-scheme.scss`
  * `docs/theme.md`

## 2026-09-28

* 系统颜色改用设计色阶，主题文档指向这些文件。去掉上游同步说明，删除 `tokens/genv4/_sys-color.scss` ([fc3db2983](https://github.com/CTOO-UXD/Web-GenV4/commit/fc3db2983))
  * `tokens/genv4/_ref-palette.scss`
  * `tokens/genv4/_sys-color-scheme.scss`
  * `tokens/_md-ref-palette.scss`
  * `tokens/_md-sys-color.scss`
  * `docs/theme.md`
  * `README.md`
  * `SETUP.md`
  * `.vscode/settings.json`
* 初始快照 ([1e76a968f](https://github.com/CTOO-UXD/Web-GenV4/commit/1e76a968f))

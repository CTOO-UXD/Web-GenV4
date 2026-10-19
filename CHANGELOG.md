# Changelog

按提交记录 GenV4 自己的改动，新的在上面。哈希可以在仓库里打开对应提交。

## 2026-10-19

* 主图弹窗在平板和电脑上把底栏改成横排，并加上可选复选框
  * `hero-modal/internal/hero-modal.ts`
  * `hero-modal/internal/_hero-modal.scss`
  * `hero-modal/hero-modal.ts`
  * `hero-modal/hero-modal_test.ts`
  * `testing/genv4/hero-modal.html`

* 新增主图弹窗，用来放带图的说明和分步引导
  * `hero-modal/`
  * `tokens/_md-comp-hero-modal.scss`
  * `tokens/_index.scss`
  * `all.ts`
  * `testing/genv4/hero-modal.html`

## 2026-10-16

* 修正 AI 输入多行时文字把内边距顶开，窄宽度下文件改成每行两个
  * `ai-input/internal/_ai-input.scss`
  * `ai-input/internal/ai-input.ts`
  * `ai-input/ai-input_test.ts`

* 新增默认弹窗，并把正文字体换成 Montserrat
  * `modal/`
  * `tokens/_md-comp-modal.scss`
  * `tokens/_index.scss`
  * `tokens/genv4/_ref-typeface.scss`
  * `tokens/_md-ref-typeface.scss`
  * `all.ts`
  * `testing/genv4/modal.html`
  * `catalog/site/css/global.css`
  * `catalog/site/fonts/montserrat/`

## 2026-10-15

* 新增文本输入、发送输入和多行输入，并补上展示页。清除文字时仍发出 input
  * `text-input/`
  * `tokens/_md-comp-text-input.scss`
  * `tokens/_index.scss`
  * `all.ts`
  * `testing/genv4/text-input.html`
  * `testing/genv4/action-input.html`
  * `testing/genv4/text-area.html`
  * `docs/components/text-input.md`
  * `catalog/src/hydration-entrypoints/components/text-input.ts`
  * `scripts/component-custom-elements.ts`
  * `scripts/analyzer/element-docs-map.ts`
  * `scripts/analyzer/update-docs.ts`
  * `scripts/update-button-theme-docs.mjs`

## 2026-10-14

* 图标字体的类型改用已有的 CSS 模块声明，避免构建把声明文件清掉
  * `icon/icon.ts`
  * `types/css-imports.d.ts`
  * `.gitignore`

* 给 AI 输入补上展示页，并让图标组件自己带上字体
  * `docs/components/ai-input.md`
  * `catalog/src/hydration-entrypoints/components/ai-input.ts`
  * `all.ts`
  * `icon/icon.ts`
  * `icon/genv4-icon.d.ts`
  * `docs/components/icon.md`
  * `scripts/update-button-theme-docs.mjs`
  * `scripts/analyzer/analyze-element.ts`
  * `catalog/esbuild.config.mjs`

## 2026-10-13

* 新增 AI 输入组件，并把 genv4-icon 升到 0.0.4
  * `ai-input/`
  * `tokens/_md-comp-ai-input.scss`
  * `tokens/_index.scss`
  * `testing/genv4/ai-input.html`
  * `catalog/package.json`
  * `package-lock.json`

## 2026-10-10

* 展示站把设计色和种子色分开，图标页加上全量画廊，字体改走 genv4-icon 包
  * `catalog/site/css/system-colors.css`
  * `catalog/src/utils/theme.ts`
  * `catalog/src/inline/apply-saved-theme.ts`
  * `catalog/src/pages/global.ts`
  * `catalog/src/components/theme-changer.ts`
  * `catalog/src/components/icon-gallery.ts`
  * `catalog/src/types/genv4-icon-json.d.ts`
  * `docs/components/icon.md`
  * `catalog/src/hydration-entrypoints/components/icon.ts`
  * `catalog/eleventy.config.cjs`
  * `catalog/package.json`
  * `catalog/site/_includes/default.html`
  * `catalog/site/stories/stories.html`
  * `package-lock.json`

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

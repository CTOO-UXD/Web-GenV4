# Changelog

按提交记录 GenV4 自己的改动，新的在上面。哈希可以在仓库里打开对应提交。

## 2026-10-22

* 新增搜索栏，宽窄按组件宽度切换，结果由页面放进插槽
  * `search-bar/`
  * `tokens/_md-comp-search-bar.scss`
  * `tokens/_index.scss`
  * `all.ts`
  * `scripts/component-custom-elements.ts`
  * `testing/genv4/search-bar.html`

* 补上分组菜单展示页，两组圆角和选中换图标在页面上能分开
  * `docs/components/gen-menu.md`
  * `catalog/src/hydration-entrypoints/components/gen-menu.ts`
  * `scripts/analyzer/element-docs-map.ts`
  * `scripts/analyzer/update-docs.ts`
  * `scripts/update-button-theme-docs.mjs`
  * `gen-menu/`
  * `tokens/_md-comp-gen-menu-group.scss`

## 2026-10-21

* 新增分组菜单，旧菜单保持不动，选中只由页面设置
  * `gen-menu/`
  * `tokens/_md-comp-gen-menu.scss`
  * `tokens/_md-comp-gen-menu-group.scss`
  * `tokens/_md-comp-gen-menu-item.scss`
  * `tokens/_index.scss`
  * `all.ts`
  * `scripts/component-custom-elements.ts`
  * `testing/genv4/gen-menu.html`

* 补上提示横幅展示页，并写明关掉后要不要再出现由页面决定
  * `docs/components/alert-banner.md`
  * `catalog/src/hydration-entrypoints/components/alert-banner.ts`
  * `alert-banner/internal/alert-banner.ts`
  * `scripts/analyzer/element-docs-map.ts`
  * `scripts/analyzer/update-docs.ts`
  * `scripts/component-custom-elements.ts`
  * `scripts/update-button-theme-docs.mjs`

* 新增提示横幅，页面自己放按钮和勾选框，关掉后留在页面上但不占高度
  * `alert-banner/`
  * `tokens/_md-comp-alert-banner.scss`
  * `tokens/_index.scss`
  * `all.ts`
  * `testing/genv4/alert-banner.html`

* 步骤条补上展示页，禁用步后面改成灰线，空心进行中改成圆环里的点
  * `process-stepper/internal/process-stepper.ts`
  * `process-stepper/internal/_process-stepper.scss`
  * `process-stepper/process-stepper.ts`
  * `process-stepper/process-step.ts`
  * `process-stepper/process-stepper_test.ts`
  * `docs/components/process-stepper.md`
  * `catalog/src/hydration-entrypoints/components/process-stepper.ts`
  * `scripts/analyzer/element-docs-map.ts`
  * `scripts/analyzer/update-docs.ts`
  * `scripts/component-custom-elements.ts`
  * `scripts/update-button-theme-docs.mjs`
  * `all.ts`
  * `testing/genv4/process-stepper.html`

* 展示页的代码块和行内代码改用 Montserrat
  * `catalog/site/css/syntax-highlight.css`

## 2026-10-20

* 新增流程步骤条，页面自己标每一步的状态，线跟着组件的宽高拉开
  * `process-stepper/`
  * `tokens/_md-comp-process-stepper.scss`
  * `tokens/_index.scss`
  * `all.ts`
  * `testing/genv4/process-stepper.html`

* 对话弹窗可以用 icon 换成自己的图标连字，不写仍用外观自带的
  * `modal/internal/modal.ts`
  * `modal/modal_test.ts`
  * `docs/components/modal.md`

* 弹窗文档里的 open 补上说明和默认值，再生成也不会丢掉
  * `scripts/analyzer/analyze-element.ts`
  * `modal/internal/modal.ts`
  * `hero-modal/internal/hero-modal.ts`
  * `feature-tour-modal/internal/feature-tour-modal.ts`
  * `loading-modal/internal/loading-modal.ts`

* 新增弹窗展示页，把四类弹窗和各自的样子放在同一页
  * `docs/components/modal.md`
  * `docs/components/images/modal-dialog.png`
  * `docs/components/images/modal-hero.png`
  * `docs/components/images/modal-feature-tour.png`
  * `docs/components/images/modal-loading.png`
  * `catalog/src/hydration-entrypoints/components/modal.ts`
  * `scripts/analyzer/element-docs-map.ts`
  * `scripts/analyzer/update-docs.ts`
  * `scripts/update-button-theme-docs.mjs`
  * `modal/internal/modal.ts`
  * `hero-modal/internal/hero-modal.ts`
  * `feature-tour-modal/internal/feature-tour-modal.ts`
  * `loading-modal/internal/loading-modal.ts`

* 新增加载弹窗，用来在处理时显示转圈，完成后停在勾上，等页面自己关闭
  * `loading-modal/`
  * `tokens/_md-comp-loading-modal.scss`
  * `tokens/_index.scss`
  * `all.ts`
  * `testing/genv4/loading-modal.html`

* 主图弹窗底栏改成三个可选按钮，标题左右与同档内容边距对齐
  * `hero-modal/hero-modal.ts`
  * `hero-modal/internal/hero-modal.ts`
  * `hero-modal/internal/_hero-modal.scss`
  * `hero-modal/hero-modal_test.ts`
  * `testing/genv4/hero-modal.html`
  * `feature-tour-modal/internal/_feature-tour-modal.scss`
  * `feature-tour-modal/feature-tour-modal_test.ts`

## 2026-10-19

* 新增功能引导卡片，用来在页面旁边分步说明；内容边距不再带动标题
  * `feature-tour-modal/`
  * `tokens/_md-comp-feature-tour-modal.scss`
  * `tokens/_index.scss`
  * `all.ts`
  * `testing/genv4/feature-tour-modal.html`
  * `hero-modal/internal/_hero-modal.scss`
  * `hero-modal/hero-modal_test.ts`

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

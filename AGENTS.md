# GenV4

这个仓库是内部使用的 Material Web，npm 包名是 `genv4`。

每次只改完成当前要求所需要的文件和行。要求本身要做完。旁边的重构、已经删掉的上游说明、`tokens/versions/` 留在原地。

改组件页时先读对应说明，按那份做：

- 改已有文案：`D:\项目\GenV4-docs\utility\怎么改组件页.md`
- 把下一页做成和按钮页一样：`D:\项目\GenV4-docs\utility\怎么重构组件页.md`

颜色只动这两个文件。设计给的是某个色阶的色值，改 `tokens/genv4/_ref-palette.scss`。设计给的是角色对应哪一档，改 `tokens/genv4/_sys-color-scheme.scss`。亮色和暗色共用一套色阶。示意图上的角色两档相同。图上没有的角色保持原档：Background、On Background、Surface Dim、Surface Container High、Surface Variant、Surface Tint。展示页颜色在 `catalog/site/css/system-colors.css`，和对应表一起改。

图标字体在同级目录 `D:\项目\GenV4-icon`，包名 `genv4-icon`。这个仓库里不改 `<md-icon>`。

只有明确要求时才提交或推送。提交时把这一条写到 `CHANGELOG.md` 最上面，格式跟现有条目一样。

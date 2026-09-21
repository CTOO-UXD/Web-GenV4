# GenV4 组件库开发资源

## Knowledge

- [Material Web：Theming](https://github.com/material-components/material-web/blob/main/docs/theming/README.md)  
  上游对 Reference、System、Component Token 和 CSS Custom Property 的权威说明。用于判断设计需求应该落在哪一层。
- [Material Web：Button](https://github.com/material-components/material-web/blob/main/docs/components/button.md)  
  Button 的用法、变体和公开 Token 清单。用于核对组件对外能力和默认映射。
- [Lit：Components overview](https://lit.dev/docs/components/overview/)  
  Lit 官方组件模型总览。用于理解自定义元素、渲染、响应式属性、样式和生命周期。
- [Lit：Defining a component](https://lit.dev/docs/components/defining/)  
  `LitElement`、`@customElement` 和 `HTMLElementTagNameMap` 的官方解释。用于阅读组件入口类。
- [Lit：Styles](https://lit.dev/docs/components/styles/)  
  Shadow DOM 样式、`static styles` 和 CSS Custom Property 的官方说明。用于理解 `cssresult.ts` 为什么被组件导入。
- [Sass：Maps](https://sass-lang.com/documentation/values/maps/)  
  `map.get()`、`map.set()` 和 `map.merge()` 的官方说明。用于阅读 Token Map 和 GenV4 覆盖层。
- [Sass：@use](https://sass-lang.com/documentation/at-rules/use/) 与 [@forward](https://sass-lang.com/documentation/at-rules/forward/)  
  Sass 模块系统的官方说明。用于理解公共入口与内部实现文件的关系。
- [MDN：Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)  
  Custom Elements、Shadow DOM 和模板等 Web 标准总览。用于区分 Lit 提供的便利与浏览器原生能力。
- [MDN：Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)  
  Shadow DOM 封装机制的权威解释。用于理解为什么普通页面 CSS 不能直接修改按钮内部节点。

## Wisdom (Communities)

- [Lit 官方 Discord](https://lit.dev/discord/)  
  Lit 团队和使用者社区。用于验证 Lit 生命周期、装饰器和复杂 Shadow DOM 实践问题。
- [Material Web GitHub Discussions](https://github.com/material-components/material-web/discussions)  
  上游维护者和使用者的历史讨论。用于查找 Material Web 特有问题；注意该项目目前处于 maintenance mode。

## Gaps

- Google 内部 Material Token 生成器和源模板未随仓库开放，当前只能依据生成结果与公开 Theming 接口学习。
- GenV4 暂无成体系的视觉回归测试指南，后续需要结合真实需求逐步补充。

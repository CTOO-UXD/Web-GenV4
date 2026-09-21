# Material Design 3 vs Material Web vs GenV4: component gap analysis

**Comparison date:** 2026-09-21  
**Scope:** the component names exposed by the current official Material Design 3 (M3) component catalog, the elements actually exported by official Material Web, experimental implementations under Material Web `labs/`, and this local GenV4 fork.

## Executive summary

The M3 design catalog and Material Web are not equivalent catalogs. On the comparison date, the M3 catalog contains **36 named component families**. Material Web has a stable equivalent for **16**, a labs/experimental implementation for **7**, only a related primitive for **8**, and no official implementation or sufficiently close Material primitive for **5**. These counts describe component families, not individual variants.

The largest practical gaps are not basic controls. Material Web's stable package covers buttons, form controls, menus, dialogs, lists, tabs, and progress indicators, but it does not provide stable application-shell navigation, transient messaging, pickers, sheets, search, carousel, tooltips, FAB menus, or the newer M3 Expressive composites. The 2026 `2.5.0` release added several expressive experiments under `labs/gb`, but they are not part of the stable `all.ts` export ([release](https://github.com/material-components/material-web/releases/tag/v2.5.0), [upstream `all.ts`](https://github.com/material-components/material-web/blob/main/all.ts), local `all.ts`).

Material Web is officially in **maintenance mode, not deprecated**. The maintainers state that Material Design reassigned the staffed engineers, new features and components are no longer planned, pull requests are not accepted by default, and small changes may be reviewed case by case while new maintainers are sought ([official announcement, 2024-06-10](https://github.com/material-components/material-web/discussions/5642), [roadmap](https://github.com/material-components/material-web/blob/main/docs/roadmap.md)). A company that needs the missing components should therefore plan to own implementation, accessibility testing, M3 conformance, and long-term maintenance rather than assume upstream delivery.

Recommended first investments, under the assumptions stated below, are:

1. **Tooltip**: broad reuse and bounded scope, but it still requires correct hover/focus/dismiss behavior.
2. **Snackbar**: common feedback pattern, moderate accessibility and queueing work, and little dependence on other missing components.
3. **Search**: high product value and strong reuse of existing text-field, icon-button, list, and menu primitives; implement a deep controller rather than styling a text field.
4. **Navigation rail**: high responsive-shell value and reuse of navigation item/badge primitives; coordinate it with the labs navigation bar/drawer family.
5. **Date/time pickers** only where native `<input type="date|time">` is insufficient: very high interaction, localization, and testing cost.

## Methodology and classification

### Sources

Only first-party sources were used:

- M3's official [component catalog](https://m3.material.io/components) and linked official component pages.
- The official [`material-components/material-web`](https://github.com/material-components/material-web) source tree, releases, roadmap, and maintenance announcement.
- The local GenV4 repository, especially `all.ts`, `docs/components/`, `labs/`, and component source directories.
- Platform and accessibility recommendations cite standards-owner documentation: [WHATWG HTML](https://html.spec.whatwg.org/), [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/), and [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

The M3 catalog is a live site. This report records what it exposed on **2026-09-21**, including the newer Button groups, FAB menu, Loading indicator, Split button, and Toolbars entries. The upstream code comparison uses Material Web `main` and the latest listed release, `2.5.0` (2026-07-14) ([releases](https://github.com/material-components/material-web/releases)). The local fork revision observed for this comparison was `dd562ee48d07b3915fbe07932bf9d54e151a9cce` (2026-09-17).

### Rules

- **Stable Material Web equivalent**: a public Material Web custom element is imported/exported from upstream `all.ts`. Supporting primitives such as ripple, focus ring, elevation, icon, and field are not counted as M3 catalog families.
- **Labs/experimental**: an official implementation exists only below `labs/`; it is not promoted to the stable bundle. Material Web explicitly warns that labs components are experimental, not recommended for production, and may introduce breaking changes without a major version ([upstream `labs/README.md`](https://github.com/material-components/material-web/blob/main/labs/README.md)). `labs/gb` expressive utility-class components remain labs despite appearing in a release.
- **Partial/closest primitive**: Material Web has a related official component that can help implement the design, but not the catalog component itself. Composition is explicitly not counted as existence.
- **Absent**: no official stable or labs implementation of the catalog component was found. Native HTML or an application-built composition may still be recommended.
- **Materially incomplete** is an additional overlay, not a fifth mutually exclusive class. A baseline component can be stable while lacking important current M3 Expressive variants or composite behavior.
- Local GenV4 status is based on source, not token files. The presence of a Sass token file is not treated as an implemented element. This matters because local `tokens/` contains component token sets for components that have no corresponding element.

GenV4's local stable bundle matches upstream's component exports line-for-line at the family level (`all.ts`; upstream [`all.ts`](https://github.com/material-components/material-web/blob/main/all.ts)). GenV4 also retains the same principal labs families under `labs/`, plus the 2026 `labs/gb` work. Consequently, most upstream gaps are also GenV4 gaps unless the inventory explicitly says otherwise.

## Findings

### Stable coverage is baseline-heavy

The stable bundle exports button variants, checkbox, chips, dialog, divider, FAB, icon buttons, lists, menus, progress, radio, slider, switch, tabs, and text fields ([upstream `all.ts`](https://github.com/material-components/material-web/blob/main/all.ts); local `all.ts`). Extended FAB is not a separate element: `<md-fab>` becomes extended when its `label` is supplied (local `fab/fab.ts`, `docs/components/fab.md`). That is a naming/API difference, not a missing implementation.

Material Web's stable package does **not** export cards, badges, segmented buttons, navigation bar, navigation drawer, app bar, or split button. Their source is below `labs/` locally and upstream, so using them creates an experimental API dependency (local `labs/card/`, `labs/badge/`, `labs/segmentedbuttonset/`, `labs/navigationbar/`, `labs/navigationdrawer/`, `labs/gb/components/appbar/`, and `labs/gb/components/splitbutton/`; upstream [`labs`](https://github.com/material-components/material-web/tree/main/labs)).

### Current M3 Expressive coverage is materially incomplete

M3 has updated several families beyond the baseline designs implemented by stable Material Web:

- App bars now include search, medium-flexible, and large-flexible variants; baseline medium and large are no longer recommended ([M3 app-bar specs](https://m3.material.io/components/app-bars/specs)).
- Navigation rail now distinguishes collapsed and expanded expressive rails, and the baseline rail is no longer recommended ([M3 navigation-rail specs](https://m3.material.io/components/navigation-rail/specs)).
- Navigation bar has a flexible expressive replacement for the baseline bar ([M3 navigation bar](https://m3.material.io/components/navigation-bar)).
- Expressive lists add segmented styling, selected treatment, and flexible slots; M3 says baseline lists remain usable but are not recommended for new designs ([M3 list specs](https://m3.material.io/components/lists/specs)).
- Material Web `2.5.0` added experimental expressive button, FAB, icon button, list, menu, split-button, card, badge, checkbox, radio, and switch utilities under labs rather than upgrading the stable elements ([release notes](https://github.com/material-components/material-web/releases/tag/v2.5.0), local `labs/gb/components/`).

Therefore “stable equivalent” in the inventory means a supported public Material Web family exists; it does not mean complete parity with every current M3 Expressive size, shape, motion, layout, or variant.

### Maintenance implications

The official announcement says MWC is “not deprecated or going away,” but Material Design no longer actively staffs it, new features/components are not planned, and ongoing support depends on volunteer time ([announcement](https://github.com/material-components/material-web/discussions/5642)). The official roadmap repeats that no current or future feature work is planned and that fixes may be accepted case by case ([roadmap](https://github.com/material-components/material-web/blob/main/docs/roadmap.md)).

Practical implications:

- Do not use an upstream roadmap as a delivery dependency for missing components.
- Treat labs APIs as source to evaluate, not as a compatibility guarantee.
- Keep company-owned additions in a separable namespace/package and avoid modifying stable upstream internals unless unavoidable.
- Preserve native semantics and use shared controllers/tokens so components remain maintainable if Material Web stewardship changes.
- Pin the upstream revision and document fork deltas. GenV4 already has local changes, so automated rebases should not be assumed conflict-free.

## Design guidance for missing and partial components

Everything in this section is **analysis/recommendation**, not an official claim that Material Web provides the component.

### Cross-cutting architecture

1. **Semantics first.** Prefer native `<button>`, `<a>`, `<input>`, `<dialog>`, headings, lists, and landmarks. Add ARIA only when native semantics cannot express the pattern. Follow the relevant [ARIA APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) and WCAG 2.2 focus, target-size, keyboard, contrast, and status-message requirements.
2. **Deep components for interaction-owning composites.** A picker, search surface, snackbar host, carousel, or sheet should own state transitions, focus restoration, keyboard rules, positioning, responsive mode, and accessibility announcements behind a small public API. Do not expose a bag of styling helpers and leave each product to recreate behavior.
3. **Compose visual primitives, not behavioral ambiguity.** Reuse GenV4 buttons, icon buttons, text fields, list items, menus, dialogs, badges, focus ring, and tokens where their contracts fit. Do not claim the resulting composite is the official Material Web component.
4. **Tokens.** Define `--genv4-*` system and component tokens in three layers: semantic system tokens, component defaults mapped to system tokens, and instance overrides. Keep M3 token names traceable, but do not depend on undocumented stable-component internals. Include density, shape, state-layer, motion, typography, elevation, and high-contrast mappings.
5. **Responsive behavior.** Use container queries or explicit host-size inputs for component adaptation. Avoid coupling reusable components to `window.innerWidth`. Preserve user state when changing variants.
6. **Focus and motion.** Always restore focus after transient/modal UI closes, keep visible focus, support `prefers-reduced-motion`, and test forced-colors/high-contrast mode.

### Component-specific recommendations

#### Tooltips — create a new deep component

Use an owning trigger/content relationship with generated IDs and `aria-describedby` for non-interactive descriptions. Show on hover and keyboard focus; dismiss on `Escape`, pointer exit, blur, and trigger removal; keep the tooltip hoverable where WCAG 1.4.13 requires it. Rich interactive content is not a tooltip and should use a popover/dialog pattern. Prefer the native Popover API where supported, with positioning/collision logic isolated behind a controller. `title` alone is not an adequate accessible Material tooltip implementation. See [ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) and [WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html).

#### Snackbar — create a host plus item component

Use `role="status"`/polite live-region behavior for routine confirmation; reserve assertive announcements for urgent errors. Do not move focus to a snackbar merely because it appeared. If it has an action, make the action keyboard reachable in normal tab order and ensure timeout policy allows enough time; pause or disable timeout while hovered/focused. A host should own queueing, deduplication, replacement, and responsive placement. Reuse GenV4 text/button primitives, but not `md-dialog`: snackbar is non-modal and has different focus behavior. See [ARIA status role](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) and [WCAG timing guidance](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html).

#### Search — create a deep composite from existing primitives

Start with native `<form role="search">` and a real search input. Reuse GenV4 text-field/icon-button/list/menu visuals, but own query state, async-result state, active descendant, submit/clear behavior, and focus restoration in a search controller. Suggestions should follow the [ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) only when they behave as a combobox; a results page or command palette is a different pattern. Support `Escape`, arrows, `Enter`, composition events, and abortable/debounced requests. Adapt between bar and expanded/full-screen views without replacing the focused input node where possible.

#### Navigation rail — build a coordinated navigation family

Use a `<nav aria-label="…">` landmark containing links for navigation destinations; use buttons only for actions. Indicate the current destination with `aria-current="page"`. Ordinary navigation links should remain in normal Tab order rather than imitating a tablist. Share a destination-item model and tokens with labs navigation bar/drawer, but create a distinct rail layout/controller for collapsed/expanded behavior, badges, optional FAB, and width adaptation. M3's current rail differs materially from a composed vertical list ([M3 rail specs](https://m3.material.io/components/navigation-rail/specs)).

#### Bottom and side sheets — share overlay infrastructure, expose distinct components

Reuse dialog overlay/focus-trap/scroll-lock infrastructure, but do not merely reskin `<md-dialog>`. Modal sheets require inert background content, initial focus, `Escape`, focus restoration, and accessible labelling; persistent/standard sheets must not trap focus. Bottom sheets need drag/velocity thresholds, snap points, touch-action handling, and safe-area insets. Side sheets need logical start/end placement and directionality. Switch modality/layout at explicit breakpoints without losing content state. See the [ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

#### Button groups — compose, then deepen only if selection behavior is owned

For a purely visual cluster, use a semantic wrapper and existing buttons; do not add a group widget role unnecessarily. For a single-select group, use native radios styled as buttons, with arrow-key behavior only if adopting a radio-group interaction contract. For multi-select toggles, use pressed buttons (`aria-pressed`) or checkboxes. Split button is a separate labs component and is not evidence that M3 Button groups are implemented. Share shape adjacency, spacing, and selected-state tokens with segmented/split buttons.

#### Date and time pickers — prefer native inputs unless requirements justify ownership

Native `<input type="date">`, `<input type="time">`, and related types provide platform semantics and localization but have browser-dependent UI and limited styling ([HTML input types](https://html.spec.whatwg.org/multipage/input.html#date-state-(type=date))). Use them by default when they meet product requirements. A custom calendar/grid picker is high-risk: it must implement locale calendars, first day of week, month/year navigation, min/max/disabled dates, ranges, parsing, time zones, and the [ARIA date-picker/dialog grid guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/). Build a deep component only with dedicated internationalization and accessibility test capacity.

#### Carousel — create a deep component only for a validated use case

Use a labelled region with meaningful previous/next buttons and stable document-order slide content. Avoid automatic rotation by default; if present, expose pause and stop it on focus/hover according to [ARIA carousel guidance](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) and WCAG 2.2.2. Keep off-screen content discoverability deliberate rather than indiscriminately applying `aria-hidden`. A scroll-snap primitive may provide layout, but paging, announcements, focus, and responsive item sizing require an owning controller.

#### FAB menu — extend FAB primitives with menu-specific ownership

Reuse `md-fab`/icon buttons for appearance, but implement disclosure state, labelling, focus movement, outside-click dismissal, `Escape`, and focus return as one component. Do not automatically apply `role="menu"`: use it only when the actions obey the menu keyboard model; a disclosed group of ordinary action buttons can be more appropriate. Responsive placement must account for safe areas and navigation bars.

#### Loading indicator — create a distinct motion component

Do not alias indeterminate `md-circular-progress`: M3 defines the Loading indicator as a separate expressive component for short indeterminate waits and says Web Expressive is unavailable ([M3 overview](https://m3.material.io/components/loading-indicator/overview)). Reuse progress semantics and shared motion/color tokens, expose an accessible label when the visual communicates state, honor reduced motion, and avoid announcing repeated frame/state changes. Keep it shallow visually but separate from determinate progress APIs.

#### Toolbars — compose primitives behind a layout contract

Use a labelled toolbar only when the contained controls form one functional group; apply `role="toolbar"` and the [ARIA toolbar keyboard pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) only if implementing its focus-management contract. Otherwise use an ordinary semantic container with buttons in normal Tab order. Reuse buttons, icon buttons, fields, FAB, tooltip, and focus primitives, while a toolbar component owns docked/floating layout, overflow, logical alignment, responsive collapse, and action emphasis. M3 explicitly treats toolbars as slotted containers for these controls ([M3 toolbar guidance](https://m3.material.io/components/toolbars/guidelines)).

#### Side sheets, snackbar, and search tokens

Token files in GenV4 may supply historical values, but a token set without source/behavior is not an implementation. Adopt tokens only after mapping them to the current M3 spec version, and record the mapping/version in the component package.

## Prioritization

This ranking assumes a general-purpose business web application with forms, responsive navigation, CRUD feedback, and keyboard/screen-reader requirements. It does **not** assume company usage analytics. Validate the order against product telemetry, roadmap screens, support tickets, and accessibility risk.

| Priority | Candidate | User/business value | Accessibility/interaction complexity | Reuse | Implementation risk |
|---|---|---|---|---|---|
| 1 | Tooltip | Broad explanatory affordance; many screens | Medium | Icon button, focus, elevation, tokens | Low–medium |
| 2 | Snackbar | Common action/result feedback | Medium | Button, elevation, motion | Medium |
| 3 | Search | High discoverability and task-completion value | High | Text field, icon button, list/menu | Medium–high |
| 4 | Navigation rail | Responsive desktop/tablet shell | Medium | Labs navigation item/drawer/bar, badge | Medium |
| 5 | Sheet infrastructure | Enables mobile and desktop secondary workflows | High | Dialog/focus/overlay | High |
| 6 | FAB menu | Useful in action-centric responsive products | Medium | FAB, tooltip, motion | Medium |
| 7 | Date/time picker | High value only where native controls fail requirements | Very high | Text field, dialog, buttons | Very high |
| 8 | Carousel | Use-case-specific; often avoidable | High | Buttons, focus, motion | High |
| 9 | Button groups | Usually composable from existing controls | Low–medium | Buttons, segmented/split work | Low–medium |

Before starting a new component, evaluate whether a labs implementation is sufficiently mature to harden behind a GenV4-owned facade. For navigation and expressive controls, this can reduce styling work, but the facade must prevent labs API churn from leaking into products.

## Appendix A — complete M3 catalog inventory

The “MW status” column is mutually exclusive under the methodology above. “Incomplete/current-spec note” records significant parity limitations. Local paths are evidence for GenV4; linked upstream paths are evidence for official Material Web.

| # | M3 catalog family | MW status | Official Material Web / naming evidence | GenV4 evidence | Incomplete/current-spec note |
|---:|---|---|---|---|---|
| 1 | App bars | **Labs/experimental** | Expressive app bar only under [`labs/gb/components/appbar`](https://github.com/material-components/material-web/tree/main/labs/gb/components/appbar); no export in [`all.ts`](https://github.com/material-components/material-web/blob/main/all.ts) | `labs/gb/components/appbar/`; catalog-only `catalog/src/components/top-app-bar.ts` is not a package component | M3 includes search/small/flexible variants; labs utility does not establish full behavioral parity ([M3 specs](https://m3.material.io/components/app-bars/specs)) |
| 2 | Badges | **Labs/experimental** | [`labs/badge`](https://github.com/material-components/material-web/tree/main/labs/badge); expressive utility added in [2.5.0](https://github.com/material-components/material-web/releases/tag/v2.5.0) | `labs/badge/`, `labs/gb/components/badge/` | Not stable-exported |
| 3 | Bottom sheets | **Partial/closest primitive** | Stable dialog exists, but no sheet export in [`all.ts`](https://github.com/material-components/material-web/blob/main/all.ts) or labs tree | `dialog/`; no bottom-sheet element | Dialog supplies some overlay/focus infrastructure; drag/snap and sheet modality are absent |
| 4 | Buttons | **Stable equivalent** | `md-elevated-button`, `md-filled-button`, `md-filled-tonal-button`, `md-outlined-button`, `md-text-button` in [`button/`](https://github.com/material-components/material-web/tree/main/button) and `all.ts` | `button/`, `docs/components/button.md`, `all.ts` | M3 Expressive button utility is labs-only (`labs/gb/components/button/`) |
| 5 | Button groups | **Partial/closest primitive** | Stable buttons and labs split/segmented controls exist; no M3 Button group element/export | `button/`, `labs/segmentedbuttonset/`, `labs/gb/components/splitbutton/` | Composition is possible but no official group contract, adjacency behavior, or selection model |
| 6 | Cards | **Labs/experimental** | [`labs/card`](https://github.com/material-components/material-web/tree/main/labs/card); expressive utility added in [2.5.0](https://github.com/material-components/material-web/releases/tag/v2.5.0) | `labs/card/`, `labs/gb/components/card/` | No stable card export |
| 7 | Carousel | **Absent** | No carousel in stable [`all.ts`](https://github.com/material-components/material-web/blob/main/all.ts) or official labs tree | No `carousel/` or `labs/carousel/` | Scroll-snap composition is not an official implementation |
| 8 | Checkbox | **Stable equivalent** | [`checkbox/checkbox.ts`](https://github.com/material-components/material-web/blob/main/checkbox/checkbox.ts), exported by `all.ts` | `checkbox/checkbox.ts`, `docs/components/checkbox.md` | Expressive utility remains under `labs/gb/components/checkbox/` |
| 9 | Chips | **Stable equivalent** | Assist/filter/input/suggestion chips in [`chips/`](https://github.com/material-components/material-web/tree/main/chips), exported by `all.ts` | `chips/`, `docs/components/chip.md` | Current expressive styling/behavior should be audited variant-by-variant |
| 10 | Date pickers | **Absent** | No date-picker stable or labs element | No date-picker source | Native date inputs are an alternative, not a Material implementation |
| 11 | Dialogs | **Stable equivalent** | [`dialog/dialog.ts`](https://github.com/material-components/material-web/blob/main/dialog/dialog.ts), exported by `all.ts` | `dialog/dialog.ts`, `docs/components/dialog.md` | Does not imply sheet support |
| 12 | Dividers | **Stable equivalent** | [`divider/divider.ts`](https://github.com/material-components/material-web/blob/main/divider/divider.ts), exported by `all.ts` | `divider/divider.ts`, `docs/components/divider.md` | Expressive utility also exists in labs |
| 13 | Extended FABs | **Stable equivalent** | Same `md-fab` API; label produces extended form ([`fab/fab.ts`](https://github.com/material-components/material-web/blob/main/fab/fab.ts)) | `fab/fab.ts`, `docs/components/fab.md` | Naming difference: no separate `md-extended-fab` element |
| 14 | FAB menu | **Partial/closest primitive** | Stable FAB and menu elements exist, but no coordinated FAB-menu export ([`fab/`](https://github.com/material-components/material-web/tree/main/fab), [`menu/`](https://github.com/material-components/material-web/tree/main/menu)) | `fab/`, `menu/`; no FAB-menu source | Composition does not supply the disclosure, focus, positioning, or action-group contract |
| 15 | Floating action buttons | **Stable equivalent** | `md-fab` and `md-branded-fab` in [`fab/`](https://github.com/material-components/material-web/tree/main/fab), exported by `all.ts` | `fab/`, `docs/components/fab.md` | Expressive FAB utility is labs-only |
| 16 | Icon buttons | **Stable equivalent** | Standard/filled/filled-tonal/outlined elements in [`iconbutton/`](https://github.com/material-components/material-web/tree/main/iconbutton), exported by `all.ts` | `iconbutton/`, `docs/components/icon-button.md` | New expressive sizes/shapes utility is labs-only |
| 17 | Lists | **Stable equivalent** | `md-list` and `md-list-item` in [`list/`](https://github.com/material-components/material-web/tree/main/list), exported by `all.ts` | `list/`, `docs/components/list.md` | Stable implementation is baseline; M3 recommends expressive lists with richer slots/selection ([M3 specs](https://m3.material.io/components/lists/specs)) |
| 18 | Loading indicator | **Partial/closest primitive** | Stable `md-circular-progress` is the nearest primitive, but no loading-indicator export exists and M3 reports Web Expressive unavailable ([M3 overview](https://m3.material.io/components/loading-indicator/overview), [`progress/`](https://github.com/material-components/material-web/tree/main/progress)) | `progress/circular-progress.ts`; no loading-indicator source | M3 defines different short-wait motion and usage, so circular progress is not parity |
| 19 | Menus | **Stable equivalent** | `md-menu`, `md-menu-item`, `md-sub-menu` in [`menu/`](https://github.com/material-components/material-web/tree/main/menu), exported by `all.ts` | `menu/`, `docs/components/menu.md` | Expressive menu utility is labs-only |
| 20 | Navigation bars | **Labs/experimental** | [`labs/navigationbar`](https://github.com/material-components/material-web/tree/main/labs/navigationbar); not in `all.ts` | `labs/navigationbar/` | Flexible expressive navigation bar parity is not established ([M3 page](https://m3.material.io/components/navigation-bar)) |
| 21 | Navigation drawers | **Labs/experimental** | [`labs/navigationdrawer`](https://github.com/material-components/material-web/tree/main/labs/navigationdrawer); not in `all.ts` | `labs/navigationdrawer/` | No stable application-shell navigation |
| 22 | Navigation rail | **Partial/closest primitive** | Labs navigation bar/drawer/tab primitives exist; no navigation-rail element | `labs/navigationbar/`, `labs/navigationdrawer/`, `labs/navigationtab/`; no rail source | M3's collapsed/expanded rail is distinct and current baseline is not recommended ([M3 specs](https://m3.material.io/components/navigation-rail/specs)) |
| 23 | Progress indicators | **Stable equivalent** | `md-circular-progress`, `md-linear-progress` in [`progress/`](https://github.com/material-components/material-web/tree/main/progress), exported by `all.ts` | `progress/`, `docs/components/progress.md` | Audit current expressive sizes/wavy variants before claiming visual parity |
| 24 | Radio buttons | **Stable equivalent** | [`radio/radio.ts`](https://github.com/material-components/material-web/blob/main/radio/radio.ts), exported by `all.ts` | `radio/radio.ts`, `docs/components/radio.md` | Expressive utility remains labs-only |
| 25 | Search | **Partial/closest primitive** | Stable text-field, icon-button, list, menu, and dialog primitives exist, but no search bar/view export; the frozen roadmap lists Search among unbuilt components ([M3 Search](https://m3.material.io/components/search/overview), [roadmap](https://github.com/material-components/material-web/blob/main/docs/roadmap.md)) | `textfield/`, `iconbutton/`, `list/`, `menu/`, `dialog/`; no search source | Composition lacks an official query, suggestion, result, focus, and responsive-view controller |
| 26 | Segmented buttons | **Labs/experimental** | [`labs/segmentedbutton`](https://github.com/material-components/material-web/tree/main/labs/segmentedbutton) and [`labs/segmentedbuttonset`](https://github.com/material-components/material-web/tree/main/labs/segmentedbuttonset) | `labs/segmentedbutton/`, `labs/segmentedbuttonset/` | Outlined variant only; not stable |
| 27 | Side sheets | **Partial/closest primitive** | Stable dialog and labs navigation drawer are related primitives, but no side-sheet export ([M3 Side sheets](https://m3.material.io/components/side-sheets/overview), [repository tree](https://github.com/material-components/material-web/tree/main)) | `dialog/`, `labs/navigationdrawer/`; no side-sheet source | Related primitives have different semantics, modality, sizing, and responsive behavior |
| 28 | Sliders | **Stable equivalent** | [`slider/slider.ts`](https://github.com/material-components/material-web/blob/main/slider/slider.ts), exported by `all.ts` | `slider/slider.ts`, `docs/components/slider.md` | Audit current M3 expressive size/value-indicator variants |
| 29 | Snackbars | **Absent** | No snackbar element in stable or labs exports | No snackbar source | Dialog is not an accessible substitute for non-modal status feedback |
| 30 | Split button | **Labs/experimental** | Expressive split button added under labs in [2.5.0](https://github.com/material-components/material-web/releases/tag/v2.5.0), [`labs/gb/components/splitbutton`](https://github.com/material-components/material-web/tree/main/labs/gb/components/splitbutton) | `labs/gb/components/splitbutton/` | Utility-class/labs API; not stable-exported |
| 31 | Switches | **Stable equivalent** | [`switch/switch.ts`](https://github.com/material-components/material-web/blob/main/switch/switch.ts), exported by `all.ts` | `switch/switch.ts`, `docs/components/switch.md` | Expressive utility remains labs-only |
| 32 | Tabs | **Stable equivalent** | `md-tabs`, `md-primary-tab`, `md-secondary-tab` in [`tabs/`](https://github.com/material-components/material-web/tree/main/tabs), exported by `all.ts` | `tabs/`, `docs/components/tabs.md` | Navigation tabs also have separate labs experiments |
| 33 | Text fields | **Stable equivalent** | Filled and outlined elements in [`textfield/`](https://github.com/material-components/material-web/tree/main/textfield), exported by `all.ts` | `textfield/`, `docs/components/text-field.md` | Stable select is a separate Material Web API but not a separate current M3 catalog family |
| 34 | Time pickers | **Absent** | No time-picker stable or labs element | No time-picker source | Native time inputs are an alternative, not a Material implementation |
| 35 | Toolbars | **Partial/closest primitive** | Stable button/icon-button/text-field/FAB primitives exist, but no toolbar element/export; M3 describes toolbar as a component container ([guidance](https://m3.material.io/components/toolbars/guidelines)) | Relevant primitives exist; no toolbar source | Composition can supply content, but responsive docked/floating layout and focus/overflow contract are absent |
| 36 | Tooltips | **Absent** | No tooltip element in stable or labs exports; M3 reports Web unavailable ([M3 overview](https://m3.material.io/components/tooltips/overview)) | No tooltip source; historical tooltip token files do not create an element | `title` or custom composition does not establish M3 behavior/accessibility |

### Inventory totals

- Stable Material Web equivalent: **16**
- Labs/experimental: **7**
- Partial/closest primitive: **8**
- Absent: **5**
- Total M3 catalog families: **36**

## Appendix B — Material Web items that are not separate M3 catalog families

Material Web also exports supporting primitives and controls that should not inflate M3 catalog coverage:

- `md-icon`, `md-ripple`, `md-focus-ring`, and `md-elevation` are implementation/design primitives (`all.ts`).
- `md-filled-field` and `md-outlined-field` are lower-level field primitives (`all.ts`).
- `md-filled-select`, `md-outlined-select`, and `md-select-option` are stable controls (`all.ts`), but Select is not a separately named family in the M3 catalog snapshot used here; it is therefore not included in the denominator.
- Sub-menu, chip set, list item, menu item, and tab variants are subcomponents/variants of catalog families, not additional catalog families.

## Appendix C — uncertainty and reproducibility notes

1. The M3 catalog is rendered dynamically and changes without versioned snapshots. Its top-level page exposed limited text to non-browser fetching during this research. The 36-name inventory was cross-checked against the live official catalog and linked official pages, but future readers should re-open [the catalog](https://m3.material.io/components) and record additions/removals before reusing the counts.
2. M3 uses “available” to describe design variants; that does not imply a Material Web implementation. This report intentionally derives implementation status from source/export locations.
3. Recent `labs/gb` components are utility-class/experimental work. Their presence in the `2.5.0` release notes does not promote them into upstream `all.ts`.
4. “Materially incomplete” is based on visible variant/behavior differences and the stable-vs-labs boundary. It is not a conformance certification; detailed visual and accessibility parity requires per-component test matrices.
5. No first-party page required authentication. The dynamic M3 top-level page was only partially extractable through text fetching, which is the principal access limitation.

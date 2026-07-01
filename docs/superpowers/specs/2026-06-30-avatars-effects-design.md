# 斗地主头像与出牌特效设计文档

## 1. 背景与目标

为现有的 React + TypeScript + Vite 斗地主网页游戏增强视觉表现：
- 加入写实古风风格的地主与农民头像。
- 在炸弹、火箭、飞机等关键牌型出牌后播放全屏特效。

## 2. 设计决策

| 决策项 | 选择 | 原因 |
|--------|------|------|
| 头像风格 | 写实古风 | 用户明确选择，匹配「中式茶馆牌桌」主题 |
| 资源来源 | TRAE 图片生成接口内置 | 产物无需外部网络，部署时一起打包 |
| 特效范围 | 炸弹、火箭、飞机 | 用户选择，覆盖高冲击牌型 |
| 特效强度 | 全屏动效 | 用户选择，增强游戏体验 |
| 实现方案 | 完整视觉升级 | 头像 + 特效一次性完成 |

## 3. 资源规划

### 3.1 图片资源

生成 3 张头像图片，保存到 `public/assets/avatars/`：

| 文件名 | 角色 | 画面描述 |
|--------|------|----------|
| `landlord.svg` | 地主 | 中年男性，穿华服，古风，金色边框 |
| `farmer-male.svg` | 农民甲 | 青年男性，布衣斗笠，古风 |
| `farmer-female.svg` | 农民乙 | 青年女性，布衣头巾，古风 |

- 格式：SVG 矢量图，体积小、缩放清晰，与项目一起打包。
- 说明：原计划使用 TRAE 图片接口生成写实 PNG，但该接口在当前环境返回异步占位图，因此改用 SVG 矢量头像以保证功能完整；后续可随时替换为真实图片。

### 3.2 部署路径

Vite 在构建时会自动把 `public/` 下的资源复制到 `dist/` 根目录。运行和部署产物中，头像可通过 `/assets/avatars/landlord.svg` 访问。

## 4. UI 改动

### 4.1 头像展示

- **AI 手牌区（`AIHand`）**：在名字上方显示头像；地主头像加金色边框和右上角皇冠角标；当前回合头像外圈高亮。
- **玩家区（`GameScreen`）**：在底部「你的回合 / 等待中」信息左侧显示玩家头像；成为地主后加金色边框。

### 4.2 特效层

新增 `EffectOverlay` 组件，绝对定位覆盖整个牌桌（不覆盖顶部 header），根据 `lastPlay.pattern.type` 播放动画：

| 牌型 | 动画效果 | 持续时间 |
|------|----------|----------|
| `BOMB` | 桌面震动（CSS `animation: shake`）+ 中央爆炸闪光 + 金色粒子四散 | 1.2s |
| `ROCKET` | 白屏闪光 + 底部升起金色光柱/尾焰 | 1.2s |
| `PLANE` | 多张纸牌从左侧飞向右侧 + 拖尾残影 | 1.2s |

特效结束后自动清空状态，不影响下一轮出牌。

## 5. 状态与数据流

### 5.1 现有状态

`gameStore` 已包含 `lastPlay: LastPlay | null`，其中 `lastPlay.pattern.type` 可直接用于判断特效类型。

### 5.2 新增状态

在 `GameStore` 中新增：

```ts
effect: {
  type: 'BOMB' | 'ROCKET' | 'PLANE' | null;
  key: number; // 用于强制重新触发动画
}
clearEffect: () => void;
```

### 5.3 触发流程

1. `playCards(playerId, cards)` 成功执行后，读取 `pattern.type`。
2. 若 `pattern.type` 为 `BOMB` / `ROCKET` / `PLANE`，设置 `effect` 状态并递增 `key`。
3. `GameScreen` 订阅 `effect`，非空时渲染 `EffectOverlay` 并传入 `type` 和 `key`。
4. `EffectOverlay` 在动画结束时调用 `clearEffect()`。

## 6. 组件改动清单

| 文件 | 改动 |
|------|------|
| `src/components/AIHand.tsx` | 添加头像展示、地主边框、当前回合高亮 |
| `src/components/GameScreen.tsx` | 添加玩家头像；引入并渲染 `EffectOverlay` |
| `src/components/EffectOverlay.tsx` | 新增全屏特效组件 |
| `src/store/gameStore.ts` | 新增 `effect` 状态与 `clearEffect` 动作；在 `playCards` 中触发特效 |
| `src/index.css` | 新增头像样式、特效关键帧动画 |

## 7. 技术约束

- 不使用第三方动画库，仅用 CSS keyframes + React 状态，避免增加依赖。
- 特效层使用 `pointer-events-none`，不拦截牌桌点击。
- 头像图片使用 `object-cover`，确保圆形/圆角裁剪后主体居中。
- 保持响应式：移动端头像缩小，特效缩放以 viewport 为基准。

## 8. 验收标准

- [ ] 3 张头像图片生成并位于 `public/assets/avatars/`。
- [ ] 地主与农民头像在牌桌正确显示，地主有金色边框/皇冠标识。
- [ ] 玩家头像在底部区域显示，成为地主后边框变金。
- [ ] 出炸弹时屏幕震动并出现爆炸闪光。
- [ ] 出火箭时出现白屏闪光与上升光柱。
- [ ] 出飞机时有多张纸牌飞过的拖尾效果。
- [ ] 动画结束后特效自动消失，不影响后续操作。
- [ ] `pnpm build` 成功，产物包含头像图片。

# 斗地主头像与出牌特效实现计划

> **For agentic workers:** 本计划由当前会话直接执行，不依赖外部 subagent skill。项目无前端单元测试套件，以 `pnpm build` 和人工预览作为验收手段。

**Goal:** 为斗地主网页游戏加入写实古风头像与炸弹/火箭/飞机出牌全屏特效。

**Architecture:** 图片资源通过 TRAE 图片接口生成并内置到 `public/assets/avatars/`；特效状态由 Zustand store 维护，出牌成功后写入特效类型与递增 key；`GameScreen` 订阅状态并渲染 `EffectOverlay`，动画结束后自动清空。

**Tech Stack:** React + TypeScript + Vite + Tailwind CSS + Zustand，纯 CSS keyframes 实现动效。

---

## File Structure

| 文件 | 职责 |
|------|------|
| `public/assets/avatars/landlord.svg` | 地主头像（SVG 矢量） |
| `public/assets/avatars/farmer-male.svg` | 农民甲头像（SVG 矢量） |
| `public/assets/avatars/farmer-female.svg` | 农民乙头像（SVG 矢量） |
| `src/components/EffectOverlay.tsx` | 全屏特效层组件 |
| `src/components/AIHand.tsx` | 显示 AI 头像、地主边框、当前回合高亮 |
| `src/components/GameScreen.tsx` | 显示玩家头像、挂载 EffectOverlay |
| `src/store/gameStore.ts` | 新增 effect 状态、clearEffect、触发逻辑 |
| `src/index.css` | 头像与特效关键帧动画 |

---

## Task 1: 创建头像图片

**Files:**
- Create: `public/assets/avatars/landlord.svg`
- Create: `public/assets/avatars/farmer-male.svg`
- Create: `public/assets/avatars/farmer-female.svg`

**说明：** 原计划使用 TRAE 图片接口生成写实 PNG，但该接口在当前环境返回异步占位图，无法直接下载最终图片。因此改用 SVG 矢量头像，体积小、可缩放，且与项目一起打包。后续可随时替换为真实 PNG 图片。

**Steps:**

- [ ] **Step 1.1: 创建地主头像 SVG**

  保存为 `public/assets/avatars/landlord.svg`：古风中年男性，华服，金色边框。

- [ ] **Step 1.2: 创建农民甲头像 SVG**

  保存为 `public/assets/avatars/farmer-male.svg`：青年男性，布衣斗笠。

- [ ] **Step 1.3: 创建农民乙头像 SVG**

  保存为 `public/assets/avatars/farmer-female.svg`：青年女性，布衣头巾。

- [ ] **Step 1.4: 验证图片存在**

  运行：
  ```bash
  ls -la public/assets/avatars/
  ```
  Expected: 三张 SVG 文件存在。

---

## Task 2: 添加 CSS 动画与头像样式

**Files:**
- Modify: `src/index.css`

**Steps:**

- [ ] **Step 2.1: 添加头像通用样式**

  ```css
  .avatar {
    @apply rounded-full object-cover border-2 border-transparent transition-all duration-200;
  }
  .avatar-landlord {
    @apply border-[#d4a653] shadow-[0_0_8px_rgba(212,166,83,0.6)];
  }
  .avatar-active {
    @apply ring-2 ring-[#d4a653] ring-offset-2 ring-offset-[#0a1f18];
  }
  ```

- [ ] **Step 2.2: 添加桌面震动动画**

  ```css
  @keyframes table-shake {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-4px, -4px); }
    20% { transform: translate(4px, 4px); }
    30% { transform: translate(-4px, 4px); }
    40% { transform: translate(4px, -4px); }
    50% { transform: translate(-2px, 2px); }
    60% { transform: translate(2px, -2px); }
    70% { transform: translate(-2px, -2px); }
    80% { transform: translate(2px, 2px); }
    90% { transform: translate(0, 0); }
  }
  .animate-table-shake {
    animation: table-shake 0.5s ease-in-out;
  }
  ```

- [ ] **Step 2.3: 添加爆炸闪光动画**

  ```css
  @keyframes bomb-flash {
    0% { opacity: 0; transform: scale(0.5); }
    40% { opacity: 1; transform: scale(1.2); }
    100% { opacity: 0; transform: scale(1.5); }
  }
  .animate-bomb-flash {
    animation: bomb-flash 1.2s ease-out forwards;
  }
  ```

- [ ] **Step 2.4: 添加火箭上升光柱动画**

  ```css
  @keyframes rocket-flash {
    0% { opacity: 0; }
    20% { opacity: 0.9; }
    40% { opacity: 0.2; }
    60% { opacity: 0.8; }
    100% { opacity: 0; }
  }
  @keyframes rocket-beam {
    0% { transform: translateY(100%) scaleY(0); opacity: 0; }
    30% { opacity: 1; }
    100% { transform: translateY(-120%) scaleY(1); opacity: 0; }
  }
  .animate-rocket-flash {
    animation: rocket-flash 1.2s ease-out forwards;
  }
  .animate-rocket-beam {
    animation: rocket-beam 1.2s ease-out forwards;
  }
  ```

- [ ] **Step 2.5: 添加飞机飞行动画**

  ```css
  @keyframes plane-fly {
    0% { transform: translateX(-120vw) rotate(-10deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateX(120vw) rotate(-10deg); opacity: 0; }
  }
  .animate-plane-fly {
    animation: plane-fly 1.2s ease-in-out forwards;
  }
  ```

- [ ] **Step 2.6: 添加粒子动画**

  ```css
  @keyframes particle-burst {
    0% { transform: translate(0, 0) scale(1); opacity: 1; }
    100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0); opacity: 0; }
  }
  .particle {
    animation: particle-burst 1s ease-out forwards;
  }
  ```

---

## Task 3: 扩展 gameStore 特效状态

**Files:**
- Modify: `src/store/gameStore.ts`

**Steps:**

- [ ] **Step 3.1: 在 GameStore 类型中新增 effect 字段**

  在 `interface GameStore` 中新增：
  ```ts
  effect: { type: 'BOMB' | 'ROCKET' | 'PLANE' | null; key: number };
  clearEffect: () => void;
  ```

- [ ] **Step 3.2: 在初始状态中加入 effect**

  在 `makeInitialState` 返回的对象中加入：
  ```ts
  effect: { type: null, key: 0 },
  ```

- [ ] **Step 3.3: 实现 clearEffect**

  在 store actions 中加入：
  ```ts
  clearEffect: () => set((state) => ({ effect: { ...state.effect, type: null } })),
  ```

- [ ] **Step 3.4: 在 playCards 中触发特效**

  在 `playCards` 中，设置 `lastPlay` 和 `logs` 之后、检查手牌是否出完之前，加入：
  ```ts
  const effectType = pattern.type === 'BOMB' || pattern.type === 'ROCKET' || pattern.type === 'PLANE'
    ? pattern.type
    : null;
  const effect = effectType
    ? { type: effectType, key: state.effect.key + 1 }
    : state.effect;
  ```

  并在 `set({ players, lastPlay, selectedCardIds, logs })` 中加上 `effect`。

---

## Task 4: 创建 EffectOverlay 组件

**Files:**
- Create: `src/components/EffectOverlay.tsx`

**Steps:**

- [ ] **Step 4.1: 编写组件骨架**

  ```tsx
  import { useEffect } from 'react';
  import { useGameStore } from '@/store/gameStore';

  interface EffectOverlayProps {
    type: 'BOMB' | 'ROCKET' | 'PLANE';
    effectKey: number;
  }

  export function EffectOverlay({ type, effectKey }: EffectOverlayProps) {
    const clearEffect = useGameStore((state) => state.clearEffect);

    useEffect(() => {
      const timer = setTimeout(() => clearEffect(), 1200);
      return () => clearTimeout(timer);
    }, [effectKey, clearEffect]);

    if (type === 'BOMB') {
      return (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-yellow-100/30 animate-bomb-flash" />
          <div className="text-6xl font-black text-[#d4a653] animate-bomb-flash drop-shadow-[0_0_20px_rgba(212,166,83,0.9)]">
            炸弹！
          </div>
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="particle absolute w-2 h-2 rounded-full bg-[#d4a653]"
              style={{
                left: '50%',
                top: '50%',
                '--tw-translate-x': `${Math.cos((i / 24) * Math.PI * 2) * (120 + Math.random() * 80)}px`,
                '--tw-translate-y': `${Math.sin((i / 24) * Math.PI * 2) * (120 + Math.random() * 80)}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      );
    }

    if (type === 'ROCKET') {
      return (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-end justify-center overflow-hidden">
          <div className="absolute inset-0 bg-white animate-rocket-flash" />
          <div className="absolute bottom-0 w-24 h-[80vh] bg-gradient-to-t from-[#d4a653] via-yellow-200/60 to-transparent animate-rocket-beam blur-md" />
          <div className="absolute bottom-10 text-5xl font-black text-[#d4a653] animate-rocket-beam drop-shadow-[0_0_20px_rgba(212,166,83,0.9)]">
            火箭！
          </div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 animate-plane-fly text-4xl"
            style={{
              animationDelay: `${i * 0.1}s`,
              top: `${30 + i * 10}%`,
            }}
          >
            ✈️
          </div>
        ))}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-[#d4a653] animate-plane-fly drop-shadow-[0_0_15px_rgba(212,166,83,0.8)]">
          飞机！
        </div>
      </div>
    );
  }
  ```

---

## Task 5: 更新 AIHand 显示头像

**Files:**
- Modify: `src/components/AIHand.tsx`

**Steps:**

- [ ] **Step 5.1: 增加头像 URL 映射与 props**

  在文件顶部加入：
  ```ts
  const avatarMap: Record<string, string> = {
    '农民甲': '/assets/avatars/farmer-male.svg',
    '农民乙': '/assets/avatars/farmer-female.svg',
    '我': '/assets/avatars/landlord.svg',
  };
  ```

- [ ] **Step 5.2: 在 AI 名字上方渲染头像**

  在名字/皇冠行之前插入：
  ```tsx
  <div className="relative">
    <img
      src={avatarMap[name] || '/assets/avatars/farmer-male.svg'}
      alt={name}
      className={`w-12 h-12 sm:w-14 sm:h-14 avatar ${isLandlord ? 'avatar-landlord' : ''} ${isActive ? 'avatar-active' : ''}`}
    />
    {isLandlord && (
      <Crown className="absolute -top-1 -right-1 w-4 h-4 text-[#d4a653] bg-[#0a1f18] rounded-full p-0.5" />
    )}
  </div>
  ```

- [ ] **Step 5.3: 调整容器布局**

  确保 `AIHand` 容器为 `flex flex-col items-center gap-2`。

---

## Task 6: 更新 GameScreen 显示玩家头像与特效层

**Files:**
- Modify: `src/components/GameScreen.tsx`

**Steps:**

- [ ] **Step 6.1: 导入 EffectOverlay**

  在文件顶部加入：
  ```ts
  import { EffectOverlay } from './EffectOverlay';
  ```

- [ ] **Step 6.2: 读取 effect 状态**

  在 `useGameStore` 解构中加入：
  ```ts
  effect,
  ```

- [ ] **Step 6.3: 在玩家信息区添加头像**

  在底部玩家区域，将：
  ```tsx
  <div className="flex items-center gap-2 text-sm">
  ```
  改为：
  ```tsx
  <div className="flex items-center gap-2 text-sm">
    <img
      src="/assets/avatars/landlord.svg"
      alt="玩家"
      className={`w-10 h-10 sm:w-12 sm:h-12 avatar ${landlordId === 'player' ? 'avatar-landlord' : ''} ${currentTurn === 'player' ? 'avatar-active' : ''}`}
    />
  ```

- [ ] **Step 6.4: 在牌桌区域挂载 EffectOverlay**

  将中间牌桌区域：
  ```tsx
  <div className="flex-1 flex flex-col justify-center">
    <PlayArea ... />
  </div>
  ```
  改为：
  ```tsx
  <div className="flex-1 flex flex-col justify-center relative">
    <PlayArea ... />
    {effect.type && <EffectOverlay type={effect.type} effectKey={effect.key} />}
  </div>
  ```

- [ ] **Step 6.5: 为整个牌桌区域添加震动类**

  当 effect.type === 'BOMB' 时，给外层 `div` 添加 `animate-table-shake`。

  可以在主游戏区域外层添加条件类名：
  ```tsx
  <div className={`flex-1 flex flex-col px-2 sm:px-6 py-4 gap-4 overflow-hidden ${effect.type === 'BOMB' ? 'animate-table-shake' : ''}`}>
  ```

---

## Task 7: 构建与验证

**Files:**
- Verify: `dist/assets/avatars/`

**Steps:**

- [ ] **Step 7.1: 类型检查**

  运行：
  ```bash
  pnpm check
  ```
  Expected: 无 TypeScript 错误。

- [ ] **Step 7.2: 构建产物**

  运行：
  ```bash
  pnpm build
  ```
  Expected: `dist/` 生成成功，包含 `dist/assets/avatars/` 下的三张图片。

- [ ] **Step 7.3: 本地预览（可选）**

  运行：
  ```bash
  pnpm preview
  ```
  打开浏览器访问输出 URL，检查：
  - 地主/农民头像显示正常。
  - 出炸弹、火箭、飞机时有对应特效。
  - 动画结束后能继续正常出牌。

---

## Self-Review

- **Spec coverage:** 头像生成、头像展示位置、三种特效、状态触发、构建验证均已覆盖。
- **Placeholder scan:** 无 TBD/TODO；所有代码与命令均已给出。
- **Type consistency:** `effect.type` 在 store、GameScreen、EffectOverlay 中均使用 `'BOMB' | 'ROCKET' | 'PLANE' | null` 或子集，一致。

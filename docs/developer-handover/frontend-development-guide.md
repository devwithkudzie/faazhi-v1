# Frontend Development Guide

## Add A New Frontend Page

1. Create a route in `apps/web/app`.
2. Create or reuse a feature page in `apps/web/features`.
3. Keep the route file thin.

Example:

```tsx
import MyFeaturePage from "@/features/my-feature/MyFeaturePage";

export default function Page() {
  return <MyFeaturePage />;
}
```

## Add A New Feature Module

Recommended structure:

```txt
features/new-feature/
├── NewFeaturePage.tsx
├── components/
├── hooks/
├── data/
├── types/
└── utils/
```

Start feature-specific. Promote to `shared/` only when reuse is real.

## Add A New Scene Type

1. Add the type:

```ts
export type SceneType = "concept" | "example" | "new-type";
```

2. Create a renderer:

```txt
features/learn/components/scenes/NewTypeScene.tsx
```

3. Add it to `SceneRenderer`.

4. Add sample scene data.

## Add A New UI Component

Use feature components by default:

```txt
features/learn/components/player/MyComponent.tsx
```

Use shared UI only when the component is generic:

```txt
shared/ui/button.tsx
```

## Tailwind And Styling

Faazhi styling direction:

- soft blue educational accents
- light workspace backgrounds
- rounded panels
- subtle shadows
- clear typography
- low clutter

Avoid:

- harsh borders everywhere
- excessive cards inside cards
- one-off colors without a reason
- large monolithic components

## Maintainable Components

Split components when:

- file exceeds roughly 250-350 lines
- state logic becomes hard to follow
- rendering branches are unrelated
- a section can be named clearly

Keep hooks focused:

- one hook for player state
- one hook for captions
- one hook for navigation
- avoid hooks that know about the whole app


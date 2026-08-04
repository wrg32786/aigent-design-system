# React Three Fiber

Use React Three Fiber only inside an existing React product when live Three.js is already justified.

```bash
npm install three @react-three/fiber
```

Do not introduce React to a static page merely to access Three.js.

The same production rules apply:

- optimized assets
- bounded device pixel ratio
- suspense/loading state
- reduced motion
- offscreen pause
- error fallback
- mobile performance test

Read `skills/threejs-web-scene/SKILL.md`.

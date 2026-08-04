# Runtime Selection

Choose the runtime after the asset and interaction are understood.

## Decision ladder

1. **Does the scene need to move?**  
   If not, use an optimized image.

2. **Does movement need to react to scroll but not user manipulation?**  
   Use CSS, video, or a frame sequence.

3. **Does the user only need to rotate or inspect one model?**  
   Use `model-viewer`.

4. **Does a visual author need to build the scene quickly?**  
   Use Spline if its export and performance constraints fit.

5. **Does the page require live geometry, custom shaders, procedural state, or multiple interactive objects?**  
   Use Three.js.

6. **Is the existing product React and live 3D is already justified?**  
   React Three Fiber may reduce integration friction.

7. **Does the visual need to be rendered into reusable media variants?**  
   Use Blender, Remotion, or an editor at build time. Do not ship the renderer to the browser.

## Choreography

- Native CSS and IntersectionObserver handle small reveals.
- GSAP handles coordinated DOM, scroll, video, and scene timelines.
- Theatre.js can author complex Three.js keyframes visually.
- Rive handles compact interactive vector state machines.

Use one primary motion system on a page. Multiple libraries must not compete for the same state.

## Fallback order

Every rich scene needs an ordered fallback:

```text
primary interactive or cinematic scene
    ↓
reduced-motion state
    ↓
mobile-light state
    ↓
poster or still
    ↓
readable content without media
```

The page remains complete at every level.

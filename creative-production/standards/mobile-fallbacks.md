# Mobile and Reduced-Motion Fallbacks

A fallback is an authored state, not the desktop experience with features disabled.

## Video

Provide:

- a mobile crop when the focal point would be lost
- a poster with the same visual hierarchy
- no autoplay audio
- a reduced-motion still or short non-scrub state
- controls that remain reachable without the media

## 3D

Possible mobile reductions:

- fewer polygons
- smaller textures
- no post-processing
- capped pixel ratio
- paused animation when offscreen
- `model-viewer` instead of a custom scene
- turntable video instead of live 3D
- poster instead of video

## Frame sequences

- reduce frame count
- reduce dimensions
- load frames in the direction of travel
- keep the first useful frame available immediately
- use a poster for reduced motion

## Content integrity

At every fallback level:

- the heading and primary action remain visible
- the page still explains the product or artifact
- media does not trap focus
- no essential information exists only in motion
- contrast is checked against the actual fallback

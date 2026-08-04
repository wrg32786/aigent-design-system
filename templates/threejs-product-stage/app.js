import { mountScrollProgress } from "../../modules/motion.js";

    const stage = document.querySelector("#stage");
    const host = document.querySelector("#webgl");
    const button = document.querySelector("#enable-3d");
    const status = document.querySelector("#status");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = navigator.connection?.saveData === true;
    let cleanup = null;
    let loading = false;

    mountScrollProgress();

    async function enable() {
      if (loading || cleanup) return;
      loading = true;
      button.disabled = true;
      status.textContent = "Loading Three.js…";

      try {
        const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js");
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
        camera.position.set(0, 0, 7);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 780 ? 1.25 : 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        host.append(renderer.domElement);

        const group = new THREE.Group();
        scene.add(group);

        const core = new THREE.Mesh(
          new THREE.IcosahedronGeometry(1.05, 2),
          new THREE.MeshPhysicalMaterial({
            color: 0x5aa5ff,
            roughness: .24,
            metalness: .48,
            clearcoat: .75,
            emissive: 0x071a3e,
            emissiveIntensity: .55
          })
        );
        group.add(core);

        const ringMaterial = new THREE.MeshStandardMaterial({
          color: 0xb5ed63,
          roughness: .42,
          metalness: .72,
          emissive: 0x142500,
          emissiveIntensity: .25
        });

        [
          [1.75, .032, Math.PI * .24, Math.PI * .12],
          [2.2, .024, Math.PI * .62, Math.PI * .34],
          [2.72, .018, Math.PI * .38, Math.PI * .72]
        ].forEach(([radius, tube, x, y]) => {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, 160), ringMaterial);
          ring.rotation.set(x, y, 0);
          group.add(ring);
        });

        scene.add(new THREE.HemisphereLight(0xdde9ff, 0x06080d, 1.8));
        const key = new THREE.DirectionalLight(0xffffff, 4.2);
        key.position.set(4, 4, 5);
        scene.add(key);
        const rim = new THREE.PointLight(0x66aaff, 14, 12);
        rim.position.set(-3, 1, 3);
        scene.add(rim);

        let pointerX = 0;
        let pointerY = 0;
        let visible = true;
        let frame = 0;
        let last = performance.now();

        function resize() {
          const rect = stage.getBoundingClientRect();
          renderer.setSize(rect.width, rect.height, false);
          camera.aspect = rect.width / Math.max(1, rect.height);
          camera.updateProjectionMatrix();
        }

        function move(event) {
          if (reduced.matches) return;
          pointerX = (event.clientX / innerWidth - .5) * .32;
          pointerY = (event.clientY / innerHeight - .5) * .24;
        }

        function render(now) {
          frame = requestAnimationFrame(render);
          if (!visible || document.hidden) return;
          const delta = Math.min(.05, (now - last) / 1000);
          last = now;
          const scroll = Number(getComputedStyle(document.documentElement).getPropertyValue("--ds-scroll")) || 0;
          const targetY = pointerX + scroll * .9;
          const targetX = pointerY + scroll * .18;
          group.rotation.y += (targetY - group.rotation.y) * Math.min(1, delta * 4.5);
          group.rotation.x += (targetX - group.rotation.x) * Math.min(1, delta * 4.5);
          if (!reduced.matches) core.rotation.z += delta * .12;
          renderer.render(scene, camera);
        }

        const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .01 });
        observer.observe(stage);
        addEventListener("resize", resize);
        addEventListener("pointermove", move, { passive: true });
        resize();
        render(performance.now());

        cleanup = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          removeEventListener("resize", resize);
          removeEventListener("pointermove", move);
          renderer.dispose();
          core.geometry.dispose();
          core.material.dispose();
          ringMaterial.dispose();
          host.replaceChildren();
        };

        stage.dataset.live = "true";
        status.textContent = "Live 3D active";
        button.textContent = "Live 3D enabled";
      } catch (error) {
        console.error(error);
        status.textContent = "Three.js unavailable — static fallback preserved";
        button.disabled = false;
        button.textContent = "Retry live 3D";
      } finally {
        loading = false;
      }
    }

    button.addEventListener("click", enable);

    if (!reduced.matches && !saveData && innerWidth >= 960) {
      (globalThis.requestIdleCallback || ((callback) => setTimeout(callback, 900)))(() => enable(), { timeout: 2400 });
    }

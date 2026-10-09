const backdrop = document.getElementById("cyber-logo-backdrop");
const canvas = document.getElementById("cyber-logo-canvas");
const staticLogo = document.getElementById("cyber-logo");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!reducedMotion.matches) {
  startLogoMotion().catch((error) => {
    console.error("Cyber logo renderer could not start; showing the static logo instead.", error);
  });
}

async function startLogoMotion() {
  const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
  const isMobile = window.matchMedia("(max-width: 700px)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(document.documentElement.clientWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const accent = new THREE.Color(getComputedStyle(staticLogo).color);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, .1, 40);
  camera.position.set(0, 0, 5.6);
  const logo = new THREE.Group();
  scene.add(logo);

  // Change this shield path and the lock shapes below to replace the 3D logo artwork.
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 1.42);
  shieldShape.lineTo(1.14, 1);
  shieldShape.lineTo(1.04, .1);
  shieldShape.bezierCurveTo(.98, -.48, .5, -.99, 0, -1.3);
  shieldShape.bezierCurveTo(-.5, -.99, -.98, -.48, -1.04, .1);
  shieldShape.lineTo(-1.14, 1);
  shieldShape.closePath();

  const depth = .14;
  const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: .035,
    bevelThickness: .035,
    curveSegments: 12
  });
  shieldGeometry.translate(0, 0, -depth / 2);
  const shieldMaterial = new THREE.MeshStandardMaterial({
    color: accent,
    emissive: accent,
    emissiveIntensity: .28,
    metalness: .5,
    roughness: .32,
    transparent: true,
    opacity: .42,
    side: THREE.DoubleSide
  });
  const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
  logo.add(shield);

  const shieldPoints = [
    [0, 1.42], [1.14, 1], [1.04, .1], [.98, -.48], [.5, -.99], [0, -1.3],
    [-.5, -.99], [-.98, -.48], [-1.04, .1], [-1.14, 1]
  ].map(([x, y]) => new THREE.Vector3(x, y, .14));
  const shieldOutline = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(shieldPoints),
    new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: .9 })
  );
  logo.add(shieldOutline);

  const lockShape = new THREE.Shape();
  lockShape.moveTo(-.55, -.42);
  lockShape.lineTo(.55, -.42);
  lockShape.quadraticCurveTo(.66, -.42, .66, -.31);
  lockShape.lineTo(.66, .32);
  lockShape.quadraticCurveTo(.66, .43, .55, .43);
  lockShape.lineTo(-.55, .43);
  lockShape.quadraticCurveTo(-.66, .43, -.66, .32);
  lockShape.lineTo(-.66, -.31);
  lockShape.quadraticCurveTo(-.66, -.42, -.55, -.42);
  lockShape.closePath();
  const lockGeometry = new THREE.ExtrudeGeometry(lockShape, {
    depth: .12,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: .025,
    bevelThickness: .025,
    curveSegments: 10
  });
  lockGeometry.translate(0, -.18, .16);
  const lockMaterial = new THREE.MeshStandardMaterial({
    color: accent,
    emissive: accent,
    emissiveIntensity: .48,
    metalness: .35,
    roughness: .3,
    transparent: true,
    opacity: .68,
    side: THREE.DoubleSide
  });
  logo.add(new THREE.Mesh(lockGeometry, lockMaterial));

  const shackleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.37, .13, .2),
    new THREE.Vector3(-.37, .52, .2),
    new THREE.Vector3(-.27, .77, .2),
    new THREE.Vector3(0, .86, .2),
    new THREE.Vector3(.27, .77, .2),
    new THREE.Vector3(.37, .52, .2),
    new THREE.Vector3(.37, .13, .2)
  ]);
  const shackle = new THREE.Mesh(
    new THREE.TubeGeometry(shackleCurve, 40, .055, 10, false),
    new THREE.MeshStandardMaterial({
      color: accent, emissive: accent, emissiveIntensity: .6,
      metalness: .35, roughness: .28, side: THREE.DoubleSide
    })
  );
  logo.add(shackle);

  const keyhole = new THREE.Group();
  const keyholeDot = new THREE.Mesh(
    new THREE.CircleGeometry(.095, 20),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#0b0d18"), side: THREE.DoubleSide })
  );
  keyholeDot.position.set(0, -.09, .31);
  keyhole.add(keyholeDot);
  const keyholeStem = new THREE.Mesh(
    new THREE.PlaneGeometry(.065, .2),
    keyholeDot.material
  );
  keyholeStem.position.set(0, -.245, .312);
  keyhole.add(keyholeStem);
  logo.add(keyhole);

  const rim = new THREE.PointLight(accent, 1.4, 8);
  rim.position.set(1.8, 1.2, 2.8);
  scene.add(rim);
  const fill = new THREE.AmbientLight(accent, .4);
  scene.add(fill);

  // Adjust this value to change the number of full Y-axis turns across the page.
  const fullPageTurns = 4;
  // Adjust this value to change the slow idle spin in radians per second.
  const idleSpeed = .2;
  const pointer = { x: 0, y: 0 };
  let currentScrollRotation = 0;
  let sectionTilt = 0;
  let frame = 0;
  let pageVisible = !document.hidden;
  let loggedProgress = false;

  const render = (time) => {
    if (!pageVisible) {
      frame = 0;
      return;
    }
    const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = THREE.MathUtils.clamp(window.scrollY / scrollRange, 0, 1);
    const targetRotationY = progress * Math.PI * 2 * fullPageTurns;
    currentScrollRotation += (targetRotationY - currentScrollRotation) * .08;

    if (!loggedProgress && progress > 0) {
      console.log(`[cyber-logo] scroll progress=${progress.toFixed(3)}, Y rotation=${(targetRotationY * 180 / Math.PI).toFixed(1)}deg`);
      loggedProgress = true;
    }

    // Scroll, idle, and pointer rotations are additive rather than writing over each other.
    logo.rotation.y = currentScrollRotation + time / 1000 * idleSpeed + pointer.x * .12;
    logo.rotation.x = sectionTilt + pointer.y * .08;
    logo.rotation.z = pointer.x * .025;
    renderer.render(scene, camera);
    frame = window.requestAnimationFrame(render);
  };

  const updateSectionTilt = () => {
    const marker = window.innerHeight * .45;
    const sections = document.querySelectorAll("main section[id]");
    let sectionIndex = -1;
    sections.forEach((section, index) => {
      const bounds = section.getBoundingClientRect();
      if (bounds.top <= marker && bounds.bottom > marker) sectionIndex = index;
    });
    sectionTilt = sectionIndex < 0 ? 0 : ((sectionIndex % 5) - 2) * .035;
  };
  const onPointerMove = (event) => {
    pointer.x = event.clientX / window.innerWidth - .5;
    pointer.y = event.clientY / window.innerHeight - .5;
  };
  const onVisibilityChange = () => {
    pageVisible = !document.hidden;
    if (pageVisible && !frame) frame = window.requestAnimationFrame(render);
    else if (!pageVisible && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  const resize = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setSize(document.documentElement.clientWidth, window.innerHeight, false);
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("scroll", updateSectionTilt, { passive: true });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibilityChange);
  backdrop.classList.add("is-3d");
  staticLogo.setAttribute("aria-hidden", "true");
  updateSectionTilt();
  frame = window.requestAnimationFrame(render);

  window.addEventListener("pagehide", () => {
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", updateSectionTilt);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    scene.traverse((object) => {
      object.geometry?.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    renderer.dispose();
  }, { once: true });
}

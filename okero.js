// Based on oneko.js: https://github.com/adryd325/oneko.js (MIT)
// Art from https://pop-shop-packs.itch.io

(function okero() {
  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  if (isReducedMotion) return;

  const keroEl = document.createElement("div");
  let persistPosition = true;

  let keroPosX = 32;
  let keroPosY = 32;

  let mousePosX = 0;
  let mousePosY = 0;

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  // Frog naturally faces left. Set true when cursor is to the right.
  let facingRight = false;

  const keroSpeed = 10;

  const SPRITE_SIZE = 64;
  const HALF = SPRITE_SIZE / 2;

  // All movement uses col 3 sprites; sleeping uses col 2.
  // Coords are [col, row] as negative offsets (background-position units).
  const spriteSets = {
    idle:    [[-3, -2], [-3, -3]],  // sitting, looking back and forth
    moving:  [[-3,  0], [-3, -1]],  // land → leap
    tired:   [[-3, -2]],
    sleeping:[[-2,  0], [-2, -1]],
  };

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    keroEl.style.backgroundPosition = `${sprite[0] * SPRITE_SIZE}px ${sprite[1] * SPRITE_SIZE}px`;
    keroEl.style.transform = facingRight ? "scaleX(-1)" : "";
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // After ~20 seconds, occasionally fall asleep
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) === 0 &&
      idleAnimation == null
    ) {
      idleAnimation = "sleeping";
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) resetIdleAnimation();
        break;
      default:
        // Slow look-around: switch every ~1.5 seconds (15 frames × 100ms)
        setSprite("idle", Math.floor(idleTime / 15));
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;
    const diffX = keroPosX - mousePosX;
    const diffY = keroPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < keroSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    // Update facing whenever there's meaningful horizontal movement
    if (Math.abs(diffX) > 2) {
      facingRight = diffX < 0; // cursor is to the right of frog
    }

    if (idleTime > 1) {
      // Brief alert pause before leaping — show landing frame
      setSprite("moving", 0);
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    idleTime = 0;
    setSprite("moving", frameCount);

    keroPosX -= (diffX / distance) * keroSpeed;
    keroPosY -= (diffY / distance) * keroSpeed;

    keroPosX = Math.min(Math.max(HALF, keroPosX), window.innerWidth - HALF);
    keroPosY = Math.min(Math.max(HALF, keroPosY), window.innerHeight - HALF);

    keroEl.style.left = `${keroPosX - HALF}px`;
    keroEl.style.top = `${keroPosY - HALF}px`;
  }

  function init() {
    let keroFile = "./okero.png";
    const curScript = document.currentScript;
    if (curScript && curScript.dataset.kero) {
      keroFile = curScript.dataset.kero;
    }
    if (curScript && curScript.dataset.persistPosition) {
      if (curScript.dataset.persistPosition === "") {
        persistPosition = true;
      } else {
        persistPosition = JSON.parse(curScript.dataset.persistPosition.toLowerCase());
      }
    }

    if (persistPosition) {
      const storedKero = JSON.parse(window.localStorage.getItem("kero"));
      if (storedKero !== null) {
        keroPosX = storedKero.keroPosX;
        keroPosY = storedKero.keroPosY;
        mousePosX = storedKero.mousePosX;
        mousePosY = storedKero.mousePosY;
        frameCount = storedKero.frameCount;
        idleTime = storedKero.idleTime;
        idleAnimation = storedKero.idleAnimation;
        idleAnimationFrame = storedKero.idleAnimationFrame;
        keroEl.style.backgroundPosition = storedKero.bgPos;
      }
    }

    keroEl.id = "kero";
    keroEl.ariaHidden = true;
    keroEl.style.width = `${SPRITE_SIZE}px`;
    keroEl.style.height = `${SPRITE_SIZE}px`;
    keroEl.style.backgroundSize = `${SPRITE_SIZE * 8}px ${SPRITE_SIZE * 4}px`;
    keroEl.style.position = "fixed";
    keroEl.style.pointerEvents = "none";
    keroEl.style.imageRendering = "pixelated";
    keroEl.style.left = `${keroPosX - HALF}px`;
    keroEl.style.top = `${keroPosY - HALF}px`;
    keroEl.style.zIndex = 2147483647;
    keroEl.style.backgroundImage = `url(${keroFile})`;

    document.body.appendChild(keroEl);

    document.addEventListener("mousemove", function (event) {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });

    document.addEventListener("touchstart", function (event) {
      const touch = event.touches[0];
      mousePosX = touch.clientX;
      mousePosY = touch.clientY;
    }, { passive: true });

    document.addEventListener("touchmove", function (event) {
      const touch = event.touches[0];
      mousePosX = touch.clientX;
      mousePosY = touch.clientY;
    }, { passive: true });

    if (persistPosition) {
      window.addEventListener("beforeunload", function () {
        window.localStorage.setItem("kero", JSON.stringify({
          keroPosX,
          keroPosY,
          mousePosX,
          mousePosY,
          frameCount,
          idleTime,
          idleAnimation,
          idleAnimationFrame,
          bgPos: keroEl.style.backgroundPosition,
        }));
      });
    }

    window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp;

  function onAnimationFrame(timestamp) {
    if (!keroEl.isConnected) return;
    if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  init();
})();

/* ============================================================
   DOTTED SURFACE — fundo animado de pontos (Three.js)
   Porte em JavaScript puro do componente React "dotted-surface".
   Renderiza uma malha de pontos que ondula com o tempo, fixada
   atrás de todo o conteúdo (atrás do chat).

   Carregado como módulo ES; o Three.js vem via import map no HTML.
   ============================================================ */
import * as THREE from 'three';

(function initDottedSurface() {
  'use strict';

  var container = document.getElementById('dotted-surface');
  if (!container) return;

  // Respeita a preferência de menos movimento: desenha um quadro estático.
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parâmetros da malha de pontos.
  var SEPARATION = 150;
  var AMOUNTX = 40;
  var AMOUNTY = 60;
  // Cor dos pontos (0–1). O app é escuro, então usamos pontos claros.
  var DOT_COLOR = [0.78, 0.78, 0.78];

  // ---------- Cena ----------
  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

  var camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    10000,
  );
  camera.position.set(0, 355, 1220);

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color, 0);
  container.appendChild(renderer.domElement);

  // ---------- Pontos ----------
  var positions = [];
  var colors = [];
  var geometry = new THREE.BufferGeometry();

  for (var ix = 0; ix < AMOUNTX; ix++) {
    for (var iy = 0; iy < AMOUNTY; iy++) {
      var x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
      var y = 0; // animado no loop
      var z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
      positions.push(x, y, z);
      colors.push(DOT_COLOR[0], DOT_COLOR[1], DOT_COLOR[2]);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  var material = new THREE.PointsMaterial({
    size: 8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  var points = new THREE.Points(geometry, material);
  scene.add(points);

  var count = 0;
  var animationId = 0;

  function render() {
    var positionAttribute = geometry.attributes.position;
    var pos = positionAttribute.array;

    var i = 0;
    for (var ix = 0; ix < AMOUNTX; ix++) {
      for (var iy = 0; iy < AMOUNTY; iy++) {
        var index = i * 3;
        // Onda em Y combinando dois senos.
        pos[index + 1] =
          Math.sin((ix + count) * 0.3) * 50 +
          Math.sin((iy + count) * 0.5) * 50;
        i++;
      }
    }

    positionAttribute.needsUpdate = true;
    renderer.render(scene, camera);
    count += 0.04;
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    render();
  }

  // ---------- Resize ----------
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (reduceMotion) render(); // mantém o quadro estático nítido após resize
  }
  window.addEventListener('resize', handleResize);

  if (reduceMotion) {
    render(); // um único quadro, sem loop
  } else {
    animate();
  }

  // ---------- Limpeza ----------
  function dispose() {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationId);
    scene.traverse(function (object) {
      if (object instanceof THREE.Points) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(function (m) { m.dispose(); });
        } else {
          object.material.dispose();
        }
      }
    });
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  }
  window.addEventListener('pagehide', dispose, { once: true });
})();

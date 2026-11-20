import {Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, SRGBColorSpace, TextureLoader, WebGLRenderer} from 'three';

// A shallow fabric relief sampled on a subdivided mesh. The woven photograph
// carries the fine folds; the mesh supplies perspective and a travelling bend.
export async function mountSilk(host: HTMLElement, url: string, progress: () => number, ready: (value: boolean) => void) {
  const texture = await new TextureLoader().loadAsync(url);
  let renderer: WebGLRenderer;
  try { renderer = new WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'}); }
  catch { texture.dispose(); return; }
  const ratio = texture.image.height / texture.image.width;
  texture.colorSpace = SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0,0);
  const scene = new Scene();
  const camera = new OrthographicCamera(-.54, .54, ratio * .54, -ratio * .54, .1, 4);
  camera.position.z = 2;
  const geometry = new PlaneGeometry(1,ratio,54,30);
  const material = new MeshBasicMaterial({map: texture, transparent: true, depthWrite: false});
  const mesh = new Mesh(geometry,material);
  scene.add(mesh);
  const pos = geometry.attributes.position;
  const source = new Float32Array(pos.array);
  function paint() {
    const t = Math.min(1, progress() / .54);
    const pull = Math.sin(t * Math.PI);
    for (let i = 0; i < pos.count; i++) {
      const x = source[i*3], y = source[i*3+1];
      const side = Math.abs(x);
      const loop = Math.exp(-32 * (side-.23)**2 - 65*(y-.055)**2);
      const knot = Math.exp(-270*x*x - 110*(y-.035)**2);
      const wave = Math.sin(x*7.4 + t*4) * pull;
      pos.setXYZ(i,x + wave*.011, y + wave * (.014 + side*.028), .04*loop + .048*knot + wave*.045);
    }
    pos.needsUpdate = true;
    mesh.rotation.x = -.14 * pull;
    mesh.rotation.y = .17 * pull;
    renderer.render(scene,camera);
  }
  function size() {
    const width = host.clientWidth;
    if (!width) return;
    renderer.setSize(Math.round(width*1.08), Math.round(width*ratio*1.08), false);
    paint();
  }
  const canvas = renderer.domElement;
  const lost = (event: Event) => { event.preventDefault(); ready(false); };
  const restored = () => { size(); ready(true); };
  canvas.addEventListener('webglcontextlost',lost);
  canvas.addEventListener('webglcontextrestored',restored);
  host.appendChild(canvas);
  const observer = new ResizeObserver(size);
  observer.observe(host);
  host.addEventListener('silk-paint',paint);
  size();
  ready(true);
  return () => {
    observer.disconnect();
    host.removeEventListener('silk-paint',paint);
    canvas.removeEventListener('webglcontextlost',lost);
    canvas.removeEventListener('webglcontextrestored',restored);
    geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose();
    canvas.remove();
  };
}

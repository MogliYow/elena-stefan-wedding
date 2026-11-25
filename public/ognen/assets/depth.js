// A shallow relief mesh retains the original portrait and refracts the painted water at its base.
(() => {
  const stage=document.querySelector('.portrait-stage'), photo=stage.querySelector('img');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const canvas=document.createElement('canvas'), gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:true});
  if(!gl)return;
  const program=gl.createProgram();
  function shader(type,source){
    const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))return false;
    gl.attachShader(program,s);return true;
  }
  if(!shader(gl.VERTEX_SHADER,`attribute vec2 uv; varying vec2 tex;uniform vec2 tilt;
  void main(){tex=uv;vec2 p=(uv-.5)*2.;float face=exp(-dot((uv-vec2(.68,.29))*vec2(4.6,5.),(uv-vec2(.68,.29))*vec2(4.6,5.)));float torso=exp(-dot((uv-vec2(.6,.64))*3.,(uv-vec2(.6,.64))*3.));p+=tilt*(.25+face*.72+torso*.42);gl_Position=vec4(p.x,-p.y,0.,1.);}`)||
  !shader(gl.FRAGMENT_SHADER,`precision mediump float; varying vec2 tex; uniform sampler2D portrait;uniform float time;
  void main(){vec2 st=tex;float edge=smoothstep(.74,.96,st.y)*smoothstep(.22,.5,st.x);st.x+=sin(time*1.8+15.*st.y)*.0028*edge;gl_FragColor=texture2D(portrait,st);}`))return;
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;gl.useProgram(program);
  const vertices=[];
  for(let j=0;j<32;j++)for(let i=0;i<32;i++)for(const [dx,dy] of [[0,0],[1,0],[0,1],[1,0],[1,1],[0,1]])vertices.push((i+dx)/32,(j+dy)/32);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  const attr=gl.getAttribLocation(program,'uv');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const tilt=gl.getUniformLocation(program,'tilt'),time=gl.getUniformLocation(program,'time');
  let x=0,y=0,visible=false,ready=false,frame;
  function draw(ms){frame=0;if(!visible||!ready||document.hidden)return;const t=ms/1000;
    gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(tilt,.025*Math.sin(t*.7)+x,.016*Math.cos(t*.51)+y);gl.uniform1f(time,t);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);frame=requestAnimationFrame(draw)}
  function resume(){if(!frame)frame=requestAnimationFrame(draw)}
  function init(){canvas.width=canvas.height=Math.min(800,Math.ceil(stage.clientWidth*Math.min(devicePixelRatio,2)));gl.viewport(0,0,canvas.width,canvas.height);
    gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,photo);
    ready=true;stage.append(canvas);stage.classList.add('has-relief');resume()}
  stage.onpointermove=e=>{const r=stage.getBoundingClientRect();x=((e.clientX-r.left)/r.width-.5)*.045;y=((e.clientY-r.top)/r.height-.5)*.03};stage.onpointerleave=()=>{x=y=0};
  canvas.addEventListener('webglcontextlost',()=>{ready=false;canvas.hidden=true;stage.classList.remove('has-relief')});
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;resume()}).observe(stage);document.addEventListener('visibilitychange',resume);
  if(photo.complete&&photo.naturalWidth)init();else photo.addEventListener('load',init,{once:true});
})();

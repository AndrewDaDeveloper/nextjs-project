export const SAMPLES_MOBILE  = 24;
export const SAMPLES_DESKTOP = 48;

export const isMobile = () =>
  typeof window !== 'undefined' && window.innerWidth < 768;

export const getShader = (samples: number) => `
precision mediump float;
uniform vec2 resolution;
uniform vec2 offset;
uniform vec2 mouse;
uniform float time;
uniform sampler2D src;
#define PI 3.141593
#define SAMPLES ${samples}.

float hash3d(vec3 p){return fract(sin(dot(p,vec3(829.,4839.,432.)))*39428.);}
float hashRay(vec2 p){return fract(sin(dot(p,vec2(489.,589.)))*492.)*2.-1.;}
float hashRay3(vec3 p){return fract(sin(dot(p,vec3(489.,589.,58.)))*492.)*2.-1.;}
vec2 hashRay2(vec3 p){return vec2(hashRay3(p),hashRay3(p+1.));}

vec4 readTex(vec2 uv){
  vec4 c=texture2D(src,uv);
  c.a*=smoothstep(.5,.499,abs(uv.x-.5))*smoothstep(.5,.499,abs(uv.y-.5));
  return c;
}
vec2 zoom(vec2 uv,float t){return(uv-.5)*t+.5;}
vec3 spectrum(float x){return cos((x-vec3(0.,.5,1.))*vec3(.6,1.,.5)*PI);}

void main(){
  vec2 rawUV=(gl_FragCoord.xy-offset)/resolution;
  vec2 uv=rawUV;
  vec2 p=uv*2.-1.;
  p.x*=resolution.x/resolution.y;
  float l=length(p);

  uv=zoom(uv,0.6+smoothstep(0.,1.,pow(l,2.)*.3));
  float rd=hash3d(vec3(atan(p.y,p.x),time,0.));
  uv=(uv-.5)*(1.+rd*pow(l*.7,3.)*.3)+.5;

  vec2 uvr=uv,uvg=uv,uvb=uv;
  float waved=(1.+sin(uv.y*20.+time*3.)*.1)*.05;
  uvr.x+=.0015; uvb.x-=.0015;
  uvr=zoom(uvr,1.+waved*l*l);
  uvb=zoom(uvb,1.-waved*l*l);

  vec4 texR=readTex(uvr),texG=readTex(uvg),texB=readTex(uvb);

  vec2 mp=(mouse-offset)/resolution;
  vec2 mp_p=mp*2.-1.; mp_p.x*=resolution.x/resolution.y;
  mp=zoom(mp,0.6+smoothstep(0.,1.,pow(length(mp_p),2.)*.3));
  vec2 cp=uv*2.-1.; cp.x*=resolution.x/resolution.y;
  vec2 mp_world=mp*2.-1.; mp_world.x*=resolution.x/resolution.y;

  vec2 rp=cp;
  vec2 d=(mp_world-cp)/SAMPLES;
  float acc=0.;
  for(float i=0.;i<SAMPLES;i++){
    rp+=d+hashRay2(vec3(rp,i))*.5/SAMPLES;
    vec2 uv2=rp; uv2.x/=resolution.x/resolution.y; uv2=uv2*.5+.5;
    acc+=readTex(uv2).r/SAMPLES;
  }

  vec4 lightColor=vec4(0.);
  lightColor-=acc*.8;
  lightColor+=vec4(spectrum(cos(acc*3.5)),1.)*acc*6.;

  vec4 outColor=vec4(
    max(step(.5,texR.r),lightColor.r),
    max(step(.5,texG.r),lightColor.g),
    max(step(.5,texB.r),lightColor.b),
    texR.a+texG.a+texB.a
  );

  float res=resolution.y;
  float vigMask=smoothstep(2.,0.,l);
  outColor+=(sin(uv.y*res*.7+time*100.)*sin(uv.y*res*.3-time*130.))*.05*vigMask;
  outColor+=smoothstep(.01,.0,min(fract(uv.x*20.),fract(uv.y*20.)))*.1*vigMask;
  outColor*=1.8-l*l;
  outColor+=hash3d(vec3(rawUV,time))*.1;
  outColor-=hashRay(rawUV)*.01;

  gl_FragColor=outColor;
}
`;
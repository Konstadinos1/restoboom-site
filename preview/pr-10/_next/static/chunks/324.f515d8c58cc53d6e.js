"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[324],{2049:(e,t,r)=>{r.d(t,{Z:()=>s});let s={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`}},3264:(e,t,r)=>{r.d(t,{p:()=>a});var s=r(5339),i=r(3617);class a extends i.o{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof s.BKk?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=s.LlO.clone(e.uniforms),this.material=new s.BKk({name:void 0!==e.name?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new i.F(this.material)}render(e,t,r){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=r.texture),this._fsQuad.material=this.material,this.renderToScreen?e.setRenderTarget(null):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil)),this._fsQuad.render(e)}dispose(){this.material.dispose(),this._fsQuad.dispose()}}},3464:(e,t,r)=>{r.d(t,{X:()=>o});var s=r(5339),i=r(3617);let a={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class o extends i.o{constructor(){super(),this.isOutputPass=!0,this.uniforms=s.LlO.clone(a.uniforms),this.material=new s.D$Q({name:a.name,uniforms:this.uniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this._fsQuad=new i.F(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,r){this.uniforms.tDiffuse.value=r.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},s.ppV.getTransfer(this._outputColorSpace)===s.KLL&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===s.kyO?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===s.Mjd?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===s.nNL?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===s.FV?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===s.LAk?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===s.aJ8?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===s.g7M&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),!0===this.renderToScreen?e.setRenderTarget(null):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil)),this._fsQuad.render(e)}dispose(){this.material.dispose(),this._fsQuad.dispose()}}},3617:(e,t,r)=>{r.d(t,{F:()=>n,o:()=>i});var s=r(5339);class i{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}let a=new s.qUd(-1,1,1,-1,0,1);class o extends s.LoY{constructor(){super(),this.setAttribute("position",new s.qtW([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new s.qtW([0,2,0,0,2,0],2))}}let l=new o;class n{constructor(e){this._mesh=new s.eaF(l,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,a)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}},4497:(e,t,r)=>{r.d(t,{s:()=>h});var s=r(5339),i=r(2049),a=r(3264),o=r(3617);class l extends o.o{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,r){let s,i,a=e.getContext(),o=e.state;o.buffers.color.setMask(!1),o.buffers.depth.setMask(!1),o.buffers.color.setLocked(!0),o.buffers.depth.setLocked(!0),this.inverse?(s=0,i=1):(s=1,i=0),o.buffers.stencil.setTest(!0),o.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),o.buffers.stencil.setFunc(a.ALWAYS,s,0xffffffff),o.buffers.stencil.setClear(i),o.buffers.stencil.setLocked(!0),e.setRenderTarget(r),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),o.buffers.color.setLocked(!1),o.buffers.depth.setLocked(!1),o.buffers.color.setMask(!0),o.buffers.depth.setMask(!0),o.buffers.stencil.setLocked(!1),o.buffers.stencil.setFunc(a.EQUAL,1,0xffffffff),o.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),o.buffers.stencil.setLocked(!0)}}class n extends o.o{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class h{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),void 0===t){let r=e.getSize(new s.I9Y);this._width=r.width,this._height=r.height,(t=new s.nWS(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:s.ix0})).texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new a.p(i.Z),this.copyPass.material.blending=s.XIg,this.timer=new s.M4G}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);-1!==t&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),void 0===e&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),r=!1;for(let t=0,s=this.passes.length;t<s;t++){let s=this.passes[t];if(!1!==s.enabled){if(s.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),s.render(this.renderer,this.writeBuffer,this.readBuffer,e,r),s.needsSwap){if(r){let t=this.renderer.getContext(),r=this.renderer.state.buffers.stencil;r.setFunc(t.NOTEQUAL,1,0xffffffff),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),r.setFunc(t.EQUAL,1,0xffffffff)}this.swapBuffers()}void 0!==l&&(s instanceof l?r=!0:s instanceof n&&(r=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(void 0===e){let t=this.renderer.getSize(new s.I9Y);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,(e=this.renderTarget1.clone()).setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let r=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(r,s),this.renderTarget2.setSize(r,s);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(r,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}},6170:(e,t,r)=>{r.d(t,{A:()=>a});var s=r(5339),i=r(3617);class a extends i.o{constructor(e,t,r=null,i=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=r,this.clearColor=i,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new s.Q1f}render(e,t,r){let s,i,a=e.autoClear;e.autoClear=!1,null!==this.overrideMaterial&&(i=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),null!==this.clearColor&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),null!==this.clearAlpha&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),!0==this.clearDepth&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:r),!0===this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),null!==this.clearColor&&e.setClearColor(this._oldClearColor),null!==this.clearAlpha&&e.setClearAlpha(s),null!==this.overrideMaterial&&(this.scene.overrideMaterial=i),e.autoClear=a}}},6319:(e,t,r)=>{r.d(t,{l:()=>i});var s=r(5339);class i extends s.Z58{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new s.iNn;e.deleteAttribute("uv");let t=new s._4j({side:s.hsX}),r=new s._4j,i=new s.HiM(0xffffff,900,28,2);i.position.set(.418,16.199,.3),this.add(i);let o=new s.eaF(e,t);o.position.set(-.757,13.219,.717),o.scale.set(31.713,28.305,28.591),this.add(o);let l=new s.ZLX(e,r,6),n=new s.B69;n.position.set(-10.906,2.009,1.846),n.rotation.set(0,-.195,0),n.scale.set(2.328,7.905,4.651),n.updateMatrix(),l.setMatrixAt(0,n.matrix),n.position.set(-5.607,-.754,-.758),n.rotation.set(0,.994,0),n.scale.set(1.97,1.534,3.955),n.updateMatrix(),l.setMatrixAt(1,n.matrix),n.position.set(6.167,.857,7.803),n.rotation.set(0,.561,0),n.scale.set(3.927,6.285,3.687),n.updateMatrix(),l.setMatrixAt(2,n.matrix),n.position.set(-2.017,.018,6.124),n.rotation.set(0,.333,0),n.scale.set(2.002,4.566,2.064),n.updateMatrix(),l.setMatrixAt(3,n.matrix),n.position.set(2.291,-.756,-2.621),n.rotation.set(0,-.286,0),n.scale.set(1.546,1.552,1.496),n.updateMatrix(),l.setMatrixAt(4,n.matrix),n.position.set(-2.193,-.369,-5.547),n.rotation.set(0,.516,0),n.scale.set(3.875,3.487,2.986),n.updateMatrix(),l.setMatrixAt(5,n.matrix),this.add(l);let h=new s.eaF(e,a(50));h.position.set(-16.116,14.37,8.208),h.scale.set(.1,2.428,2.739),this.add(h);let u=new s.eaF(e,a(50));u.position.set(-16.109,18.021,-8.207),u.scale.set(.1,2.425,2.751),this.add(u);let d=new s.eaF(e,a(17));d.position.set(14.904,12.198,-1.832),d.scale.set(.15,4.265,6.331),this.add(d);let f=new s.eaF(e,a(43));f.position.set(-.462,8.89,14.52),f.scale.set(4.38,5.441,.088),this.add(f);let p=new s.eaF(e,a(20));p.position.set(3.235,11.486,-12.541),p.scale.set(2.5,2,.1),this.add(p);let c=new s.eaF(e,a(100));c.position.set(0,20,0),c.scale.set(1,.1,1),this.add(c)}dispose(){let e=new Set;for(let t of(this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))}),e))t.dispose()}}function a(e){return new s.G_z({color:0,emissive:0xffffff,emissiveIntensity:e})}},6451:(e,t,r)=>{r.d(t,{C:()=>l});var s=r(5339),i=r(3617),a=r(2049);let o={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new s.Q1f(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class l extends i.o{constructor(e,t=1,r,l){super(),this.strength=t,this.radius=r,this.threshold=l,this.resolution=void 0!==e?new s.I9Y(e.x,e.y):new s.I9Y(256,256),this.clearColor=new s.Q1f(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let n=Math.round(this.resolution.x/2),h=Math.round(this.resolution.y/2);this.renderTargetBright=new s.nWS(n,h,{type:s.ix0,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new s.nWS(n,h,{type:s.ix0,depthBuffer:!1});t.texture.name="UnrealBloomPass.h"+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let r=new s.nWS(n,h,{type:s.ix0,depthBuffer:!1});r.texture.name="UnrealBloomPass.v"+e,r.texture.generateMipmaps=!1,this.renderTargetsVertical.push(r),n=Math.round(n/2),h=Math.round(h/2)}this.highPassUniforms=s.LlO.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=l,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new s.BKk({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let u=[6,10,14,18,22];n=Math.round(this.resolution.x/2),h=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(u[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new s.I9Y(1/n,1/h),n=Math.round(n/2),h=Math.round(h/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1,this.compositeMaterial.uniforms.bloomFactors.value=[1,.8,.6,.4,.2],this.bloomTintColors=[new s.Pq0(1,1,1),new s.Pq0(1,1,1),new s.Pq0(1,1,1),new s.Pq0(1,1,1),new s.Pq0(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=s.LlO.clone(a.Z.uniforms),this.blendMaterial=new s.BKk({uniforms:this.copyUniforms,vertexShader:a.Z.vertexShader,fragmentShader:a.Z.fragmentShader,premultipliedAlpha:!0,blending:s.EZo,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new s.Q1f,this._oldClearAlpha=1,this._basic=new s.V9B,this._fsQuad=new i.F(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let r=Math.round(e/2),i=Math.round(t/2);this.renderTargetBright.setSize(r,i);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(r,i),this.renderTargetsVertical[e].setSize(r,i),this.separableBlurMaterials[e].uniforms.invSize.value=new s.I9Y(1/r,1/i),r=Math.round(r/2),i=Math.round(i/2)}render(e,t,r,s,i){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),i&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let t=0;t<this.nMips;t++)this._fsQuad.material=this.separableBlurMaterials[t],this.separableBlurMaterials[t].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[t].uniforms.direction.value=l.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[t]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[t].uniforms.colorTexture.value=this.renderTargetsHorizontal[t].texture,this.separableBlurMaterials[t].uniforms.direction.value=l.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[t]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[t];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,i&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?e.setRenderTarget(null):e.setRenderTarget(r),this._fsQuad.render(e),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){let t=[],r=e/3;for(let s=0;s<e;s++)t.push(.39894*Math.exp(-.5*s*s/(r*r))/r);let i=[],a=[];for(let r=1;r<e;r+=2){let s=t[r],o=r+1<e?t[r+1]:0,l=s+o;i.push((r*s+(r+1)*o)/l),a.push(l)}return new s.BKk({defines:{KERNEL_PAIRS:i.length},uniforms:{colorTexture:{value:null},invSize:{value:new s.I9Y(.5,.5)},direction:{value:new s.I9Y(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:i},gaussianWeights:{value:a}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new s.BKk({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}l.BlurDirectionX=new s.I9Y(1,0),l.BlurDirectionY=new s.I9Y(0,1)},8745:(e,t,r)=>{r.d(t,{j:()=>o});var s=r(5339);let i=new s.Pq0;function a(e,t,r,s,a,o){let l=2*Math.PI*a/4,n=Math.max(o-2*a,0),h=Math.PI/4;i.copy(t),i[s]=0,i.normalize();let u=.5*l/(l+n),d=1-i.angleTo(e)/h;return 1===Math.sign(i[r])?d*u:n/(l+n)+u+u*(1-d)}class o extends s.iNn{constructor(e=1,t=1,r=1,i=2,o=.1){let l=2*i+1;if(o=Math.min(e/2,t/2,r/2,o),super(1,1,1,l,l,l),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:r,segments:i,radius:o},1===l)return;let n=this.toNonIndexed();this.index=null,this.attributes.position=n.attributes.position,this.attributes.normal=n.attributes.normal,this.attributes.uv=n.attributes.uv;let h=new s.Pq0,u=new s.Pq0,d=new s.Pq0(e,t,r).divideScalar(2).subScalar(o),f=this.attributes.position.array,p=this.attributes.normal.array,c=this.attributes.uv.array,m=f.length/6,g=new s.Pq0,v=.5/l;for(let s=0,i=0;s<f.length;s+=3,i+=2)switch(h.fromArray(f,s),u.copy(h),u.x-=Math.sign(u.x)*v,u.y-=Math.sign(u.y)*v,u.z-=Math.sign(u.z)*v,u.normalize(),f[s+0]=d.x*Math.sign(h.x)+u.x*o,f[s+1]=d.y*Math.sign(h.y)+u.y*o,f[s+2]=d.z*Math.sign(h.z)+u.z*o,p[s+0]=u.x,p[s+1]=u.y,p[s+2]=u.z,Math.floor(s/m)){case 0:g.set(1,0,0),c[i+0]=a(g,u,"z","y",o,r),c[i+1]=1-a(g,u,"y","z",o,t);break;case 1:g.set(-1,0,0),c[i+0]=1-a(g,u,"z","y",o,r),c[i+1]=1-a(g,u,"y","z",o,t);break;case 2:g.set(0,1,0),c[i+0]=1-a(g,u,"x","z",o,e),c[i+1]=a(g,u,"z","x",o,r);break;case 3:g.set(0,-1,0),c[i+0]=1-a(g,u,"x","z",o,e),c[i+1]=1-a(g,u,"z","x",o,r);break;case 4:g.set(0,0,1),c[i+0]=1-a(g,u,"x","y",o,e),c[i+1]=1-a(g,u,"y","x",o,t);break;case 5:g.set(0,0,-1),c[i+0]=a(g,u,"x","y",o,e),c[i+1]=1-a(g,u,"y","x",o,t)}}static fromJSON(e){return new o(e.width,e.height,e.depth,e.segments,e.radius)}}}}]);
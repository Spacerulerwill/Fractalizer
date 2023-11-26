<script lang="ts">
  import type { ProgramInfo } from "$lib/interfaces";
  import { initialiseWebGL } from "$lib/openGL";
  import { fragmentShaderSource, vertexShaderSource } from "$lib/shaders";
  import { afterUpdate, onMount } from "svelte";

  let programInfo: ProgramInfo;
  // Mouse movement data
  let mouseDown = false;
  const delta = 6;
  let startX: number;
  let startY: number;
  let startFractalX: number;
  let startFractalY: number;

  //window related
  let windowWidth: number;
  let windowHeight: number;

  // fractal ids
  const mandelbrot = 0;
  const burningShip = 1;
  const tricorn = 2;

  let setupFinished: boolean = false;

  // fractal stats
  let fractalX = 0;
  let fractalY = 0;
  let zoom = 2.0;
  let selectedFractal = mandelbrot;

  // prettier-ignore
  const vertexData = [
    -1, -1, 0, 
		1, -1, 0, 
		1, 1, 0, 
		-1, -1, 0, 
		1, 1, 0, 
		-1, 1, 0,
  ];

  let canvas: HTMLCanvasElement;

  onMount(() => {
    programInfo = initialiseWebGL(
      canvas,
      vertexShaderSource,
      fragmentShaderSource,
      vertexData
    );
    if (programInfo.gl) {
      programInfo.gl.uniform2f(programInfo.locationLoc, fractalX, fractalY);
      programInfo.gl.uniform1f(programInfo.zoomLoc, zoom);
      programInfo.gl.uniform1i(programInfo.fractalTypeLoc, selectedFractal);
    }
  });

  afterUpdate(() => {
    if (programInfo && programInfo.gl && canvas.width && canvas.height) {
      console.log("re rendering gl instance");
      programInfo.gl.uniform1i(programInfo.fractalTypeLoc, selectedFractal);
      programInfo.gl.drawArrays(programInfo.gl.TRIANGLES, 0, 6);
    }
  });

  $: {
    if (
      programInfo &&
      programInfo.gl &&
      (windowWidth !== undefined || windowHeight !== undefined)
    ) {
      canvas.width = windowWidth;
      canvas.height = windowHeight;
      programInfo.gl.viewport(0, 0, windowWidth, windowHeight); // Set the WebprogramInfo.gl viewport
      programInfo.gl.uniform2i(
        programInfo.resolutionLoc,
        windowWidth,
        windowHeight
      );
    }
  }
  // Setup canvas and webgl
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<div>
  <canvas bind:this={canvas} />
  <button
    class="text-xl"
    on:click={() => {
      selectedFractal = tricorn;
    }}
  >
    johncook
  </button>
  <button
    class="text-xl"
    on:click={() => {
      selectedFractal = burningShip;
    }}
  >
    johncook
  </button>
</div>

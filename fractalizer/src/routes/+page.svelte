<script lang="ts">
  import type { ProgramInfo } from "$lib/interfaces";
  import { initialiseWebGL } from "$lib/openGL";
  import { fragmentShaderSource, vertexShaderSource } from "$lib/shaders";
  import { onMount } from "svelte";

  let programInfo: ProgramInfo;
  let canvas: HTMLCanvasElement;
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

  // fractal stats
  let fractalX = 0;
  let fractalY = 0;
  let zoom = 3.0;
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

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key == "r") {
      fractalX = 0;
      fractalY = 0;
      startFractalX = 0;
      startFractalY = 0;
      zoom = 2.0;
    }
  };

  const changeZoom = (event: WheelEvent) => {
    if (event.deltaY > 0) {
      zoom = zoom * 1.05;
    } else {
      zoom = zoom * 0.95;
    }
  };
  const handleMouseMove = (event: MouseEvent) => {
    if (mouseDown) {
      let diffX = event.pageX - startX;
      let diffY = event.pageY - startY;
      if (Math.abs(diffX) > delta || Math.abs(diffY) > delta) {
        fractalX = startFractalX - (diffX / screen.width) * 2 * zoom;
        fractalY = startFractalY + (diffY / screen.height) * zoom;
      }
    }
  };
  const handleMouseDown = (event: MouseEvent) => {
    if (event.buttons == 1) {
      mouseDown = true;
      startX = event.pageX;
      startY = event.pageY;
      startFractalX = fractalX;
      startFractalY = fractalY;
    }
    if (event.buttons == 2) {
      selectedFractal = (selectedFractal + 1) % 3;
    }
  };

  onMount(() => {
    programInfo = initialiseWebGL(
      canvas,
      vertexShaderSource,
      fragmentShaderSource,
      vertexData
    );
  });

  $: {
    if (programInfo && programInfo.gl && canvas.width && canvas.height) {
      programInfo.gl.uniform2f(programInfo.locationLoc, fractalX, fractalY);
      programInfo.gl.uniform1f(programInfo.zoomLoc, zoom);
      programInfo.gl.uniform1i(programInfo.fractalTypeLoc, selectedFractal);
      programInfo.gl.drawArrays(programInfo.gl.TRIANGLES, 0, 6);
    }
  }

  $: {
    if (
      programInfo &&
      programInfo.gl &&
      (windowWidth !== undefined || windowHeight !== undefined)
    ) {
      canvas.width = windowWidth;
      canvas.height = windowHeight;
      programInfo.gl.viewport(0, 0, windowWidth, windowHeight); // Set the WebGL viewport
      programInfo.gl.uniform2i(
        programInfo.resolutionLoc,
        windowWidth,
        windowHeight
      );
      programInfo.gl.drawArrays(programInfo.gl.TRIANGLES, 0, 6); // Redraw the scene this works on page load because the resolutionLoc changes post mount after all is rendered
    }
  }
</script>

<svelte:window
  on:mouseup={() => (mouseDown = false)}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  bind:innerWidth={windowWidth}
  bind:innerHeight={windowHeight}
  on:wheel={changeZoom}
  on:keydown={handleKeyDown}
/>

<div>
  <canvas bind:this={canvas} />
  <div class="w-full h-full absolute bottom-0">
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
</div>

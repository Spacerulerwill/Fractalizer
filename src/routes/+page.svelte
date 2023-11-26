<script lang="ts">
  import { Fractals, type ProgramInfo } from "$lib/interfaces";
  import { initialiseWebGL } from "$lib/openGL";
  import { fragmentShaderSource, vertexShaderSource } from "$lib/shaders";
  import { onMount } from "svelte";
  import Menu from "../components/menu.svelte";

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

  // fractal stats
  let fractalX = 0;
  let fractalY = 0;
  let zoom = 2.0;
  let selectedFractal = Fractals.Mandelbrot;

  // prettier-ignore
  const vertexData = [
    -1, -1, 0, 
		1, -1, 0, 
		1, 1, 0, 
		-1, -1, 0, 
		1, 1, 0, 
		-1, 1, 0,
  ];

  const getScreenshot = async () => {
    if (programInfo.gl) {
      programInfo.gl.drawArrays(programInfo.gl.TRIANGLES, 0, 6);
      canvas.toBlob((blob) => {
        if (blob) {
          const imageData = URL.createObjectURL(blob);
          navigator.clipboard.writeText(imageData);
        }
      });
    }
  };

  const changeFractal = (index: number) => {
    selectedFractal = index;
  };

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

  const handleMouseUp = (event: MouseEvent) => {
    mouseDown = false;
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
      event.preventDefault();
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

  //reacts to changes in variables which are used as uniforms
  $: {
    if (programInfo && programInfo.gl && canvas.width && canvas.height) {
      programInfo.gl.uniform2f(programInfo.locationLoc, fractalX, fractalY);
      programInfo.gl.uniform1f(programInfo.zoomLoc, zoom);
      programInfo.gl.uniform1i(programInfo.fractalTypeLoc, selectedFractal);
      programInfo.gl.drawArrays(programInfo.gl.TRIANGLES, 0, 6);
    }
  }

  //reacts to changes in window size and height
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
  on:mouseup={handleMouseUp}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  bind:innerWidth={windowWidth}
  bind:innerHeight={windowHeight}
  on:wheel={changeZoom}
  on:keydown={handleKeyDown}
/>

<canvas bind:this={canvas} />
<Menu
  {changeFractal}
  {zoom}
  {fractalX}
  {fractalY}
  {selectedFractal}
  {getScreenshot}
/>

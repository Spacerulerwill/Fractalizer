<script lang="ts">
  import { FractalCount, Fractals, type ProgramInfo } from "$lib/interfaces";
  import { initialiseWebGL } from "$lib/openGL";
  import { fragmentShaderSource, vertexShaderSource } from "$lib/shaders";
  import { onMount } from "svelte";
  import Menu from "../components/menu.svelte";

  import { page } from "$app/stores";

  import {
    getModalStore,
    getToastStore,
    type ModalSettings,
    type ToastSettings,
  } from "@skeletonlabs/skeleton";

  const toastStore = getToastStore();

  const modalStore = getModalStore();

  let programInfo: ProgramInfo;
  let canvas: HTMLCanvasElement;

  // Mouse movement data
  let mouseDown = false;
  const delta = 6;
  let startX: number;
  let startY: number;
  let startX2: number;
  let startY2: number;
  let startFractalX: number;
  let startFractalY: number;

  //window related
  let windowWidth: number;
  let windowHeight: number;
  let maxReal: number;
  let minReal: number;
  let maxImag: number;
  let minImag: number;

  // fractal stats
  let fractalX: number;
  let fractalY: number;
  let mouseReal = 0;
  let mouseImag = 0;
  let zoom: number;
  let selectedFractal: Fractals;
  let juliaSetModeEnabled = $page.url.searchParams.has("julia");

  let menuOpen = false;

  // TODO: Can probably make a generic function for this...
  // url parameter parsing
  {
    // parse fractal type parameter
    const urlFractal = $page.url.searchParams.get("fractal");
    if (urlFractal === null) {
      selectedFractal = 0;
    } else {
      const parsedUrlFractal = parseInt(urlFractal, 10);
      if (isNaN(parsedUrlFractal)) {
        selectedFractal = 0;
      } else {
        if (parsedUrlFractal < 0 || parsedUrlFractal > FractalCount - 1) {
          selectedFractal = 0;
        } else {
          selectedFractal = parsedUrlFractal;
        }
      }
    }

    // parse x coordinate parameter
    const urlX = $page.url.searchParams.get("x");
    if (urlX === null) {
      fractalX = 0.0;
    } else {
      const parsedUrlX = parseFloat(urlX);
      if (isNaN(parsedUrlX)) {
        fractalX = 0.0;
      } else {
        fractalX = parsedUrlX;
      }
    }

    // parse y coordinate paremeter
    const urlY = $page.url.searchParams.get("y");
    if (urlY === null) {
      fractalY = 0.0;
    } else {
      const parsedUrlY = parseFloat(urlY);
      if (isNaN(parsedUrlY)) {
        fractalY = 0.0;
      } else {
        fractalY = parsedUrlY;
      }
    }

    // parse zoom parameter
    const urlZoom = $page.url.searchParams.get("zoom");
    if (urlZoom === null) {
      zoom = 2.0;
    } else {
      const parsedUrlZoom = parseFloat(urlZoom);
      if (isNaN(parsedUrlZoom)) {
        zoom = 2.0;
      } else {
        zoom = parsedUrlZoom;
      }
    }
  }

  // prettier-ignore
  const vertexData = [
        -1, -1, 0, 
		 1, -1, 0, 
		 1,  1, 0, 
		-1, -1, 0, 
		 1,  1, 0, 
		-1,  1, 0,
  ];

  const toast: ToastSettings = {
    message: "Saved image to downloads!",
    timeout: 1500,
  };

  const modal: ModalSettings = {
    type: "alert",
    title: "share link",
    body: "",
  };

  const closeMenu = () => {
    menuOpen = false;
  };

  const shareFractal = () => {
    menuOpen = true;

    const host = $page.url.host;
    const url =
      host +
      `?zoom=${zoom}&fractal=${selectedFractal}&x=${fractalX}&y=${fractalY}`;

    if (programInfo.gl) {
      programInfo.gl.drawArrays(programInfo.gl.TRIANGLES, 0, 6);
      canvas.toBlob((blob) => {
        if (blob) {
          const imageData = URL.createObjectURL(blob);

          const modal: ModalSettings = {
            type: "component",
            component: "shareModal",
            meta: {
              url: url,
              image: imageData,
              title: Fractals[selectedFractal],
              closeFunction: closeMenu,
            },
            response: () => {
              closeMenu();
            },
          };

          modalStore.trigger(modal);
        }
      });
    }
  };

  const saveImage = async () => {
    if (programInfo.gl) {
      programInfo.gl.drawArrays(programInfo.gl.TRIANGLES, 0, 6);
      canvas.toBlob((blob) => {
        if (blob) {
          const imageData = URL.createObjectURL(blob);

          const currentDate = new Date().toLocaleDateString();
          //creates an invisible document element to trigger a download which gets auto clicked
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = imageData;
          a.download = `Fractilizer_${currentDate}_${Fractals[selectedFractal]}.png`;
          document.body.append(a);
          a.click();
          a.remove();

          toastStore.trigger(toast);
        }
      });
    }
  };

  const changeFractal = (index: number) => {
    selectedFractal = index;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "r":
        if (menuOpen === false) {
          fractalX = 0;
          fractalY = 0;
          startFractalX = 0;
          startFractalY = 0;
          zoom = 2.0;
        }
      case "j":
        juliaSetModeEnabled = !juliaSetModeEnabled;
    }
  };

  const changeZoom = (event: WheelEvent) => {
    if (menuOpen === false) {
      if (event.deltaY > 0) {
        zoom = zoom * 1.05;
      } else {
        zoom = zoom * 0.95;
      }
    }
  };

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  const handleMouseUp = (event: MouseEvent) => {
    mouseDown = false;
  };

  const handleMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    if (juliaSetModeEnabled) {
      mouseReal = event.pageX * ((maxReal - minReal) / windowWidth) + minReal;
      mouseImag = event.pageY * ((maxImag - minImag) / windowHeight) + minImag;
    } else if (mouseDown && menuOpen === false) {
      let diffX = event.pageX - startX;
      let diffY = event.pageY - startY;
      if (Math.abs(diffX) > delta || Math.abs(diffY) > delta) {
        fractalX = startFractalX - (diffX / screen.width) * 2 * zoom;
        fractalY = startFractalY + (diffY / screen.height) * zoom;
      }
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (menuOpen === false) {
      if (event.touches.length === 1) {
        let diffX = event.touches[0].clientX - startX;
        let diffY = event.touches[0].clientY - startY;
        if (Math.abs(diffX) > delta || Math.abs(diffY) > delta) {
          fractalX = startFractalX - (diffX / screen.width) * zoom;
          fractalY = startFractalY + (diffY / screen.height) * zoom;
        }
      } else if (event.touches.length === 2) {
        let diffX = event.touches[0].clientX - startX;
        let diffY = event.touches[0].clientY - startY;
        let diffX2 = event.touches[1].clientX - startX2;
        let diffY2 = event.touches[1].clientY - startY2;
      }
    }
  };

  //plan for pinch is to get distance between two fingers on press down
  //then see if that distance gets greater or bigger when movement is detected
  //bigger distance = zoom in, smaller distance = zoom out

  const handleTouchDown = (event: TouchEvent) => {
    if (menuOpen === false) {
      if (event.touches.length === 1) {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        startFractalX = fractalX;
        startFractalY = fractalY;
      } else if (event.touches.length === 2) {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        startX2 = event.touches[1].clientX;
        startY2 = event.touches[1].clientY;
      }
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (menuOpen === false) {
      if (event.buttons === 1) {
        mouseDown = true;
        startX = event.pageX;
        startY = event.pageY;
        startFractalX = fractalX;
        startFractalY = fractalY;
      }
      if (event.buttons === 2) {
        event.preventDefault();
        selectedFractal = (selectedFractal + 1) % FractalCount;
      }
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
      programInfo.gl.uniform2f(programInfo.mousePosLoc, mouseReal, mouseImag);
      programInfo.gl.uniform1f(programInfo.zoomLoc, zoom);
      programInfo.gl.uniform1i(programInfo.fractalTypeLoc, selectedFractal);
      programInfo.gl.uniform1i(
        programInfo.juliaSetModeEnabledLoc,
        juliaSetModeEnabled ? 1 : 0
      );
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

      minReal = -0.5 * zoom + fractalX;
      maxReal = 0.5 * zoom + fractalX;
      minImag = -0.5 * zoom - fractalY;
      maxImag = 0.5 * zoom - fractalY;

      programInfo.gl.drawArrays(programInfo.gl.TRIANGLES, 0, 6); // Redraw the scene this works on page load because the resolutionLoc changes post mount after all is rendered
    }
  }
</script>

<svelte:window
  on:touchstart|preventDefault={handleTouchDown}
  on:touchmove|preventDefault={handleTouchMove}
  on:contextmenu|preventDefault={handleContextMenu}
  on:mouseup|preventDefault={handleMouseUp}
  on:mousedown|preventDefault={handleMouseDown}
  on:mousemove|preventDefault={handleMouseMove}
  on:keydown={handleKeyDown}
  on:wheel|passive|preventDefault={changeZoom}
  bind:innerWidth={windowWidth}
  bind:innerHeight={windowHeight}
/>

<canvas bind:this={canvas} />
<Menu
  {shareFractal}
  {changeFractal}
  {zoom}
  {fractalX}
  {fractalY}
  {selectedFractal}
  {saveImage}
/>

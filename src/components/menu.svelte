<script lang="ts">
  import { Fractals } from "$lib/interfaces";
  import Dropdown from "./dropdown.svelte";

  export let changeFractal: (fractal: number) => void;
  export let selectedFractal: number;
  export let zoom: number;
  export let fractalX: number;
  export let fractalY: number;
  // export let getScreenshot: () => void;
  export let saveImage: () => void;
  export let shareFractal: () => void;
</script>

<menu class="w-screen h-screen absolute bottom-0 select-none flex">
  <nav
    class="bg-white bg-opacity-20 rounded-lg h-fit w-fit p-8 font-semibold h3"
  >
    <a
      href="https://github.com/Spacerulerwill/Fractalizer"
      class="h1 hover:animate-pulse"
    >
      <span class="gradient-heading">Fractilizer</span>
    </a>
    <p class="gradient-heading pb-1">{Fractals[selectedFractal]}</p>
    <p class="gradient-heading pb-1">Zoom: {(1.0 / zoom).toPrecision(2)}</p>
    <p class="gradient-heading pb-1">X: {fractalX.toPrecision(2)}</p>
    <p class="gradient-heading pb-1">Y: {fractalY.toPrecision(2)}</p>
    <Dropdown {selectedFractal} {changeFractal} />
    <span class="mt-2 flex gap-4">
      <svg
        on:click={saveImage}
        class="w-10"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 18"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        />
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 3h-2l-.447-.894A2 2 0 0 0 12.764 1H7.236a2 2 0 0 0-1.789 1.106L5 3H3a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V5a2 2 0 0 0-2-2Z"
        />
      </svg>
      <svg
        on:click={shareFractal}
        class="w-10"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 21 15"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m13.717 1 5.518 4.95a1.05 1.05 0 0 1 0 1.549l-5.612 5.088m-5.73-3.214v1.615a.95.95 0 0 0 1.525.845l5.108-4.251a1.1 1.1 0 0 0 0-1.646L9.418 1.685a.95.95 0 0 0-1.525.846v1.7c-3.312 0-6 2.979-6 6.654v1.329a.7.7 0 0 0 1.344.353 5.174 5.174 0 0 1 4.652-3.191l.004-.003Z"
        />
      </svg>
    </span>
  </nav>
</menu>

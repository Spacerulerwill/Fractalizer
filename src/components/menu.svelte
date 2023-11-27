<script lang="ts">
  import { Fractals } from "$lib/interfaces";
  import { RadioGroup } from "@skeletonlabs/skeleton";

  export let changeFractal: (fractal: number) => void;
  export let selectedFractal: number;
  export let zoom: number;
  export let fractalX: number;
  export let fractalY: number;
  // export let getScreenshot: () => void;
  export let saveImage: () => void;

  const length = Object.keys(Fractals).length / 2;
</script>

<menu class="w-screen h-screen absolute bottom-0 select-none flex">
  <nav class="w-full p-8 font-semibold h3">
    <a
      href="https://github.com/Spacerulerwill/Fractalizer"
      class="h1 hover:animate-pulse"
    >
      <span class="gradient-heading">Fractilizer</span>
    </a>
    <p class="gradient-heading">{Fractals[selectedFractal]}</p>
    <p class="gradient-heading">Zoom: {(1.0 / zoom).toPrecision(2)}</p>
    <p class="gradient-heading">X: {fractalX.toPrecision(2)}</p>
    <p class="gradient-heading">Y: {fractalY.toPrecision(2)}</p>
  </nav>
  <div class="flex gap-2 items-center h-fit">
    <svg
      on:click={saveImage}
      class="w-10 h-10 text-gray-800 dark:text-white"
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
    <RadioGroup
      hover="true"
      rounded="rounded-container-token"
      display="flex-col"
    >
      {#each { length: length } as _, index (index)}
        <option
          class={selectedFractal === index ? "variant-ghost-primary" : null}
          value={index}
          on:click={() => changeFractal(index)}
        >
          {Fractals[index]}
        </option>
      {/each}
    </RadioGroup>
  </div>
</menu>

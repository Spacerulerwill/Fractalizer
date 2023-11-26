<script lang="ts">
  import { Fractals } from "$lib/interfaces";
  import {
    AppBar,
    LightSwitch,
    RadioGroup,
    RadioItem,
  } from "@skeletonlabs/skeleton";

  export let changeFractal: (fractal: number) => void;
  export let selectedFractal: number;
  export let zoom: number;
  export let fractalX: number;
  export let fractalY: number;

  const length = Object.keys(Fractals).length / 2;
</script>

<menu class="w-full h-full absolute bottom-0 select-none">
  <nav class="w-full p-8 font-semibold h3">
    <a
      href="https://github.com/Spacerulerwill/Fractalizer"
      class="h1 hover:animate-pulse"
    >
      <span class="gradient-heading">Fractilizer V1.0</span>
    </a>
    <p class="gradient-heading">{Fractals[selectedFractal]}</p>
    <p class="gradient-heading">Zoom: {zoom.toFixed(2)}</p>
    <p class="gradient-heading">X: {fractalX.toFixed(2)}</p>
    <p class="gradient-heading">Y: {fractalY.toFixed(2)}</p>
  </nav>
  <div
    class="absolute bottom-0 w-full text-3xl px-80 h-20 flex justify-around items-center"
  >
    {#each { length: length } as _, index (index)}
      <button
        class="{selectedFractal === index
          ? 'variant-ghost-primary'
          : 'variant-ghost-secondary'} p-4 w-full"
        on:click={() => changeFractal(index)}
      >
        {Fractals[index]}
      </button>
    {/each}
  </div>
</menu>

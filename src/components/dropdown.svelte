<script lang="ts">
  import { FractalCount, Fractals } from "$lib/interfaces";

  let menuOpen = false;
  export let changeFractal: (fractal: number) => void;
  export let selectedFractal: number;
  let fractalCount = FractalCount;

  const handleKeyDown = (event: KeyboardEvent) => {
    console.log(event.key);
    if (event.key == "ArrowDown") {
      changeFractal((selectedFractal + 1) % 3);
    } else if (event.key == "ArrowUp") {
      if (selectedFractal == 0) {
        changeFractal(fractalCount - 1);
      } else {
        changeFractal(selectedFractal - 1);
      }
    }
  };
</script>

<button
  on:keydown={(e) => handleKeyDown(e)}
  on:click={() => {
    menuOpen = !menuOpen;
  }}
  class="w-fit px-1 h-max bg-white text-black outline-blue-500 outline"
>
  <p class="p h5">
    {menuOpen == false ? Fractals[selectedFractal] : "Select fractal"}
  </p>

  <ul class="{menuOpen ? 'block' : 'hidden'} bg-white relative h5 bottom-0">
    {#each { length: fractalCount } as _, index (index)}
      <option
        class="{selectedFractal === index
          ? 'variant-ghost-secondary'
          : null} px-1"
        value={index}
        on:click={() => changeFractal(index)}
      >
        {Fractals[index]}
      </option>
    {/each}
  </ul>
</button>

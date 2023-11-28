<script lang="ts">
  import { clipboard, getModalStore } from "@skeletonlabs/skeleton";
  import type { SvelteComponent } from "svelte";

  let timeoutTrue = false;

  //leave here otherwise error from console in browser
  export let parent: SvelteComponent;

  let copyButtonText = "copy";

  const modalStore = getModalStore();
</script>

{#if $modalStore[0]}
  <div class="p-6 rounded-lg w-modal-slim bg-slate-800 flex flex-col font-mono">
    <p class="text-2xl text-clip pb-2 w-full font-bold">
      Share {$modalStore[0].meta.title}
    </p>
    <img class="rounded-md p-2" src={$modalStore[0].meta.image} alt="fractal" />
    <div class="bg-slate-900 p-4 rounded-lg m-2 flex flex-col">
      <p class="text-left truncate p-3 text-green-300 font-mono">
        "{$modalStore[0].meta.url}"
      </p>
      <button
        class="bg-slate-800 text-md p-1 self-end w-fit rounded-md font-mono"
        use:clipboard={$modalStore[0].meta.url}
        on:click={() => {
          copyButtonText = "copied to clipboard!";
          setTimeout(() => {
            copyButtonText = "copy";
          }, 1000);
        }}>{copyButtonText}</button
      >
    </div>
    <button
      on:click={() => {
        modalStore.clear();
      }}
      class="self-end bg-slate-900 p-2 rounded-md text-lg">Close</button
    >
  </div>
{/if}

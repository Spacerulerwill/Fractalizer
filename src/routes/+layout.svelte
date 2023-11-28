<script lang="ts">
  import "../app.postcss";

  import {
    Modal,
    Toast,
    initializeStores,
    type ModalComponent,
  } from "@skeletonlabs/skeleton";

  import ShareModal from "../components/shareModal.svelte";

  initializeStores();

  const modalRegistry: Record<string, ModalComponent> = {
    // Set a unique modal ID, then pass the component reference
    shareModal: { ref: ShareModal },
    // ...
  };
</script>

<slot />

<Toast />
<Modal components={modalRegistry} />

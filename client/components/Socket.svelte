<script lang="ts">
  import { onMount } from 'svelte';
  export let url = '';
  let socket: WebSocket;

  const connect = function (url: string) {
    socket = new WebSocket(url);
  };

  const attachEventListeners = function () {
    socket.addEventListener('open', (event: Event) => {
      console.log('Connection opened: ', event);
    });
  };

  onMount(() => {
    connect(url);
    attachEventListeners();
  });
</script>

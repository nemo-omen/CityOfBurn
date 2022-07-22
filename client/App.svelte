<script lang="ts">
  import './style/global.css';

  import Socket from './components/Socket.svelte';
  import Header from './components/Header.svelte';

  const name: string = 'Jeff';

  const socket = new Socket({
    target: document.body,
    props: {
      url: 'ws://localhost:8080/game',
    },
  });
</script>

<Header />
<main>
  <p>This is only a test, {name}, don't get too excited.</p>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    padding: 1rem;
  }
</style>

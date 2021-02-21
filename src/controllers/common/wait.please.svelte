<script>
  import {
    UIOverlay
  } from 'not-bulma';
  
  export let message = 'Пожалуйста подождите пока операция будет завершена...';
  export let description = false;

  export let result = false;
  export let result_style = false;
</script>

<UIOverlay show={true} closeOnClick={false} closeButton={false}>
  <div class="wait-paper box">
    <h4 class="title is-4">{message}</h4>
    {#if description}
    <h5 class="subtitle is-5">{description}</h5>
    {/if}

    {#if result}
    <div class="notification is-{result_style}">{result}</div>
    {:else}
    <div class="loader"></div>
    {/if}
  </div>
</UIOverlay>

<style>
  .wait-paper {
    width: 30vw;
    margin: 35vh auto auto auto;
  }

  .loader {
    border: 1em solid #f3f3f3;
    /* Light grey */
    border-top: 1em solid #3498db;
    /* Blue */
    border-radius: 50%;
    width: 6em;
    height: 5em;
    animation: spin 2s linear infinite;
    margin: auto auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>

<script lang="ts">
    import Router from 'svelte-spa-router'
    import HashMain from './HashMain.svelte'
    import HashTest from './HashTest.svelte'

    const routes = {
      '/': HashMain,
      '/test': HashTest
    }
</script>

<header>헤더입니다</header>
<Router {routes}/>

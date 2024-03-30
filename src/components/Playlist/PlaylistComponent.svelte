<script lang="ts">
  import type { SongDB } from '../../lib/songDB'
  import type { Playlist, SongData, SongScore } from '../../types'
  import Song from '../Song/Song.svelte'
  import { flip } from 'svelte/animate'
  import { dndzone, type DndEvent } from 'svelte-dnd-action'
  import Button from '../Common/Button.svelte'
  import { icons } from '../../assets'
  import type { ExtensionStorage } from '../../lib/storage'
  import { encodeBase64 } from '../../lib/playlist'

  export let playlist: Playlist
  export let songDB: SongDB
  export let storage: ExtensionStorage
  export let onChange: (playlist: Playlist) => void
  export let onExport: (playlist: Playlist) => void
  export let onRemove: (playlist: Playlist) => void

  let open = false

  let wrapper: HTMLDivElement
  let title: HTMLDivElement

  const getTranslatedTitle = (songData?: SongData, songScore?: SongScore): string => {
    if (songData !== undefined) {
      const language = storage.settings.language
      if (language === 'ko') {
        return songData?.title_kr_user ?? songData?.title ?? 'unknown'
      }
      return songData?.title ?? 'unknown'
    } else if (songScore?.title !== undefined) {
      return songScore.title
    }

    return 'unknown'
  }

  const rename = (): void => {
    const newTitle = prompt('Enter new title', playlist.title)
    if (newTitle === null) {
      return
    }

    onChange({ ...playlist, title: newTitle })
  }

  const remove = (): void => {
    if (!confirm('Are you sure you want to remove this playlist?')) {
      return
    }

    onRemove(playlist)
  }

  const copyBase64 = async (): Promise<void> => {
    const title = playlist.title.replaceAll(' ', '_')
    const base64 = encodeBase64(playlist.songNoList)
    const str = `${title}|${base64}`
    await navigator.clipboard.writeText(str)
  }

  // let items = [ { id: 1, name: 'item1' }, { id: 2, name: 'item2' }, { id: 3, name: 'item3' }, { id: 4, name: 'item4' } ]
  $: items = playlist.songNoList.map((songNo: string) => ({ id: 'song' + songNo, songNo }))

  const flipDurationMs = 300
  const handleDndConsider = (e: CustomEvent<DndEvent>): void => {
    items = e.detail.items as Array<{ id: string, songNo: string }>
  }
  const handleDndFinalize = (e: CustomEvent): void => {
    items = e.detail.items
    const newPlaylist = { ...playlist, songNoList: items.map((item) => item.songNo) }
    onChange(newPlaylist)
  }

  const onPointerMove = (): void => {
    open = false
  }
  const onPointerUp = (): void => {
    title.removeEventListener('pointermove', onPointerMove)
    title.removeEventListener('pointerup', onPointerUp)
  }
  const onPointerDown = (): void => {
    title.addEventListener('pointermove', onPointerMove)
    title.addEventListener('pointerup', onPointerUp)
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="wrapper" bind:this={wrapper}>
  <div class="title" class:close={!open} bind:this={title} on:click={() => { open = !open }} on:pointerdown={onPointerDown}>
    <img class="icon" class:open={open} src={icons.chevronArrowDown} alt="arrow"/>
    <span>
      {playlist.title}
    </span>
  </div>
  {#if open}
    <div class="content"
      on:mousedown={(e) => { e.stopImmediatePropagation() }}
      on:dragstart={(e) => { e.stopImmediatePropagation() }}
    >
      <div class="button-container">
        <Button on:click={rename}>
          Rename
        </Button>
        <Button on:click={() => { onExport(playlist) }}>
          ↓ Export ↓
        </Button>
        <Button on:click={remove}>
          Delete
        </Button>
        <Button on:click={copyBase64}>
          Copy Base64
        </Button>
      </div>
      <section class="song-container" use:dndzone={{ type: 'song', items, flipDurationMs }} on:consider={handleDndConsider} on:finalize={handleDndFinalize}>
        {#each items as item(item.id)}
          {@const songNo = item.songNo}
          {@const songData = songDB.getSongData(songNo)}
          {@const songScore = storage.getScoreByNo(songNo)}
          <div animate:flip={{ duration: flipDurationMs }}>
            <Song
              songNo={songNo}
              title={songData?.title ?? `unknown songNo${songNo}`}
              genre={songData?.genres.at(0) ?? 'unknown'}
              details={songScore?.details ?? {}}
              translatedTitle={getTranslatedTitle(songData, songScore)}
              songData={songData}
              taikoNo={''}
              playlists={undefined}
            />
          </div>
        {/each}
      </section>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    width: 280px;
    display: flex;
    flex-direction: column;
    user-select: none;
    margin: 4px 0px;
  }

  .title {
    padding: 8px;
    background-color: #cf4844;
    color: white;
    font-size: 16px;
    font-weight: bold;
    transition: filter 0.3s;
    display: flex;
    gap: 4px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .title.close {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .title:hover {
    filter: brightness(0.9);
  }

  .icon {
    filter: invert(1);
    transform: rotate(-90deg);
    width: 16px;
    transition: transform 0.3s;
  }

  .icon.open {
    transform: rotate(0deg);
  }

  .content {
    cursor: default;
    background-color: #e99e2e;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .button-container {
    display: flex;
    padding: 4px;
    justify-content: space-around;
    flex-wrap: wrap;
  }

  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0px;
  }

  .song-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
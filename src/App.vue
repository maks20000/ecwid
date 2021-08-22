<template>
  <div class="container">
    <gallery/>
    <imageUploader />
  </div>
</template>

<script>
import gallery from './components/gallery.vue'
import imageUploader from './components/imageUploader.vue'

export default {
    name: 'App',
    components: {
        gallery, imageUploader
    }
}
</script>

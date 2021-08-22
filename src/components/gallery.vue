<template>
  <div>
      <div @dragenter.prevent="drag++" @dragover.prevent="()=>{return false}" @dragleave.prevent="drag--" @drop.prevent="drag=0; drop($event)" ref="gallery" class="gallery" :class="{loading: !loaded, drag: drag > 0}">
          <div class="gallery__image" :class="{top: image.width < image.height}" v-for="(image, i) in images" :key="i">
              <img v-if="image.url != undefined" :width="image.thumb +'px'" :src="image.url">
              <span v-if="image.url != undefined" @click="deleteImage(i)" title="Удалить" class="close"></span>
          </div>
      </div>
  </div>
</template>

<script>
import 'babel-polyfill';
import axios from 'axios'
export default {
    props: {
        col: null,
    },
    data () {
        return {
            images:[],
            imageRows: null,
            width: 0,
            loaded: false,
            drag: 0
        }
    },
    methods:  {
        async setWidth(notResize = false) {
            if ((this.width != this.$refs.gallery.offsetWidth) || notResize) {
                this.width = this.$refs.gallery.offsetWidth;
                var rowWidth = 0;
                var row = [];
                var t = this.width * (105 / this.width);
                for (var i = 0; i < this.images.length; i++) {
                    var image = this.images[i];
                    if (image.width == undefined && image.height == undefined) {
                        var img = await this.getImageWidth(image);
                        image.width = img.width;
                        image.height = img.height;
                    }
                    var r = image.width / image.height;
                    var imgWidth = t * r;
                    image.thumb = imgWidth;
                    if (rowWidth + imgWidth < this.width) {
                        rowWidth += imgWidth;
                        row.push(image);
                    }
                    else {
                        this.normalizeRow(rowWidth, row)
                        rowWidth = imgWidth;
                        row = [];
                        row.push(image)
                    }
                }

                this.normalizeRow(rowWidth, row, true)
                this.$forceUpdate()
                if (!this.loaded)
                    this.loaded = true;
            }
        },
        normalizeRow(rowWidth, row, last=false) {
            var addWidth = 0;
            if (rowWidth < this.width && (last && 100/this.width*(this.width - rowWidth) < 60) || !last) {
                addWidth = (this.width - rowWidth) / row.length - 11;
            }
            else if (rowWidth > this.width) {
                addWidth = - ((rowWidth - this.width) / row.length +11);
            }
            row.forEach(rowItem => {
                rowItem.thumb += addWidth;
            })
        },
        getImageWidth(image) {
            return new Promise((resolve, reject) => {
                var img = new Image();
                img.onload = ()=>{
                    resolve({width: img.width, height: img.height})
                }
                img.src = image.url;
            })
        },
        deleteImage(id) {
            axios.post(this.$baseApi+"/delete/"+id+"/");
            this.images.splice(id,1);
            this.setWidth(true);
        },
        drop(e) {
            this.$root.$emit('dropFile', e.dataTransfer.files[0]);
        }
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.setWidth)
    },
    mounted: async function() {
        try {
            var {data} = await axios.get(this.$baseApi+"/images/");
            this.images = data.galleryImages;
        }
        catch (err){}
        this.setWidth();
        window.addEventListener('resize',  this.setWidth);
        this.$root.$on('updateImageData', (image) => {
            this.images.push({url:image});
            this.setWidth(true);
        })
        this.$root.$on('updateAllData', (json) => {
            this.loaded = false;
            this.images = json;
            console.log(this.images)
            this.setWidth(true);
        })
    }
}
</script>
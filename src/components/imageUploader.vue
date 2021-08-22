<template>
    <div class="upload">
        <input @change="onFileSelected($event)" ref="upload_file" class="upload__input-file" type="file">
        <span v-if="error != ''" class="upload__error">{{error}}</span>
        <input ref="upload_file_path" class="upload__input-text" v-model="url" type="text">
        <span @click="$refs.upload_file.click();" class="upload__input-btn browser">Выбрать файл</span>
        <span @click="uploadFile()" class="upload__input-btn">Загрузить</span>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    data (){
        return {
            url: "",
            file: null,
            error: null,
        }
    },
    methods: {
        onFileSelected (e) {
            this.url = e.target.files[0].name;
            this.file = e.target.files[0]
        },
        uploadFile (){
            this.error = ""
            var formData = new FormData();
            if (this.file) {
                if (this.file.size/1024/1024 > 10) {
                    this.error = "Файл не должен превышать 10мб"
                    return false;
                }
                formData.append('file', this.file);
            }
            if (this.url != "")
                formData.append('url', this.url);
            axios.post(this.$baseApi + '/upload/',formData, {headers: {Accept: 'application/json','Content-Type': 'multipart/form-data'}}).then(res => {
                if (res.data.status == "OK") {
                    if (res.data.code == 100)
                        this.$root.$emit('updateImageData', res.data.imagePath);
                    if (res.data.code == 101) 
                        this.$root.$emit('updateAllData', res.data.json.galleryImages);
                }
            })
            this.file = null;
            this.url = "";
        },
    },
    mounted: function () {
        this.$root.$on('dropFile', (file) => {
            this.file = file;
            this.url = file.name;
        })
    }
}
</script>


<style scope lang="sass">

    .upload
        padding: 25px 5px
        display: flex
        flex-wrap: wrap
        position: relative

        & > * 
            margin-bottom: 10px

        &__error
            position: absolute
            top: 5px
            color: red
            font-size: 14px

        &__input-file
            display: none
        
        &__input-text
            padding: 10px 10px
            border-radius: 3px
            border: 1px solid #CACACA
            box-sizing: border-box
            flex-grow: 1
            margin-right: 5px

        &__input-btn
            display: inline-block
            padding: 9px 15px
            border-radius: 3px
            border: 1px solid #0080FF
            background: #318CE7
            color: white
            cursor: pointer
            &.browser
                background: transparent
                color: #0080FF
                margin-right: 5px
                text-align: center
            &:hover:not(.browser)
                background: #0080FF


</style>
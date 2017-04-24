<template>
    <div>1111 <p>{{$store.state.me}}</p></div>
</template>
<style lang="less" src="./index.less"></style>
<script>
    import { Component, Webview, life } from 'miox-vue2x';
    import store from '../../webstore/index';

    @Component({
        store
    })
    export default class Page extends Webview {
        @life mounted() {
            alert(this.$store.state.me);
            console.log('test')
        }
    }
</script>

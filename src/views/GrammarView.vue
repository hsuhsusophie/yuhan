<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <p class="page-kicker">HSK 1　今日の1課</p>
  <article class="lesson">
    <h2>助詞</h2>
    <p class="hanzi">的</p>
    <p class="pinyin">de</p>
    <p>
      持ち主や中身を言うとき、うしろの名詞につなぎます。日本語の「の」に近い使い方です。
    </p>
    <div class="example">
      <strong>我的书</strong>
      <span>wǒ de shū　／　わたしの本</span>
    </div>
    <div class="example">
      <strong>你的茶</strong>
      <span>nǐ de chá　／　あなたの茶</span>
    </div>
  </article>
  <div class="primary-row one">
    <RouterLink to="/" class="btn btn-solid">わかった</RouterLink>
  </div>
</template>

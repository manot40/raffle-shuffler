<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

import { animate, createTimeline, utils, type JSAnimation } from 'animejs';

import { CHARACTERS, INITIAL_CHAR, NUM_OF_DIGITS } from './const';

import Characters from './components/characters.vue';

const code = ref('');
const reels = ref<HTMLElement[]>([]);
const charHeight = ref(0);

const isIdling = ref(true);
const isSpinning = ref(false);
const isRevealing = ref(false);
const isResetting = ref(false);

const cachedTweens: Array<JSAnimation> = [];
const ms = (seconds: number) => seconds * 1000;

function reset() {
  const targetIndex = CHARACTERS.length + CHARACTERS.indexOf(INITIAL_CHAR);
  const y = -targetIndex * charHeight.value;

  if (cachedTweens.length > 0) {
    isResetting.value = true;
    cachedTweens.forEach((tween) => tween.cancel());

    const revertTl = createTimeline({ onComplete: cleanup });
    reels.value.forEach((reel) => {
      revertTl.add(reel, { y, ease: 'inOutExpo', duration: 650 }, 100);
    });
  } else {
    utils.set(reels.value, { y, onComplete: cleanup });
  }
}
function cleanup() {
  code.value = '';
  isIdling.value = true;
  isSpinning.value = false;
  isRevealing.value = false;
  isResetting.value = false;
  cachedTweens.length = 0;
}

function startSpinning() {
  if (isSpinning.value || isRevealing.value) return;
  isSpinning.value = true;
  isIdling.value = false;
  code.value = '';

  reels.value.forEach((reel) => {
    const entryHeight = CHARACTERS.length * charHeight.value;
    const wrap = utils.wrap(-entryHeight * 2, -entryHeight);

    const proxy = { y: +utils.get(reel, 'y') };
    const direction = utils.randomPick(['-=', '+=']);

    // Buat tween individual dan simpan referensinya
    cachedTweens.push(
      animate(proxy, {
        y: `${direction}${entryHeight * 10}`,
        loop: true,
        ease: 'inSine',
        duration: ms(utils.random(3, 6, 2)),
        onUpdate: () => utils.set(reel, { y: wrap(proxy.y) }),
      })
    );
  });
}

function revealCode() {
  if (!isSpinning.value || isRevealing.value) return;

  isSpinning.value = false;
  isRevealing.value = true;
  const newCode = generateRandomCode();

  const revealTl = createTimeline({
    onComplete() {
      code.value = newCode;
      isRevealing.value = false;
    },
  });

  reels.value.forEach((reel, i) => {
    const targetChar = newCode[i];
    const targetIndex = CHARACTERS.length + CHARACTERS.indexOf(targetChar);
    const y = -targetIndex * charHeight.value;

    const revealTime = ms(0.5 + i * 1.0);
    // Hentikan tween pada saat animasi pendaratan berakhir
    const onBegin = () => cachedTweens[i]?.complete();
    revealTl.add(reel, { y, ease: 'outElastic', duration: ms(1.2), onBegin }, revealTime);
  });
}
function generateRandomCode() {
  let code = '';
  for (let i = 0; i < NUM_OF_DIGITS; i++) {
    code += utils.randomPick(CHARACTERS);
  }
  return code;
}

onMounted(() => {
  nextTick(reset);
  const childEl = reels.value[0] && reels.value[0].children[0];
  if (childEl instanceof HTMLElement) charHeight.value = childEl.offsetHeight;
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-900 text-white">
    <div class="mx-auto w-full max-w-4xl p-4">
      <div class="flex flex-col items-center justify-center space-y-16">
        <h1 class="text-center text-4xl font-bold text-cyan-400 md:text-5xl">Pengacak Kode Undian</h1>

        <Characters v-model="reels" />

        <div class="flex space-x-4">
          <button
            v-if="isIdling"
            @click="startSpinning"
            class="transform rounded-lg bg-cyan-500 px-8 py-4 text-xl font-bold text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-gray-600">
            Acak
          </button>
          <button
            v-else-if="!code"
            @click="revealCode"
            :disabled="isResetting || isRevealing || !!code"
            class="transform rounded-lg bg-yellow-500 px-8 py-4 text-xl font-bold text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-gray-600">
            Buka Kode
          </button>
          <button
            @click="reset"
            :disabled="isResetting"
            v-if="!isIdling && (!isRevealing || isSpinning)"
            class="transform rounded-lg bg-gray-700 px-8 py-4 text-xl font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-gray-600 disabled:text-gray-900">
            Reset
          </button>
        </div>

        <div v-if="code" class="mt-6 w-full rounded-lg bg-gray-800 p-4 text-center shadow-inner">
          <h2 class="mb-2 text-lg text-gray-400">Kode Undian Terpilih:</h2>
          <p class="font-mono text-3xl font-bold tracking-widest text-yellow-400 md:text-4xl">
            {{ code }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

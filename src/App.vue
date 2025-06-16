<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

import { gsap } from 'gsap';
import { CHARACTERS, NUM_OF_DIGITS } from './const';

import Characters from './components/characters.vue';

const code = ref('');
const reels = ref<HTMLElement[]>([]);
const charHeight = ref(0);

const isIdling = ref(true);
const isSpinning = ref(false);
const isRevealing = ref(false);

const cachedTweens: Array<InstanceType<typeof gsap.core.Tween>> = [];

function calculateCharHeight() {
    const childEl = reels.value[0] && reels.value[0].children[0];
    if (childEl instanceof HTMLElement) charHeight.value = childEl.offsetHeight;
}

function reset() {
    // Hentikan setiap animasi putaran secara individual
    if (cachedTweens.length) {
        cachedTweens.forEach((tween) => tween.kill());
        cachedTweens.length = 0;
    }
    if (!charHeight || charHeight.value === 0) {
        calculateCharHeight();
    }
    code.value = '';
    isIdling.value = true;
    isSpinning.value = false;
    isRevealing.value = false;

    const zeroIndexInMiddleSet = CHARACTERS.length + CHARACTERS.indexOf('0');
    const initialY = -zeroIndexInMiddleSet * charHeight.value;
    gsap.set(reels.value, { y: initialY });
}

function generateRandomCode() {
    let code = '';
    for (let i = 0; i < NUM_OF_DIGITS; i++) {
        const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
        code += CHARACTERS[randomIndex];
    }
    return code;
}

function startSpinning() {
    if (isSpinning.value || isRevealing.value) return;
    isSpinning.value = true;
    isIdling.value = false;
    code.value = '';

    cachedTweens.length = 0;

    reels.value.forEach((reel) => {
        const singleSetHeight = CHARACTERS.length * charHeight.value;
        const wrap = gsap.utils.wrap(-singleSetHeight * 2, -singleSetHeight);
        const proxy = { y: gsap.getProperty(reel, 'y') as number };

        // Buat tween individual dan simpan referensinya
        const tween = gsap.to(proxy, {
            y: (Math.random() < 0.5 ? '-=' : '+=') + singleSetHeight * 15,
            duration: 3 + Math.min(Math.random(), 0.65) * 2,
            ease: 'sine.in',
            repeat: -1,
            onUpdate() {
                gsap.set(reel, { y: wrap(proxy.y) });
            },
        });
        cachedTweens.push(tween);
    });
}

// Menghentikan putaran dan membuka kode
function revealCode() {
    if (!isSpinning.value || isRevealing.value) return;

    isSpinning.value = false;
    isRevealing.value = true;
    const newCode = generateRandomCode();

    const revealTl = gsap.timeline({
        onComplete() {
            code.value = newCode;
            isRevealing.value = false;
            cachedTweens.length = 0; // Bersihkan setelah selesai
        },
    });

    reels.value.forEach((reel, index) => {
        const targetChar = newCode[index];
        const targetIndex = CHARACTERS.length + CHARACTERS.indexOf(targetChar);
        const targetY = -targetIndex * charHeight.value;

        const revealTime = 0.5 + index * 1.0; // Waktu mulai pendaratan untuk setiap digit

        const killTween = () => {
            cachedTweens[index]?.kill();
        };

        // Hentikan tween putaran pada waktu yang tepat
        revealTl.call(killTween, undefined, revealTime);
        // Mulai animasi pendaratan pada waktu yang sama
        revealTl.to(reel, { y: targetY, duration: 1.2, ease: 'elastic.out' }, revealTime);
    });
}

onMounted(() => {
    nextTick(() => reset());
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
                        :disabled="isRevealing || !!code"
                        class="transform rounded-lg bg-yellow-500 px-8 py-4 text-xl font-bold text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-gray-600">
                        Buka Kode
                    </button>
                    <button
                        @click="reset"
                        v-if="!isIdling && (!isRevealing || isSpinning)"
                        class="transform rounded-lg bg-gray-700 px-8 py-4 text-xl font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-gray-600">
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

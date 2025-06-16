<script setup lang="ts">
import { onBeforeUnmount, type VNodeRef } from 'vue';

import { NUM_OF_DIGITS, CHARACTERS } from '../const';

const REEL_CHARACTERS = [...CHARACTERS, ...CHARACTERS, ...CHARACTERS];

const reelRefs = defineModel<HTMLElement[]>({ default: [] });

const setReelRef: VNodeRef = (el) => {
    if (el instanceof HTMLElement) reelRefs.value.push(el);
};

onBeforeUnmount(() => {
    reelRefs.value = [];
});
</script>

<template>
    <div class="flex justify-center space-x-2 md:space-x-3">
        <div v-for="(_, i) in Array(NUM_OF_DIGITS)" :key="i" :class="$style.digitWrapper">
            <div :class="$style.reel" :ref="setReelRef">
                <div v-for="(char, j) in REEL_CHARACTERS" :key="j" :class="$style.char">
                    {{ char }}
                </div>
            </div>
        </div>
    </div>
</template>

<style module>
.digitWrapper {
    /* Wadah untuk satu digit, menciptakan efek "jendela" */
    height: 4rem; /* Tinggi harus pas dengan tinggi satu karakter */
    line-height: 4rem;
    overflow: hidden;
    border: 2px solid #374151; /* gray-700 */
    border-radius: 0.5rem; /* rounded-lg */
    background-color: #1f2937; /* gray-800 */
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.5);
}

.reel {
    /* Kolom vertikal yang berisi karakter dan akan dianimasikan */
    display: flex;
    flex-direction: column;
    align-items: center;
    will-change: transform; /* Optimasi performa untuk animasi transform */
}

.char {
    /* Setiap karakter di dalam reel */
    height: 4rem; /* Sesuaikan dengan tinggi wrapper */
    width: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Roboto Mono', monospace;
    font-size: 2.25rem; /* text-4xl */
    font-weight: 700;
    color: #f3f4f6; /* gray-100 */
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}
</style>

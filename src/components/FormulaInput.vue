<template>
    <!-- <div class="formula-editor"> -->

    <!-- <pre class="highlight" v-html="highlighted"></pre> -->

    <input class="formula-input" ref="inputEl" :autofocus="true" :value="modelValue" @input="formatFormulaInput"
        placeholder="Enter formula" />

    <!-- </div> -->
</template>

<script setup lang="ts">

// import { computed } from "vue"

defineProps<{
    modelValue: string
}>()

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void
}>()

function formatFormulaInput(event: Event) {
    const input = event.target as HTMLInputElement

    let value = input.value

    value = value.toUpperCase()
    value = value.replace(/[^A-Z()>→\-¬]/g, "")

    // update the field and the model
    input.value = value
    emit("update:modelValue", value)
}


// watch(() => 
//     focus()
// })


// const highlighted = computed(() => {
//     const text = props.modelValue

//     if (!text) return ""

//     return text
//         .replace(/>/g, `<span class="op">→</span>`)
//         .replace(/∧|&/g, `<span class="op">∧</span>`)
//         .replace(/∨|\|/g, `<span class="op">∨</span>`)
//         .replace(/-|!/g, `<span class="op">¬</span>`)
//         .replace(/\(/g, `<span class="paren">(</span>`)
//         .replace(/\)/g, `<span class="paren">)</span>`)
// })
</script>

<style scoped>
/* .formula-editor {
    /* width: 100%; */
/* } */

.formula-input {
    /* width: 100%; */
    display: flex;
    /* width: auto; */

    padding: 0.5rem 0.75rem;

    border-radius: 0.5rem;
    border: 1px solid #e5e5e5;
    outline: none;

    background: white;
    transition: border-color 0.15s, box-shadow 0.15s;

    /* font-size: 0.9rem; */
    font-family: monospace;
    /* text-transform: uppercase; */
}

.formula-input:focus {
    border-color: #4f46e5;

    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
}


/* highlighted background layer */

.highlight {
    margin: 0;

    padding: 0.55rem 0.75rem;

    pointer-events: none;

    white-space: pre-wrap;
    word-break: break-word;
}


/* typing layer */

/* .editor {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    padding: 0.55rem 0.75rem;

    border: none;
    outline: none;

    background: transparent;

    color: transparent;
    caret-color: black;

    resize: none;

    font-family: inherit;
    font-size: inherit;
} */


/* syntax colors */

.op {
    color: #1b66d8;
    font-weight: 600;
}

.paren {
    color: #555;
}
</style>
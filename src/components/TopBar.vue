<template>
    <div class="top-bar">
        <h2>HilbertAssistant</h2>

        <button class="btn-primary" @click="$emit('reset')">New proof</button>
    </div>
</template>

<script setup lang="ts">

defineEmits(['reset'])

</script>

<style scoped>
.top-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    /* justify-content: right; */
    margin-left: 2rem;
    margin-right: 2rem;
    /* border-bottom: 2px red; */
}

.btn-primary {
    align-self: center;

    height: fit-content;
    padding: 0.45rem 0.9rem;
    border-radius: 0.5rem;
    border: none;

    font-size: 0.8rem;
    font-weight: 700;

    background: #1b66d8;
    color: white;
    transition: background 0.15s;

    cursor: pointer;
}

.btn-primary:hover {
    background: #103772;
}
</style>
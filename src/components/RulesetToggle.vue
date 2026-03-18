<template>
    <div class="toggle-container">
        <span class="label" :class="{ active: !isRight }" @click="selectLeft">
            {{ leftLabel }}
        </span>

        <div :class="{ right: isRight, switch: true }" @click="toggle">
            <div class="knob" :class="{ right: isRight }"></div>
        </div>

        <span class="label" :class="{ active: isRight }" @click="selectRight">
            {{ rightLabel }}
        </span>
    </div>
</template>



<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
    modelValue: string
    leftLabel: string
    rightLabel: string
    leftValue: string
    rightValue: string
}>()

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void
}>()

const isRight = computed(() => props.modelValue === props.rightValue)

function toggle() {
    emit(
        "update:modelValue",
        isRight.value ? props.leftValue : props.rightValue
    )
}

function selectLeft() {
    emit("update:modelValue", props.leftValue)
}

function selectRight() {
    emit("update:modelValue", props.rightValue)
}
</script>



<style scoped>
.toggle-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.label {
    cursor: pointer;
    opacity: 0.5;
    user-select: none;
}

.label.active {
    opacity: 1;
    font-weight: 500;
}

.switch {
    width: 42px;
    height: 22px;
    background: #ccc;
    border-radius: 11px;
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
}

.knob {
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
}

.knob.right {
    transform: translateX(20px);
}

.switch.right {
    background-color: #1b66d8;
}
</style>

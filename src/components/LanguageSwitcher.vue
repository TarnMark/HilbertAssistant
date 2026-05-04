<template>
    <div class="lang-switcher" ref="root">
        <button class="trigger" @click="toggle" :aria-expanded="open">
            <span class="code">{{ currentLocale.toUpperCase() }}</span>
            <span class="chevron" :class="{ open }">▾</span>
        </button>

        <ul v-if="open" class="menu" role="listbox">
            <li v-for="loc in locales" :key="loc" class="item" :class="{ selected: loc === currentLocale }"
                role="option" @click="select(loc)">
                {{ loc.toUpperCase() }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, availableLocales } = useI18n({ useScope: 'global' })

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const locales = computed(() => availableLocales)
const currentLocale = computed(() => locale.value)

function toggle() {
    open.value = !open.value
}

function select(loc: string) {
    if (loc !== locale.value) {
        locale.value = loc
        localStorage.setItem('lang', loc)
    }
    open.value = false
}

// Close on outside click
function onClickOutside(e: MouseEvent) {
    if (!root.value) return
    if (!root.value.contains(e.target as Node)) {
        open.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.lang-switcher {
    position: relative;
    display: inline-block;
    font-size: 14px;
}

.trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: transparent;
    border: 1px solid #ccc;
    border-radius: 6px;
    cursor: pointer;
}

.code {
    font-weight: 500;
    letter-spacing: 0.5px;
}

.chevron {
    transition: transform 0.2s ease;
}

.chevron.open {
    transform: rotate(180deg);
}

.menu {
    position: absolute;
    top: 70%;
    /* right: 0; */
    min-width: 100%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 4px 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    z-index: 1000;
}

.item {
    padding: 6px 10px;
    cursor: pointer;
}

.item:hover {
    background: #f2f2f2;
}

.item.selected {
    font-weight: 600;
}

.item::marker {
    color: #ffffff00;
}
</style>
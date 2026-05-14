<template>
    <div class="hint-container">
        <span class="hint-icon">?</span>

        <div class="hint-tooltip">
            <slot />
        </div>
    </div>
</template>


<style scoped>
.hint-container {
    display: inline-flex;
    align-items: center;
}

.hint-icon {
    width: 16px;
    height: 16px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 11px;
    font-weight: 700;

    color: #6b7280;

    border: 1px solid #d1d5db;
    border-radius: 50%;

    cursor: default;
}

.hint-container:hover .hint-tooltip {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
    z-index: 1000;
}

.hint-tooltip {
    position: absolute;
    bottom: 125%;
    right: 0;

    width: max-content;

    background: #111827;
    color: white;

    font-size: 11px;
    line-height: 1.4;

    padding: 8px 10px;

    border-radius: 6px;

    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    opacity: 0;
    pointer-events: none;

    transform: translateY(4px);
    transition: all 0.15s ease;

    z-index: 10;
}
</style>
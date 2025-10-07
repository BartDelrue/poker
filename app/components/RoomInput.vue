<script setup lang="ts">

const {length = 6, label = "Room ID"} = defineProps<{
  length?: number,
  label?: string,
  modelValue: string
}>()
defineEmits<{
  "update:modelValue": [value: string]
}>()

const inputRef = useTemplateRef('inputRef')
const moveCaretToEnd = () => {
  nextTick(() => {
    if (inputRef.value) {
      const el = inputRef.value
      el.selectionStart = el.selectionEnd = el.value.length
    }
  })
}

onMounted(() => {
  inputRef.value?.addEventListener("focus", moveCaretToEnd)
  inputRef.value?.addEventListener("click", moveCaretToEnd)
  inputRef.value?.addEventListener("keyup", moveCaretToEnd)
})

onBeforeUnmount(() => {
  inputRef.value?.removeEventListener("focus", moveCaretToEnd)
  inputRef.value?.removeEventListener("click", moveCaretToEnd)
  inputRef.value?.removeEventListener("keyup", moveCaretToEnd)
})

</script>

<template>
  <div class="box text-xl lg:text-2xl">
    <label for="roomId">{{ label }}</label>
    <input
        id="roomId"
        ref="inputRef"
        type="text"
        required
        :pattern="`.{${length},${length}}`"
        :value="modelValue"
        v-bind="$attrs"
        @input="(event: InputEvent) => $emit('update:modelValue', (event.target! as HTMLInputElement).value.toUpperCase())"
    >
    <span
        v-for="i in length"
        :key="i"
        :class="{active: modelValue.length === i - 1}"
        aria-hidden="true"
    >
      {{ modelValue[i - 1]?.toUpperCase() ?? '' }}
    </span>
  </div>

</template>

<style scoped>
.box {
  position: relative;
  min-height: 3em;
  line-height: 1;
  border: 1px solid;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding-inline: 1em;
  border-radius: var(--ui-radius);

  label {
    position: absolute;
    inset-block-start: -.7em;
    inset-inline-start: 1em;
    background: var(--ui-bg);
    padding-inline: .5em;
    font-size: 0.5em;
  }

  &:has(:focus) {
    outline: 2px solid var(--ui-text-dimmed);
    border-color: transparent;

    &:has(:valid) {
      outline: 2px solid var(--ui-primary);
    }

    span.active {
      border-inline-start: 1px solid;
      animation: blink 800ms alternate-reverse infinite;
    }
  }

  input {
    display: block;
    position: absolute;
    opacity: 0;
    inset: 0;
  }

  span {
    border-bottom: 2px solid;
    height: 1em;
    width: 1em;
  }
}

@keyframes blink {
  0% {
    border-inline-start-color: transparent;
  }
  49% {
    border-inline-start-color: transparent;
  }
  50% {
    border-inline-start-color: initial;
  }
  100% {
    border-inline-start-color: initial;
  }
}
</style>
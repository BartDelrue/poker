<script setup lang="ts">
const {scores} = defineProps<{
  scores: Scores,
  connectionId: string | undefined,
  revealed: boolean
}>()

defineEmits<{
  toggleReveal: []
}>()

const finished = computed<boolean>(() =>
    Array.from(scores.values())
        .every(v => !!v)
)


</script>

<template>
  <div class="flex flex-wrap gap-4 justify-center">
      <span
          v-for="([key, value]) in scores"
          :key="key"
          :title="connectionId === key ? 'dit ben jij vriend!' : null"
          class="p-4 bg-muted ring  inline-block rounded-lg"
          :class="connectionId === key ? 'ring-secondary' : 'ring-default'"
      >
        {{ revealed || connectionId === key ? value : value ? '?' : '-' }}
      </span>
    <UButton
        :icon="finished ? revealed ? 'i-lucide-eye-closed' : 'i-lucide-eye' : 'i-lucide-eye-off'"
        :variant="!finished || revealed ? 'soft' : 'solid'"
        :disabled="!finished"
        :label="revealed ? 'Verstoppen!' : 'Piepen!'"
        @click="$emit('toggleReveal')" />
  </div>


</template>

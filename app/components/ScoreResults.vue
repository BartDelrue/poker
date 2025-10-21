<script setup lang="ts">
const {scores, members, revealed, userId} = defineProps<{
  scores: ScoreMap,
  members: Member[],
  userId: string | undefined,
  revealed: boolean
}>()

defineEmits<{
  toggleReveal: []
}>()

const finished = computed<boolean>(() =>
    Array.from(scores.entries())
        .every(([userId, Score]) => !!Score || members?.find(m => m.userId === userId)?.active === false)
)

const displayValue = ([key, value]: [string, Score]) => {
  if (revealed) return value
  if (userId === key) return value ?? '-'
  return '?'
}

</script>

<template>
  <div class="flex flex-wrap gap-4 justify-center">
      <span
          v-for="([key, value]) in scores"
          :key="key"
          :title="userId === key ? 'dit ben jij vriend!' : undefined"
          class="p-4 bg-muted ring  inline-block rounded-lg"
          :class="{
            'ring-secondary': userId === key,
            'ring-default': userId !== key,
            'ring-error text-muted': !members.find(m => m.userId === key)?.active
          }"
      >
        {{ displayValue([key, value]) }}
      </span>
    <UButton
        :icon="finished ? revealed ? 'i-lucide-eye-closed' : 'i-lucide-eye' : 'i-lucide-eye-off'"
        :variant="!finished || revealed ? 'soft' : 'solid'"
        :disabled="!finished"
        :label="revealed ? 'Verstoppen!' : 'Piepen!'"
        @click="$emit('toggleReveal')" />
  </div>


</template>

<script setup lang="ts">

defineProps<{
  options: Score[]
}>()
defineEmits<{
  score: [value: string]
}>()

</script>

<template>

  <div class="flex gap-2 flex-wrap justify-center">
    <UButton
        variant="outline"
        v-for="o in options"
        :key="o!"
        @click="$emit('score',o!.toString())">
      {{ o }}
    </UButton>
  </div>


</template>

<style scoped>

</style>
<script setup lang="ts">
import {onBeforeRouteLeave} from "#app/composables/router";
const emit = defineEmits<{ reset: []}>()
const open = ref()

const reset = () => {
  open.value = false
  emit('reset')
}

onBeforeRouteLeave(() => {
  if (open.value) {
    open.value = false
    return false
  }
})

</script>

<template>
  <UModal
      v-model:open="open"
      title="Reset criterium"
      description="Reset criterium">
    <UButton
        variant="soft"
        color="neutral"
        label="Wis scores"
        icon="i-lucide-circle-alert"
        class="ms-auto"
        @click="open = true"/>
    <template #content>
      <div class="p-4">
        <p>Ben je heel zeker?</p>
        <div class="flex justify-between mt-8">
          <UButton color="neutral" variant="outline" @click="reset">Ja!</UButton>
          <UButton variant="outline" @click="open = false">Oei, nee!</UButton>
        </div>
      </div>
    </template>
  </UModal>

</template>

<style scoped>

</style>
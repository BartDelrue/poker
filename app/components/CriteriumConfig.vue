<script setup lang="ts">
import type {FormError} from "#ui/types";
import {onBeforeRouteLeave} from "#app/composables/router";

const props = withDefaults(defineProps<{
  name?: string,
  options?: Score[]
}>(), {name: '', options: () => []})

const emit = defineEmits<{
  submit: [value: { name: string, options: Score[] }]
}>()

const form = useTemplateRef('form')

const local = ref({name: props.name, options: [...props.options]})
watch(props, newProps => local.value = {...newProps})
const handleSubmit = () => {
  emit('submit', {...local.value})
  open.value = false
  local.value = {name: '', options: []}
}
const open = ref()

const validate = (state: { name: string, options: Score[] }): FormError[] => {
  const errors: FormError[] = []

  if (!state.options.length)
    errors.push({name: `options`, message: '\'t is van moeten hoor'})
  if (state.options.length === 1)
    errors.push({name: `options`, message: 'Eéntje is geentje, ben je de komma\'s vergeten?'})


  return errors
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
v-model:open="open" :title="name || options.length ? 'Bewerk criterium' : 'Nieuw criterium'"
          :description="name || options.length ? 'Bewerk criterium' : 'Nieuw criterium'">
    <UButton
        v-if="name || options.length"
        variant="soft"
        color="neutral"
        title="bewerk criterium"
        icon="i-lucide-edit"
        class="ms-auto"
        @click="open = true"/>
    <UButton
        v-else
        variant="soft"
        color="neutral"
        label="Voeg criterium toe"
        icon="i-lucide-edit"
        class="ms-auto"
        @click="open = true"/>
    <template #content>
      <UForm ref="form" :state="local" class="p-4" :validate @submit="handleSubmit">
        <UFormField
            :name="`name`"
            class="mb-4" label="Criteriumnaam" description="(optioneel)">
          <UInput v-model="local.name"/>
        </UFormField>
        <UFormField
            :name="`options`"
            class="mb-4" required description="gescheiden door komma's" label="Opties">
          <UInput
              :model-value="local.options.join(',')"
              @update:model-value="local.options = $event.split(',')"/>
        </UFormField>
        <UButton type="submit" :label="name || options.length ? 'Update' : 'Voeg toe'"/>
      </UForm>
    </template>
  </UModal>

</template>

<style scoped>

</style>
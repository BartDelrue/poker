<script lang="ts" setup>

import type {FormError} from "#ui/types";
import {useSharedConfig} from "~/composable/sharedConfig";

const { config } = useSharedConfig()

const create = () => {
  const roomId = (Math.random() + 1).toString(36).slice(-6).toUpperCase();
  config.value = toValue(newRoomState)
  useRouter().push({name: 'room-id', params: {id: roomId}})
}

const error = ref<string | null>(null)
const join = () => {

  error.value = null

  if (roomId.value.length !== 6) {
    error.value = "Eerst ons geheim wachtwoordje geven."
    return
  }

  useRouter().push({name: 'room-id', params: {id: roomId.value.slice(0, 6)}})
}

const roomId = ref("")

const newRoomState = reactive<{ name: string, options: Score[] }[]>([{
  name: '',
  options: ["0", "0.5", "1", "2", "3", "5", "8"]
}])

const validate = (state: { name: string, options: Score[] }[]): FormError[] => {
  const errors: FormError[] = []
  state.forEach(
      (c, i) => {
        if (!c.options.length)
          errors.push({name: `${i}-options`, message: '\'t is van moeten hoor'})
        if (c.options.length === 1)
          errors.push({name: `${i}-options`, message: 'Eéntje is geentje, ben je de komma\'s vergeten?'})
      }
  )
  return errors
}


</script>


<template>
  <main class=" min-h-dvh flex flex-col items-stretch justify-center w-fit mx-auto max-w-12/12 ">
    <div class="prose">
      <h1 class="lg:text-7xl mb-16">Evaluatiepoker</h1>
    </div>

    <UCard class="mb-8">
      <template #header>
        <h2 class="no-prose text-sm">Kom eens naar mijn kamertje</h2>
      </template>
      <form novalidate class="prose" @submit.prevent="join">
        <div class="flex flex-wrap gap-4">
          <RoomInput v-model="roomId" label="code"/>
          <UButton type="submit" trailing-icon="i-lucide-arrow-right" size="md">Ga binnen</UButton>
        </div>
        <p v-if="error" role="alert" class="text-error">{{ error }}</p>
      </form>

    </UCard>
    <UCollapsible :unmount-on-hide="false">
      <UButton
          class="group"
          color="neutral"
          variant="subtle"
          trailing-icon="i-lucide-chevron-down"
          block
          :ui="{trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'}"
      >Of start je eigen kamertje
      </UButton>
      <template #content>
        <UCard class="bg-muted mt-2">
          <UForm :state="newRoomState" :validate @submit="create">
            <fieldset
                v-for="(field,i) in newRoomState"
                :key="i"
                class="border-b-accented border-b-1 mb-4 relative">
              <UButton
                  v-if="i > 0"
                  title="verwijder criterium"
                  icon="lucide:minus"
                  variant="subtle"
                  color="neutral"
                  class="absolute top-0 end-0"
              type="button"
              @click="newRoomState.splice(i,1)"/>
              <UFormField
                  :name="`${i}-options`"
                  class="mb-4" required description="gescheiden door komma's" label="Opties">
                <UInput
                    :model-value="field.options.join(',')"
                    @update:model-value="field.options = $event.split(',')"/>
              </UFormField>
              <UFormField
                  :name="`${i}-name`"
                  class="mb-4" label="Criteriumnaam" description="(optioneel)">
                <UInput v-model="field.name"/>
              </UFormField>
            </fieldset>
            <div class="flex justify-between">
              <UButton type="submit">Start</UButton>
              <UButton
                  type="button"
                  variant="subtle"
                  color="neutral"
                  icon="lucide:square-plus"
                  @click="newRoomState.push({name: '', options: []})"
              >Voeg nog een criterium toe
              </UButton>
            </div>

          </UForm>
        </UCard>

      </template>
    </UCollapsible>

  </main>


</template>

<script lang="ts" setup>
import {usePokerSocket} from "~/composable/pokerSocket";
import ScoreOptions from "~/components/ScoreOptions.vue";
import CriteriumConfig from "~/components/CriteriumConfig.vue";
import {useSharedConfig} from "~/composable/sharedConfig";
import {useBurnAfterReading} from "~/composable/burnAfterReading";

const room = useRoute().params.id as string
const config = useBurnAfterReading(useSharedConfig().config)

const {
  connectionId,
  score, toggleReveal,
  rubric,
  updateConfig,
  onOpen
} = usePokerSocket(room)

onOpen(() => {
  if (config) {
    config.forEach(c => updateConfig({...c}))
  }
})

const hasMembers = computed<boolean>(() => !!rubric.value?.criteria[0]?.scores.size)

</script>

<template>
  <div class="my-8">
    <h1 class="sr-only">Kamertje {{ room }}</h1>
    <div v-if="rubric?.criteria?.length">
      <UCard v-for="({scores, options, id, revealed, name}) in rubric?.criteria" :key="id">
        <template #header>
          <div class="flex">
            <h2 class="font-bold text-xl" :class="{ 'sr-only' : !name}">{{ name || 'criterium' }}</h2>

            <CriteriumConfig
                :name
                :options
                @submit="updateConfig( $event, id)"
            />
          </div>
        </template>
        <div class="my-8">
          <ScoreResults
              :scores
              :revealed
              :connection-id
              @toggle-reveal="toggleReveal(id)"/>
          <p
              v-if="!hasMembers"
              class="text-center my-4 text-muted text-sm">
            Je bent helemaal alleen,<br>deel de URL met
            je vriendjes.</p>
        </div>
        <div class="my-8">
          <ScoreOptions
              :options="options"
              @score="score($event, id)"/>
        </div>
        <template #footer>

        </template>
      </UCard>
    </div>
    <UCard v-else variant="subtle" class="prose mx-auto mb-8">
      <div class="flex flex-col items-center text-muted">
        <UIcon name="i-lucide-ghost" class="size-16"/>
        <p>Dit kamertje is leeg</p>
      </div>
    </UCard>
    <div class="mt-8">
      <CriteriumConfig
          @submit="updateConfig( $event)"
      />
    </div>
  </div>
</template>

<template>
  <q-card style="min-width: 50vw; max-width: 90vw">
    <q-card-section class="q-pa-none">
      <q-table
        class="table-sticky-header no-column"
        style="max-height: 70vh"
        :rows="rows"
        :separator="'cell'"
        :filter="filter"
        :rows-per-page-options="[0]"
        hide-bottom
        hide-header
        bordered
        dense
      >
        <template v-slot:body-cell="props">
          <q-td :props="props" style="text-align: left !important">
            {{ props.value }}
          </q-td>
        </template>
        <template v-slot:top-left>
          <div class="text-h6">
            {{ parameters.title }}
            <q-badge
              v-if="true === parameters.badge"
              color="orange"
              rounded
              align="top"
              transparent
            />
          </div>
        </template>
        <template v-slot:top-right>
          <q-input
            v-if="false !== parameters.search"
            borderless
            dense
            v-model="filter"
            class="q-ml-md"
            :placeholder="$t('label.search')"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <div v-if="util.isArray(parameters.actions)" class="q-ml-sm q-mr-sm">
            <q-btn
              v-for="(action, index) in parameters.actions"
              :key="index"
              round
              glossy
              dense
              size="sm"
              :icon="action.icon"
              :color="action.color"
              :loading="action.loading"
              :disable="action.disable"
              class="q-ml-sm"
              @click="action.click"
            >
              <q-tooltip v-if="action?.label?.length">{{
                action.label
              }}</q-tooltip>
            </q-btn>
          </div>

          <q-btn
            v-if="util.isFunction(parameters.onRefresh)"
            round
            glossy
            dense
            size="sm"
            icon="refresh"
            class="q-ml-sm"
            :loading="loading"
            :color="parameters?.color?.refresh"
            @click="onRefresh"
          >
            <q-tooltip>{{ $t("label.refresh") }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            glossy
            dense
            size="sm"
            icon="close"
            class="q-ml-sm"
            :color="parameters?.color?.close"
            v-close-popup
          >
            <q-tooltip>{{ $t("label.close") }}</q-tooltip>
          </q-btn>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script>
import { ref } from "vue";
import { util } from "src/scripts/util";
let self;

export default {
  props: ["parameters"],
  setup() {
    return {
      util,
      rows: ref([]),
      filter: ref(null),
      loading: ref(true),
    };
  },
  created() {
    self = this;
    self.rows = util.isArray(self.parameters.rows) ? self.parameters.rows : [];
    self.onRefresh();
  },
  methods: {
    onRefresh() {
      if (util.isFunction(self.parameters.onRefresh)) {
        let parameters = util.copy(self.parameters);
        self.parameters.onRefresh({
          parameters: parameters,
          onStar() {
            self.loading = true;
          },
          onFinish() {
            self.loading = false;
          },
          onData(rows) {
            if (util.isArray(rows)) {
              self.rows = rows;
            }
          },
        });
      }
    },
  },
};
</script>

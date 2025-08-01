<template>
  <q-card>
    <q-card-section
      class="q-pa-none header-main"
      :style="
        APP?.color?.header
          ? 'background: ' + APP.color.header + ' !important;'
          : ''
      "
    >
      <q-item class="q-pr-none">
        <q-item-section>
          <q-item-label class="text-white">{{}}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            class="text-caption text-white q-pl-xs q-pr-xs q-mr-xs"
            flat
            round
            glossy
            icon="close"
            v-close-popup
          >
            <q-tooltip>{{ $t("label.close") }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section style="max-height: 80vh" class="q-pa-sm q-pt-sm scroll">
      <div v-if="!loading">
        <q-table
          class="table-default"
          :columns="columns.entity"
          :rows="rows.entity"
          :separator="'cell'"
          :rows-per-page-options="[0]"
          hide-bottom
          bordered
          dense
        >
          <template v-slot:top>
            <span class="text-h6">{{ $t("label.entity") }}</span>
          </template>
        </q-table>
        <q-table
          v-if="data.id && data.id.fields?.length"
          class="table-default q-mt-md"
          :columns="columns.field"
          :rows="data.id.fields"
          :separator="'cell'"
          :rows-per-page-options="[0]"
          hide-bottom
          bordered
          dense
        >
          <template v-slot:top>
            <span class="text-h6">{{ $t("label.identifier") }}</span>
            <span class="q-ml-md"
              >[ {{ $t("label.type") }}: {{ data.id.type
              }}{{
                util.isString(data.id.name)
                  ? ", " + $t("label.field") + ": " + data.id.name
                  : ""
              }}
              ]</span
            >
          </template>
        </q-table>
        <q-table
          v-if="data.fields?.length"
          class="table-default q-mt-sm"
          :columns="columns.field"
          :rows="data.fields"
          :separator="'cell'"
          :rows-per-page-options="[0]"
          hide-bottom
          bordered
          dense
        >
          <template v-slot:top>
            <span class="text-h6">{{ $t("label.field") }}</span>
          </template>
        </q-table>
        <q-table
          v-if="data.transients?.length"
          class="table-default q-mt-sm"
          :columns="columns.transient"
          :rows="data.transients"
          :separator="'cell'"
          :rows-per-page-options="[0]"
          hide-bottom
          dense
        >
          <template v-slot:top>
            <span class="text-h6">{{ $t("label.transient") }}</span>
          </template>
        </q-table>
      </div>
      <div v-else style="height: 80px"></div>
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card-section>
  </q-card>
</template>

<script>
import { ref } from "vue";
import { APP } from "src/scripts/static";
import { util } from "src/scripts/util";
import { api } from "src/scripts/api";
let self;

export default {
  props: ["parameters"],
  setup() {
    return {
      APP,
      util,
      title: ref(null),
      manager: ref(null),
      entity: ref(null),
      data: ref({}),
      loading: ref(false),
      columns: ref({}),
      rows: ref({
        entity: [],
      }),
    };
  },

  created() {
    self = this;
    let params = util.isObject(self.parameters) ? self.parameters : {};
    self.title = params.title;
    self.columns = params.columns;
    self.manager = params.manager;
    self.entity = params.entity;
    self.get_entity();
  },

  methods: {
    get_entity() {
      self.loading = true;
      api.call({
        path: "/manager/entity",
        params: {
          manager: self.manager,
          entity: self.entity,
        },
        onFinish() {
          self.loading = false;
        },
        onSuccess(data) {
          if (util.isObject(data)) {
            self.data = data;
            self.rows.entity = [self.data];
          }
        },
      });
    },
  },
};
</script>

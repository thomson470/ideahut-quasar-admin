<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-card :style="'width: ' + ($q.screen.lt.md ? '100%;' : '50%;')">
    <q-card-section class="q-pa-none header-main">
      <q-item class="q-pr-none">
        <q-item-section>
          <q-item-label class="text-h6 text-white">{{ title }}</q-item-label>
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
    <q-card-section style="max-height: 75vh" class="q-pa-xs q-mt-xs scroll">
      <q-input
        type="text"
        v-for="(field, index) in fields"
        :key="index"
        :label="field.label"
        v-model="field.value"
        readonly
        filled
        autogrow
        class="q-mb-xs"
        style="max-height: 200px; overflow: scroll"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import { ref } from "vue";
import { util } from "src/scripts/util";
import { grid as fxGrid } from "src/scripts/grid";

export default {
  props: ["parameters"],
  setup() {
    return {
      title: ref(null),
      fields: ref([]),
      forms: ref({}),
      loading: ref({}),
    };
  },

  created() {
    let self = this;
    let params = fxGrid.get.object(self.parameters);
    let row = fxGrid.get.object(params.row);
    let definition = fxGrid.get.object(params.definition);
    self.title = params.title;
    self.replica = fxGrid.get.number(params.replica, null);
    self.fields = [];
    let columns = fxGrid.get.array(definition.table.columns);
    let value;
    let isIdShown = false;
    for (const column of columns) {
      if (!isIdShown && definition.id.fields.includes(column.field)) {
        isIdShown = true;
      }
      value = util.getFieldValue(column.field, row);
      if (util.isFunction(column.format)) {
        value = column.format(value, row);
      }
      self.fields.push({
        label: column.label,
        value: value,
      });
    }
    if (!isIdShown) {
      let value = fxGrid.id.toPk(definition.id, row);
      if (util.isDefined(value) && value !== null) {
        self.fields.splice(0, 0, {
          label: "ID",
          value: value,
        });
      }
    }
  },
};
</script>

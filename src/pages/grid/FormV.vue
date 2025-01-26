<template>
  <q-card :style="'width: ' + ($q.screen.lt.md ? '100%;' : '50%;') + dialog.style">
    <q-card-section
      class="q-pa-none header-main"
      :style="APP?.color?.header ? 'background: ' + APP.color.header + ' !important;' : ''"
      v-touch-pan.mouse="dialog.onDrag"
    >
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
            <q-tooltip>{{ $t('label.close') }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section style="max-height: 80vh" class="q-pa-xs q-mt-xs scroll">
      <div class="row">
        <div
          v-for="(field, index) in fields"
          :key="index"
          class="col-md-6 col-sm-12 q-mb-xs"
          style="width: 100%"
        >
          <div v-if="'title' === field.type" class="text-h6 text-center text-bold">
            {{ field.label }}
          </div>
          <q-input
            v-else
            type="text"
            :label="field.label"
            v-model="field.value"
            readonly
            filled
            autogrow
            class="q-mb-xs"
            style="max-height: 200px; overflow: scroll"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { ref } from 'vue'
import { APP } from 'src/scripts/static'
import { util } from 'src/scripts/util'
import { uix } from 'src/scripts/uix'
import { grid as fxGrid } from 'src/scripts/grid'
let self

export default {
  props: ['parameters'],
  setup() {
    return {
      APP,
      title: ref(null),
      fields: ref([]),
      dialog: ref(uix.dialog.init(() => self.dialog)),
    }
  },

  created() {
    self = this
    let params = fxGrid.get.object(self.parameters)
    let template = fxGrid.get.object(params.template)
    let form = fxGrid.get.object(params.form)
    let data = fxGrid.get.object(params.data)
    self.title = form.title
    self.fields = []
    let isIdShown = false
    let sval
    for (const field of form.fields) {
      let value = util.getFieldValue(field.name, data)
      if (!isIdShown && form.id.fields.includes(field.name)) {
        isIdShown = true
      }
      if (util.isFunction(field.format)) {
        value = field.format(value, data)
      } else if ('enum' === field.type) {
        try {
          sval = template.enums[field.enum].find((x) => x.value === value).label
        } catch {
          sval = value
        }
        value = sval
      } else if ('option' === field.type) {
        try {
          sval = template.options[field.option].find((x) => x.value === value).label
        } catch {
          sval = value
        }
        value = sval
      }
      self.fields.push({
        type: field.type,
        label: field.label,
        value: value,
      })
    }
    if (!isIdShown) {
      let value = fxGrid.id.toPk(form.id, data)
      if (util.isDefined(value) && value !== null) {
        self.fields.splice(0, 0, {
          label: 'ID',
          value: value,
        })
      }
    }
  },
}
</script>

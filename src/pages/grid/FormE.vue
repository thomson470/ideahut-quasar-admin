<template>
  <q-card :style="'width: ' + ($q.screen.lt.md ? '100%;' : '50%;') + dialog.main.style">
    <q-card-section
      class="q-pa-none header-main"
      :style="APP?.color?.header ? 'background: ' + APP.color.header + ' !important;' : ''"
      v-touch-pan.mouse="dialog.main.onDrag"
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
            :disable="saving"
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
            v-else-if="'words' === field.type"
            type="text"
            :label="field.label"
            :readonly="!field.editable"
            v-model="field.value"
            filled
            autogrow
            style="max-height: 200px; overflow: scroll"
          />
          <q-select
            v-else-if="'enum' === field.type"
            v-model="field.value"
            :label="field.label"
            :readonly="true !== field.editable"
            :options="enums[field.enum]"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            filled
          />
          <q-select
            v-else-if="'option' === field.type"
            v-model="field.value"
            :label="field.label"
            :readonly="true !== field.editable"
            :options="options[field.option]"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            filled
          />
          <q-input
            v-else-if="'datetime' === field.type || 'date' === field.type || 'time' === field.type"
            type="text"
            :label="field.label"
            :readonly="!field.editable"
            v-model="field.value"
            filled
          >
            <template v-slot:append>
              <q-icon
                :name="
                  'time' === field.type
                    ? 'schedule'
                    : 'date' === field.type
                      ? 'calendar_month'
                      : 'event'
                "
                class="cursor-pointer"
              >
                <q-popup-proxy
                  transition-show="scale"
                  transition-hide="scale"
                  cover
                  @before-show="uix.calendar.beforeShow(field, 'tab', 'proxy_value', 'value')"
                >
                  <div class="bg-primary">
                    <q-tabs
                      v-model="field.tab"
                      class="bg-primary text-grey-5 shadow-2 text-subtitle2"
                      align="justify"
                      no-caps
                      indicator-color="transparent"
                      active-color="white"
                    >
                      <q-tab v-if="'datetime' === field.type || 'date' === field.type" name="date">
                        <span>{{ $t('label.date') }}</span>
                      </q-tab>
                      <q-tab v-if="'datetime' === field.type || 'time' === field.type" name="time">
                        <span>{{ $t('label.time') }}</span>
                      </q-tab>
                    </q-tabs>
                    <q-separator />
                    <q-tab-panels v-model="field.tab">
                      <q-tab-panel
                        v-if="'datetime' === field.type || 'date' === field.type"
                        name="date"
                        class="q-pa-none"
                      >
                        <q-date v-model="field.proxy_value" :mask="field.format" square />
                      </q-tab-panel>
                      <q-tab-panel
                        v-if="'datetime' === field.type || 'time' === field.type"
                        name="time"
                        class="q-pa-none"
                      >
                        <q-time v-model="field.proxy_value" :mask="field.format" format24h square />
                      </q-tab-panel>
                    </q-tab-panels>
                    <q-separator />
                    <div class="q-pa-xs bg-white row">
                      <div class="col-6 text-left">
                        <q-btn :label="$t('label.cancel')" color="negative" no-caps v-close-popup />
                      </div>
                      <div class="col-6 text-right">
                        <q-btn
                          :label="$t('label.ok')"
                          color="secondary"
                          no-caps
                          v-close-popup
                          @click="field.value = field.proxy_value"
                        />
                      </div>
                    </div>
                  </div>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input
            v-else-if="'pick' === field.type"
            type="text"
            :label="field.label"
            :readonly="!field.editable"
            v-model="field.text"
            filled
          >
            <template v-if="field.editable" v-slot:append>
              <q-fab
                v-model="field.fab"
                icon="flaky"
                direction="left"
                padding="none"
                flat
                class="q-ma-none q-pa-none"
              >
                <q-fab-action
                  color="secondary"
                  icon="fact_check"
                  @click="on_pick_select_click(field)"
                >
                  <q-tooltip>{{ $t('label.select') }}</q-tooltip>
                </q-fab-action>
                <q-fab-action
                  v-if="field.value"
                  color="negative"
                  icon="delete_forever"
                  @click="on_pick_remove_click(field)"
                >
                  <q-tooltip>{{ $t('label.delete') }}</q-tooltip>
                </q-fab-action>
              </q-fab>
            </template>
          </q-input>
          <q-input
            v-else
            :type="field.type"
            :label="field.label"
            :readonly="!field.editable"
            v-model="field.value"
            filled
          />
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions class="row">
      <div class="col-6 q-pr-xs text-left">
        <q-btn
          :label="$t('label.cancel')"
          color="negative"
          no-caps
          glossy
          :disable="saving"
          v-close-popup
        />
      </div>
      <div class="col-6 q-pl-xs text-right">
        <q-btn
          :label="$t('label.save')"
          color="secondary"
          no-caps
          glossy
          :loading="saving"
          @click="on_save_click"
        />
      </div>
    </q-card-actions>
  </q-card>

  <q-dialog
    v-model="dialog.pick.show"
    persistent
    transition-show="slide-down"
    transition-hide="none"
    backdrop-filter="blur(1px)"
  >
    <Pick :parameters="dialog.pick.parameters" @close="on_close_dialog_pick" />
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from 'vue'
import { APP } from 'src/scripts/static'
import { util } from 'src/scripts/util'
import { uix } from 'src/scripts/uix'
import { grid as fxGrid } from 'src/scripts/grid'
let self

export default {
  props: ['parameters'],
  emits: ['close'],
  components: {
    Pick: defineAsyncComponent(() => import('src/pages/grid/Pick.vue')),
  },
  setup() {
    return {
      APP,
      uix,
      id: ref(null),
      title: ref(''),
      is_edit: ref(false),
      saving: ref(false),
      index: ref(null),
      fields: ref(null),
      form: ref(null),
      template: ref({ options: {}, enums: {} }),
      replica: ref(null),
      relations: ref([]),
      enums: ref({}),
      options: ref({}),
      row: ref(null),
      dialog: ref({
        main: uix.dialog.init(() => self.dialog.main),
        pick: uix.dialog.init(),
      }),
    }
  },

  created() {
    self = this
    let params = fxGrid.get.object(self.parameters)
    let form = fxGrid.get.object(params.form)
    self.template = fxGrid.get.object(params.template)
    self.replica = params.replica
    self.relations = fxGrid.get.array(params.relations)
    self.enums = {}
    if (util.isObject(self.template.enums)) {
      Object.keys(self.template.enums).forEach((key) => {
        self.enums[key] = [null].concat(self.template.enums[key])
      })
    }
    self.options = {}
    if (util.isObject(self.template.options)) {
      Object.keys(self.template.options).forEach((key) => {
        self.options[key] = [null].concat(self.template.options[key])
      })
    }
    self.data = fxGrid.get.object(params.data)
    self.form = form
    self.fields = []
    self.is_edit = params.is_edit
    self.title =
      (util.isString(form.title) && '' !== form.title ? form.title + ' - ' : '') +
      (self.is_edit ? self.$t('label.edit') : self.$t('label.new'))
    let fields = fxGrid.get.array(form.fields)
    if (self.is_edit) {
      // edit
      self.id = fxGrid.id.fromPk(self.form.id, self.data._pk_)
      for (const element of fields) {
        let field = fxGrid.clone.field(element)
        field.value = util.getFieldValue(field.name, self.data)
        if ('datetime' === field.type && 'epoch' === field.converter) {
          field.value = util.format.date(field.value, {
            format: field.pattern || null,
          })
        } else if ('pick' === field.type) {
          if (util.isDefined(field.value)) {
            field.text = util.isFunction(field.format)
              ? field.format(field.value, params.row)
              : field.value + ''
          }
        } else {
          if (util.isFunction(field.format)) {
            field.text = field.format(field.value, params.row)
          }
        }
        if (true === field.insertable || true === field.editable || 'title' === field.type) {
          self.fields.push(field)
        }
      }
    } else {
      // add
      for (const element of fields) {
        if (element.insertable || 'title' === element.type) {
          let field = fxGrid.clone.field(element)
          field.editable = true
          self.fields.push(field)
        }
      }
    }
  },

  methods: {
    /*
     * PICK CLICK
     */
    on_pick_select_click(field) {
      let pick = self.template.picks[field.pick]
      if (!util.isObject(pick)) {
        uix.error('error.required', 'label.pick')
        return
      }
      uix.dialog.show(self.dialog.pick, {
        template: self.template,
        field: field,
        pick: pick,
        replica: self.replica,
      })
    },

    /*
     * REMOVE PICK VALUE
     */
    on_pick_remove_click(field) {
      field.value = undefined
      field.text = undefined
    },

    /*
     * CLOSE PICK DIALOG
     */
    on_close_dialog_pick(value) {
      if (value?._pk_) {
        let field = self.dialog.pick.parameters.field
        let text = util.isFunction(field.format) ? field.format(value) : value + ''
        field.value = value
        field.text = text
      }
      uix.dialog.hide(self.dialog.pick)
    },

    /*
     * SAVE CLICK
     */
    on_save_click() {
      self.form._grid_id_ = self.template._grid_id_
      fxGrid.action.save({
        id: self.id,
        fields: self.fields,
        definition: self.form,
        replica: self.replica,
        relations: self.relations,
        is_edit: self.is_edit,
        saving: self.saving,
        onSuccess: function (data) {
          self.$emit('close', {
            row: data,
            is_edit: self.is_edit,
            index: self.index,
          })
        },
      })
    },
  },
}
</script>

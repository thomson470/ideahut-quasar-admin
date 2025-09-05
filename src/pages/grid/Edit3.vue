<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-card
    :style="
      'width: ' + ($q.screen.lt.md ? '100%;' : '50%;') + dialog.main.style
    "
  >
    <q-card-section
      class="q-pa-none header-main"
      :style="
        crud.config?.color?.header
          ? 'background: ' + crud.config.color.header + ' !important;'
          : ''
      "
      v-touch-pan.mouse="dialog.main.onDrag"
    >
      <q-item class="q-pr-none">
        <q-item-section>
          <q-item-label class="text-h6 text-white">{{
            definition.title +
            " - " +
            (is_edit ? $t("label.edit") : $t("label.new"))
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            class="text-caption text-white q-pl-xs q-pr-xs q-mr-xs"
            flat
            round
            glossy
            icon="close"
            :disable="saving"
            @click="$emit('close')"
          >
            <q-tooltip>{{ $t("label.close") }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section style="max-height: 65vh" class="q-pa-xs q-mt-xs scroll">
      <div
        v-for="(field, index) in fields"
        :key="index"
        class="q-mb-xs"
        style="width: 100%"
      >
        <q-input
          v-if="'words' === field.type"
          type="text"
          :label="field.label"
          :readonly="!field.editable"
          v-model="field.value"
          filled
          autogrow
          style="max-height: 200px; overflow: scroll"
        />
        <q-select
          v-else-if="'option' === field.type"
          v-model="field.value"
          :label="field.label"
          :readonly="!field.editable"
          :options="options[field.option]"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          filled
        >
          <template v-slot:selected-item="scope">
            {{ scope.opt?.label || options[field.option][scope.opt]?.label }}
          </template>
        </q-select>
        <q-select
          v-else-if="'enum' === field.type"
          v-model="field.value"
          :label="field.label"
          :readonly="!field.editable"
          :options="enums[field.enum]"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          filled
        >
          <template v-slot:selected-item="scope">
            {{ scope.opt?.label || enums[field.enum][scope.opt]?.label }}
          </template>
        </q-select>
        <q-input
          v-else-if="
            'datetime' === field.type ||
            'date' === field.type ||
            'time' === field.type
          "
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
                @before-show="
                  crud.calendar.beforeShow(field, 'tab', 'proxy_value', 'value')
                "
              >
                <div class="bg-primary">
                  <q-tabs
                    v-model="field.tab"
                    class="bg-primary text-grey-5 shadow-2 text-subtitle2"
                    no-caps
                    indicator-color="transparent"
                    active-color="white"
                  >
                    <q-tab
                      v-if="'datetime' === field.type || 'date' === field.type"
                      name="date"
                    >
                      <span>{{ $t("label.date") }}</span>
                    </q-tab>
                    <q-tab
                      v-if="'datetime' === field.type || 'time' === field.type"
                      name="time"
                    >
                      <span>{{ $t("label.time") }}</span>
                    </q-tab>
                  </q-tabs>
                  <q-separator />
                  <q-tab-panels v-model="field.tab">
                    <q-tab-panel
                      v-if="'datetime' === field.type || 'date' === field.type"
                      name="date"
                      class="q-pa-none"
                    >
                      <q-date
                        v-model="field.proxy_value"
                        :mask="field.pattern"
                        square
                      />
                    </q-tab-panel>
                    <q-tab-panel
                      v-if="'datetime' === field.type || 'time' === field.type"
                      name="time"
                      class="q-pa-none"
                    >
                      <q-time
                        v-model="field.proxy_value"
                        :mask="field.pattern"
                        format24h
                        square
                      />
                    </q-tab-panel>
                  </q-tab-panels>
                  <q-separator />
                  <div class="q-pa-xs bg-white row">
                    <div class="col-6 text-left">
                      <q-btn
                        :label="$t('label.cancel')"
                        color="negative"
                        no-caps
                        v-close-popup
                      />
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
          autogrow
        >
          <template v-if="field.editable" v-slot:append>
            <q-fab
              v-model="field.fab"
              icon="flaky"
              direction="left"
              padding="none"
              round
              dense
              flat
              glossy
              class="q-ma-none q-pa-none"
            >
              <q-fab-action
                color="secondary"
                icon="fact_check"
                round
                dense
                glossy
                @click="on_pick_select_click(field)"
              >
                <q-tooltip>{{ $t("label.select") }}</q-tooltip>
              </q-fab-action>
              <q-fab-action
                v-if="field.value"
                color="negative"
                icon="delete_forever"
                round
                dense
                glossy
                @click="on_pick_remove_click(field)"
              >
                <q-tooltip>{{ $t("label.delete") }}</q-tooltip>
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
    </q-card-section>
    <q-separator />
    <q-card-actions class="row">
      <div class="col-4 q-pr-xs text-left">
        <q-btn
          :label="$t('label.cancel')"
          color="negative"
          no-caps
          glossy
          :disable="saving"
          v-close-popup
        />
      </div>
      <div class="col-4 q-pr-xs text-center">
        <q-btn
          v-if="
            is_edit &&
            false !== definition.copy &&
            crud.permission.add(template)
          "
          :label="$t('label.copy')"
          color="purple"
          no-caps
          glossy
          :disable="saving"
          @click="on_clone_click"
        />
      </div>
      <div class="col-4 q-pl-xs text-right">
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
    transition-hide="slide-down"
    backdrop-filter="blur(1px)"
  >
    <Pick :parameters="dialog.pick.parameters" @close="on_close_dialog_pick" />
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
import { crud } from "src/pages/grid/Crud";
let self;

export default {
  props: ["parameters"],
  emits: ["close"],
  components: {
    Pick: defineAsyncComponent(() => import("src/pages/grid/Pick.vue")),
  },
  setup() {
    return {
      crud,

      id: ref(null),
      is_edit: ref(false),
      saving: ref(false),
      index: ref(null),
      fields: ref(null),
      template: ref({ options: {} }),
      definition: ref({}),
      parentRow: ref(null),
      row: ref(null),
      replica: ref(null),
      relations: ref([]),
      enums: ref({}),
      options: ref({}),
      loading: ref({}),
      dialog: ref({
        main: crud.dialog.init(() => self.dialog.main),
        pick: crud.dialog.init(),
      }),
    };
  },

  created() {
    self = this;
    self.fields = [];
    self.is_edit = false;
    let params = crud.get.object(self.parameters);
    self.replica = crud.get.number(params.replica, null);
    self.template = crud.get.object(params.template);
    self.definition = crud.get.object(params.definition);
    self.parentRow = crud.get.object(params.parentRow);
    self.relations = crud.get.array(params.relations);
    self.enums = {};
    if (crud.isObject(self.template.enums)) {
      Object.keys(self.template.enums).forEach((key) => {
        self.enums[key] = [null].concat(self.template.enums[key]);
      });
    }
    self.options = {};
    if (crud.isObject(self.template.options)) {
      Object.keys(self.template.options).forEach((key) => {
        self.options[key] = [null].concat(self.template.options[key]);
      });
    }
    self.row = crud.get.object(params.row);
    let fields = crud.get.array(self.definition?.fields);
    if (fields.length) {
      if (crud.isObject(params.row)) {
        // edit
        self.index = params.index;
        self.id = crud.id.fromPk(self.definition.id, params.row._pk_);
        self.is_edit = crud.isDefined(self.id);
        for (const element of fields) {
          let field = crud.clone.field(element);
          field.value = crud.getFieldValue(field.name, params.row);
          if (
            !crud.isDefined(field.value) &&
            crud.isFunction(field.rowToValue)
          ) {
            field.value = field.rowToValue(params.row);
          }
          if ("datetime" === field.type && "epoch" === field.converter) {
            field.value = crud.format.date(field.value, {
              format: field.pattern || null,
            });
          } else if ("pick" === field.type) {
            if (crud.isDefined(field.value) && field.value !== null) {
              field.text = crud.isFunction(field.format)
                ? field.format(field.value, params.row)
                : field.value + "";
            } else {
              field.text = crud.isFunction(field.format)
                ? field.format(null, params.row)
                : "";
            }
          }
          if (!self.is_edit) {
            field.editable = field.insertable;
          }
          self.fields.push(field);
        }
      } else {
        // add
        for (const element of fields) {
          if (element.insertable) {
            let field = crud.clone.field(element);
            field.editable = field.insertable;
            self.fields.push(field);
          }
        }
      }
    }
  },

  methods: {
    /*
     * PICK CLICK
     */
    on_pick_select_click(field) {
      let pick = self.template.picks[field.pick];
      if (!crud.isObject(pick)) {
        crud.error("error.required", "label.pick");
        return;
      }
      let relations = crud.isArray(pick.relations) ? pick.relations : [];
      for (const relation of relations) {
        relation.value = crud.getFieldValue(relation.source, self.parentRow);
        if (!crud.isDefined(relation.value)) {
          let f = self.fields.find((o) => o.name === relation.source);
          crud.runIf(crud.isObject(f), () => {
            relation.value = crud.isFunction(f.toValue)
              ? f.toValue(f.value)
              : f.value;
            relation.value = crud.isObject(relation.value)
              ? relation.value[relation.source]
              : relation.value;
          });
        }
      }
      crud.dialog.show(self.dialog.pick, {
        template: self.template,
        field: field,
        pick: pick,
        relations: relations,
        replica: self.replica,
      });
    },

    /*
     * REMOVE PICK VALUE
     */
    on_pick_remove_click(field) {
      field.value = undefined;
      field.text = undefined;
    },

    /*
     * CLOSE PICK DIALOG
     */
    on_close_dialog_pick(value) {
      if (value?._pk_) {
        let field = self.dialog.pick.parameters.field;
        let text = crud.isFunction(field.format)
          ? field.format(value)
          : value + "";
        field.value = value;
        field.text = text;
      }
      crud.dialog.hide(self.dialog.pick);
    },

    /*
     * CLONE CLICK
     */
    on_clone_click() {
      let row = self.row ? crud.copy(self.row) : null;
      if (row?._pk_) {
        delete row._pk_;
        let id = self.template.id;
        if ("STANDARD" === id.type) {
          delete row[id.fields[0]];
        }
      }
      self.$emit("close", {
        row: row,
        is_edit: self.is_edit,
      });
    },

    /*
     * SAVE CLICK
     */
    on_save_click() {
      crud.action.save({
        id: self.id,
        fields: self.fields,
        definition: self.definition,
        replica: self.replica,
        is_edit: self.is_edit,
        relations: self.relations,
        row: self.row,
        onSuccess: function (data) {
          self.$emit("close", {
            row: data,
            is_edit: self.is_edit,
            index: self.index,
          });
        },
        onProgress: (saving) => (self.saving = saving),
      });
    },
  },
};
</script>

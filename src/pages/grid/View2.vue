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
    <q-card-section style="max-height: 75vh" class="q-pa-xs q-mt-none scroll">
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
      <div v-if="onlyView">
        <div v-if="definition.childrenFirst">
          <div v-if="tables.length" class="q-mb-xs" style="width: 100%">
            <q-btn
              v-for="(table, index) in tables"
              :key="index"
              :label="table.title"
              class="full-width q-mt-xs q-mb-xs text-weight-bold"
              no-caps
              glossy
              @click="on_table_click(table)"
            />
          </div>
          <div v-if="forms.length" class="q-mb-xs" style="width: 100%">
            <q-btn
              v-for="(form, index) in forms"
              :key="index"
              :label="form.title"
              class="full-width q-mt-xs q-mb-xs text-weight-bold"
              no-caps
              glossy
              :loading="loading['form_' + index]"
              @click="on_form_click(form, index)"
            />
          </div>
        </div>
        <div v-else>
          <div v-if="forms.length" class="q-mb-xs" style="width: 100%">
            <q-btn
              v-for="(form, index) in forms"
              :key="index"
              :label="form.title"
              class="full-width q-mt-xs q-mb-xs text-weight-bold"
              no-caps
              glossy
              :loading="loading['form_' + index]"
              @click="on_form_click(form, index)"
            />
          </div>
          <div v-if="tables.length" class="q-mb-xs" style="width: 100%">
            <q-btn
              v-for="(table, index) in tables"
              :key="index"
              :label="table.title"
              class="full-width q-mt-xs q-mb-xs text-weight-bold"
              no-caps
              glossy
              @click="on_table_click(table)"
            />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>

  <q-dialog
    v-model="dialog.form.show"
    persistent
    transition-show="slide-down"
    transition-hide="none"
    backdrop-filter="blur(1px)"
  >
    <FormV :parameters="dialog.form.parameters" />
  </q-dialog>

  <q-dialog
    v-model="dialog.table.show"
    transition-show="slide-down"
    transition-hide="none"
    backdrop-filter="blur(1px)"
    full-height
  >
    <Table3
      :parameters="dialog.table.parameters"
      @close="on_close_dialog_table"
    />
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
import { crud } from "src/pages/grid/Crud";
let self;

export default {
  props: ["parameters"],
  components: {
    FormV: defineAsyncComponent(() => import("src/pages/grid/FormV.vue")),
    Table3: defineAsyncComponent(() => import("src/pages/grid/Table3.vue")),
  },
  setup() {
    return {
      crud,
      title: ref(null),
      fields: ref([]),
      template: ref(null),
      forms: ref([]),
      tables: ref([]),
      loading: ref({}),
      replica: ref(null),
      onlyView: ref(false),
      dialog: ref({
        main: crud.dialog.init(() => self.dialog.main),
        form: crud.dialog.init(),
        table: crud.dialog.init(),
      }),
    };
  },

  created() {
    self = this;
    let params = crud.get.object(self.parameters);
    let row = crud.get.object(params.row);
    let definition = crud.get.object(params.definition);
    self.title = crud.isString(params.title) ? params.title : definition.title;
    self.replica = crud.get.number(params.replica, null);
    self.onlyView = true == params.onlyView;
    self.fields = [];
    let cols = crud.get.array(definition.table.columns);
    let value;
    let isIdShown = false;
    for (const element of cols) {
      if (!isIdShown && definition.id.fields.includes(element.field)) {
        isIdShown = true;
      }
      value = crud.getFieldValue(element.field, row);
      if (crud.isFunction(element.format)) {
        value = element.format(value, row);
      }
      self.fields.push({
        label: element.label,
        value: value,
      });
    }
    if (!isIdShown) {
      let value = crud.id.toPk(definition.id, row);
      if (crud.isDefined(value) && value !== null) {
        self.fields.splice(0, 0, {
          label: "ID",
          value: value,
        });
      }
    }
    self.forms = crud.get.array(definition.forms);
    self.tables = crud.get.array(definition.children);
    self.definition = definition;
  },

  methods: {
    /*
     * FORM CLICK
     */
    on_form_click(form, index) {
      let params = crud.get.object(self.parameters);
      let definition = crud.get.object(params.definition);
      let row = crud.get.object(params.row);
      let relations = crud.get.array(form.relations);
      if (!relations.length) {
        crud.error("error.required", "label.relation");
        return;
      }
      let filters = [];
      for (const relation of relations) {
        filters.push({
          field: relation.target,
          condition: "EQUAL",
          value: crud.getFieldValue(relation.source, row),
        });
      }
      let body = crud.copy(form.crud);
      body.filters = crud.isArray(body.filters) ? body.filters : [];
      body.filters = body.filters.concat(filters);
      if (crud.isNumber(self.replica)) {
        body.replica = self.replica;
      }
      self.loading["form_" + index] = true;
      crud.api.call({
        path: "/crud/single",
        method: "post",
        data: body,
        onFinish() {
          self.loading["form_" + index] = false;
        },
        onSuccess(data) {
          data = crud.get.object(data);
          crud.inject.pkAndGridId(form.id, data, definition._grid_id_);
          crud.dialog.show(self.dialog.form, {
            template: definition,
            form: form,
            data: data,
            replica: self.replica,
          });
        },
      });
    },

    /*
     * TABLE CLICK
     */
    on_table_click(table) {
      let params = crud.get.object(self.parameters);
      let template = crud.get.object(params.template);
      let row = crud.get.object(params.row);
      let relations = crud.copy(crud.get.array(table.relations));
      if (!relations.length) {
        crud.error("error.required", "label.relation");
        return;
      }
      for (const relation of relations) {
        relation.value = crud.getFieldValue(relation.source, row);
      }
      table._grid_id_ = template._grid_id_;
      crud.dialog.show(self.dialog.table, {
        template: template,
        definition: table,
        parentRow: row,
        relations: relations,
        onlyView: crud.isDefined(table.onlyView)
          ? false !== table.onlyView
          : params.onlyView,
        replica: self.replica,
      });
    },

    /*
     * CLOSE TABLE DIALOG
     */
    on_close_dialog_table() {
      crud.dialog.hide(self.dialog.table);
    },
  },
};
</script>

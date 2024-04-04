<template>
    <q-card :style="'width: ' + ($q.screen.lt.md ? '100%;' : '50%;')">
        <q-card-section class="header-main">
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
        <q-card-section
            style="max-height: 75vh;"
            class="q-pa-xs q-mt-none scroll"
        >
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
                style="max-height: 120px; overflow: scroll;"
            />
            <div
                v-if="forms.length"
                class="q-mb-xs"
                style="width: 100%"
            >
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
            <div
                v-if="tables.length"
                class="q-mb-xs"
                style="width: 100%"
            >
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
        </q-card-section>
    </q-card>
    
    <q-dialog
        v-model="dialog.form.show"
        persistent
        transition-show="slide-down"
        transition-hide="none"
    >
        <FormV
            :parameters="dialog.form.parameters"
        />
    </q-dialog>

    <q-dialog
        v-model="dialog.table.show"
        transition-show="slide-down"
        transition-hide="none"
        full-height
        full-width
    >
        <Table2
            :parameters="dialog.table.parameters"
            @close="on_close_dialog_table"
        />
    </q-dialog>
</template>
  
<script>
import { ref, defineAsyncComponent } from "vue";
import { util } from "src/scripts/util";
import { api } from "src/scripts/api";
import { uix } from "src/scripts/uix";
import { grid as fxGrid } from "src/scripts/grid";

export default {
    props: ["parameters"],
    components: {
        FormV: defineAsyncComponent(() => import('src/pages/grid/FormV')),
        Table2: defineAsyncComponent(() => import('src/pages/grid/Table2')),
    },
    setup() {
        return {
            util,
            title: ref(null),
            fields: ref([]),
            forms: ref([]),
            tables: ref([]),
            loading: ref({}),
            replica: ref(null),
            dialog: ref({
                form: {
                    show: false,
                    parameters: null,
                },
                table: {
                    show: false,
                    parameters: null,
                }
            }),
        };
    },
  
    created() {
        let self = this;
        let params = fxGrid.get.object(self.parameters);
        let row = fxGrid.get.object(params.row);
        let template = fxGrid.get.object(params.template);
        self.title = util.isString(params.title) ? params.title : template.title;
        self.replica = fxGrid.get.number(params.replica, null);
        self.fields = [];
        let cols = fxGrid.get.array(template.table.columns);
        let value;
        let isIdShown = false;
        for (const element of cols) {
            if (!isIdShown && template.id.fields.includes(element.field)) {
                isIdShown = true;
            }
            value = util.getFieldValue(element.field, row);
            if (util.isFunction(element.format)) {
                value = element.format(value, row);
            }
            self.fields.push({
                label: element.label,
                value: value,
            });
        }
        if (!isIdShown) {
            let value = fxGrid.id.toPk(template.id, row);
            if (util.isDefined(value) && value !== null) {
                self.fields.splice(0, 0, {
                    label: "ID",
                    value: value,
                });
            }
        }
        self.forms = fxGrid.get.array(template.forms);
        self.tables = fxGrid.get.array(template.children);
    },
  
    methods: {
        /*
         * FORM CLICK
         */
        on_form_click(form, index) {
            let self = this;
            let params = fxGrid.get.object(self.parameters);
            let template = fxGrid.get.object(params.template);
            let row = fxGrid.get.object(params.row);
            let relations = fxGrid.get.array(form.relations);
            if (!relations.length) {
                uix.error("error.required", "label.relation");
                return;
            }
            let filters = [];
            for (const relation of relations) {
                filters.push({
                    field: relation.target,
                    condition: "EQUAL",
                    value: util.getFieldValue(relation.source, row),
                });
            }
            let body = fxGrid.copy(form.crud);
            body.filters = util.isArray(body.filters) ? body.filters : [];
            body.filters = body.filters.concat(filters);
            if (util.isNumber(self.replica)) {
                body.replica = self.replica;
            }
            self.loading["form_" + index] = true;
            api.call({
                path: "/crud/single",
                method: "post",
                data: body,
                onFinish() {
                    self.loading["form_" + index] = false;
                },
                onSuccess(data) {
                    data = fxGrid.get.object(data);
                    fxGrid.inject.pkAndGridId(form.id, data, template._grid_id_);
                    self.dialog.form = {
                        show: true,
                        parameters: {
                        form: form,
                        data: data,
                        replica: self.replica
                        },
                    };
                },
            });
        },

        /*
         * TABLE CLICK
         */
        on_table_click(table) {
            let self = this;
            let params = fxGrid.get.object(self.parameters);
            let template = fxGrid.get.object(params.template);
            let row = fxGrid.get.object(params.row);
            let relations = fxGrid.copy(fxGrid.get.array(table.relations));
            if (!relations.length) {
                uix.error("error.required", "label.relation");
                return;
            }
            for (const relation of relations) {
                relation.value = util.getFieldValue(relation.source, row);
            }
            table._grid_id_ = template._grid_id_;
            self.dialog.table = {
                show: true,
                parameters: {
                    template: template,
                    definition: table,
                    parentRow: row,
                    relations: relations,
                    onlyView: true,
                    replica: self.replica,
                },
            };
        },

        /*
         * CLOSE TABLE DIALOG
         */
        on_close_dialog_table(result) {
            let self = this;
            self.dialog.table = { show: false, parameters: null };
        },
    },
};
</script>
  
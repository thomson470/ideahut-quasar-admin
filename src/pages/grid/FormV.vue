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
        <q-card-section
            style="max-height: 80vh;"
            class="q-pa-xs q-mt-xs scroll"
        >
            <q-input
                v-for="(field, index) in fields"
                :key="index"
                type="text"
                :label="field.label"
                v-model="field.value"
                readonly
                filled
                autogrow
                class="q-mb-xs"
                style="max-height: 200px; overflow: scroll;"
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
        };
    },
  
    created() {
        let self = this;
        let params = fxGrid.get.object(self.parameters);
        let form = fxGrid.get.object(params.form);
        let data = fxGrid.get.object(params.data);
        self.title = form.title;
        self.fields = [];
        let isIdShown = false;
        for (const field of form.fields) {
            let value = util.getFieldValue(field.name, data);
            if (!isIdShown && form.id.fields.includes(field.name)) {
                isIdShown = true;
            }
            if (util.isFunction(field.format)) {
                value = field.format(value, data);
            }
            self.fields.push({
                label: field.label,
                value: value,
            });
        };
        if (!isIdShown) {
            let value = fxGrid.id.toPk(form.id, data);
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
  
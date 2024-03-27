<template>
    <q-card :style="'width: ' + ($q.screen.lt.md ? '100%;' : '50%;')">
        <q-card-section class="q-pa-none header-main">
            <q-item class="q-pr-none">
                <q-item-section>
                    <q-item-label class="text-h6 text-white">{{  }}</q-item-label>
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
        </q-card-section>
    </q-card>
</template>
  
<script>
import { ref } from "vue";
import { util } from "src/scripts/util";

export default {
    props: ["parameters"],
    setup() {
        return {
            util,
            scope: ref(null),
            fields: ref([]),
        };
    },

    created() {
        let self = this;
        let params = util.isObject(self.parameters) ? self.parameters : {};
        self.scope = util.isObject(params.scope) ? params.scope : {};
        let columns = util.isArray(params.columns) ? params.columns : self.scope.cols;
        let row = util.isObject(self.scope.row) ? self.scope.row : {};
        self.fields = [];
        for (const column of columns) {
            let value = util.getFieldValue(column.field, row);
            if (util.isDefined(value) && util.isFunction(column.format)) {
                value = column.format(value, row);
            }
            if (util.isObject(value)) {
                value = JSON.stringify(value);
            }
            self.fields.push({
                label: column.label,
                value: value
            });
        }
    },

};
</script>
  
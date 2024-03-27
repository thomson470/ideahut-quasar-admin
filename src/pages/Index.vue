<template>
    <div class="row q-mt-none q-pa-sm">
        <div class="col-md-6 col-xs-12 q-pa-xs q-mb-sm">
            <q-table
                v-if="application?.length"
                class="table-sticky-header no-column"
                style="max-height: 36vh;"
                :title="$t('label.application')"
                :rows="application"
                :separator="'cell'"
                :rows-per-page-options="[0]"
                hide-bottom
                hide-header
                bordered
                dense
            />
        </div>
        <div class="col-md-6 col-xs-12 q-pa-xs q-mb-sm">
            <q-table
                v-if="version?.length"
                class="table-sticky-header no-column"
                style="max-height: 36vh;"
                :title="$t('label.version')"
                :rows="version"
                :separator="'cell'"
                :rows-per-page-options="[0]"
                hide-bottom
                hide-header
                bordered
                dense
            />
        </div>
        <div class="col-md-12 col-xs-12 q-pa-xs q-mb-sm">
            <q-table
                :title="$t('label.bean')"
                class="table-sticky-header"
                :rows="bean.rows"
                :columns="bean.columns"
                row-key="beanName"
                :loading="loading"
                :pagination="bean.pagination"
                :filter="bean.filter"
                binary-state-sort
                separator="cell"
                selection="single"
                bordered
                dense
            >
                <template v-slot:top-right>
                    <q-input borderless dense debounce="300" v-model="bean.filter" :placeholder="$t('label.search')">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                    </q-input>
                </template>

                <template v-slot:body-selection="scope">
                    <q-btn
                        glossy
                        round
                        dense
                        size="sm"
                        class="q-ma-none q-ml-xs q-mr-sm"
                        color="deep-purple"
                        icon="visibility"
                    >
                        <q-tooltip>{{ $t("label.view") }}</q-tooltip>
                        <q-popup-proxy
                            transition-show="scale"
                            transition-hide="scale"
                            @before-show="bean.popup = scope.row"
                            :style="'width: 400px;'"
                        >
                            <q-card>
                                
                                <q-card-section
                                    style="max-height: 600px;"
                                    class="q-pa-xs q-mt-none scroll"
                                >
                                    <q-input
                                        type="text"
                                        :label="$t('label.bean_name')"
                                        class="q-mb-xs"
                                        v-model="bean.popup.beanName"
                                        readonly
                                        filled
                                        dense
                                        autogrow
                                    />
                                    <q-input
                                        type="text"
                                        :label="$t('label.proxy')"
                                        class="q-mb-xs"
                                        v-model="bean.popup.isProxy"
                                        readonly
                                        filled
                                        dense
                                        autogrow
                                    />
                                    <q-input
                                        type="text"
                                        :label="$t('label.reloadable')"
                                        class="q-mb-xs"
                                        v-model="bean.popup.isReloadable"
                                        readonly
                                        filled
                                        dense
                                        autogrow
                                    />
                                    <q-input
                                        type="text"
                                        :label="$t('label.reconfigure')"
                                        class="q-mb-xs"
                                        v-model="bean.popup.isReconfigure"
                                        readonly
                                        filled
                                        dense
                                        autogrow
                                    />
                                    <q-input
                                        type="text"
                                        :label="$t('label.class_name')"
                                        class="q-mb-xs"
                                        v-model="bean.popup.className"
                                        readonly
                                        filled
                                        dense
                                        autogrow
                                    />
                                </q-card-section>
                            </q-card>
                        </q-popup-proxy>
                    </q-btn>
                </template>
            </q-table>
        </div>
    </div>
</template>
  
<script>
import { ref } from "vue";
import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";

export default {
    
    setup() {
        return {
            util,
            loading: ref(false),
            application: ref([]),
            version: ref([]),
            bean: ref({
                filter: null,
                columns: [],
                rows: [],
                popup: null,
                pagination: {
                    page: 1,
                    rowsPerPage: 10,
                    sortBy: 'beanName',
                    descending: false,
                },
            }),
        };
    },

    created() {
        let self = this;
        self.bean.columns = [
            {
                name: "beanName",
                label: self.$t('label.bean_name'),
                field: "beanName",
                align: "left",
                sortable: true,
            },
            {
                name: "isProxy",
                label: self.$t('label.proxy'),
                field: "isProxy",
                align: "left",
                sortable: true,
            },
            {
                name: "isReloadable",
                label: self.$t('label.reloadable'),
                field: "isReloadable",
                align: "left",
                sortable: true,
            },
            {
                name: "isReconfigure",
                label: self.$t('label.reconfigure'),
                field: "isReconfigure",
                align: "left",
                sortable: true,
            },
            {
                name: "className",
                label: self.$t('label.class_name'),
                field: "className",
                align: "left",
                sortable: true,
            },
        ];
        this.get_info();
    },
    methods: {
       
        get_info() {
            let self = this;
            self.loading = true;
            api.call({
                path: "/info",
                onFinish() {
                    self.loading = false;
                },
                onSuccess(data) {
                    if (util.isObject(data.application)) {
                        let app = data.application;
                        self.application = [
                            {
                                label: self.$t("label.id"),
                                value: app.id,
                            },
                            {
                                label: self.$t("label.application_name"),
                                value: app.applicationName,
                            },
                            {
                                label: self.$t("label.display_name"),
                                value: app.displayName,
                            },
                            {
                                label: self.$t("label.server_classname"),
                                value: util.isString(app.serverClassname) ? app.serverClassname : "",
                            },
                            {
                                label: self.$t("label.server_port"),
                                value: util.isNumber(app.serverPort) ? app.serverPort : "",
                            },
                            {
                                label: self.$t("label.bean_count"),
                                value: app.beanCount,
                            },
                            {
                                label: self.$t("label.startup_date"),
                                value: util.isNumber(app.startupDate) ? util.format.date(app.startupDate, {format: "YYYY-MM-DD HH:mm:ss"}) : "",
                            },
                        ];
                    }
                    if (util.isObject(data.version)) {
                        let version = data.version;
                        self.version = [
                            {
                                label: "Java",
                                value: version.java,
                            },
                            {
                                label: "Spring Framework",
                                value: version.springFramework,
                            },
                            {
                                label: "Spring Boot",
                                value: version.springBoot,
                            },
                            {
                                label: "Hibernate",
                                value: version.hibernate,
                            },
                            {
                                label: "Ideahut",
                                value: version.ideahut,
                            },
                        ];
                    }
                    if (util.isArray(data.beans)) {
                        self.bean.rows = data.beans;
                        self.bean.pagination.rowsNumber = self.bean.rows.length;
                    }
                },
            });
        },
    
    },

};
</script>
  
<template>
    <q-card>
        <q-card-section class="q-pa-none header-main">
            <q-item class="q-pr-none">
                <q-item-section>
                    <q-item-label class="text-h6 text-white">{{ pick.title }}</q-item-label>
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
        <q-card-section style="max-height: 80vh" class="q-pa-xs q-pt-sm scroll">
            <q-table
                class="table-sticky-header q-ma-none"
                :rows="table.rows"
                :columns="table.columns"
                :visible-columns="table.visibles"
                :row-key="'_pk_'"
                :loading="table.loading"
                :selection="'single'"
                v-model:pagination="table.pagination"
                :dense="$q.screen.lt.md"
                :no-data-label="$t('error.data_not_available')"
                rows-per-page-label=" "
                :selected-rows-label="(selected) => {}"
                :rows-per-page-options="util.isObject(pick.table) && pick.table.page?.options ? pick.table.page.options : [10, 20, 30]"
                @request="do_request"
                binary-state-sort
                :separator="util.isObject(pick.table) ? pick.table.separator : 'cell'"
                bordered
                style="max-height: 70vh;"
            >
                <template v-slot:top>
                    <q-space />
                    <q-btn
                        v-if="search.filters && search.filters.length"
                        glossy
                        round
                        dense
                        class="q-ma-none q-ml-md"
                        color="deep-orange"
                        icon="search"
                        @click="on_search_click"
                    >
                        <q-badge v-if="!search.empty" class="led-green" floating></q-badge>
                    </q-btn>
                    <q-btn
                        glossy
                        round
                        dense
                        class="q-ma-none q-ml-md"
                        color="indigo"
                        icon="refresh"
                        :loading="table.loading"
                        @click="on_refresh_click"
                    />
                </template>

                <template v-slot:no-data="{ message }">
                    <div class="full-width row flex-center text-accent q-gutter-sm">
                        <q-icon size="2em" name="block" />
                        <span class="text-subtitle2">{{ message }}</span>
                    </div>
                </template>

                <template v-slot:loading>
                    <q-inner-loading showing color="primary" />
                </template>

                <template v-slot:body-selection="scope">
                    <q-radio v-model="table.selected" :val="scope.row" color="primary" />
                </template>
                <template v-slot:pagination="scope">
                    <q-btn
                        v-if="scope.pagesNumber > 2"
                        glossy
                        size="sm"
                        icon="first_page"
                        color="grey-8"
                        round
                        dense
                        flat
                        :disable="scope.isFirstPage"
                        @click="scope.firstPage"
                    />
                    <q-btn
                        glossy
                        size="sm"
                        icon="chevron_left"
                        color="grey-8"
                        round
                        dense
                        flat
                        :disable="scope.isFirstPage"
                        @click="scope.prevPage"
                    />
                    <q-input
                        dense
                        borderless
                        type="number"
                        input-class="text-center q-ml-xs q-mr-xs"
                        input-style="max-width: 60px;"
                        v-model="table.pagination.page"
                        @update:model-value="on_page_changed"
                    >
                        <template v-if="util.isObject(pick.table) && util.isObject(pick.table.page) ? (true === pick.table.page.count) : false" v-slot:append>
                            <span class="text-caption"> / {{ scope.pagesNumber }}</span>
                        </template>
                    </q-input>
                    <q-btn
                        glossy
                        size="sm"
                        icon="chevron_right"
                        color="grey-8"
                        round
                        dense
                        flat
                        :disable="scope.isLastPage"
                        @click="scope.nextPage"
                    />
                    <q-btn
                        v-if="scope.pagesNumber > 2"
                        glossy
                        size="sm"
                        icon="last_page"
                        color="grey-8"
                        round
                        dense
                        flat
                        :disable="scope.isLastPage"
                        @click="scope.lastPage"
                    />
                </template>
            </q-table>
        </q-card-section>
        <q-separator />
        <q-card-actions class="row">
            <div class="col-6 q-pr-xs text-left">
                <q-btn
                    :label="$t('label.cancel')"
                    color="negative"
                    no-caps
                    glossy
                    v-close-popup
                />
            </div>
            <div class="col-6 q-pl-xs text-right">
                <q-btn
                    :label="$t('label.select')"
                    color="indigo"
                    no-caps
                    glossy
                    :disable="!table.selected?._pk_"
                    @click="on_select_click"
                />
            </div>
        </q-card-actions>
    </q-card>

    <q-dialog
        v-model="dialog.search.show"
        persistent
        transition-show="slide-down"
        transition-hide="none"
    >
        <Search
            :parameters="dialog.search.parameters"
            @close="on_close_dialog_search"
        />
    </q-dialog>
</template>
  
<script>
import { ref, defineAsyncComponent } from "vue";
import { util } from "src/scripts/util";
import { grid as fxGrid } from "src/scripts/grid";

export default {
    props: ["parameters"],
    emits: ["close"],
    components: {
        Search:  defineAsyncComponent(() => import('src/pages/grid/Search')),
    },
    setup() {
        return {
            util,
            template: ref({}),
            field: ref({}),
            pick: ref({}),
            relations: ref([]),
            replica: ref(null),
            table: ref({
                rows: [],
                columns: [],
                visibles: [],
                selected: null,
                pagination: {},
                loading: false,
            }),
            search: ref({
                filters: [],
                empty: true,
            }),
            dialog: ref({
                search: {
                    show: false,
                    parameters: null,
                }
            }),
        };
    },
  
    created() {
        let self = this;
        let params = fxGrid.get.object(self.parameters);
        self.template = fxGrid.get.object(params.template);
        self.replica = fxGrid.get.number(params.replica, null);
        self.field = fxGrid.get.object(params.field);
        self.relations = fxGrid.get.array(params.relations);
        self.pick = fxGrid.get.object(params.pick);
        self.pick._grid_id_ = self.template._grid_id_;
        self.search = {
            empty: true,
            filters: fxGrid.copy(fxGrid.get.array(self.pick.table.filters)),
        };
        self.table = {
            rows: [],
            columns: self.pick.table.columns,
            visibles: self.pick.table.visibles,
            selected: null,
            pagination: {
                page: 1,
                rowsPerPage: self.pick.table.page.default,
                sortBy: self.pick.table.order.field,
                descending: true === self.pick.table.order.descending,
            },
            loading: false,
        };
        self.do_request({
            pagination: self.table.pagination,
        });
    },
  
    methods: {
        /*
         * REQUEST
         */
        do_request(props) {
            let self = this;
            let replica = null;
            if (true === self.template.allUseSameReplica) {
                replica = self.replica;
            }
            fxGrid.action.page({
                props: props,
                table: self.table,
                search: self.search,
                definition: self.pick,
                relations: self.relations,
                replica: replica,
                allUseSameReplica: self.template.allUseSameReplica,
            });
        },

        /*
         * REFRESH CLICK
         */
        on_refresh_click() {
            let self = this;
            self.do_request({
                pagination: self.table.pagination,
            });
        },

        /*
         * SELECT CLICK
         */
        on_select_click() {
            let self = this;
            self.$emit("close", self.table.selected);
        },

        /*
         * SEARCH CLICK
         */
        on_search_click() {
            let self = this;
            let dialog = self.dialog.search;
            dialog.parameters = {
                filters: fxGrid.copy(self.search.filters),
                template: self.template,
            };
            dialog.show = true;
        },

        /*
         * CLOSE SEARCH DIALOG
         */
        on_close_dialog_search(filters) {
            let self = this;
            if (util.isArray(filters)) {
                let search = self.search, v1, v2;
                search.filters = filters;
                search.empty = true;
                for (const filter of search.filters) {
                    v1 = util.isDefined(filter.value) ? filter.value : "";
                    v2 = util.isDefined(filter.value2) ? filter.value2 : "";
                    if ("" !== v1 || "" !== v2) {
                        search.empty = false;
                        break;
                    }
                }
                self.dialog.search = { show: false, parameters: null };
                self.table.pagination.page = 1;
                self.do_request({
                    pagination: self.table.pagination,
                });
            }
        },

        /*
         * PAGE CHANGED
         */
        on_page_changed() {
            let self = this;
            let page = +self.table.pagination.page;
            if (!isNaN(page) && page > 0) {
                self.do_request({
                    pagination: self.table.pagination,
                });
            }
        },
    },
};
</script>
  
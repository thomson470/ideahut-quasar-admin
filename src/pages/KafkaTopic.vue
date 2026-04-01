<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-table
    class="table-sticky-header q-ma-sm"
    :rows="table.rows"
    :columns="table.columns"
    :loading="table.loading"
    :selection="'single'"
    :dense="$q.screen.lt.md"
    :no-data-label="$t('error.data_not_available')"
    rows-per-page-label=" "
    :rows-per-page-options="[10, 20, 30, 40, 50]"
    binary-state-sort
    :separator="'cell'"
    v-model:pagination="table.pagination"
    @request="do_request"
    bordered
  >
    <template v-slot:top-right>
      <q-btn
        glossy
        round
        dense
        class="q-ma-none q-ml-md"
        color="deep-orange"
        icon="search"
        @click="on_search_dialog_click"
      >
        <q-badge
          v-if="Object.keys(table.filters).length"
          class="led-green"
          floating
        ></q-badge>
        <q-tooltip>{{ $t("label.search") }}</q-tooltip>
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
      >
        <q-tooltip>{{ $t("label.refresh") }}</q-tooltip>
      </q-btn>
    </template>

    <template v-slot:no-data="{ message }">
      <div class="full-width row flex-center text-accent q-gutter-sm">
        <q-icon size="2em" name="block" />
        <span class="text-subtitle2">{{ message }}</span>
      </div>
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
        @click="on_view_click(scope)"
      >
        <q-tooltip>{{ $t("label.view") }}</q-tooltip>
      </q-btn>
      <q-btn
        glossy
        round
        dense
        size="sm"
        class="q-ma-none q-mr-xs"
        color="negative"
        icon="delete"
        :loading="table.deleting[scope.row.id]"
        @click="on_delete_click(scope)"
      />
    </template>
  </q-table>

  <!-- VIEW DIALOG -->
  <q-dialog
    v-model="dialog.view.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
  >
    <KeyValue
      :parameters="dialog.view.parameters"
      :style="dialog.view.style"
      v-touch-pan.mouse="dialog.view.onDrag"
    />
  </q-dialog>

  <!-- SEARCH DIALOG -->
  <q-dialog
    v-model="dialog.search.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
    persistent
  >
    <q-card
      :style="
        'width: ' + ($q.screen.lt.md ? '100%;' : '50%;') + dialog.search.style
      "
    >
      <q-card-section
        class="q-pa-none header-main"
        :style="
          APP?.color?.header
            ? 'background: ' + APP.color.header + ' !important;'
            : ''
        "
        v-touch-pan.mouse="dialog.search.onDrag"
      >
        <q-item class="q-pr-none">
          <q-item-section>
            <q-item-label class="text-h6 text-white">{{
              $t("label.search")
            }}</q-item-label>
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
      <q-card-section style="max-height: 70vh" class="q-pa-xs q-mt-xs scroll">
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.topicId"
            type="text"
            :label="$t('label.id')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.topicName"
            type="text"
            :label="$t('label.name')"
            filled
            class="q-mb-xs"
          />
        </q-form>
      </q-card-section>
      <q-separator />
      <q-card-actions class="row">
        <div class="col-6 q-pr-xs text-left">
          <q-btn
            :label="$t('label.reset')"
            color="orange"
            no-caps
            glossy
            @click="on_search_reset_click"
          />
        </div>
        <div class="col-6 q-pl-xs text-right">
          <q-btn
            :label="$t('label.filter')"
            color="purple"
            no-caps
            glossy
            @click="on_search_filter_click"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
import { APP } from "src/scripts/static";
import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";
let self;

export default {
  components: {
    KeyValue: defineAsyncComponent(() => import("src/pages/KeyValue.vue")),
  },
  setup() {
    return {
      APP,
      util,
      handler: ref(null),
      table: ref({
        rows: [],
        filters: {},
        columns: [],
        loading: false,
        deleting: {},
        pagination: {
          page: 1,
          rowsPerPage: 30,
          sortBy: "name",
          descending: false,
          count: true,
        },
      }),
      dialog: ref({
        view: uix.dialog.init(() => self.dialog.view),
        search: uix.dialog.init(() => self.dialog.search),
      }),
    };
  },

  created() {
    self = this;
    self.handler = self.$route.query.handler;
    self.table.columns = [
      {
        name: "id",
        label: self.$t("label.id"),
        field: "id",
        align: "left",
        sortable: true,
      },
      {
        name: "name",
        label: self.$t("label.name"),
        field: "name",
        align: "left",
        sortable: true,
      },
      {
        name: "internal",
        label: self.$t("label.internal"),
        field: "internal",
        align: "center",
        sortable: true,
      },
    ];
    self.on_refresh_click();
  },
  methods: {
    /*
     * REQUEST
     */
    do_request(props) {
      let { page, rowsPerPage, sortBy, descending } =
        self.get_pagination(props);
      let params = {
        name: self.handler,
        index: page,
        size: rowsPerPage,
        order: (descending ? "-" : "") + sortBy,
      };
      Object.keys(self.table.filters).forEach((key) => {
        params[key] = self.table.filters[key];
      });
      self.table.loading = true;
      api.call({
        path: "/kafka/topics",
        params: params,
        onFinish() {
          self.table.loading = false;
        },
        onSuccess(data) {
          if (util.isObject(data)) {
            self.table.rows = util.isArray(data.data) ? data.data : [];
            let pagination = self.table.pagination;
            pagination.page = data.index;
            pagination.rowsPerPage = data.size;
            if (util.isNumber(data.records)) {
              pagination.rowsNumber = data.records;
            } else {
              let rowsNumber = data.index * data.size;
              if (self.table.rows.length !== data.size) {
                pagination.rowsNumber = rowsNumber;
              } else {
                pagination.rowsNumber = rowsNumber + 1;
              }
            }
          }
        },
      });
    },

    /*
     * GET PAGINATION
     */
    get_pagination(props) {
      let pagination = props?.pagination
        ? props.pagination
        : self.table.pagination;
      if (pagination) {
        self.table.pagination = pagination;
        return pagination;
      }
      return self.table.pagination;
    },

    /*
     * REFRESH CLICK
     */
    on_refresh_click() {
      if (!self.table.rows?.length) {
        if (self.table.pagination.page > 1) {
          self.table.pagination.page = 1;
        }
      }
      self.do_request({
        pagination: self.table.pagination,
      });
    },

    /*
     * VIEW CLICK
     */
    on_view_click(scope) {
      let rows = [];
      for (const col of scope.cols) {
        rows.push({
          label: col.label,
          value: util.isFunction(col.format)
            ? col.format(scope.row[col.field], scope.row)
            : scope.row[col.field],
        });
      }
      uix.dialog.show(self.dialog.view, {
        search: false,
        rows: rows,
      });
    },

    /*
     * DELETE CLICK
     */
    on_delete_click(scope) {
      if (!Object.keys(self.table.deleting).length) {
        uix.confirm(function () {
          self.table.deleting[scope.row.id] = true;
          api.call({
            path: "/kafka/topic",
            method: "delete",
            params: {
              name: self.handler,
              topic: scope.row.name,
            },
            onFinish() {
              delete self.table.deleting[scope.row.id];
            },
            onSuccess() {
              self.on_refresh_click();
            },
          });
        }, "confirm.delete");
      }
    },

    /*
     * SEARCH RESET CLICK
     */
    on_search_reset_click() {
      self.table.filters = {};
    },

    /*
     * SEARCH FILTER CLICK
     */
    on_search_filter_click() {
      let filters = self.table.filters;
      if (!(util.isString(filters.topicId) && "" !== filters.topicId)) {
        delete filters.topicId;
      }
      if (!(util.isString(filters.topicName) && "" !== filters.topicName)) {
        delete filters.topicName;
      }
      self.do_request({
        pagination: self.table.pagination,
      });
      uix.dialog.hide(self.dialog.search);
    },

    /*
     * SEARCH DIALOG CLICK
     */
    on_search_dialog_click() {
      uix.dialog.show(self.dialog.search);
    },
  },
};
</script>

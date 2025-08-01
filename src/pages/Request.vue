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
    :rows-per-page-options="[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
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
        @click="on_detail_click(scope)"
      >
        <q-tooltip>{{ $t("label.view") }}</q-tooltip>
      </q-btn>
    </template>
  </q-table>

  <q-dialog
    v-model="dialog.detail.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
  >
    <q-card
      :style="
        ($q.screen.lt.md ? '' : 'width: 80vw; max-width: 81vw;') +
        dialog.detail.style
      "
    >
      <q-card-section
        class="q-pa-none header-main"
        :style="
          APP?.color?.header
            ? 'background: ' + APP.color.header + ' !important;'
            : ''
        "
        v-touch-pan.mouse="dialog.detail.onDrag"
      >
        <q-item class="q-pr-none">
          <q-item-section style="max-width: 80vw; overflow-x: scroll">
            <q-item-label class="text-white">{{
              dialog.detail.title
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
      <q-card-section
        :style="
          'overflow: scroll; ' +
          ($q.screen.lt.md
            ? 'max-height: 70vh;'
            : 'max-height: 70vh; width: 80vw; max-width: 81vw;')
        "
        class="q-pa-xs q-mt-xs scroll"
      >
        <VueJsonPretty
          :data="dialog.detail.data"
          :showLineNumber="true"
          :showLine="true"
          :showDoubleQuotes="false"
          :showIcon="true"
          :highlightSelectedNode="false"
          :showKeyValueSpace="true"
        />
      </q-card-section>
    </q-card>
  </q-dialog>

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
            v-model="table.filters.path"
            type="text"
            :label="$t('label.path')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-select
          v-model="table.filters.method"
          :label="$t('label.method')"
          :options="option.methods"
          filled
          class="q-mb-xs"
        />
        <q-select
          v-model="table.filters.isPublic"
          :label="$t('label.public')"
          :options="option.boolean"
          filled
          class="q-mb-xs"
        />
        <q-select
          v-model="table.filters.isExclude"
          :label="$t('label.exclude')"
          :options="option.boolean"
          filled
          class="q-mb-xs"
        />
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.bean"
            type="text"
            :label="$t('label.bean')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.function"
            type="text"
            :label="$t('label.function')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.annotation"
            type="text"
            :label="$t('label.annotation')"
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
    VueJsonPretty: defineAsyncComponent(() => import("vue-json-pretty")),
  },

  setup() {
    return {
      APP,
      util,

      table: ref({
        rows: [],
        filters: {},
        columns: [],
        loading: false,
        pagination: {
          page: 1,
          rowsPerPage: 30,
          sortBy: "path",
          descending: false,
          count: true,
        },
      }),

      dialog: ref({
        detail: {
          ...uix.dialog.init(() => self.dialog.detail),
          title: null,
          data: null,
        },
        search: uix.dialog.init(() => self.dialog.search),
      }),

      option: ref({
        methods: [
          "",
          "GET",
          "POST",
          "PUT",
          "DELETE",
          "HEAD",
          "PATCH",
          "OPTIONS",
          "TRACE",
        ],
        boolean: ["", "true", "false"],
      }),
    };
  },

  created() {
    self = this;
    self.table.columns = [
      {
        name: "path",
        label: self.$t("label.path"),
        field: "patternValues",
        align: "left",
        sortable: true,
        format: function (val) {
          return val.join(", ");
        },
      },
      {
        name: "method",
        label: self.$t("label.method"),
        field: "methods",
        align: "left",
        sortable: true,
        format: function (val) {
          return val.join(", ");
        },
      },
      {
        name: "public",
        label: self.$t("label.public"),
        field: "public",
        align: "left",
        sortable: true,
      },
      {
        name: "exclude",
        label: self.$t("label.exclude"),
        field: "exclude",
        align: "left",
        sortable: true,
      },
      {
        name: "bean",
        label: self.$t("label.bean"),
        field: "handler",
        align: "left",
        sortable: true,
        format: function (val) {
          return val.bean;
        },
      },
      {
        name: "function",
        label: self.$t("label.function"),
        field: "handler",
        align: "left",
        sortable: true,
        format: function (val) {
          return val.method.name + " (" + val.method.parameterCount + ")";
        },
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
        index: page,
        size: rowsPerPage,
        order: (descending ? "-" : "") + sortBy,
      };
      Object.keys(self.table.filters).forEach((key) => {
        params[key] = self.table.filters[key];
      });
      self.table.loading = true;
      api.call({
        path: "/request/list",
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
     * DETAIL CLICK
     */
    on_detail_click(scope) {
      let d = self.dialog.detail;
      d.title = scope.row.patternValues[0];
      d.data = scope.row;
      uix.dialog.show(d);
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
      if (!(util.isString(filters.method) && "" !== filters.method)) {
        delete filters.method;
      }
      if (!(util.isString(filters.path) && "" !== filters.path)) {
        delete filters.path;
      }
      if (!(util.isString(filters.bean) && "" !== filters.bean)) {
        delete filters.bean;
      }
      if (!(util.isString(filters.function) && "" !== filters.function)) {
        delete filters.function;
      }
      if (!(util.isString(filters.annotation) && "" !== filters.annotation)) {
        delete filters.annotation;
      }
      if (!(util.isString(filters.isPublic) && "" !== filters.isPublic)) {
        delete filters.isPublic;
      }
      if (!(util.isString(filters.isExclude) && "" !== filters.isExclude)) {
        delete filters.isExclude;
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

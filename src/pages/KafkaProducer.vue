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
    </template>
  </q-table>

  <!-- VIEW DIALOG -->
  <q-dialog
    v-model="dialog.view.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(2px)"
  >
    <KeyValue :parameters="dialog.view.parameters" />
  </q-dialog>

  <!-- SEARCH DIALOG -->
  <q-dialog
    v-model="dialog.search.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(2px)"
    persistent
  >
    <q-card :style="'width: ' + ($q.screen.lt.md ? '100%;' : '50%;')">
      <q-card-section class="q-pa-none header-main">
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
            v-model="table.filters.producerId"
            type="text"
            :label="$t('label.producer_id')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.topicName"
            type="text"
            :label="$t('label.topic')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.partition"
            type="text"
            :label="$t('label.partition')"
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
import { util } from "src/scripts/util";
import { api } from "src/scripts/api";

export default {
  components: {
    KeyValue: defineAsyncComponent(() => import("src/pages/KeyValue.vue")),
  },
  setup() {
    return {
      util,

      handler: ref(null),

      table: ref({
        rows: [],
        filters: {},
        columns: [],
        loading: false,
        pagination: {
          page: 1,
          rowsPerPage: 30,
          sortBy: "producerId",
          descending: false,
          count: true,
        },
      }),

      dialog: ref({
        view: {
          show: false,
          parameters: null,
        },
        search: {
          show: false,
        },
      }),

    };
  },

  created() {
    let self = this;
    self.handler = self.$route.query.handler;
    self.table.columns = [
      {
        name: "producerId",
        label: self.$t("label.producer_id"),
        field: "producerId",
        align: "left",
        sortable: true,
      },
      {
        name: "partition.topic",
        label: self.$t("label.topic"),
        field: "partition",
        align: "left",
        sortable: true,
        format: function (val, row) {
          return val.topic;
        },
      },
      {
        name: "partition.index",
        label: self.$t("label.partition"),
        field: "partition",
        align: "left",
        sortable: true,
        format: function (val, row) {
          return val.index;
        },
      },
      {
        name: "lastTimestamp",
        label: self.$t("label.last_timestamp"),
        field: "lastTimestamp",
        align: "left",
        sortable: true,
        format: function (val, row) {
          return util.isNumber(val) && val > 0 ? util.format.date(val, { format: "YYYY-MM-DD HH:mm:ss", }) : "";
        },
      },
      {
        name: "lastSequence",
        label: self.$t("label.last_sequence"),
        field: "lastSequence",
        align: "left",
      },
      {
        name: "producerEpoch",
        label: self.$t("label.producer_epoch"),
        field: "producerEpoch",
        align: "left",
      },
      {
        name: "coordinatorEpoch",
        label: self.$t("label.coordinator_epoch"),
        field: "coordinatorEpoch",
        align: "left",
      },
      {
        name: "currentTransactionStartOffset",
        label: self.$t("label.current_trx_start_offset"),
        field: "currentTransactionStartOffset",
        align: "left",
      },
    ];
    self.on_refresh_click();
  },
  methods: {
    /*
     * REQUEST
     */
    do_request(props) {
      let self = this;
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
        path: "/kafka/producers",
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
      let self = this;
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
      let self = this;
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
      let self = this;
      let rows = [];
      for (const col of scope.cols) {
        rows.push({
          label: col.label,
          value: util.isFunction(col.format) ? col.format(scope.row[col.field], scope.row) : scope.row[col.field],
        });
      }
      self.dialog.view = {
        show: true,
        parameters: {
          search: false,
          rows: rows,
        },
      };
    },

    /*
     * SEARCH RESET CLICK
     */
    on_search_reset_click() {
      let self = this;
      self.table.filters = {};
    },

    /*
     * SEARCH FILTER CLICK
     */
    on_search_filter_click() {
      let self = this;
      let filters = self.table.filters;
      if (!(util.isString(filters.producerId) && "" !== filters.producerId)) {
        delete filters.producerId;
      }
      if (!(util.isString(filters.topicName) && "" !== filters.topicName)) {
        delete filters.topicName;
      }
      if (!(util.isString(filters.partition) && "" !== filters.partition)) {
        delete filters.partition;
      }
      self.do_request({
        pagination: self.table.pagination,
      });
      self.dialog.search.show = false;
    },

    /*
     * SEARCH DIALOG CLICK
     */
    on_search_dialog_click() {
      let self = this;
      self.dialog.search.show = true;
    },
  },
};
</script>

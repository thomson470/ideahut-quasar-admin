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
    backdrop-filter="blur(1px)"
    bordered
  >
    <q-card :style="'min-width: 50vw; max-width: 90vw;' + dialog.view.style">
      <q-card-section
        class="q-pa-xs q-pr-md text-right"
        v-touch-pan.mouse="dialog.view.onDrag"
      >
        <q-btn
          round
          glossy
          dense
          size="sm"
          icon="delete"
          class="q-ml-sm"
          :loading="dialog.view.deleting"
          @click="on_delete_group_click"
        >
          <q-tooltip>{{ $t("label.delete") }}</q-tooltip>
        </q-btn>
        <q-btn
          round
          glossy
          dense
          size="sm"
          icon="close"
          class="q-ml-sm"
          v-close-popup
        >
          <q-tooltip>{{ $t("label.close") }}</q-tooltip>
        </q-btn>
      </q-card-section>
      <q-card-section class="q-pa-xs">
        <q-table
          class="table-sticky-header no-column"
          :rows="dialog.view.rows"
          :separator="'cell'"
          :rows-per-page-options="[0]"
          hide-bottom
          hide-header
          bordered
          dense
        />
      </q-card-section>
      <q-card-section class="q-pa-xs">
        <q-table
          :columns="columns.coordinator"
          :rows="dialog.view.coordinator"
          :separator="'cell'"
          :rows-per-page-options="[0]"
          hide-bottom
          bordered
          dense
        >
          <template v-slot:top>
            <span class="text-weight-bolder">
              {{ $t("label.coordinator") }}</span
            >
          </template>
        </q-table>
        <q-table
          v-if="dialog?.view?.members?.length"
          class="table-sticky-header q-mt-sm"
          selection="single"
          :columns="columns.members"
          :rows="dialog.view.members"
          :separator="'cell'"
          :rows-per-page-options="[0]"
          hide-bottom
          bordered
          dense
        >
          <template v-slot:top>
            <span class="text-weight-bolder"> {{ $t("label.members") }}</span>
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
              @click="on_member_click(scope)"
            >
              <q-tooltip>{{ $t("label.view") }}</q-tooltip>
            </q-btn>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- MEMBER DIALOG -->
  <q-dialog
    v-model="dialog.member.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
  >
    <KeyValue
      :parameters="dialog.member.parameters"
      :style="dialog.member.style"
      v-touch-pan.mouse="dialog.member.onDrag"
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
            v-model="table.filters.groupId"
            type="text"
            :label="$t('label.group_id')"
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
        <q-select
          v-model="table.filters.consumerState"
          :label="$t('label.state')"
          :options="option.state"
          filled
          class="q-mb-xs"
        />
        <q-select
          v-model="table.filters.isSimpleConsumerGroup"
          :label="$t('label.simple_consumer_group')"
          :options="option.boolean"
          filled
          class="q-mb-xs"
        />
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.partitionAssignor"
            type="text"
            :label="$t('label.partition_assignor')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-select
          v-model="table.filters.aclOperation"
          :label="$t('label.acl_operation')"
          :options="option.aclOperation"
          filled
          class="q-mb-xs"
        />
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
        pagination: {
          page: 1,
          rowsPerPage: 30,
          sortBy: "groupId",
          descending: false,
          count: true,
        },
      }),
      columns: ref({
        coordinator: [],
        members: [],
      }),
      dialog: ref({
        view: {
          ...uix.dialog.init(() => self.dialog.view),
          rows: null,
          coordinator: null,
          members: null,
          deleting: false,
        },
        member: uix.dialog.init(() => self.dialog.member),
        search: uix.dialog.init(() => self.dialog.search),
      }),
      option: ref({
        state: [
          "",
          "UNKNOWN",
          "PREPARING_REBALANCE",
          "COMPLETING_REBALANCE",
          "STABLE",
          "DEAD",
          "EMPTY",
        ],
        aclOperation: [
          "",
          "UNKNOWN",
          "ANY",
          "ALL",
          "READ",
          "WRITE",
          "CREATE",
          "DELETE",
          "ALTER",
          "DESCRIBE",
          "CLUSTER_ACTION",
          "DESCRIBE_CONFIGS",
          "ALTER_CONFIGS",
          "IDEMPOTENT_WRITE",
          "CREATE_TOKENS",
          "DESCRIBE_TOKENS",
        ],
        boolean: ["", "true", "false"],
      }),
    };
  },

  created() {
    self = this;
    self.handler = self.$route.query.handler;
    self.table.columns = [
      {
        name: "groupId",
        label: self.$t("label.group_id"),
        field: "groupId",
        align: "left",
        sortable: true,
      },
      {
        name: "state",
        label: self.$t("label.state"),
        field: "state",
        align: "left",
        sortable: true,
      },
      {
        name: "isSimpleConsumerGroup",
        label: self.$t("label.simple_consumer_group"),
        field: "isSimpleConsumerGroup",
        align: "left",
        sortable: true,
      },
      {
        name: "partitionAssignor",
        label: self.$t("label.partition_assignor"),
        field: "partitionAssignor",
        align: "left",
      },
      {
        name: "aclOperations",
        label: self.$t("label.acl_operation"),
        field: "aclOperations",
        align: "left",
        format: (val) => {
          return util.isArray(val) ? val.join(", ") : val;
        },
      },
    ];
    self.columns.coordinator = [
      {
        name: "idInteger",
        label: self.$t("label.id_integer"),
        field: "idInteger",
        align: "left",
      },
      {
        name: "idString",
        label: self.$t("label.id_string"),
        field: "idString",
        align: "left",
      },
      {
        name: "host",
        label: self.$t("label.host"),
        field: "host",
        align: "left",
      },
      {
        name: "port",
        label: self.$t("label.port"),
        field: "port",
        align: "left",
      },
    ];
    self.columns.members = [
      {
        name: "memberId",
        label: self.$t("label.member_id"),
        field: "memberId",
        align: "left",
      },
      {
        name: "clientId",
        label: self.$t("label.client_id"),
        field: "clientId",
        align: "left",
      },
      {
        name: "host",
        label: self.$t("label.host"),
        field: "host",
        align: "left",
      },
      {
        name: "partitions",
        label: self.$t("label.topic_partition"),
        field: "partitions",
        align: "left",
        format: (val) => {
          let sval = "";
          if (util.isArray(val)) {
            util.sort.array(val, "label");
            let m = {};
            for (const v of val) {
              if (!util.isArray(m[v.topic])) {
                m[v.topic] = [];
              }
              m[v.topic].push(v.index);
            }
            Object.keys(m).forEach((k) => {
              sval += '["' + k + '" => ' + m[k].join(", ") + "] ";
            });
          }
          return sval;
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
        path: "/kafka/consumers",
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
      let d = self.dialog.view;
      d.rows = rows;
      d.coordinator = [scope.row.coordinator];
      d.members = util.isArray(scope.row.members) ? scope.row.members : [];
      d.groupId = scope.row.groupId;
      uix.dialog.show(d);
    },

    /*
     * MEMBER CLICK
     */
    on_member_click(scope) {
      let rows = [];
      for (const col of scope.cols) {
        rows.push({
          label: col.label,
          value: util.isFunction(col.format)
            ? col.format(scope.row[col.field], scope.row)
            : scope.row[col.field],
        });
      }
      uix.dialog.show(self.dialog.member, {
        search: false,
        rows: rows,
      });
    },

    /*
     * DELETE GROUP CLICK
     */
    on_delete_group_click() {
      let dlg = self.dialog.view;
      uix.confirm(function () {
        dlg.deleting = true;
        api.call({
          path: "/kafka/consumer/group",
          method: "delete",
          params: {
            name: self.handler,
            groupId: dlg.groupId,
          },
          onFinish() {
            dlg.deleting = false;
          },
          onSuccess() {
            let d = self.dialog.view;
            d.rows = null;
            d.coordinator = null;
            d.members = null;
            d.deleting = false;
            uix.dialog.hide(d);
            self.on_refresh_click();
          },
        });
      }, "confirm.delete");
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
      if (!(util.isString(filters.groupId) && "" !== filters.groupId)) {
        delete filters.groupId;
      }
      if (
        !(util.isString(filters.consumerState) && "" !== filters.consumerState)
      ) {
        delete filters.consumerState;
      }
      if (
        !(
          util.isString(filters.isSimpleConsumerGroup) &&
          "" !== filters.isSimpleConsumerGroup
        )
      ) {
        delete filters.isSimpleConsumerGroup;
      }
      if (
        !(
          util.isString(filters.partitionAssignor) &&
          "" !== filters.partitionAssignor
        )
      ) {
        delete filters.partitionAssignor;
      }
      if (
        !(util.isString(filters.aclOperation) && "" !== filters.aclOperation)
      ) {
        delete filters.aclOperation;
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

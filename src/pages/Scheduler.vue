<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="q-mt-none q-pa-sm q-mb-lg">
    <q-card class="q-pa-none q-mb-lg" bordered>
      <q-card-section class="row q-pa-none">
        <div
          class="col-md-3 col-xs-12 text-center flex flex-center"
          style="border-right: solid 0.5px"
        >
          <q-btn
            v-if="null !== running"
            round
            glossy
            class="q-mb-sm q-mt-sm"
            :icon="running ? 'stop_circle' : 'play_circle'"
            :color="running ? 'negative' : 'positive'"
            size="5vh"
            :loading="loading.start_stop"
            @click="on_start_stop_click"
          >
            <q-tooltip>{{
              $t(running ? "label.stop" : "label.start")
            }}</q-tooltip>
          </q-btn>
        </div>
        <div class="col-md-9 col-xs-12">
          <div class="row">
            <div class="col-6 text-right">
              <q-btn
                round
                glossy
                dense
                size="sm"
                icon="layers_clear_24"
                color="teal-9"
                class="q-ma-xs"
                @click="on_reset_running_click"
              >
                <q-tooltip>{{ $t("label.reset_running") }}</q-tooltip>
              </q-btn>
              <q-btn
                round
                glossy
                dense
                size="sm"
                icon="developer_board_off_24"
                color="indigo-9"
                class="q-ma-xs q-ml-sm"
                @click="on_reset_locking_click"
              >
                <q-tooltip>{{ $t("label.reset_locking") }}</q-tooltip>
              </q-btn>
            </div>
            <div class="col-6 text-right">
              <q-btn
                round
                glossy
                dense
                size="sm"
                icon="refresh"
                class="q-ma-xs"
                :loading="loading.metadata"
                @click="get_metadata"
              >
                <q-tooltip>{{ $t("label.refresh") }}</q-tooltip>
              </q-btn>
            </div>
          </div>
          <q-table
            v-if="metadata?.length"
            class="table-sticky-header no-column q-ma-xs"
            style="max-height: 25vh"
            :rows="metadata"
            :separator="'horizontal'"
            :rows-per-page-options="[0]"
            hide-bottom
            hide-header
            dense
            flat
            bordered
          />
        </div>
      </q-card-section>
    </q-card>
    <q-card
      v-for="(group, id) in groups"
      :key="id"
      class="q-pa-none q-mb-lg"
      bordered
    >
      <q-item>
        <q-item-section>
          <q-item-label class="text-h5">{{ group.name }}</q-item-label>
          <q-item-label class="text-italic" caption>
            {{ $t("label.zone_offset_seconds") }}: {{ group.zoneOffsetSeconds }}
          </q-item-label>
          <q-item-label class="ellipsis-text lines2" caption>
            {{ group.description }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-card-section v-if="expand[id]" class="q-pa-xs">
        <q-table
          class="table-sticky-header"
          :rows="pagination[id].triggers"
          :visible-columns="visibles"
          :columns="columns"
          row-key="triggerId"
          :loading="loading[id]"
          v-model:pagination="pagination[id]"
          :filter="filter[id]"
          binary-state-sort
          separator="cell"
          selection="single"
          rows-per-page-label=" "
          :rows-per-page-options="[10, 20, 30, 40, 50]"
          @request="on_table_request"
        >
          <template v-slot:body-selection="scope">
            <div class="text-right">
              <q-btn
                v-if="
                  scope.row?.status?.state &&
                  'PAUSED' === scope.row.status.state
                "
                glossy
                round
                dense
                size="sm"
                class="q-ma-none q-ml-xs q-mr-sm"
                color="green-9"
                icon="play_arrow"
                :loading="loading.pause_resume[scope.row.triggerId]"
                @click="on_resume_click(scope)"
              >
                <q-tooltip>{{ $t("label.resume") }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="
                  scope.row?.status?.state &&
                  'PAUSED' !== scope.row.status.state
                "
                glossy
                round
                dense
                size="sm"
                class="q-ma-none q-ml-xs q-mr-sm"
                color="orange-9"
                icon="pause"
                :loading="loading.pause_resume[scope.row.triggerId]"
                @click="on_pause_click(scope)"
              >
                <q-tooltip>{{ $t("label.pause") }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="scope.row?.status && true !== scope.row.status.scheduled"
                glossy
                round
                dense
                size="sm"
                class="q-ma-none q-ml-xs q-mr-sm"
                color="indigo-9"
                icon="add"
                :loading="loading.schedule_unschedule[scope.row.triggerId]"
                @click="on_schedule_click(scope)"
              >
                <q-tooltip>{{ $t("label.schedule") }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="scope.row?.status && true === scope.row.status.scheduled"
                glossy
                round
                dense
                size="sm"
                class="q-ma-none q-ml-xs q-mr-sm"
                color="pink-9"
                icon="remove"
                :loading="loading.schedule_unschedule[scope.row.triggerId]"
                @click="on_unschedule_click(scope)"
              >
                <q-tooltip>{{ $t("label.unschedule") }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="scope.row?.status && true === scope.row.status.scheduled"
                glossy
                round
                dense
                size="sm"
                class="q-ma-none q-ml-xs q-mr-sm"
                color="blue-grey-9"
                icon="directions_run"
                :loading="loading.trigger[scope.row.triggerId]"
                @click="on_trigger_click(scope)"
              >
                <q-tooltip>{{ $t("label.trigger") }}</q-tooltip>
              </q-btn>
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
            </div>
          </template>
        </q-table>
      </q-card-section>
      <q-badge color="transparent" floating transparent>
        <q-btn
          v-if="expand[id]"
          round
          glossy
          dense
          size="sm"
          icon="refresh"
          class="q-ma-sm button-default"
          :loading="loading.group[id]"
          @click="refresh_triggers(id)"
        >
          <q-tooltip>{{ $t("label.refresh") }}</q-tooltip>
        </q-btn>
        <q-btn
          round
          glossy
          dense
          size="sm"
          class="q-ma-sm button-default"
          :icon="expand[id] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="expand[id] = !expand[id]"
        />
      </q-badge>
    </q-card>
  </div>

  <q-dialog
    v-model="dialog.view.show"
    transition-show="slide-down"
    transition-hide="none"
    backdrop-filter="blur(1px)"
  >
    <View
      :parameters="dialog.view.parameters"
      :style="dialog.view.style"
      v-touch-pan.mouse="dialog.view.onDrag"
    />
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";
let self;

export default {
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    View: defineAsyncComponent(() => import("src/pages/TableView.vue")),
  },
  setup() {
    return {
      util,
      handler: ref(null),
      running: ref(null),
      metadata: ref([]),
      groups: ref({}),
      columns: ref([]),
      visibles: ref([]),
      filter: ref({}),
      expand: ref({}),
      pagination: ref({}),
      loading: ref({
        start_stop: false,
        metadata: false,
        group: {},
        pause_resume: {},
        schedule_unschedule: {},
        trigger: {},
      }),
      dialog: ref({
        view: uix.dialog.init(() => self.dialog.view),
      }),
    };
  },

  created() {
    self = this;
    self.visibles = [
      "name",
      "cronExpression",
      "type.isRunning",
      "isLocking",
      "lastRunTime",
      "status.startTime",
      "status.previousFireTime",
      "status.nextFireTime",
    ];
    self.columns = [
      {
        name: "name",
        label: self.$t("label.name"),
        field: "name",
        align: "left",
        sortable: true,
      },
      {
        name: "cronExpression",
        label: self.$t("label.cron"),
        field: "cronExpression",
        align: "left",
        sortable: true,
      },
      {
        name: "type.classname",
        label: self.$t("label.class"),
        field: "type",
        align: "left",
        format: function (val) {
          if (val) {
            return val.classname;
          } else {
            return val.name;
          }
        },
      },
      {
        name: "isRunOnStartup",
        label: self.$t("label.run_on_startup"),
        field: "isRunOnStartup",
        align: "center",
        format: function (val) {
          if ("Y" === val) {
            return self.$t("label.yes");
          } else if ("N" === val) {
            return self.$t("label.no");
          } else {
            return "";
          }
        },
      },
      {
        name: "type.isRunning",
        label: self.$t("label.running"),
        field: "type",
        align: "center",
        sortable: true,
        format: (val) => {
          let isSingleRun = val?.isSingleRun;
          let isRunning = val?.isRunning;
          if ("Y" === isSingleRun && "Y" == isRunning) {
            return self.$t("label.yes");
          } else {
            return self.$t("label.no");
          }
        },
      },
      {
        name: "isLocking",
        label: self.$t("label.locking"),
        field: "isLocking",
        align: "center",
        sortable: true,
        format: function (val) {
          if ("Y" === val) {
            return self.$t("label.yes");
          } else {
            return self.$t("label.no");
          }
        },
      },
      {
        name: "lastRunTime",
        label: self.$t("label.last_run_time"),
        field: "lastRunTime",
        align: "center",
        sortable: true,
        format: function (val) {
          return val && util.isNumber(val)
            ? util.format.date(val, { format: "yyyy-MM-dd HH:mm:ss" })
            : "";
        },
      },
      {
        name: "status.startTime",
        label: self.$t("label.start_time"),
        field: "status",
        align: "center",
        format: function (val) {
          return val && util.isNumber(val.startTime)
            ? util.format.date(val.startTime, { format: "yyyy-MM-dd HH:mm:ss" })
            : "";
        },
      },
      {
        name: "status.previousFireTime",
        label: self.$t("label.previous_fire_time"),
        field: "status",
        align: "center",
        format: function (val) {
          return val && util.isNumber(val.previousFireTime)
            ? util.format.date(val.previousFireTime, {
                format: "yyyy-MM-dd HH:mm:ss",
              })
            : "";
        },
      },
      {
        name: "status.nextFireTime",
        label: self.$t("label.next_fire_time"),
        field: "status",
        align: "center",
        format: function (val) {
          return val && util.isNumber(val.nextFireTime)
            ? util.format.date(val.nextFireTime, {
                format: "yyyy-MM-dd HH:mm:ss",
              })
            : "";
        },
      },
      {
        name: "status.state",
        label: self.$t("label.state"),
        field: "status",
        align: "center",
        format: function (val) {
          return val ? val.state : "";
        },
      },
      {
        name: "status.priority",
        label: self.$t("label.priority"),
        field: "status",
        align: "center",
        format: function (val) {
          return val && util.isNumber(val.priority) ? val.priority : "";
        },
      },
      {
        name: "trigger",
        label: self.$t("label.trigger"),
        field: "trigger",
        align: "left",
      },
      {
        name: "type",
        label: self.$t("label.type"),
        field: "type",
        align: "left",
      },
      {
        name: "status",
        label: self.$t("label.status"),
        field: "status",
        align: "left",
      },
    ];
    self.do_init();
  },

  methods: {
    /*
     * INIT
     */
    do_init() {
      let handler = self.$route.query.handler;
      if (handler === self.handler) {
        return;
      }
      self.handler = handler;
      self.get_metadata();
      self.get_groups();
    },

    /*
     * METADATA
     */
    get_metadata() {
      self.loading.metadata = true;
      api.call({
        path: "/scheduler/metadata",
        params: {
          handler: self.handler,
        },
        onFinish() {
          self.loading.metadata = false;
        },
        onSuccess(data, info) {
          self.running = info.running;
          self.metadata = [];
          if (util.isObject(data)) {
            Object.keys(data).forEach((key) => {
              self.metadata.push({
                label: key.substring(0, 1).toUpperCase() + key.substring(1),
                value:
                  "runningSince" === key
                    ? util.format.date(data[key], {
                        format: "yyyy-MM-dd HH:mm:ss",
                      })
                    : data[key],
              });
            });
          }
          if (util.isArray(info.packages)) {
            self.metadata.push({
              label: "JobPackages",
              value: JSON.stringify(info.packages),
            });
          }
        },
      });
    },

    /*
     * INIT GROUP
     */
    init_group(group, tmp_expand, tmp_filter) {
      self.groups[group.groupId] = group;
      self.loading.group[group.groupId] = false;
      self.filter[group.groupId] = tmp_filter[group.groupId]
        ? tmp_filter[group.groupId]
        : null;
      self.expand[group.groupId] =
        true === tmp_expand[group.groupId] ? true : false;
      self.pagination[group.groupId] = {
        page: 1,
        rowsPerPage: 10,
        sortBy: "name",
        descending: false,
        triggers: [],
        groupId: group.groupId,
      };
    },

    /*
     * GROUPS
     */
    get_groups() {
      api.call({
        path: "/scheduler/groups",
        params: {
          handler: self.handler,
          size: 1000,
          order: "name",
        },
        onSuccess(page) {
          if (util.isArray(page?.data)) {
            let tmp_expand = JSON.parse(JSON.stringify(self.expand));
            let tmp_filter = JSON.parse(JSON.stringify(self.filter));
            self.groups = {};
            self.expand = {};
            self.filter = {};
            self.pagination = {};
            for (const group of page.data) {
              self.init_group(group, tmp_expand, tmp_filter);
              self.refresh_triggers(group.groupId);
            }
          }
        },
      });
    },

    /*
     * TRIGGERS
     */
    refresh_triggers(groupId) {
      self.pagination[groupId].page = 1;
      self.get_triggers(groupId);
    },
    get_triggers(groupId) {
      let page = self.pagination[groupId];
      self.loading.group[groupId] = true;
      api.call({
        path: "/scheduler/triggers",
        params: {
          handler: self.handler,
          groupId: groupId,
          index: page.page,
          size: page.rowsPerPage,
          order: (page.descending ? "-" : "") + page.sortBy,
        },
        onFinish() {
          self.loading.group[groupId] = false;
        },
        onSuccess(page) {
          let pagination = self.pagination[groupId];
          if (util.isObject(page)) {
            pagination.triggers = util.isArray(page.data) ? page.data : [];
            pagination.page = page.index;
            pagination.rowsPerPage = page.size;
            if (util.isNumber(page.records)) {
              pagination.rowsNumber = page.records;
            } else {
              let rowsNumber = page.index * page.size;
              if (pagination.triggers.length !== page.size) {
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
     * TABLE REQUEST
     */
    on_table_request(props) {
      self.pagination[props.pagination.groupId] = props.pagination;
      self.get_triggers(props.pagination.groupId);
    },

    /*
     * START / STOP CLICK
     */
    on_start_stop_click() {
      uix.confirm(
        function () {
          self.loading.start_stop = true;
          api.call({
            path: "/scheduler/" + (self.running ? "stop" : "start"),
            method: "post",
            params: {
              handler: self.handler,
            },
            onFinish() {
              self.loading.start_stop = false;
            },
            onSuccess() {
              self.get_metadata();
              self.get_groups();
            },
          });
        },
        self.$t("label." + (self.running ? "stop" : "start")) + " ?",
      );
    },

    /*
     * PAUSE CLICK
     */
    on_pause_click(scope) {
      let row = scope.row;
      uix.confirm(
        function () {
          self.loading.pause_resume[row.triggerId] = true;
          api.call({
            path: "/scheduler/pause",
            method: "post",
            params: {
              handler: self.handler,
              triggerId: row.triggerId,
            },
            onFinish() {
              self.loading.pause_resume[row.triggerId] = false;
            },
            onSuccess() {
              self.get_triggers(row.groupId);
            },
          });
        },
        self.$t("label.pause") + " <b>" + row.name + "</b> ?",
      );
    },

    /*
     * RESUME CLICK
     */
    on_resume_click(scope) {
      let row = scope.row;
      uix.confirm(
        function () {
          self.loading.pause_resume[row.triggerId] = true;
          api.call({
            path: "/scheduler/resume",
            method: "post",
            params: {
              handler: self.handler,
              triggerId: row.triggerId,
            },
            onFinish() {
              self.loading.pause_resume[row.triggerId] = false;
            },
            onSuccess() {
              self.get_triggers(row.groupId);
            },
          });
        },
        self.$t("label.resume") + " <b>" + row.name + "</b> ?",
      );
    },

    /*
     * SCHEDULE CLICK
     */
    on_schedule_click(scope) {
      let row = scope.row;
      uix.confirm(
        function () {
          self.loading.schedule_unschedule[row.triggerId] = true;
          api.call({
            path: "/scheduler/add",
            method: "post",
            params: {
              handler: self.handler,
              triggerId: row.triggerId,
            },
            onFinish() {
              self.loading.schedule_unschedule[row.triggerId] = false;
            },
            onSuccess() {
              self.get_triggers(row.groupId);
            },
          });
        },
        self.$t("label.schedule") + " <b>" + row.name + "</b> ?",
      );
    },

    /*
     * UNSCHEDULE CLICK
     */
    on_unschedule_click(scope) {
      let row = scope.row;
      uix.confirm(
        function () {
          self.loading.schedule_unschedule[row.triggerId] = true;
          api.call({
            path: "/scheduler/delete",
            method: "post",
            params: {
              handler: self.handler,
              triggerId: row.triggerId,
            },
            onFinish() {
              self.loading.schedule_unschedule[row.triggerId] = false;
            },
            onSuccess() {
              self.get_triggers(row.groupId);
            },
          });
        },
        self.$t("label.unschedule") + " <b>" + row.name + "</b> ?",
      );
    },

    /*
     * TRIGGER CLICK
     */
    on_trigger_click(scope) {
      let row = scope.row;
      uix.confirm(
        function () {
          self.loading.trigger[row.triggerId] = true;
          api.call({
            path: "/scheduler/trigger",
            method: "post",
            params: {
              handler: self.handler,
              triggerId: row.triggerId,
            },
            onFinish() {
              self.loading.trigger[row.triggerId] = false;
            },
            onSuccess() {
              self.get_triggers(row.groupId);
            },
          });
        },
        self.$t("label.trigger") + " <b>" + row.name + "</b> ?",
      );
    },

    /*
     * VIEW CLICK
     */
    on_view_click(scope) {
      delete scope.row.trigger;
      let trigger = JSON.parse(JSON.stringify(scope.row));
      delete trigger.type;
      delete trigger.status;
      scope.row.trigger = trigger;
      uix.dialog.show(self.dialog.view, {
        scope: scope,
        columns: self.columns,
      });
    },

    /*
     * RESET RUNNING CLICK
     */
    on_reset_running_click() {
      uix.confirm(
        function () {
          api.call({
            path: "/scheduler/reset/running",
            method: "post",
            params: {
              handler: self.handler,
            },
          });
        },
        self.$t("label.reset_running") + " ?",
      );
    },

    /*
     * RESET LOCKING CLICK
     */
    on_reset_locking_click() {
      uix.confirm(
        function () {
          api.call({
            path: "/scheduler/reset/locking",
            method: "post",
            params: {
              handler: self.handler,
            },
          });
        },
        self.$t("label.reset_locking") + " ?",
      );
    },
  },
};
</script>

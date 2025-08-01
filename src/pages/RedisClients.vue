<template>
  <q-card
    :style="'min-width: 50vw; max-width: 90vw;' + main.style"
    v-touch-pan.mouse="main.onDrag"
  >
    <q-card-section class="q-pa-none">
      <q-table
        class="table-sticky-header q-ma-none"
        :rows="table.rows"
        :columns="table.columns"
        :row-key="'id'"
        :loading="table.loading"
        :selection="'single'"
        v-model:pagination="table.pagination"
        :dense="$q.screen.lt.md"
        :no-data-label="$t('error.data_not_available')"
        rows-per-page-label=" "
        :rows-per-page-options="[10, 20, 30, 40, 50]"
        :selected-rows-label="(selected) => {}"
        @request="do_request"
        binary-state-sort
        :separator="'cell'"
        style="max-height: 70vh"
        bordered
      >
        <template v-slot:top-left>
          <div class="text-h6">
            {{ parameters.title }}
            <q-badge
              v-if="true === parameters.badge"
              color="orange"
              rounded
              align="top"
              transparent
            />
          </div>
        </template>
        <template v-slot:top-right>
          <q-btn
            round
            glossy
            dense
            size="sm"
            icon="refresh"
            class="q-ml-sm"
            :loading="table.loading"
            @click="on_refresh_click"
          >
            <q-tooltip>{{ $t("label.refresh") }}</q-tooltip>
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
        </template>
        <template v-slot:no-data="{ message }">
          <div class="full-width row flex-center text-accent q-gutter-sm">
            <q-icon size="2em" name="block" />
            <span class="text-subtitle2">
              {{ message }}
            </span>
          </div>
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
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
            <template v-slot:append>
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
  </q-card>

  <!-- VIEW -->
  <q-dialog
    v-model="view.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
    persistent
  >
    <KeyValue
      :parameters="view.parameters"
      :style="view.style"
      v-touch-pan.mouse="view.onDrag"
    />
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";
let self;

const FIELDS = [
  "id",
  "addressPort",
  "databaseId",
  "name",
  "user",
  "fileDescriptor",
  "age",
  "idle",
  "flags",
  "rbp",
  "rbs",
  "totalMemoryConsumed",
  "bufferedMultiCommandsMemory",
  "multiCommandContext",
  "channelSubscribtions",
  "shardChannelSubscriptions",
  "patternSubscrbtions",
  "bufferLength",
  "bufferFreeSpace",
  "outputBufferLength",
  "outputListLength",
  "outputBufferMemoryUsage",
  "events",
  "lastCommand",
  "incompleteArguments",
  "trackingRedirection",
  "respProtocolVersion",
  "libName",
  "libVersion",
  "bindAddress",
];

export default {
  props: ["parameters"],
  components: {
    KeyValue: defineAsyncComponent(() => import("src/pages/KeyValue.vue")),
  },
  setup() {
    return {
      util,
      table: ref({
        rows: [],
        columns: [],
        loading: false,
        pagination: {
          page: 1,
          rowsPerPage: 10,
        },
      }),
      main: ref(uix.dialog.init(() => self.main)),
      view: ref(uix.dialog.init(() => self.view)),
    };
  },

  created() {
    self = this;
    let columns = [];
    for (const field of FIELDS) {
      columns.push({
        name: field,
        label: field.substring(0, 1).toUpperCase() + field.substring(1),
        field: field,
        align: "left",
      });
    }
    self.table.columns = columns;
    self.do_request({
      pagination: self.table.pagination,
    });
  },

  methods: {
    /*
     * REQUEST
     */
    do_request(props) {
      self.table.selected = [];
      let { page, rowsPerPage } = props?.pagination
        ? props.pagination
        : self.table.pagination;
      let params = {
        name: self.parameters.name,
        index: page,
        size: rowsPerPage,
      };
      self.table.loading = true;
      api.call({
        path: "/redis/clients",
        params: params,
        onFinish() {
          self.table.loading = false;
        },
        onSuccess(page) {
          self.table.rows = [];
          if (util.isObject(page)) {
            self.table.rows = util.isArray(page.data) ? page.data : [];
            let pagination = self.table.pagination;
            pagination.page = page.index;
            pagination.rowsPerPage = page.size;
            pagination.rowsNumber = page.records;
          }
        },
      });
    },

    /*
     * REFRESH CLICK
     */
    on_refresh_click() {
      self.do_request({
        pagination: self.table.pagination,
      });
    },

    /*
     * PAGE CHANGED
     */
    on_page_changed() {
      let page = +self.table.pagination.page;
      if (!isNaN(page) && page > 0) {
        self.do_request({
          pagination: self.table.pagination,
        });
      }
    },

    /*
     * VIEW CLICK
     */
    on_view_click(scope) {
      let rows = [];
      for (const col of scope.cols) {
        rows.push({
          label: col.label,
          value: scope.row[col.field],
        });
      }
      uix.dialog.show(self.view, {
        title: scope.row.addressPort,
        name: scope.row.name,
        badge: true === scope.row.isDefault,
        rows: rows,
      });
    },
  },
};
</script>

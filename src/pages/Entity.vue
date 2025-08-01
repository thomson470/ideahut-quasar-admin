<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="row q-mt-none q-pa-sm">
    <div
      :class="
        (metadata?.rows?.length ? 'col-md-6 ' : 'col-md-12 ') +
        ' col-xs-12 q-pa-xs q-mb-sm'
      "
    >
      <q-table
        class="table-sticky-header no-column"
        style="max-height: 27vh"
        :title="$t('label.setting')"
        :rows="setting.rows"
        :separator="'cell'"
        :rows-per-page-options="[0]"
        :filter="setting.filter"
        hide-bottom
        hide-header
        bordered
        dense
      >
        <template v-slot:top-right>
          <q-btn
            round
            glossy
            dense
            size="sm"
            icon="lightbulb"
            @click="on_keyvalue_show($t('label.setting'), setting.rows)"
          >
            <q-tooltip>{{ $t("label.view") }}</q-tooltip>
          </q-btn>
        </template>
      </q-table>
    </div>
    <div
      v-if="metadata?.rows?.length"
      class="col-md-6 col-xs-12 q-pa-xs q-mb-sm"
    >
      <q-table
        class="table-sticky-header no-column"
        style="max-height: 27vh"
        :title="$t('label.metadata')"
        :rows="metadata.rows"
        :separator="'cell'"
        :rows-per-page-options="[0]"
        :filter="metadata.filter"
        hide-bottom
        hide-header
        bordered
        dense
      >
        <template v-slot:top-right>
          <q-btn
            round
            glossy
            dense
            size="sm"
            icon="lightbulb"
            @click="on_keyvalue_show($t('label.metadata'), metadata.rows)"
          >
            <q-tooltip>{{ $t("label.view") }}</q-tooltip>
          </q-btn>
        </template>
      </q-table>
    </div>
    <div class="col-md-12 col-xs-12 q-pa-xs q-mb-sm">
      <q-table
        class="table-sticky-header"
        :title="$t('label.entity')"
        :rows="entity.rows"
        :columns="columns.entity"
        :loading="entity.loading"
        :selection="'single'"
        :dense="$q.screen.lt.md"
        :no-data-label="$t('error.data_not_available')"
        rows-per-page-label=" "
        :rows-per-page-options="[10, 20, 30, 40, 50]"
        binary-state-sort
        :separator="'cell'"
        v-model:pagination="entity.pagination"
        @request="get_entities"
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
              v-if="Object.keys(entity.filters).length"
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
            :loading="entity.loading"
            @click="on_entity_refresh_click"
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

        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
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
            class="q-ml-sm q-mr-xs"
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
            v-model="entity.pagination.page"
            @update:model-value="on_entity_page_changed"
          >
            <template v-if="true === entity.pagination.count" v-slot:append>
              <span class="text-caption"> / {{ scope.pagesNumber }}</span>
            </template>
          </q-input>
          <q-btn
            glossy
            size="sm"
            icon="chevron_right"
            color="grey-8"
            class="q-ml-sm q-mr-sm"
            round
            dense
            flat
            :disable="scope.isLastPage"
            @click="scope.nextPage"
          />
          <q-btn
            v-if="scope.pagesNumber > 2 && true === entity.pagination.count"
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

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width />
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-btn
                glossy
                round
                dense
                size="sm"
                class="q-ma-none q-ml-xs q-mr-sm"
                :color="props.expand ? 'deep-purple' : 'accent'"
                :icon="props.expand ? 'remove' : 'add'"
                @click="props.expand = !props.expand"
              >
                <q-tooltip>{{ $t("label.expand") }}</q-tooltip>
              </q-btn>
            </q-td>
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              :style="'type' === col.name ? 'cursor: pointer;' : ''"
              @click="
                'type' === col.name
                  ? on_dialog_entity_show(props.row.type)
                  : null
              "
            >
              {{ col.value }}
            </q-td>
          </q-tr>
          <q-tr v-if="props.expand" v-show="props.expand" :props="props">
            <q-td colspan="100%">
              <div class="text-left q-pa-sm">
                <div>
                  <q-btn-dropdown
                    glossy
                    dense
                    size="sm"
                    class="q-ml-xs"
                    color="light-green-10"
                    icon="content_copy"
                    :label="$t('label.replica')"
                    :loading="loading.replica[props.row.type]"
                  >
                    <q-list>
                      <q-item
                        v-for="total in 10"
                        :key="total"
                        clickable
                        v-close-popup
                        @click="on_entity_replica_click(props, total)"
                      >
                        <q-item-section>
                          <q-item-label>{{ total }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                  <q-btn-dropdown
                    glossy
                    dense
                    size="sm"
                    class="q-ml-sm q-pr-sm"
                    color="orange-10"
                    icon="view_quilt"
                    :label="$t('label.grid')"
                    :loading="loading.grid[props.row.type]"
                  >
                    <q-list>
                      <q-item
                        clickable
                        v-close-popup
                        @click="on_entity_grid_click(props, 'json')"
                      >
                        <q-item-section>JSON</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item
                        clickable
                        v-close-popup
                        @click="on_entity_grid_click(props, 'yaml')"
                      >
                        <q-item-section>YAML</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>
                <q-table
                  class="table-child q-mt-sm"
                  :columns="columns.field"
                  :rows="props.row.id.fields"
                  :separator="'cell'"
                  :rows-per-page-options="[0]"
                  hide-bottom
                  dense
                >
                  <template v-slot:top>
                    <span class="text-weight-bolder">{{
                      $t("label.identifier")
                    }}</span>
                    <span class="q-ml-md"
                      >[ {{ $t("label.type") }}: {{ props.row.id.type
                      }}{{
                        util.isString(props.row.id.name)
                          ? ", " + $t("label.field") + ": " + props.row.id.name
                          : ""
                      }}
                      ]</span
                    >
                  </template>
                </q-table>
                <q-table
                  class="table-child q-mt-sm"
                  :columns="columns.field"
                  :rows="props.row.fields"
                  :separator="'cell'"
                  :rows-per-page-options="[0]"
                  hide-bottom
                  dense
                >
                  <template v-slot:top>
                    <span class="text-weight-bolder">{{
                      $t("label.field")
                    }}</span>
                  </template>
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td
                        v-for="col in props.cols"
                        :key="col.name"
                        :props="props"
                        :style="
                          'type' === col.name && true === props.row.isEntity
                            ? 'cursor: pointer;'
                            : ''
                        "
                        @click="
                          'type' === col.name && true === props.row.isEntity
                            ? on_dialog_entity_show(props.row.type)
                            : null
                        "
                      >
                        {{ col.value }}
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
                <q-table
                  v-if="props.row.transients?.length"
                  class="table-child q-mt-sm"
                  :columns="columns.transient"
                  :rows="props.row.transients"
                  :separator="'cell'"
                  :rows-per-page-options="[0]"
                  hide-bottom
                  dense
                >
                  <template v-slot:top>
                    <span class="text-weight-bolder">{{
                      $t("label.transient")
                    }}</span>
                  </template>
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td
                        v-for="col in props.cols"
                        :key="col.name"
                        :props="props"
                        :style="
                          'type' === col.name && true === props.row.isEntity
                            ? 'cursor: pointer;'
                            : ''
                        "
                        @click="
                          'type' === col.name && true === props.row.isEntity
                            ? on_dialog_entity_show(props.row.type)
                            : null
                        "
                      >
                        {{ col.value }}
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>

  <!--
      DIALOG SEARCH
    -->
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
        <q-select
          v-model="entity.filters['id.type']"
          :label="$t('label.id')"
          :options="option.id"
          filled
          class="q-mb-xs"
        />
        <q-form @submit="on_entity_filter_click" @reset="on_entity_reset_click">
          <q-input
            v-model="entity.filters.type"
            type="text"
            :label="$t('label.type')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form @submit="on_entity_filter_click" @reset="on_entity_reset_click">
          <q-input
            v-model="entity.filters.table"
            type="text"
            :label="$t('label.table')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-select
          v-model="entity.filters.isSoftDelete"
          :label="$t('label.soft_delete')"
          :options="option.boolean"
          filled
          class="q-mb-xs"
        />
        <q-select
          v-model="entity.filters.isAuditEntity"
          :label="$t('label.audit_entity')"
          :options="option.boolean"
          filled
          class="q-mb-xs"
        />
        <q-select
          v-model="entity.filters.isAuditEnabled"
          :label="$t('label.audit_enabled')"
          :options="option.boolean"
          filled
          class="q-mb-xs"
        />
        <q-select
          v-model="entity.filters.isApiExclude"
          :label="$t('label.api_exclude')"
          :options="option.boolean"
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
            @click="on_entity_reset_click"
          />
        </div>
        <div class="col-6 q-pl-xs text-right">
          <q-btn
            :label="$t('label.filter')"
            color="purple"
            no-caps
            glossy
            @click="on_entity_filter_click"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!--
      DIALOG REPLICA
    -->
  <q-dialog
    v-model="dialog.replica.show"
    persistent
    backdrop-filter="blur(1px)"
  >
    <q-card
      :style="
        ($q.screen.lt.md
          ? 'width: 80vw; max-width: 81vw;'
          : 'width: 60vw; max-width: 61vw;') + dialog.replica.style
      "
    >
      <q-card-section
        class="q-pa-none header-main"
        :style="
          APP?.color?.header
            ? 'background: ' + APP.color.header + ' !important;'
            : ''
        "
        v-touch-pan.mouse="dialog.replica.onDrag"
      >
        <q-item class="q-pr-none">
          <q-item-section style="max-width: 80vw; overflow-x: scroll">
            <q-item-label class="text-white">{{
              dialog.replica.title
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
          $q.screen.lt.md
            ? 'max-height: 65vh;'
            : 'max-height: 70vh; width: 60vw; max-width: 61vw;'
        "
        class="q-pa-xs q-mt-xs scroll"
      >
        <q-list>
          <q-item
            v-for="(sql, index) in dialog.replica.sqls"
            :key="index"
            class="q-pa-none"
          >
            <q-input
              type="text"
              v-model="dialog.replica.sqls[index]"
              filled
              dense
              readonly
              autogrow
              class="text-left text-caption q-mt-xs full-width"
            />
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions class="row">
        <div class="col-12 text-center">
          <q-btn
            v-if="!dialog.replica.copied"
            no-caps
            ripple
            glossy
            icon="assignment"
            :label="$t('label.copy_to_clipboard')"
            color="secondary"
            @click="on_entity_replica_copy_to_clipboard_click"
          />
          <span v-else>{{ $t("label.copied_to_clipboard") }} </span>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!--
      DIALOG GRID
    -->
  <q-dialog v-model="dialog.grid.show" persistent backdrop-filter="blur(1px)">
    <q-card
      :style="
        ($q.screen.lt.md
          ? 'width: 80vw; max-width: 81vw;'
          : 'width: 60vw; max-width: 61vw;') + dialog.grid.style
      "
    >
      <q-card-section
        class="q-pa-none header-main"
        :style="
          APP?.color?.header
            ? 'background: ' + APP.color.header + ' !important;'
            : ''
        "
        v-touch-pan.mouse="dialog.grid.onDrag"
      >
        <q-item class="q-pr-none">
          <q-item-section style="max-width: 80vw; overflow-x: scroll">
            <q-item-label class="text-white">{{
              dialog.grid.title
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
          $q.screen.lt.md
            ? 'max-height: 65vh;'
            : 'max-height: 70vh; width: 60vw; max-width: 61vw;'
        "
        class="q-pa-xs q-mt-xs scroll"
      >
        <q-input
          v-if="'yaml' === dialog.grid.type"
          type="text"
          v-model="dialog.grid.text"
          filled
          dense
          readonly
          autogrow
          class="text-left q-mt-xs full-width"
        />
        <VueJsonPretty
          v-else
          :data="JSON.parse(dialog.grid.text)"
          :showLineNumber="true"
          :showLine="true"
          :showDoubleQuotes="false"
          :showIcon="true"
          :highlightSelectedNode="false"
          :showKeyValueSpace="true"
        />
      </q-card-section>
      <q-card-actions class="row">
        <div class="col-12 text-center">
          <q-btn
            v-if="!dialog.grid.copied"
            no-caps
            ripple
            glossy
            icon="assignment"
            :label="$t('label.copy_to_clipboard')"
            color="secondary"
            @click="on_entity_grid_copy_to_clipboard_click"
          />
          <span v-else>{{ $t("label.copied_to_clipboard") }} </span>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!--
      DIALOG ENTITY
    -->
  <q-dialog
    v-model="dialog.entity.show"
    persistent
    transition-show="slide-down"
    transition-hide="none"
    backdrop-filter="blur(1px)"
    full-width
  >
    <EntityView
      :parameters="dialog.entity.parameters"
      :style="dialog.entity.style"
      v-touch-pan.mouse="dialog.entity.onDrag"
    />
  </q-dialog>

  <!--
      DIALOG KEY VALUE
    -->
  <q-dialog
    v-model="dialog.keyvalue.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
  >
    <KeyValue
      :parameters="dialog.keyvalue.parameters"
      :style="dialog.keyvalue.style"
      v-touch-pan.mouse="dialog.keyvalue.onDrag"
    />
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
import { APP } from "src/scripts/static";
import { copyToClipboard } from "quasar";
import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";
let self;

export default {
  components: {
    KeyValue: defineAsyncComponent(() => import("src/pages/KeyValue.vue")),
    EntityView: defineAsyncComponent(() => import("src/pages/EntityView.vue")),
    VueJsonPretty: defineAsyncComponent(() => import("vue-json-pretty")),
  },

  setup() {
    return {
      APP,
      util,
      copyToClipboard,
      loading: ref({
        replica: {},
        grid: {},
      }),
      manager: ref(null),
      setting: ref({
        rows: [],
        filter: null,
      }),
      metadata: ref({
        rows: [],
        filter: null,
      }),
      entity: ref({
        rows: [],
        filters: {},
        pagination: {
          page: 1,
          rowsPerPage: 10,
          sortBy: "type",
          descending: false,
          count: true,
        },
        loading: false,
      }),
      columns: ref({
        entity: [],
        field: [],
        transient: [],
      }),
      dialog: ref({
        entity: uix.dialog.init(() => self.dialog.entity),
        search: uix.dialog.init(() => self.dialog.search),
        replica: {
          ...uix.dialog.init(() => self.dialog.replica),
          title: null,
          sqls: [],
          copied: false,
        },
        grid: {
          ...uix.dialog.init(() => self.dialog.grid),
          type: null,
          title: null,
          data: null,
          copied: false,
        },
        keyvalue: uix.dialog.init(() => self.dialog.keyvalue),
      }),
      option: ref({
        boolean: ["", "true", "false"],
        id: ["", "NONE", "STANDARD", "COMPOSITE", "EMBEDDED"],
      }),
    };
  },

  created() {
    self = this;
    self.columns.entity = [
      {
        name: "type",
        label: self.$t("label.type"),
        field: "type",
        align: "left",
        sortable: true,
      },
      {
        name: "id",
        label: self.$t("label.id"),
        field: "id",
        align: "left",
        sortable: true,
        format: function (val) {
          return val.type;
        },
      },
      {
        name: "table",
        label: self.$t("label.table"),
        field: "table",
        align: "left",
        sortable: true,
      },
      {
        name: "isSoftDelete",
        label: self.$t("label.soft_delete"),
        field: "isSoftDelete",
        align: "left",
        sortable: true,
      },
      {
        name: "isAuditEntity",
        label: self.$t("label.audit_entity"),
        field: "isAuditEntity",
        align: "left",
        sortable: true,
      },
      {
        name: "isAuditEnabled",
        label: self.$t("label.audit_enabled"),
        field: "isAuditEnabled",
        align: "left",
        sortable: true,
      },
      {
        name: "isApiExclude",
        label: self.$t("label.api_exclude"),
        field: "isApiExclude",
        align: "left",
        sortable: true,
      },
    ];
    self.columns.field = [
      {
        name: "name",
        label: self.$t("label.name"),
        field: "name",
        align: "left",
        sortable: true,
      },
      {
        name: "column",
        label: self.$t("label.column"),
        field: "column",
        align: "left",
        sortable: true,
      },
      {
        name: "type",
        label: self.$t("label.type"),
        field: "type",
        align: "left",
        sortable: true,
        format: function (val, row) {
          return (
            val + (util.isString(row.jdbcType) ? " (" + row.jdbcType + ")" : "")
          );
        },
      },
      {
        name: "isLazy",
        label: self.$t("label.lazy"),
        field: "isLazy",
        align: "left",
        sortable: true,
      },
      {
        name: "isEager",
        label: self.$t("label.eager"),
        field: "isEager",
        align: "left",
        sortable: true,
      },
      {
        name: "isLob",
        label: self.$t("label.lob"),
        field: "isLob",
        align: "left",
        sortable: true,
      },
      {
        name: "isEntity",
        label: self.$t("label.entity"),
        field: "isEntity",
        align: "left",
        sortable: true,
      },
      {
        name: "isEnum",
        label: self.$t("label.enum"),
        field: "isEnum",
        align: "left",
        sortable: true,
      },
      {
        name: "format",
        label: self.$t("label.format"),
        field: "format",
        align: "left",
        sortable: true,
      },
      {
        name: "length",
        label: self.$t("label.length"),
        field: "length",
        align: "left",
        sortable: true,
      },
      {
        name: "scale",
        label: self.$t("label.scale"),
        field: "scale",
        align: "left",
        sortable: true,
      },
      {
        name: "precision",
        label: self.$t("label.precision"),
        field: "precision",
        align: "left",
        sortable: true,
      },
    ];
    self.columns.transient = [
      {
        name: "name",
        label: self.$t("label.name"),
        field: "name",
        align: "left",
        sortable: true,
      },
      {
        name: "type",
        label: self.$t("label.type"),
        field: "type",
        align: "left",
        sortable: true,
      },
    ];
    self.do_init();
  },
  beforeUpdate() {
    this.do_init();
  },
  methods: {
    /*
     * GET ENTITY PAGINATION
     */
    get_entity_pagination(props) {
      let pagination = props?.pagination
        ? props.pagination
        : self.entity.pagination;
      if (pagination) {
        self.entity.pagination = pagination;
        return pagination;
      }
      return self.entity.pagination;
    },

    /*
     * INIT
     */
    do_init() {
      let manager = self.$route.query.manager;
      if (manager === self.manager) {
        return;
      }
      self.manager = manager;
      self.get_info();
      self.get_entities({
        pagination: self.entity.pagination,
      });
    },

    /*
     * GET INFO
     */
    get_info() {
      api.call({
        path: "/manager/info",
        params: {
          manager: self.manager,
        },
        onSuccess(data) {
          if (util.isObject(data)) {
            self.setting.rows = [];
            if (util.isObject(data.setting)) {
              Object.keys(data.setting).forEach((key) => {
                self.setting.rows.push({
                  label: key,
                  value: data.setting[key],
                });
              });
              util.sort.array(self.setting.rows, "label");
            }
            self.metadata.rows = [];
            if (util.isObject(data.metadata)) {
              Object.keys(data.metadata).forEach((key) => {
                self.metadata.rows.push({
                  label: key,
                  value: data.metadata[key],
                });
              });
              util.sort.array(self.metadata.rows, "label");
            }
          }
        },
      });
    },

    /*
     * GET ENTITIES
     */
    get_entities(props) {
      let { page, rowsPerPage, sortBy, descending } =
        self.get_entity_pagination(props);
      let params = {
        manager: self.manager,
        index: page,
        size: rowsPerPage,
        order: (descending ? "-" : "") + sortBy,
      };
      Object.keys(self.entity.filters).forEach((key) => {
        params[key] = self.entity.filters[key];
      });
      self.entity.loading = true;
      api.call({
        path: "/manager/entities",
        params: params,
        onFinish() {
          self.entity.loading = false;
        },
        onSuccess(data) {
          if (util.isObject(data)) {
            self.entity.rows = util.isArray(data.data) ? data.data : [];
            let pagination = self.entity.pagination;
            pagination.page = data.index;
            pagination.rowsPerPage = data.size;
            if (util.isNumber(data.records)) {
              pagination.rowsNumber = data.records;
            } else {
              let rowsNumber = data.index * data.size;
              if (self.entity.rows.length !== data.size) {
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
     * REFRESH CLICK
     */
    on_entity_refresh_click() {
      if (!self.entity.rows?.length) {
        if (self.entity.pagination.page > 1) {
          self.entity.pagination.page = 1;
        }
      }
      self.get_entities({
        pagination: self.entity.pagination,
      });
    },

    /*
     * PAGE CHANGED
     */
    on_entity_page_changed() {
      let page = +self.entity.pagination.page;
      if (!isNaN(page) && page > 0) {
        self.do_request({
          pagination: self.entity.pagination,
        });
      }
    },

    /*
     * DIALOG ENTITY SHOW
     */
    on_dialog_entity_show(type) {
      uix.dialog.show(self.dialog.entity, {
        title: type,
        columns: self.columns,
        manager: self.manager,
        entity: type,
      });
    },

    /*
     * ENTITY REPLICA
     */
    on_entity_replica_click(props, total) {
      self.loading.replica[props.row.type] = true;
      api.call({
        path: "/entity/replica",
        params: {
          manager: self.manager,
          entity: props.row.type,
          total: total,
        },
        onFinish() {
          self.loading.replica[props.row.type] = false;
        },
        onSuccess(data) {
          if (util.isArray(data)) {
            let d = self.dialog.replica;
            d.title = props.row.type;
            d.sqls = data;
            uix.dialog.show(d);
          }
        },
      });
    },

    /*
     * ENTITY GRID CLICK
     */
    on_entity_grid_click(props, type) {
      self.loading.grid[props.row.type] = true;
      api.call({
        path: "/entity/grid",
        params: {
          manager: self.manager,
          entity: props.row.type,
          type: type,
        },
        onFinish() {
          self.loading.grid[props.row.type] = false;
        },
        onSuccess(data) {
          if (util.isString(data)) {
            let d = self.dialog.grid;
            d.title = props.row.type;
            d.text = data;
            d.type = type;
            uix.dialog.show(d);
          }
        },
      });
    },

    /*
     * ENTITY GRID COPY TO CLIPBOARD
     */
    on_entity_grid_copy_to_clipboard_click() {
      copyToClipboard(self.dialog.grid.text);
      self.dialog.grid.copied = true;
      setTimeout(function () {
        self.dialog.grid.copied = false;
      }, 3000);
    },

    /*
     * ENTITY REPLICA COPY TO CLIPBOARD
     */
    on_entity_replica_copy_to_clipboard_click() {
      let sqls = self.dialog.replica.sqls;
      if (util.isArray(sqls) && sqls.length) {
        let str = "";
        for (const sql of sqls) {
          str += sql + "\n\n";
        }
        copyToClipboard(str);
        self.dialog.replica.copied = true;
        setTimeout(function () {
          self.dialog.replica.copied = false;
        }, 3000);
      }
    },

    /*
     * ENTITY FILTER CLICK
     */
    on_entity_filter_click() {
      let filters = self.entity.filters;
      if (!(util.isString(filters.type) && "" !== filters.type)) {
        delete filters.type;
      }
      if (!(util.isString(filters.table) && "" !== filters.table)) {
        delete filters.table;
      }
      if (
        !(util.isString(filters.isSoftDelete) && "" !== filters.isSoftDelete)
      ) {
        delete filters.isSoftDelete;
      }
      if (
        !(util.isString(filters.isAuditEntity) && "" !== filters.isAuditEntity)
      ) {
        delete filters.isAuditEntity;
      }
      if (
        !(
          util.isString(filters.isAuditEnabled) && "" !== filters.isAuditEnabled
        )
      ) {
        delete filters.isAuditEnabled;
      }
      if (
        !(util.isString(filters.isApiExclude) && "" !== filters.isApiExclude)
      ) {
        delete filters.isApiExclude;
      }
      if (!(util.isString(filters["id.type"]) && "" !== filters["id.type"])) {
        delete filters["id.type"];
      }
      self.get_entities({
        pagination: self.entity.pagination,
      });
      uix.dialog.hide(self.dialog.search);
    },

    /*
     * ENTITY RESET CLICK
     */
    on_entity_reset_click() {
      self.entity.filters = {};
    },

    /*
     * KEY VALUE
     */
    on_keyvalue_show(title, rows) {
      uix.dialog.show(self.dialog.keyvalue, {
        title: title,
        search: true,
        rows: rows,
      });
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

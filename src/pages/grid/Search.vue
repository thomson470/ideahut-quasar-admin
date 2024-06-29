<!-- eslint-disable vue/multi-word-component-names -->
<template>
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
      <div v-for="(filter, index) in filters" :key="index" class="q-mb-xs">
        <q-form @submit="on_filter_click" @reset="on_reset_click">
          <!-- WORDS -->
          <div v-if="'words' === filter.type">
            <div v-if="'BETWEEN' === filter.condition" class="q-mb-xs row">
              <q-input
                type="text"
                :label="filter.label"
                v-model="filter.value"
                filled
                autogrow
                class="col-6 q-pr-xs"
                style="max-height: 200px; overflow: scroll"
              />
              <q-input
                type="text"
                :label="filter.label"
                v-model="filter.value2"
                filled
                autogrow
                class="col-6 q-pl-xs"
                style="max-height: 200px; overflow: scroll"
              />
            </div>
            <q-input
              v-else
              type="text"
              :label="filter.label"
              v-model="filter.value"
              filled
              autogrow
              style="max-height: 200px; overflow: scroll"
            />
          </div>

          <!-- DATETIME / DATE / TIME -->
          <div
            v-else-if="
              'datetime' === filter.type ||
              'date' === filter.type ||
              'time' === filter.type
            "
            class="q-mb-xs"
          >
            <div v-if="'BETWEEN' === filter.condition" class="row">
              <q-input
                type="text"
                :label="filter.label"
                v-model="filter.value"
                filled
                class="col-6 q-pr-xs"
              >
                <template v-slot:append>
                  <q-icon
                    :name="
                      'time' === filter.type
                        ? 'schedule'
                        : 'date' === filter.type
                        ? 'calendar_month'
                        : 'event'
                    "
                    class="cursor-pointer"
                  >
                    <q-popup-proxy
                      transition-show="scale"
                      transition-hide="scale"
                      cover
                      @before-show="
                        filter.proxy_value = filter.value;
                        filter.tab = 'time' === filter.type ? 'time' : 'date';
                      "
                    >
                      <div class="bg-primary">
                        <q-tabs
                          v-model="filter.tab"
                          class="bg-primary text-grey-5 shadow-2 text-subtitle2"
                          align="justify"
                          no-caps
                          indicator-color="transparent"
                          active-color="white"
                        >
                          <q-tab
                            v-if="
                              'datetime' === filter.type ||
                              'date' === filter.type
                            "
                            name="date"
                          >
                            <span>{{ $t("label.date") }}</span>
                          </q-tab>
                          <q-tab
                            v-if="
                              'datetime' === filter.type ||
                              'time' === filter.type
                            "
                            name="time"
                          >
                            <span>{{ $t("label.time") }}</span>
                          </q-tab>
                        </q-tabs>
                        <q-separator />
                        <q-tab-panels v-model="filter.tab">
                          <q-tab-panel
                            v-if="
                              'datetime' === filter.type ||
                              'date' === filter.type
                            "
                            name="date"
                            class="q-pa-none"
                          >
                            <q-date
                              v-model="filter.proxy_value"
                              :mask="filter.pattern"
                              square
                            />
                          </q-tab-panel>
                          <q-tab-panel
                            v-if="
                              'datetime' === filter.type ||
                              'time' === filter.type
                            "
                            name="time"
                            class="q-pa-none"
                          >
                            <q-time
                              v-model="filter.proxy_value"
                              :mask="filter.pattern"
                              format24h
                              square
                            />
                          </q-tab-panel>
                        </q-tab-panels>
                        <q-separator />
                        <div class="q-pa-xs bg-white row">
                          <div class="col-6 text-left">
                            <q-btn
                              :label="$t('label.cancel')"
                              color="red"
                              no-caps
                              v-close-popup
                            />
                          </div>
                          <div class="col-6 text-right">
                            <q-btn
                              :label="$t('label.ok')"
                              color="secondary"
                              no-caps
                              v-close-popup
                              @click="filter.value = filter.proxy_value"
                            />
                          </div>
                        </div>
                      </div>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input
                type="text"
                :label="filter.label"
                v-model="filter.value2"
                filled
                class="col-6 q-pr-xs"
              >
                <template v-slot:append>
                  <q-icon
                    :name="
                      'time' === filter.type
                        ? 'schedule'
                        : 'date' === filter.type
                        ? 'calendar_month'
                        : 'event'
                    "
                    class="cursor-pointer"
                  >
                    <q-popup-proxy
                      transition-show="scale"
                      transition-hide="scale"
                      cover
                      @before-show="
                        filter.proxy_value2 = filter.value2;
                        filter.tab2 = 'time' === filter.type ? 'time' : 'date';
                      "
                    >
                      <div class="bg-primary">
                        <q-tabs
                          v-model="filter.tab2"
                          class="bg-primary text-grey-5 shadow-2 text-subtitle2"
                          no-caps
                          indicator-color="transparent"
                          active-color="white"
                        >
                          <q-tab
                            v-if="
                              'datetime' === filter.type ||
                              'date' === filter.type
                            "
                            name="date"
                          >
                            <span>{{ $t("label.date") }}</span>
                          </q-tab>
                          <q-tab
                            v-if="
                              'datetime' === filter.type ||
                              'time' === filter.type
                            "
                            name="time"
                          >
                            <span>{{ $t("label.time") }}</span>
                          </q-tab>
                        </q-tabs>
                        <q-separator />
                        <q-tab-panels v-model="filter.tab2">
                          <q-tab-panel
                            v-if="
                              'datetime' === filter.type ||
                              'date' === filter.type
                            "
                            name="date"
                            class="q-pa-none"
                          >
                            <q-date
                              v-model="filter.proxy_value2"
                              :mask="filter.pattern"
                              square
                            />
                          </q-tab-panel>
                          <q-tab-panel
                            v-if="
                              'datetime' === filter.type ||
                              'time' === filter.type
                            "
                            name="time"
                            class="q-pa-none"
                          >
                            <q-time
                              v-model="filter.proxy_value2"
                              :mask="filter.pattern"
                              format24h
                              square
                            />
                          </q-tab-panel>
                        </q-tab-panels>
                        <q-separator />
                        <div class="q-pa-xs bg-white row">
                          <div class="col-6 text-left">
                            <q-btn
                              :label="$t('label.cancel')"
                              color="red"
                              no-caps
                              v-close-popup
                            />
                          </div>
                          <div class="col-6 text-right">
                            <q-btn
                              :label="$t('label.ok')"
                              color="secondary"
                              no-caps
                              v-close-popup
                              @click="filter.value2 = filter.proxy_value2"
                            />
                          </div>
                        </div>
                      </div>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <q-input
              v-else
              type="text"
              :label="filter.label"
              v-model="filter.value"
              filled
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    'time' === filter.type
                      ? 'schedule'
                      : 'date' === filter.type
                      ? 'calendar_month'
                      : 'event'
                  "
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                    cover
                    @before-show="
                      filter.proxy_value = filter.value;
                      filter.tab = 'time' === filter.type ? 'time' : 'date';
                    "
                  >
                    <div class="bg-primary">
                      <q-tabs
                        v-model="filter.tab"
                        class="bg-primary text-grey-5 shadow-2 text-subtitle2"
                        no-caps
                        indicator-color="transparent"
                        active-color="white"
                      >
                        <q-tab
                          v-if="
                            'datetime' === filter.type || 'date' === filter.type
                          "
                          name="date"
                        >
                          <span>{{ $t("label.date") }}</span>
                        </q-tab>
                        <q-tab
                          v-if="
                            'datetime' === filter.type || 'time' === filter.type
                          "
                          name="time"
                        >
                          <span>{{ $t("label.time") }}</span>
                        </q-tab>
                      </q-tabs>
                      <q-separator />
                      <q-tab-panels v-model="filter.tab">
                        <q-tab-panel
                          v-if="
                            'datetime' === filter.type || 'date' === filter.type
                          "
                          name="date"
                          class="q-pa-none"
                        >
                          <q-date
                            v-model="filter.proxy_value"
                            :mask="filter.pattern"
                            square
                          />
                        </q-tab-panel>
                        <q-tab-panel
                          v-if="
                            'datetime' === filter.type || 'time' === filter.type
                          "
                          name="time"
                          class="q-pa-none"
                        >
                          <q-time
                            v-model="filter.proxy_value"
                            :mask="filter.pattern"
                            format24h
                            square
                          />
                        </q-tab-panel>
                      </q-tab-panels>
                      <q-separator />
                      <div class="q-pa-xs bg-white row">
                        <div class="col-6 text-left">
                          <q-btn
                            :label="$t('label.cancel')"
                            color="red"
                            no-caps
                            v-close-popup
                          />
                        </div>
                        <div class="col-6 text-right">
                          <q-btn
                            :label="$t('label.ok')"
                            color="secondary"
                            no-caps
                            v-close-popup
                            @click="filter.value = filter.proxy_value"
                          />
                        </div>
                      </div>
                    </div>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!-- OPTION -->
          <div v-else-if="'option' === filter.type" class="q-mb-xs">
            <div v-if="'BETWEEN' === filter.condition" class="row">
              <q-select
                v-model="filter.value"
                :label="filter.label"
                :options="options[filter.option]"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                filled
                class="col-6 q-pl-xs"
              />
              <q-select
                v-model="filter.value2"
                :label="filter.label"
                :options="options[filter.option]"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                filled
                class="col-6 q-pl-xs"
              />
            </div>
            <q-select
              v-else
              v-model="filter.value"
              :label="filter.label"
              :options="options[filter.option]"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              filled
            />
          </div>

          <!-- ENUM -->
          <div v-else-if="'enum' === filter.type" class="q-mb-xs">
            <q-select
              v-model="filter.value"
              :label="filter.label"
              :options="enums[filter.enum]"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              filled
            />
          </div>

          <!-- ELSE -->
          <div v-else class="q-mb-xs">
            <div v-if="'BETWEEN' === filter.condition" class="row">
              <q-input
                type="text"
                :label="filter.label"
                v-model="filter.value"
                filled
                class="col-6 q-pr-xs"
              />
              <q-input
                type="text"
                :label="filter.label"
                v-model="filter.value2"
                filled
                class="col-6 q-pl-xs"
              />
            </div>
            <q-input
              v-else-if="filter.type"
              type="text"
              :label="filter.label"
              v-model="filter.value"
              filled
            />
          </div>
        </q-form>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions class="row">
      <div class="col-6 q-pr-xs text-left">
        <q-btn
          :label="$t('label.reset')"
          color="orange"
          no-caps
          glossy
          @click="on_reset_click"
        />
      </div>
      <div class="col-6 q-pl-xs text-right">
        <q-btn
          :label="$t('label.filter')"
          color="purple"
          no-caps
          glossy
          @click="on_filter_click"
        />
      </div>
    </q-card-actions>
  </q-card>
</template>

<script>
import { ref } from "vue";
import { util } from "src/scripts/util";

export default {
  props: ["parameters"],
  emits: ["close"],
  setup() {
    return {
      filters: ref([]),
      template: ref({}),
      enums: ref({}),
      options: ref({}),
    };
  },

  created() {
    let self = this;
    let params = self.parameters || {};
    self.filters = util.isArray(params.filters) ? params.filters : [];
    self.template = util.isObject(params.template) ? params.template : {};
    self.enums = {};
    if (util.isObject(self.template.enums)) {
      Object.keys(self.template.enums).forEach((key) => {
        self.enums[key] = [null].concat(self.template.enums[key]);
      });
    }
    self.options = {};
    if (util.isObject(self.template.options)) {
      Object.keys(self.template.options).forEach((key) => {
        self.options[key] = [null].concat(self.template.options[key]);
      });
    }
  },

  methods: {
    on_reset_click() {
      let self = this;
      for (const element of self.filters) {
        delete element.value;
        delete element.value2;
      }
    },
    on_filter_click() {
      let self = this;
      for (const element of self.filters) {
        if (util.isDefined(element.value) && element.value === null) {
          delete element.value;
        }
        if (util.isDefined(element.value2) && element.value2 === null) {
          delete element.value2;
        }
      }
      self.$emit("close", self.filters);
    },
  },
};
</script>

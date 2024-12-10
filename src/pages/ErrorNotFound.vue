<template>
    <div
        v-if="!is_index"
        class="text-center q-ma-sm flex flex-center"
        style="height: 80vh"
    >
        <div>
            <div style="font-size: 20vh">404</div>
            <div class="text-h4" style="opacity: 0.4">
                {{ $t("error.page_not_found") }}
            </div>
        </div>
    </div>
</template>
  
<script>
import { ref, defineComponent } from "vue";
import { util } from "src/scripts/util";

export default defineComponent({
    name: "ErrorNotFound",
    setup() {
        return {
            is_index: ref(true),
        };
    },
    created() {
        let self = this;
        self.is_index = window.location.pathname === util.webPath() + "/index.html";
    },
});
</script>
  
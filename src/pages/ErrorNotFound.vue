<template>
    <div
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
import { defineComponent } from "vue";

export default defineComponent({
    name: "ErrorNotFound",
});
</script>
  
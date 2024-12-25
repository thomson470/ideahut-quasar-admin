// diisi / direplace di sisi server
const STATIC = {
    "__admin__": {
        id: "",
        title: "",
        //web: "",
        //api: "http://localhost:7101/_/api",
        web: "/_/web",
        api: "/_/api",
        timeout: 60,
        language: "en",
        debug: true,
    }
};
const APP = STATIC["__admin__"];
export { APP };
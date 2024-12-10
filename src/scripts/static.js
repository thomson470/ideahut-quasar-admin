// diisi / direplace di sisi server
const STATIC = {
    "__app__": {
        id: "",
        title: "",
        web: "",
        api: "http://localhost:5401/_/api",
        //web: "/_/web",
        //api: "/_/api",
        timeout: 60,
        language: "en",
        debug: true,
    }
};
const APP = STATIC["__app__"];
export { APP };
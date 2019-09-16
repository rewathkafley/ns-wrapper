/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

import {Observable} from "tns-core-modules/data/observable";
import {isAndroid, Page} from "tns-core-modules/ui/page";
import * as dialogs from "tns-core-modules/ui/dialogs";
import {TextField} from "tns-core-modules/ui/text-field";
import {LoadEventData, WebViewExt} from "@nota/nativescript-webview-ext";
import {platformNames} from "tns-core-modules/platform";
import { FilePickerOptions, ImagePickerOptions, Mediafilepicker } from 'nativescript-mediafilepicker';


// >> setting-url-webview-ts
export function onNavigatingTo(args) {
    const page: Page = <Page>args.object;
    const vm = new Observable();
    const url = "https://selise.platform.selise.org";
    vm.set("webViewSrc", url);
    vm.set("result", "");
    vm.set("tftext", url);
    page.bindingContext = vm;
    vm.set('isWebViewLoading', true);
}

// handling WebView load finish event
export function onWebViewLoaded(webargs) {
    const page: Page = <Page>webargs.object.page;
    const vm = page.bindingContext;
    const webview: WebViewExt = <WebViewExt>webargs.object;
    vm.set("result", "WebView is still loading...");
    vm.set("enabled", false);

    if (isAndroid) {
        debugger;
        //let myWebChromeClient: EcapWebChromeClient = new EcapWebChromeClient();
        //webview.android.setWebChromeClient(myWebChromeClient);
        if (android.os.Build.VERSION.SDK_INT >= 21) {
            android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webview.android, true);
        } else {
            android.webkit.CookieManager.getInstance().setAcceptCookie(true);
        }
        webview.android.getSettings().setJavaScriptEnabled(true);
        webview.android.getSettings().setBuiltInZoomControls(false);
        webview.android.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
        webview.android.getSettings().setAllowFileAccess(true);
        webview.android.getSettings().setPluginsEnabled(true);webview.android.getSettings().setAllowContentAccess(true);
        webview.android.getSettings().setAllowFileAccess(true);
        webview.android.getSettings().setAllowFileAccessFromFileURLs(true);
        webview.android.getSettings().setAllowUniversalAccessFromFileURLs(true);
        webview.android.getSettings().setDomStorageEnabled(true);
    }
    webview.on(WebViewExt.loadFinishedEvent, (args: LoadEventData) => {
        let message = "";
        debugger;
        if (!args.error) {
            message = `WebView finished loading of ${args.url}`;
        } else {
            message = `Error loading ${args.url} : ${args.error}`;
        }

        vm.set("result", message);
        vm.set('isWebViewLoading', false);
        console.log(`WebView message - ${message}`);
    });
}

// going to the previous page if such is available
export function goBack(args) {
    const page: Page = <Page>args.object.page;
    const vm = page.bindingContext;
    const webview: WebViewExt = <WebViewExt>page.getViewById("myWebView");
    if (webview.canGoBack) {
        webview.goBack();
        vm.set("enabled", true);
    }
}

// going forward if a page is available
export function goForward(args) {
    const page: Page = <Page>args.object.page;
    const vm = page.bindingContext;
    const webview: WebViewExt = <WebViewExt>page.getViewById("myWebView");
    if (webview.canGoForward) {
        webview.goForward();
    } else {
        vm.set("enabled", false);
    }
}

// changing WebView source
export function submit(args) {
    const page: Page = <Page>args.object.page;
    const vm = page.bindingContext;
    const textField: TextField = <TextField>args.object;
    const text = textField.text;
    vm.set("enabled", false);
    if (text.substring(0, 4) === "http") {
        vm.set("webViewSrc", text);
        textField.dismissSoftInput();
    } else {
        dialogs.alert("Please, add `http://` or `https://` in front of the URL string")
            .then(() => {
                console.log("Dialog closed!");
            });
    }
}

/*
export class EcapWebChromeClient extends android.webkit.WebChromeClient {
    file_path: string;
    public readonly INPUT_FILE_REQUEST_CODE = 101;
    private mediafilepicker: Mediafilepicker;
    private selectedFiles: any = [];
    constructor() {
        super();
        this.mediafilepicker = new Mediafilepicker();
        return global.__native(this);
    }
    onShowFileChooser(webView, filePathCallback, fileChooserParams) {
        console.log('fileChooserParams', fileChooserParams.getMode());
        console.log('fileChooserAcceptTypes', fileChooserParams.getAcceptTypes()[0]);
        this.filepathCallbackFn(filePathCallback, fileChooserParams);
        return true;
    }

    filepathCallbackFn(filePathCallback, fileChooserParams) {
        console.log('filepathCallbackFn filePathCallback', filePathCallback);

        let extensions = [];
        let maxNumberFiles = 0;
        let multipleSelection = false;

        if (fileChooserParams.getMode() == 0) {
            maxNumberFiles = 1;
        } else {
            maxNumberFiles = 20;
            multipleSelection = true;
        }

        if (fileChooserParams.getAcceptTypes()[0].includes("image")) {
            extensions = ['jpeg', 'jpg', 'png'];

            let imageOptions: ImagePickerOptions = {
                android: {
                    isCaptureMood: false, // if true   then camera will open directly.
                    isNeedCamera: true,
                    maxNumberFiles: maxNumberFiles,
                    isNeedFolderList: false
                }, ios: {
                    isCaptureMood: true, // if true then camera will open directly.
                    maxNumberFiles: maxNumberFiles
                }
            };

            this.mediafilepicker.openImagePicker(imageOptions);
        } else {
            extensions = ['txt', 'pdf', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'doc', 'docx'];

            let fileOptions: FilePickerOptions = {
                android: {
                    extensions: extensions,
                    maxNumberFiles: maxNumberFiles
                },
                ios: {
                    extensions: extensions,
                    multipleSelection: multipleSelection
                }
            };

            this.mediafilepicker.openFilePicker(fileOptions);
        }

        this.mediafilepicker.on("getFiles", (res) => {
            let results = res.object.get('results');
            this.selectedFiles = results;
            if (this.selectedFiles.length) {
                this.startSelection(this.selectedFiles, filePathCallback);
            }
        });

        this.mediafilepicker.on("error", (res) => {
            let msg = res.object.get('msg');
            console.log('error======>', msg);
            filePathCallback.onReceiveValue(null);
        });

        this.mediafilepicker.on("cancel", (res) => {
            let msg = res.object.get('msg');
            console.log('cancel========>', msg);
            filePathCallback.onReceiveValue(null);
        });
    }

    startSelection(selectedFiles, filePathCallback) {
        let results = Array.create(android.net.Uri, selectedFiles.length);
        selectedFiles.forEach((selected, index) => {
            let path = selected.file;
            let file = fs.File.fromPath(path);
            this.file_path = file.path;
            this.file_path = "file:" + this.file_path;
            const dataUri = android.net.Uri.parse(this.file_path);
            results[index] = dataUri;
        });
        filePathCallback.onReceiveValue(results);
        filePathCallback = null;
    }
}
*/

// << setting-url-webview-ts

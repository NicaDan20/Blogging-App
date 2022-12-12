FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode
)

FilePond.setOptions({
    stylePanelAspectRatio: 1/2,
    imageResizeTargetWidth: 280,
    imageResizeTargetHeight: 420,
    imageResizeUpscale: false,
    allowFileSizeValidation: true,
    maxFileSize: "50MB"
})

FilePond.parse(document.body)
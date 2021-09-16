function FileUploader(input, module, moduleId, files, settings)
{
    this.module = module;
    this.moduleId = moduleId;
    this.files = files;
    this.uploadedFiles = [];

    var defaults = {
        limit : null,
        maxSize : 5,
        images : false,
        showThumbs: true,
        extensions : null,
        removeConfirmation: true
    };
    this.settings = $.extend({}, defaults, settings || {});
    this.template = settings.template;
    this.callbacks = settings.callbacks;
    this.jFiler = this.initFiler(input, this.settings);
}

FileUploader.prototype.setEvents = function(events)
{
    this.events = {
        onFileAdded: events.onFileAdded || null,
        onFileRemoved: events.onFileRemoved || null
    };
};

FileUploader.prototype.initFiler = function(input, settings)
{
    var result = input.fileuploader({
        changeInput: this.template.changeInput || true,
        theme: this.template.theme || null,
        showThumbs: this.settings.showThumbs,
        addMore: false,
        limit: settings.limit,
        files: this.files,
        maxSize: settings.maxSize,
        extensions: settings.images ? ["jpg", "jpeg", "png", "gif"] : settings.extensions,
        enableApi: true,
        thumbnails: {
            box: this.template.thumbnails.box || '',
            item: this.template.thumbnails.item || '',
            item2: this.template.thumbnails.item2 || '',
            removeConfirmation: this.settings.removeConfirmation
        },
        upload: {
            url: '/files/upload.json',
            data: { 'field': input.attr('name'), 'module': this.module, 'module_id': this.moduleId },
            type: 'POST',
            start: true,
            enctype: 'multipart/form-data',
            onSuccess: $.proxy(this.onSuccess, this),
            onError: $.proxy(this.onError, this),
            onProgress: this.callbacks.upload.onProgress || null
        },
        onRemove: $.proxy(this.onRemove, this),
        dialogs: {
            alert: this.callbacks.dialogs.alert || null,
            confirm: this.callbacks.dialogs.confirm || null
        },
        captions: {
            feedback: this.template.captions.feedback || '',
            feedback2: this.template.captions.feedback2 || '',
            drop: this.template.captions.drop || ''
        }
    });

    return $.fileuploader.getInstance(result);
};

FileUploader.prototype.clear = function()
{
    this.uploadedFiles = [];
    this.jFiler.reset();
};

FileUploader.prototype.onSuccess = function(data, item)
{
    var file = data.files[0];
    if(file.id === null)
    {
        return this.onError(item);
    }

    item.db_id = file.id; // Add id to jFiler file info
    this.uploadedFiles.push(file.id);

    if(this.events.onFileAdded)
    {
        this.events.onFileAdded(file.id);
    }

    if(this.callbacks.upload.onSuccess)
    {
        this.callbacks.upload.onSuccess(data, item);
    }
};

FileUploader.prototype.onError = function(item)
{
    if(this.callbacks.upload.onError)
    {
        this.callbacks.upload.onError(item);
    }
};

FileUploader.prototype.onRemove = function(item, file)
{
    var id = item.db_id;
    var index = this.uploadedFiles.indexOf(id);
    if(index >= 0)
    {
        this.uploadedFiles.splice(index, 1);
    }

    $.post('/files/remove.json', {file_id: id});

    if(this.events.onFileRemoved)
    {
        this.events.onFileRemoved(id);
    }

    if(this.callbacks.upload.onRemove)
    {
        this.callbacks.upload.onRemove(item, file);
    }

    return true;
};
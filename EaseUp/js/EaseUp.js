(function (window) {
    
    var EaseUp = new (function () {
        'use strict';
        var self = this,
            initialized = false;
            
        
        /************************INIT**********************************/
        
        var options = {
            uploadUrl: 'EaseUp.php', // used to upload individual items
            updateUrl: 'EaseUp.db.php', // used to push info to database
            callback: 'thanks-for-uploading.html', // callback for once upload is finished
            allowed: ['png', 'jpg', 'mp4', 'avi'], // array of allowed filetypes
            maxFilesize: 16777216, // in bytes (default: 16 MB)
            useTitle: false, // title for entire upload
            useDescription: false, // description for entire upload
            accountName: '', // dynamic account name of user
            titles: true, // title for individual items
            detailsType: 'description', // details for individual items, possibilities are 'description', 'checklist', 'radios', 'none'
            maxItems: 8, // max number of children for each parent
            custom: { // variables for customization
                title: "Create Lesson",
                titlePlaceholder: "Lesson Title",
                descriptionPlaceholder: "Add a description of your lesson here!",
                submitText: "Create"
            }
        };
        
        self.init = function (args) {
            if (initialized) { // required for security
                return;
            } else {
                for (var prop in args) {
                    options[prop] = args[prop];
                }
                initialized = true;
            }
        };
        
        // insert DOM elements
        document.addEventListener('DOMContentLoaded',function(){
            var content = document.getElementById('EaseUp');
            content.setAttribute('class', 'panel panel-primary');
            
            var ezupContent = '<div class="panel-heading" style="text-align:center"><h1>' + options.custom.title + '</h1></div><div class="panel-body"><form action="" method="post" enctype="multipart/form-data">';
                
            if (options.useTitle) {
                ezupContent += '<div class="form-group"><input type="text" class="form-control" placeholder="' + options.custom.titlePlaceholder + '"></div>';
            }
            if (options.useDescription) {
                ezupContent += '<div class="form-group"><textarea class="form-control" placeholder="' + options.custom.descriptionPlaceholder + '" rows="3" style="resize:none"></textarea></div>';
            }
                
            ezupContent += '<div class="panel panel-default"><div class="panel-heading"><a href="javascript:void(0);" onclick="EaseUp.removeAll()" id="ezup-remove-all" class="btn btn-danger btn-xs" style="visibility:hidden"><i class="ion-close"></i> Remove All</a>' +
                '</div><div class="panel-body" id="ezup-items" droppable="true"><div id="ezup-add-item" onclick="EaseUp.addFile()"><i class="ion-plus" title="Add an item"></i></div>' +
                '<span class="help-block" style="pointer-events:none">Drag files here or click the button above to upload!</span></div><input id="ezup-files-temp" type="file" accept="' + getMIMEtypes() + '" onchange="EaseUp.fileInputHandler(this)" style="display:none" multiple /></div><button type="submit" id="ezup-submit" class="btn btn-primary disabled" disabled>' + options.custom.submitText + '</button>' +
                '<p class="pull-right text-muted"><small>Form by EaseUp</small></p></form></div>';
                
            content.innerHTML = ezupContent;
            
            var filedrag = document.getElementById('ezup-items');
            filedrag.addEventListener("dragover", self.fileDragHover, false);
    		filedrag.addEventListener("dragleave", self.fileDragHover, false);
    		filedrag.addEventListener("drop", self.fileDropHandler, false);
        });
        
        /*************************Internal Functions*********************************/
        
        function getMIMEtypes () {
            var mimes = [];
            for (var i = 0; i < options.allowed.length; i++) {
                switch (options.allowed[i]) {
                    /****************Image***************/
                    case 'png':
                        mimes.push('image/x-png');
                        break;
                    case 'jpg':
                    case 'jpeg':
                        mimes.push('image/jpeg');
                        break;
                    case 'gif':
                        mimes.push('image/gif');
                        break;
                    case 'svg':
                        mimes.push('image/svg+xml');
                        break;
                    case 'ico':
                        mimes.push('image/x-icon');
                        break;
                        
                    /****************Video***************/
                    case 'flv':
                        mimes.push('video/x-flv');
                        break;
                    case 'mp4':
                        mimes.push('video/mp4');
                        break;
                    case '3gp':
                        mimes.push('video/3gpp');
                        break;
                    case 'mov':
                        mimes.push('video/quicktime');
                        break;
                    case 'avi':
                        mimes.push('video/x-msvideo');
                        break;
                    case 'ogv':
                        mimes.push('video/ogg');
                        break;
                    
                    /****************Audio***************/
                    case 'webm':
                        mimes.push('audio/webm');
                        break;
                    case 'aac':
                        mimes.push('audio/x-aac');
                        break;
                    case 'wma':
                        mimes.push('audio/x-ms-wma');
                        break;
                    case 'wav':
                        mimes.push('audio/x-wav');
                        break;
                    case 'mp3':
                        mimes.push('audio/mp3');
                        break;
                        
                    default:
                        break;
                }
            }
            mimes.join(', ');
            return mimes;
        }
        
        function getFileCategory (ext) {
            var category = '';
            switch (ext) {
                /****************Image***************/
                case 'png':
                case 'jpg':
                case 'jpeg':
                case 'gif':
                case 'svg':
                case 'ico':
                    category = 'image';
                    break;
                    
                /****************Video***************/
                case 'flv':
                case 'mp4':
                case '3gp':
                case 'mov':
                case 'avi':
                case 'ogv':
                    category = 'video';
                    break;
                
                /****************Audio***************/
                case 'webm':
                case 'aac':
                case 'wma':
                case 'wav':
                case 'mp3':
                    category = 'audio';
                    break;
                    
                default:
                    break;
            }
            return category;
        }
        
        function roundToTwo (num) {  // rounds a number to two decimal places
            return +(Math.round(num + "e+2")  + "e-2");
        }
    
        function formatByteSize (bytes) {  // format bytes into KB, MB, GB dynamically
            var sizes = ['bytes', 'KB', 'MB', 'GB'];
            if (bytes == 0) return '0 bytes';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return roundToTwo(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        }
        
        self.throwError = function (error) {
            console.log(error);
        };
        
        /************************DOM Manipulation**********************************/
        
        self.openOptions = function (options, type) {
            options.style.display = 'block';
            
            switch (type) {
                case 'delete':
                    options.innerHTML = '<a href="javascript:void(0)" onclick="EaseUp.closeOptions(this.parentNode)" class="btn btn-default" title="Cancel">Cancel</a><a href="javascript:void(0)" onclick="EaseUp.deleteItem(this.parentNode.parentNode.parentNode)" class="btn btn-danger" title="Delete">Delete</a>';
                    break;
                case 'edit':
                    options.innerHTML = '<a href="javascript:void(0)" onclick="EaseUp.closeDetails(this.parentNode, \'cancel\')" class="btn btn-default" title="Cancel">Cancel</a><a href="javascript:void(0)" onclick="EaseUp.closeDetails(this.parentNode, \'save\')" class="btn btn-success" title="Save changes">Save</a>';
                    
                    var details = options.parentNode.querySelector('textarea.ezup-description');
                    details.style.opacity = '1';
                    details.style.pointerEvents = 'auto';
                    break;
                default:
                    break;
            }
        };
        
        self.deleteItem = function (item) {
            item.parentNode.removeChild(item);
            self.checkItemsLength();
        };
        
        self.removeAll = function () {
            if(confirm('Are your sure you want to DELETE ALL items?')) {
                var items = document.querySelectorAll('.ezup-item');
                for (var i = 0; i < items.length; i++) {
                    self.deleteItem(items[i]);
                }
            }
        };
        
        self.closeOptions = function (options) {
            options.style.display = 'none';
        };
        
        self.closeDetails = function (options, type) {
            var description = options.parentNode.querySelector('textarea.ezup-description');
            var details = options.parentNode.querySelector('input[type="hidden"]');
            
            (type == 'save') ? details.value = description.value : description.value = details.value;
            
            description.style.opacity = '0';
            description.style.pointerEvents = 'none';
            self.closeOptions(options);
        };
        
        self.checkItemsLength = function () {
            var items = document.getElementById('ezup-items'),
                submit = document.getElementById('ezup-submit'),
                deleteAll = document.getElementById('ezup-remove-all');
            
            if (items.children.length > 2) { // items exist
                items.children[items.children.length - 1].style.display = 'none'; // hide helper text
                submit.className = 'btn btn-primary';
                submit.removeAttribute('disabled');
                deleteAll.setAttribute('style', 'visibility:visible');
                
                if ((items.children.length - 2) >= options.maxItems) { // max items reached
                    items.children[items.children.length - 2].style.display = 'none'; // hide add button
                    items.setAttribute('droppable', 'false'); // dont allow items to be dropped
                } else {
                    items.children[items.children.length - 2].style.display = 'inline-block'; // show add button
                    items.setAttribute('droppable', 'true'); // allow items to be dropped
                }
                return true;
            }
            
            items.children[items.children.length - 1].style.display = 'block'; // show helper text
            items.children[items.children.length - 2].style.display = 'inline-block'; // show add button
            submit.className = 'btn btn-primary disabled';
            submit.setAttribute('disabled', '');
            deleteAll.setAttribute('style', 'visibility:hidden');
            items.setAttribute('droppable', 'true'); // allow items to be dropped
            return false;
        };
        
        self.createItem = function (imgSrc) {
            var newItem = '<div class="ezup-item"><div class="form-group"><input class="form-control ezup-title" type="text" name="title" placeholder="Title" /></div><div class="ezup-body"><div class="btn-group btn-group-justified ezup-controls" role="group"><a href="javascript:void(0);" onclick="EaseUp.openOptions(this.parentNode.nextSibling, \'delete\')" class="btn btn-danger" title="Delete Item"><i class="ion-close"></i></a>';
            if (options.detailsType != '' || options.detailsType == 'none') { // if details are allowed
                newItem += '<a href="javascript:void(0);" onclick="EaseUp.openOptions(this.parentNode.nextSibling, \'edit\')" class="btn btn-success" title="Edit Details"><i class="ion-edit"></i></a>';
            }
            
            newItem += '</div><div class="btn-group btn-group-justified ezup-controls" role="group" style="display:none;opacity:1"></div>';
            
            if (options.detailsType == 'description') {
                newItem += '<div class="form-group"><textarea class="form-control ezup-description" name="description" placeholder="Description"></textarea><input type="hidden" name="details" /></div>';
            } else if (options.detailsType == 'checklist') {
                // checklist
            } else if (options.detailsType == 'radios') {
                // radio list
            }
            
            newItem += '<img src="' + imgSrc +'" class="img-rounded ezup-img" /></div></div>';
            
            document.getElementById('ezup-add-item').insertAdjacentHTML('beforebegin', newItem);
            
            self.checkItemsLength();
        };
        
        /************************File Handling**********************************/
        
        self.parseFile = function (file) {
            var filename = file.name,
                fileExt = filename.split('.')[filename.split('.').length - 1].toLowerCase(),
                fileCategory = getFileCategory(fileExt);
            
            // decide whether to render an image thumbnail or video thumbnail
            if (fileCategory == 'video') { // render video thumbnail
                var video = document.createElement('video');
                var reader = new FileReader();
                reader.onload = function (e) {
                    video.setAttribute('src', e.target.result);
                };
                reader.readAsDataURL(file);
                video.currentTime = 4.5;
                
                var canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 360;
                var ctx = canvas.getContext('2d');
                video.onloadeddata = function(){
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    var dataURI = canvas.toDataURL('image/jpeg');
                    self.createItem(dataURI);
                };
                video.remove();
                canvas.remove();
            } else if (fileCategory == 'image') { // render image
                var reader = new FileReader();
                reader.onload = function (e) {
                    self.createItem(e.target.result);
                };
                reader.readAsDataURL(file);
            } else if (fileCategory == 'audio') { // give default audio image
                self.createItem('EaseUp/images/audio.jpg');
            } else { // give default image
                self.createItem('EaseUp/images/default.jpg');
            }
        };
        
        self.checkFiles = function (files) {
            var items = document.getElementById('ezup-items'),
                itemsUsed = items.children.length - 2;
            
            if ((itemsUsed + files.length) > options.maxItems) {
                self.throwError('You have selected too many items! The max number of files is ' + options.maxItems);
            }
            for (var i = 0; i < Math.min(files.length, (options.maxItems - itemsUsed)); i++) {
                var file = files[i],
                    filename = file.name,
                    fileExt = filename.split('.')[filename.split('.').length - 1].toLowerCase();
                
                if (options.allowed.indexOf(fileExt) === -1) { // if file type is not allowed
                    self.throwError('That file type is not allowed!');
                } else {
                    if (file.size > options.maxFilesize) { // if file size is not allowed
                        self.throwError('That file size is too large! The max file size is ' + formatByteSize(options.maxFilesize));
                    } else {
                        self.parseFile(file);
                    }
                }
            }
        };
        
        self.fileInputHandler = function (fileInput) {
            var files = fileInput.files;
            self.checkFiles(files);
        };
        
        self.fileDropHandler = function (e) {
            self.fileDragHover(e);
            var dropTarget = document.getElementById('ezup-items');
        	if (dropTarget.getAttribute('droppable')) {
            	var files = e.target.files || e.dataTransfer.files;
            	self.checkFiles(files);
        	}
        };
        
        self.fileDragHover = function (e) {
        	e.stopPropagation();
        	e.preventDefault();
        	var dropTarget = document.getElementById('ezup-items');
        	if (dropTarget.getAttribute('droppable')) {
            	if (e.target === dropTarget || 
            	    e.target === document.getElementById('ezup-add-item') ||
            	    e.target === document.getElementById('ezup-add-item').childNodes[0]) {
            	        dropTarget.style.border = (e.type == "dragover" ? "2px dashed blue" : "none");
            	}
        	}
        };
        
        self.addFile = function () {
            var fileInput = document.getElementById('ezup-files-temp');
            fileInput.click();
        };
        
        return self;
    })();
    
    window.EaseUp = EaseUp;
})(window);
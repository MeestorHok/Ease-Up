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
            maxItems: 4, // max number of children for each parent
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
        
        self.openFileWindow = function (parent) {
            parent.children[parent.children.length-1].click();
        };
        
        self.deleteItem = function (item) {
            item.parentNode.removeChild(item);
            self.checkItemsLength();
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
            var items = document.getElementById('ezup-items');
            
            if (items.children.length > 2) {
                items.children[items.children.length - 1].style.display = 'none'; // hide helper text
                
                if ((items.children.length - 2) >= options.maxItems) {
                    items.children[items.children.length - 2].style.display = 'none'; // hide add button
                } else {
                    items.children[items.children.length - 2].style.display = 'inline-block'; // show add button
                }
                return true;
            }
            
            items.children[items.children.length - 1].style.display = 'block'; // show helper text
            items.children[items.children.length - 2].style.display = 'inline-block'; // show add button
            return false;
        };
        
        self.updateImage = function (fileInput, img) {
            var file = fileInput.files[0],
                filesize = file.size,
                filename = file.name,
                fileExt = filename.split('.')[filename.split('.').length - 1].toLowerCase(),
                fileCategory = getFileCategory(fileExt);
            
            if (filesize > options.maxFilesize) {
                self.throwError('That file is too large!');
                return;
            }
            if (options.allowed.indexOf(fileExt) === -1) {
                self.throwError('That file type is not allowed!');
                return;
            }
            
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
                    img.setAttribute('src', dataURI);
                };
                video.remove();
                canvas.remove();
            } else if (fileCategory == 'image') { // render image
                var reader = new FileReader();
                reader.onload = function (e) {
                    img.setAttribute('src', e.target.result);
                };
                reader.readAsDataURL(file);
            } else if (fileCategory == 'audio') {
                img.setAttribute('src', 'EaseUp/images/audio.jpg');
            }
            
            img.setAttribute('alt', filename);
            img.setAttribute('title', filename + ' | ' + formatByteSize(filesize));
        };
        
        self.addItem = function (addButton) {
            var newItem = '<div class="ezup-item"><div class="form-group"><input class="form-control ezup-title" type="text" name="title" placeholder="Title" /></div><div class="ezup-body"><div class="btn-group btn-group-justified ezup-controls" role="group"><a href="javascript:void(0);" onclick="EaseUp.openOptions(this.parentNode.nextSibling, \'delete\')" class="btn btn-danger" title="Delete Item"><i class="ion-close"></i></a>';
            if (options.detailsType != '' || options.detailsType == 'none') { // if details are allowed
                newItem += '<a href="javascript:void(0);" onclick="EaseUp.openOptions(this.parentNode.nextSibling, \'edit\')" class="btn btn-warning" title="Edit Details"><i class="ion-edit"></i></a>';
            }
            
            newItem += '<a href="javascript:void(0);" onclick="EaseUp.openFileWindow(this.parentNode.parentNode)" class="btn btn-primary" title="Change File"><i class="ion-arrow-swap"></i></a></div><div class="btn-group btn-group-justified ezup-controls" role="group" style="display:none;opacity:1"></div>';
            
            if (options.detailsType == 'description') {
                newItem += '<div class="form-group"><textarea class="form-control ezup-description" name="description" placeholder="Description"></textarea><input type="hidden" name="details" /></div>';
            } else if (options.detailsType == 'checklist') {
                // checklist
            } else if (options.detailsType == 'radios') {
                // radio list
            }
            
            newItem += '<img src="EaseUp/images/default.jpg" class="img-rounded ezup-img" /><input name="file" type="file" accept="' + getMIMEtypes() + '" onchange="EaseUp.updateImage(this, this.previousSibling)" style="display:none"></div></div>';
            
            addButton.insertAdjacentHTML('beforebegin', newItem);
            
            var parent = addButton.parentNode,
                item = parent.children[parent.children.length - 3],
                body = item.lastChild;
            
            body.children[body.children.length - 1].click();
            
            self.checkItemsLength();
        };
        
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
                
            ezupContent += '<div class="panel panel-default"><div class="panel-heading"><ul class="nav nav-pills">' +
                    '<li><a href="javascript:void(0);">afgsdf</a></li>' +
                    '<li><a href="javascript:void(0);">sdfgsdfg</a></li>' +
                    '<li><a href="javascript:void(0);">afgsdf</a></li>' +
                '</ul></div><div class="panel-body" id="ezup-items"><div class="ezup-add-item" onclick="EaseUp.addItem(this)"><i class="ion-plus" title="Add an item"></i></div>' +
                '<span class="help-block">Add a file to upload!</span></div></div><button type="submit" class="btn btn-primary">' + options.custom.submitText + '</button>' +
                '<p class="pull-right text-muted"><small>Form by <a href="#">EaseUp</a></small></p></form></div>';
            content.innerHTML = ezupContent;
        });
        
        return self;
    })();
    
    window.EaseUp = EaseUp;
})(window);
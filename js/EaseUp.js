(function (window) {
    "use strict";
    
    var EaseUp = new (function () {
        
        var self = this,
            initialized = false; // this prevents the user from being able to call init from devtools. Prevents the ability to upload files that are not permitted.
            
        var options = {
            uploadUrl: 'EaseUp.php', // used to upload individual items
            updateUrl: 'EaseUp.db.php', // used to push info to database
            callback: 'thanks-for-uploading.html', // callback for once upload is finished
            allowed: ['png', 'jpg', 'jpeg'], // array of allowed filetypes
            maxFilesize: 16777216, // in bytes (default: 16 MB)
            title: false, // title for entire upload
            description: false, // description for entire upload
            accountName: '', // dynamic account name of user
            
            titles: false, // title for individual items
            detailsType: '', // details for individual items, possibilities are 'description', 'checklist', 'radio'
            maxDepth: 4, // depth of sub items, 0 means just top-level
            maxChildren: 4 // max number of children for each parent
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
        
        /******************************DOM MANIPULATION********************************/
        
        function getMIMEtypes (types) {
            var mimes = [];
            for (var i = 0; i < types.length; i++) {
                switch (types[i]) {
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
                        
                    /****************Application***************/
                    case 'pdf':
                        mimes.push('application/pdf');
                        break;
                    default:
                        break;
                }
            }
            mimes.join(', ');
            return mimes;
        }
        
        self.addItem = function (thisItem) {  // add item to parent
            var item = thisItem.parentNode,
                itemId = item.getAttribute('ezup-id') || '0',
                idBroken = itemId.split('-'),
                itemNum = parseInt(idBroken.pop()),
                itemDepth = parseInt(item.getAttribute('ezup-depth')) || 0;
            
            if (itemId === '0') {
                itemId = '0';
                item.setAttribute('ezup-id', '0');
            }
            item.innerHTML = ''; // empty the item before we add to it
            
            /******************************LABEL************************************/
            
            var inputsGroup = document.createElement('div');
            inputsGroup.setAttribute('class', 'form-group ezup-inputs-group');
            
            var deleteButton = document.createElement('a');
            deleteButton.setAttribute('ezup-delete', itemId);
            deleteButton.setAttribute('href', 'javascript:void(0);');
            deleteButton.setAttribute('onclick', 'EaseUp.removeNode(\'' + itemId + '\')');
            
            var deleteIcon = document.createElement('i');
            deleteIcon.setAttribute('class', 'fa fa-times text-danger');
            
            deleteButton.appendChild(deleteIcon);
            inputsGroup.appendChild(deleteButton);
            
            var itemLabel = document.createElement('label');
            itemLabel.setAttribute('for', 'ezup-title-' + itemId);
            itemLabel.setAttribute('class', 'control-label');
            itemLabel.setAttribute('ezup-label', itemId);
            itemLabel.innerHTML = ' Item ' + (itemNum + 1) + ': ';
            
            inputsGroup.appendChild(itemLabel);
            
            /******************************ITEM TITLE************************************/
            
            if (options.titles) {
                var itemTitle = document.createElement('input');
                itemTitle.setAttribute('type', 'text');
                itemTitle.setAttribute('class', 'form-control input-sm');
                itemTitle.setAttribute('placeholder', 'Item Title Here');
                itemTitle.setAttribute('name', 'ezup-title-' + itemId);
                itemTitle.setAttribute('ezup-title', itemId);
                itemTitle.setAttribute('onkeyup', 'EaseUp.displayDescription(this,\'' + itemId + '\')');
                
                inputsGroup.appendChild(itemTitle);
            }
            
            item.appendChild(inputsGroup);
            
            /******************************FILE SELECTION************************************/
            
            var filesGroup = document.createElement('div');
            filesGroup.setAttribute('class', 'ezup-files-group');
            
            var getFileButton = document.createElement('a');
            getFileButton.setAttribute('ezup-file-button', itemId);
            getFileButton.setAttribute('href', 'javascript:void(0);');
            getFileButton.setAttribute('onclick', 'this.lastChild.click()');
            
            var getFileContainer = document.createElement('div');
            getFileContainer.setAttribute('style', 'display:inline-block');
            
            var getFileIcon = document.createElement('i');
            getFileIcon.setAttribute('class', 'fa fa-plus');
            
            getFileContainer.appendChild(getFileIcon);
            
            var addFileText = document.createElement('span');
            addFileText.innerHTML = ' Add File';
            
            getFileContainer.appendChild(addFileText);
            getFileButton.appendChild(getFileContainer);
            
            var fileInput = document.createElement('input');
            fileInput.setAttribute('class', 'ezup-file');
            fileInput.setAttribute('ezup-file', itemId);
            fileInput.setAttribute('name', 'ezup-file-' + itemId);
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute('accept', getMIMEtypes(options.allowed));
            fileInput.setAttribute('onchange', 'EaseUp.changeInputFiles(this,\'' + itemId + '\')');
            fileInput.setAttribute('style', 'display:none');
            
            getFileButton.appendChild(fileInput);
            filesGroup.appendChild(getFileButton);
            
            /******************************ITEM FEEDBACK************************************/
            
            var feedback = document.createElement('div');
            feedback.setAttribute('class', 'ezup-feedback');
            feedback.setAttribute('ezup-feedback', itemId);
            feedback.setAttribute('style', 'display:none');
            
            filesGroup.appendChild(feedback);
            
            /******************************UPLOAD PROGRESS************************************/
            
            var thumbnails = document.createElement('div');
            thumbnails.setAttribute('ezup-thumbs', itemId);
            thumbnails.setAttribute('style', 'display:inline-block');
            
            filesGroup.appendChild(thumbnails);
            
            item.appendChild(filesGroup);
            
            /******************************DESCRIPTION************************************/
            if (options.detailsType === 'description') {
                var descriptionContainer = document.createElement('div');
                descriptionContainer.setAttribute('class', 'form-group');
                descriptionContainer.setAttribute('style', 'display:block;border-left:1px dashed #ddd');
                
                var description = document.createElement('textarea');
                description.setAttribute('class', 'form-control ezup-description');
                description.setAttribute('ezup-description', itemId);
                description.setAttribute('name', 'ezup-description-' + itemId);
                description.setAttribute('placeholder', 'Write a description of this item.');
                
                descriptionContainer.appendChild(description);
                item.appendChild(descriptionContainer);
            } else if (options.detailsType === 'checklist') {
                // add checklist
            } else if (options.detailsType === 'radiolist') {
                // add radio list
            }
            
            /******************************SUB-ITEMS LIST**********************************/
            
            var subItems = document.createElement('div');
            subItems.setAttribute('class', 'ezup-items');
            subItems.setAttribute('ezup-items', itemId);
            subItems.setAttribute('style', 'padding-left:2em;border-left:1px dashed #ddd');
            
            if (itemDepth < options.maxDepth) {
                newItemId = itemId + '-0';
                var subItem = document.createElement('div');
                subItem.setAttribute('class', 'ezup-item');
                subItem.setAttribute('ezup-id', newItemId);
                subItem.setAttribute('ezup-depth', (itemDepth + 1));
                subItem.innerHTML = '<a href="javascript:void(0);" onclick="EaseUp.addItem(this)"><i class="fa fa-plus"></i> Add Item</a>';
                
                subItems.appendChild(subItem);
            }
            
            item.appendChild(subItems);
            
            /******************************NEXT ITEM BUTTON************************************/
            
            if (item.parentNode.children.length < options.maxChildren) {
                idBroken.push((itemNum + 1).toString());
                var newItemId = idBroken.join('-');
                
                var newItem = document.createElement('div');
                newItem.setAttribute('class', 'ezup-item');
                newItem.setAttribute('ezup-id', newItemId);
                newItem.setAttribute('ezup-depth', itemDepth);
                newItem.innerHTML = '<a href="javascript:void(0);" onclick="EaseUp.addItem(this)"><i class="fa fa-plus"></i> Add Item</a>';
                
                item.parentNode.appendChild(newItem);
            }
        };
        
        self.removeNode = function (nodeId) {  // remove a node from its parent
            var node = document.querySelector('[ezup-id=\'' + nodeId + '\']');
            var parent = node.parentNode;
            parent.removeChild(node);
            
            if (parent.lastChild.children.length > 1) { // if there is no add item button,
                if (parent.children.length < options.maxChildren) { // if we can add an add item button
                    var newItem = document.createElement('div');
                    newItem.setAttribute('class', 'ezup-item');
                    newItem.setAttribute('ezup-depth', (parent.getAttribute('ezup-depth') || '0'));
                    newItem.innerHTML = '<a href="javascript:void(0);" onclick="EaseUp.addItem(this)"><i class="fa fa-plus"></i> Add Item</a>';
                    
                    parent.appendChild(newItem);
                }
            }
            self.reNumber();
        };
    
        self.reNumber = function () {  // renumbers the elements in a hierarchy after an element has been removed
            var parent = document.getElementById('ezup-items');
            
            var follow = function (parent) {
                var i = 0,
                    children = parent.children,
                    id = parent.getAttribute('ezup-items');
                
                if (id === null) id = '';
                
                while(i < children.length) {
                    var node = children[i],
                        oldId = node.getAttribute('ezup-id'),
                        newId = id;
                    
                    // only add the '-' if there is something before it
                    (newId === '') ?
                        newId += i.toString() :
                        newId += '-' + i.toString();
                        
                    // rename individual components of item
                    node.setAttribute('ezup-id', newId);
                    
                    var deleteButton = node.querySelector('[ezup-delete=\'' + oldId + '\']');
                    if (deleteButton) { // check if this exists
                        deleteButton.setAttribute('ezup-delete', newId);
                        deleteButton.setAttribute('onclick', 'EaseUp.removeNode(\'' + newId + '\')');
                    }
                    
                    var label = node.querySelector('[ezup-label=\'' + oldId + '\']');
                    if (label) { // check if this exists
                        label.setAttribute('ezup-label', newId);
                        label.innerHTML = ' Item ' + (i + 1) + ': ';
                    }
                    
                    var title = node.querySelector('input[ezup-title=\'' + oldId + '\']');
                    if (title) { // check if this exists
                        title.setAttribute('ezup-title', newId);
                        title.setAttribute('name', 'ezup-title-' + newId);
                        title.setAttribute('onkeyup', 'EaseUp.displayDescription(this,\'' + newId + '\')');
                    }
                    
                    var description = node.querySelector('input[ezup-description=\'' + oldId + '\']');
                    if (description) { // check if this exists
                        description.setAttribute('ezup-description', newId);
                        description.setAttribute('name', 'ezup-description-' + newId);
                    }
                    
                    var file = node.querySelector('input[ezup-file=\'' + oldId + '\']');
                    if (file) { // check if this exists
                        file.setAttribute('ezup-file', newId);
                        file.setAttribute('name', 'ezup-file-' + newId);
                        file.setAttribute('onchange', 'EaseUp.changeInputFiles(this,\'' + newId + '\')');
                    }
                    
                    var feedback = node.querySelector('[ezup-feedback=\'' + oldId + '\']');
                    if (feedback) { // check if this exists
                        feedback.setAttribute('ezup-feedback', newId);
                    }
                    
                    var filesBtn = node.querySelector('[ezup-file-button=\'' + oldId + '\']');
                    if (filesBtn) { // check if this exists
                        filesBtn.setAttribute('ezup-file-button', newId);
                    }
                    
                    var filesDelBtn = node.querySelector('[ezup-file-delete-button=\'' + oldId + '\']');
                    if (filesDelBtn) { // check if this exists
                        filesDelBtn.setAttribute('ezup-file-delete-button', newId);
                        filesDelBtn.setAttribute('onclick', 'EaseUp.clearFiles(\'' + newId + '\')');
                    }
                    
                    var thumbs = node.querySelector('[ezup-thumbs=\'' + oldId + '\']');
                    if (thumbs) { // check if this exists
                        thumbs.setAttribute('ezup-thumbs', newId);
                    }
                    
                    var subitems = node.lastChild;
                    if (subitems) { // check if this exists
                        subitems.setAttribute('ezup-items', newId);
                        if (subitems.children.length > 0) {
                            follow(subitems);
                        }
                    }
                    
                    i++;
                }
            };
            
            follow(parent);
        };
        
        self.displayDescription = function (thisNode, id) {  // show description for current unit or topic
            if (thisNode.value != null && thisNode.value != "") {
                document.querySelector('[ezup-description=\"' + id + '\"]').style.display = 'block';
            } else {
                document.querySelector('[ezup-description=\"' + id + '\"]').style.display = 'none';
            }
        };
    
        /********************************UPLOAD DATA************************************/
        
        var mustStay = false,
            ajaxStarted = 0,
            ajaxFinished = 0;
    
        self.warnExit = function () {  // warns user of leaving page if upload is part-way through
            if (mustStay) {
                return 'Upload in progress. Leaving now could corrupt files.';
            }
        };
        window.onbeforeunload = self.warnExit;
        
        function roundToTwo (num) {  // rounds a number to two decimal places
            return +(Math.round(num + "e+2")  + "e-2");
        }
    
        function formatByteSize (bytes) {  // format bytes into KB, MB, GB dynamically
            var sizes = ['bytes', 'KB', 'MB', 'GB'];
            if (bytes == 0) return '0 bytes';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return roundToTwo(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        }

        self.throwError = function (reason) {  // throws a controlled error
            document.getElementById('ezup-feedback').innerHTML = '<p class="alert alert-warning">' + reason + '</p>';
            document.getElementById('ezup-feedback').style.display = 'inline-block';
        };
    
        self.clearError = function () {  // clear error
            document.getElementById('ezup-feedback').innerHTML = '';
            document.getElementById('ezup-feedback').style.display = 'none';
        };
        
        self.checkErrors = function () {
            if (document.getElementById('ezup-items').children.length == 1) { // if no items exist
                self.throwError('You must choose something to upload.');
                return false;
            }
            if (options.title) { // if title is necessary
                var title = document.querySelector('input[ezup-title=\'title\']');
                if (title.value.toString() != '') { // if title is empty
                    self.throwError('You must include a title.');
                    title.parentElement.className += ' has-warning';
                    return false;
                }
            }
            if (options.description) { // if description is necessary
                var description = document.querySelector('[ezup-description=\'description\']');
                if (description.value.toString() == '') { // if description is empty
                    self.throwError('You must include a description.');
                    description.parentElement.className += ' has-warning';
                    return false;
                }
            }
            
            var items = document.querySelectorAll('div[ezup-id]');
            for (var i = 0; i < items.length; i++) { // for each item
                var item = items[i],
                    id = item.getAttribute('ezup-id'),
                    files = item.querySelector('input[ezup-file=\'' + id + '\']').files;
                
                if (files.length < 1) { // if there no files are selected
                    self.throwError('All items must include a file.');
                    return false;
                }
                
                if (options.titles) { // if item titles are required
                    if (item.querySelector('input[ezup-title=\'' + id + '\']').value.toString() == '') { // if item title is empty
                        self.throwError('All items must have a title.');
                        item.querySelector('div.form-group').className += ' has-warning';
                        return false;
                    }
                }
                
                if (options.detailsType === 'description') { // if description is necessary
                    if (item.querySelector('[ezup-description=\'' + id + '\']').value.toString() == '') { // if description is empty
                        self.throwError('All items must have a description.');
                        item.querySelector('div.form-group').className += ' has-warning';
                        return false;
                    }
                }
            }
            
            return true;
        };
        
        self.clearFiles = function (thisId) {  // clear files to be uploaded
            self.clearError(thisId);
            var thisImages = document.querySelector('[ezup-thumbs=\'' + thisId + '\']');
            var file = document.querySelector('[ezup-file=\'' + thisId + '\']');
            var button = document.querySelector('[ezup-file-button=\'' + thisId + '\']');
            
            while(thisImages.hasChildNodes()) { // empty drawn files
                thisImages.removeChild(thisImages.lastChild);
            }
            button.innerHTML = '<i class="fa fa-plus"></i><span> Add File</span>';
            
            //refresh file selector
            file.value = '';
            button.appendChild(file);
        };
        
        self.renameFile = function (file) {  // rename a file
            // get file extension
            var fileExt = file.name.split('.');
            fileExt = fileExt[fileExt.length - 1].toLowerCase();
            
            var usr = (options.accountName != '') ? options.accountName + '.' : ''; // creator
            var title = (options.title) ? document.querySelector('[ezup-title=\'title\']').value.toLowerCase().replace(/\s/g, "_") + '.' : ''; // uploads title
            
            var timestamp = Math.floor(Date.now() * 1000); // timestamp
            var rand = Math.floor(100000000 + Math.random() * 900000000).toString(); // random number
            var newFilename = usr + title + timestamp + '.' + rand + '.' + fileExt;
            
            return newFilename;
        };
            
        self.uploadFile = function (id) {  // upload an individual file
            var file = document.querySelector('[ezup-file=\'' + id + '\']').files[0],
                feedback = document.querySelector('[ezup-feedback=\'' + id + '\']'),
                newFilename = '';
                
            // error handling variables
            var fileTypeCheck = feedback.getAttribute('ftc');
            var fileSizeCheck = feedback.getAttribute('fsc');
    
            if (fileSizeCheck == 'true' && fileTypeCheck == 'true') { // if error handling is good
                mustStay = true;
                self.clearError(id);
                ajaxStarted += 1;
                // rename file
                newFilename = 'uploads/' + self.renameFile(file);
                var progress = feedback.parentElement;
                // create ajax call
                var request = new XMLHttpRequest();
                var data = new FormData();
                
                data.append('ajax', 'true');
                data.append('file', file);
                data.append('newFilename', newFilename);
                
                // called every few milliseconds, used to draw progress bar
                request.upload.addEventListener('progress', function(e){
                    if(e.lengthComputable){ //draw progress bar
                        
                        var percent = Math.round((e.loaded / e.total) * 100);
                        var amount = formatByteSize(e.loaded).toString() + ' / ' + formatByteSize(e.total).toString();
                        var container, filled, num, comparison;
                        
                        while(progress.hasChildNodes()) {
                            progress.removeChild(progress.firstChild);
                        }
                        
                        container = document.createElement('div');
                        container.setAttribute('class', 'ezup-progress-bar');
                        
                        comparison = document.createElement ('p');
                        comparison.appendChild(document.createTextNode(amount));
                        comparison.setAttribute('class', 'ezup-progress-text-left');
                        
                        num = document.createElement('p');
                        num.appendChild(document.createTextNode(percent + '%'));
                        num.setAttribute('class', 'ezup-progress-text-right');
                        
                        filled = document.createElement('div');
                        filled.setAttribute('class', 'ezup-progress');
                        filled.setAttribute('style', 'width: ' + percent + '%');
                
                        container.appendChild(comparison);
                        container.appendChild(num);
                        container.appendChild(filled);
                        progress.appendChild(container);
                    }
                });
                    
                // just error handling on the server's end
                request.upload.addEventListener('error', function(e){
                    self.throwError('Error: ' + e);
                });
            
                // used to finish and cancel upload
                request.addEventListener('readystatechange', function(e){
                    if(this.readyState == 4) { // all's good
                        if (this.status == 200) { // successfully uploaded
                            mustStay = false;
                            progress.setAttribute('style', 'display: inline-block');
                            progress.innerHTML = '<a href="'+ newFilename +'" target="_blank">Uploaded File!</a>';
                            ajaxFinished += 1;
                        } else { // if upload was cancelled
                            self.throwError('Upload failed and I don\'t know why! Please let us know about this.');
                            mustStay = false;
                        }
                    }
                });
                    
                //execute the ajax call
                request.open('POST', options.uploadUrl, true);
                request.setRequestHeader('Cache-Control', 'no-cache');
                
                progress.setAttribute('style', 'display: block');
                
                request.send(data);
                
            }
            return newFilename;
        };
        
        self.changeInputFiles = function (thisInput, thisId) {  // if a file is selected or deselected
            var thisFiles = thisInput.files,
                fileTypeCheck = false,
                fileSizeCheck = false,
                thisImages = document.querySelector('[ezup-thumbs=\'' + thisId + '\']'), // parent to draw thumbnails into
                file = document.querySelector('[ezup-file=\'' + thisId + '\']'),
                button = document.querySelector('[ezup-file-button=\'' + thisId + '\']'),
                img, span, x;
            
            if (thisFiles.length < 1) {
                self.clearFiles(thisId);
                return;
            }
            
            while(thisImages.hasChildNodes()) { //empty drawn files
                thisImages.removeChild(thisImages.firstChild);
            }
            
            var totalSize = thisFiles[0].size;
            
            // draw selected files
            var file_ext = thisFiles[0].name.split('.')[thisFiles[0].name.split('.').length - 1].toLowerCase();
            
            if (options.allowed.indexOf(file_ext) !== -1) {
                fileTypeCheck = true;
                
                img = document.createElement('img');
                img.setAttribute('class', 'ezup-files-group-img');
                img.setAttribute('title', thisFiles[0].name + ' | ' + formatByteSize(thisFiles[0].size));
                
                // decide whether to render an image thumbnail or video thumbnail
                if (file_ext == 'mp4') { // render video thumbnail
                    var video = document.createElement('video');
                    var readerV = new FileReader();
                    readerV.onload = function (e) {
                        video.setAttribute('src', e.target.result);
                    };
                    readerV.readAsDataURL(thisFiles[0]);
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
                } else { // render image
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        img.setAttribute('src', e.target.result);
                    };
                    reader.readAsDataURL(thisFiles[0]);
                }
                
                thisImages.appendChild(img);
            } else { // if filetype is not allowed
                fileTypeCheck = false;
                self.throwError('That filetype is not allowed.');
            }
            
            if (thisFiles.length > 0) { // draw the clear files button
                button.innerHTML = '<i class="fa fa-refresh"></i> <span>Change File</span>';
                button.appendChild(file);
                
                span = document.createElement('span');
                span.setAttribute('class', 'pointer text-danger');
                span.setAttribute('ezup-file-delete-button', thisId);
                span.setAttribute('onclick', 'EaseUp.clearFiles(\'' + thisId + '\')');
                
                x = document.createElement('i');
                x.setAttribute('class', 'fa fa-times');
            
                thisImages.appendChild(document.createTextNode(' ' + formatByteSize(totalSize) + ' | '));
                span.appendChild(document.createTextNode('Remove File '));
                span.appendChild(x);
                thisImages.appendChild(span);
            } else {
                button.innerHTML = '<i class="fa fa-plus"></i> <span>Add File</span>';
                button.appendChild(file);
            }
            
            if (totalSize > options.maxFileSize) { // if file size is too large
                fileSizeCheck = false;
                self.throwError('File size is too large.');
            } else {
                fileSizeCheck = true;
            }
            
            var feedback = document.querySelector('[ezup-feedback=\'' + thisId + '\']');
            feedback.setAttribute('ftc', fileTypeCheck);
            feedback.setAttribute('fsc', fileSizeCheck);
        };
    
        /******************************FINISH AND PASS RESULTS********************************/
        
        self.formatData = function () { // formats the information into JSON to be used by PHP
            var json = '{',
                parent = document.getElementById('ezup-items');
            
            if (options.accountName != '') {
                json += '"creator":"' + options.accountName + '",';
            }
            
            json += '"timestamp":"' + Math.floor(Date.now() / 1000) + '",'; // UNIX timestamp
             
            if (options.title) {
                var title = document.querySelector('[ezup-title=\'title\']').value.toString();
                json += '"title":"' + title + '",';
            }
            
            if (options.description) {
                var description = document.querySelector('[ezup-description=\'description\']').value.toString();
                json += '"description":"' + description + '",';
            }
            
            json += '"data":{';
            var follow = function (parent) {
                var i = 0,
                    children = parent.children,
                    results = '';
                
                while (i < children.length - 1) {
                    var node = children[i],
                        id = node.getAttribute('ezup-id'),
                        itemDump = '"' + i.toString() + '":{';
                    
                    if (options.titles) {
                        itemDump += '"title":"' + node.querySelector('[ezup-title=\'' + id + '\']').value.toString() + '",';
                    }
                    if (options.detailsType === 'description') {
                        itemDump += '"description":"' + node.querySelector('[ezup-description=\'' + id + '\']').value.toString() + '",';
                    }
                    
                    itemDump += '"file":"' + self.uploadFile(id) + '"';
                    
                    if (node.lastChild.children.length > 1) {
                        itemDump += ',"children":{';
                        itemDump += follow(node.lastChild);
                        
                        if (itemDump[itemDump.length - 1] == ',') {
                            itemDump = itemDump.substring(0, itemDump.length - 1);
                        }
                        itemDump += '}';
                    }
                    itemDump += '},';
                    
                    results += itemDump;
                    i++;
                }
                return results;
            };
            
            json += follow(parent);
            if (json[json.length - 1] == ',') {
                json = json.substring(0, json.length - 1);
            }
            json += '}}';
            return json;
        };
    
        self.upload = function () {  // begin upload process
            if(self.checkErrors()) { // if all errors pass
                self.clearError('feedback');
                var data = self.formatData(); // JSON formatting of data
                self.uploadToDatabase(data); // update the database
            }
        };
    
        self.uploadToDatabase = function (JSONdata) {  // send AJAX request to push upload to database
            if (ajaxStarted == ajaxFinished) {  // uploads are finished
                var request = new XMLHttpRequest();
                var data = new FormData();
                
                data.append('ajax', 'true');
                data.append('callback', options.callback);
                data.append('data', JSONdata);
                
                request.onload = function() {
                    if (request.status >= 200 && request.status < 400) { // Success!
                        document.location.href = request.responseText;
                    }
                };
                
                request.onerror = function(error) {
                    alert('Oops, there has been a problem! Error: ' + error.responseText);
                };
                
                request.open('POST', options.updateUrl, true);
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                request.send(data);
            } else {
                setTimeout(function(){ self.uploadToDatabase(JSONdata) }, 500);
            }
        };
        
        return self;
    
    })();
    
    window.EaseUp = EaseUp;
})(window);

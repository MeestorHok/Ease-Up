(function (window) {
    "use strict";
    
    var EaseUp = new (function () {
        
        var self = this,
            initialized = false; // this prevents the user from being able to call init from devtools. Prevents the ability to upload files that are not permitted.
            
        var options = {
            uploadURL: 'php/upload.php',
            databaseUpdateURL: 'php/update-database.php',
            callbackURL: 'php/thanks-for-uploading.php',
            useMacroInfo: true,
            useAccounts: true,
            accountName: 'user',
            useMicroInfo: true,
            maxDepth: 4 // depth of sub items, 0 means just top-level
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
            inputsGroup.setAttribute('class', 'ezup-inputs-group');
            
            var deleteButton = document.createElement('a');
            deleteButton.setAttribute('ezup-delete', itemId);
            deleteButton.setAttribute('href', 'javascript:void(0);');
            deleteButton.setAttribute('onclick', 'EaseUp.removeNode(\'' + itemId + '\')');
            
            var deleteIcon = document.createElement('i');
            deleteIcon.setAttribute('class', 'fa fa-times text-danger');
            
            deleteButton.appendChild(deleteIcon);
            inputsGroup.appendChild(deleteButton);
            
            var itemLabel = document.createElement('span');
            itemLabel.setAttribute('ezup-label', itemId);
            itemLabel.innerHTML = ' Item ' + (itemNum + 1) + ': ';
            
            inputsGroup.appendChild(itemLabel);
            
            /******************************ITEM TITLE************************************/
            
            if (options.useMicroInfo) {
                var itemTitle = document.createElement('input');
                itemTitle.setAttribute('type', 'text');
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
            getFileButton.setAttribute('href', 'javascript:void(0);');
            getFileButton.setAttribute('onclick', 'this.lastChild.click()');
            
            var getFileContainer = document.createElement('div');
            getFileContainer.setAttribute('style', 'display:inline-block');
            
            var getFileIcon = document.createElement('i');
            getFileIcon.setAttribute('class', 'fa fa-plus');
            
            getFileContainer.appendChild(getFileIcon);
            
            var addFileText = document.createTextNode(' Add File');
            
            getFileContainer.appendChild(addFileText);
            getFileButton.appendChild(getFileContainer);
            
            var fileInput = document.createElement('input');
            fileInput.setAttribute('class', 'ezup-file');
            fileInput.setAttribute('ezup-file', itemId);
            fileInput.setAttribute('name', 'ezup-file-' + itemId);
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute('accept', 'image/x-png, image/jpeg');
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
            
            var progressBar = document.createElement('div');
            progressBar.setAttribute('style', 'display:inline-block');
            
            filesGroup.appendChild(progressBar);
            item.appendChild(filesGroup);
            
            /******************************DESCRIPTION************************************/
            if (options.useMicroInfo) {
                var descriptionContainer = document.createElement('div');
                descriptionContainer.setAttribute('style', 'display:block');
                
                var description = document.createElement('textarea');
                description.setAttribute('class', 'ezup-description');
                description.setAttribute('ezup-description', itemId);
                description.setAttribute('name', 'ezup-description-' + itemId);
                description.setAttribute('placeholder', 'Write a description of this item.');
                
                descriptionContainer.appendChild(description);
                item.appendChild(descriptionContainer);
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
                subItem.innerHTML = '<a href="javascript:void(0);" onclick="EaseUp.addItem(this)">Add Subitem</a>';
                
                subItems.appendChild(subItem);
            }
            
            item.appendChild(subItems);
            
            /******************************NEXT ITEM BUTTON************************************/
            
            idBroken.push((itemNum + 1).toString());
            var newItemId = idBroken.join('-');
            
            var newItem = document.createElement('div');
            newItem.setAttribute('class', 'ezup-item');
            newItem.setAttribute('ezup-id', newItemId);
            newItem.setAttribute('ezup-depth', itemDepth);
            newItem.innerHTML = '<a href="javascript:void(0);" onclick="EaseUp.addItem(this)">Add Item</a>';
            
            item.parentNode.appendChild(newItem);
        };
        
        self.removeNode = function (nodeId) {  // remove a node from its parent
            //if (confirm('Are you sure you wish to delete this?')){
                var node = document.querySelector('[ezup-id=\'' + nodeId + '\']');
                var parent = node.parentNode;
                parent.removeChild(node);
                self.reNumber();
            //}
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
                    
                    var title = node.querySelector('[ezup-title=\'' + oldId + '\']');
                    if (title) { // check if this exists
                        title.setAttribute('ezup-title', newId);
                        title.setAttribute('name', 'ezup-title-' + newId);
                        title.setAttribute('onkeyup', 'EaseUp.displayDescription(this,\'' + newId + '\')');
                    }
                    
                    var description = node.querySelector('[ezup-description=\'' + oldId + '\']');
                    if (description) { // check if this exists
                        description.setAttribute('ezup-description', newId);
                        description.setAttribute('name', 'ezup-description-' + newId);
                    }
                    
                    var file = node.querySelector('[ezup-file=\'' + oldId + '\']');
                    if (file) { // check if this exists
                        file.setAttribute('ezup-file', newId);
                        file.setAttribute('name', 'ezup-file-' + newId);
                        file.setAttribute('onchange', 'EaseUp.changeInputFiles(this,\'' + newId + '\')');
                    }
                    
                    var feedback = node.querySelector('[ezup-feedback=\'' + oldId + '\']');
                    if (feedback) { // check if this exists
                        feedback.setAttribute('ezup-feedback', newId);
                    }
                    
                    var subitems = node.lastChild;
                    subitems.setAttribute('ezup-items', newId);
                    
                    if (subitems.children.length > 0) {
                        follow(subitems);
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
            errorReason = '',
            ajaxStarted = 0,
            ajaxFinished = 0;
    
        self.warnExit = function () {  // warns user of leaving page if upload is part-way through
            if (mustStay) {
                return 'Upload in progress. Leaving now could corrupt files.';
            }
        };
        window.onbeforeunload = self.warnExit;
        
        self.roundToTwo = function (num) {  // rounds a number to two decimal places
            return +(Math.round(num + "e+2")  + "e-2");
        };
    
        self.formatByteSize = function (bytes) {  // format bytes into KB, MB, GB dynamically
            var sizes = ['bytes', 'KB', 'MB', 'GB'];
            if (bytes == 0) return '0 bytes';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return self.roundToTwo(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        };

        self.throwError = function (feedbackId, reason) {  // throws a controlled error
            if (arguments.length == 1) {
                errorReason = errorReason; // show the most recent error
            } else {
                errorReason = reason; // show new error
            }
            
            document.querySelector('[ezup-feedback=\'' + feedbackId + '\']').innerHTML = errorReason;
            document.querySelector('[ezup-feedback=\'' + feedbackId + '\']').style.display = 'inline-block';
        };
    
        self.clearError = function (feedbackId) {  // clear error
            document.querySelector('[ezup-feedback=\'' + feedbackId + '\']').innerHTML = errorReason;
            document.querySelector('[ezup-feedback=\'' + feedbackId + '\']').style.display = 'none';
        };
        
        self.clearFiles = function (thisInput, feedbackID) {  // clear files to be uploaded
            self.clearError(feedbackID);
            var thisImages = document.getElementById(thisInput).parentNode.parentNode.lastChild;
            
            while(thisImages.hasChildNodes()) { // empty drawn files
                thisImages.removeChild(thisImages.lastChild);
            }
            document.getElementById(thisInput).parentNode.parentNode.firstChild.firstChild.innerHTML = '<i class="fa fa-plus"></i> Add File';
            $('#' + thisInput).replaceWith($('#' + thisInput).val('').clone(true)); //refresh file selector
        };
        
        self.renameFile = function (file) {  // rename a file
            // get file extension
            var fileExt = file.name.split('.');
            fileExt = fileExt[fileExt.length - 1].toLowerCase();
            
            // get the title of the lesson
            var title = (options.useMacroInfo) ? document.querySelector('[ezup-title=\'title\']').value.toLowerCase().replace(/\s/g, "_") + '.' : '';
            
            var d = new Date; // get the date of upload
            var dateTime = d.getMinutes().toString() + d.getHours().toString() + d.getDate().toString() + d.getMonth().toString() + d.getFullYear().toString();
            var rand = Math.floor(100000000 + Math.random() * 900000000);
            var usr = (options.useAccounts) ? options.accountName + '.' : '';
            var newFilename = usr + title + dateTime + '.' + rand.toString() + '.' + fileExt;
            
            return newFilename.toString();
        };
            
        self.uploadFile = function (parentID) {  // if user clicks upload button
            var file = document.getElementById('ezup-file-'+parentID).files[0];
            var feedbackID = 'ezup-feedback-' + parentID;
            var newFilename = '';
            // error handling variables
            var fileTypeCheck = document.getElementById(feedbackID).getAttribute('ftc');
            var fileSizeCheck = document.getElementById(feedbackID).getAttribute('fsc');
    
            if (fileSizeCheck == 'true' && fileTypeCheck == 'true') { // if error handling is good
                mustStay = true;
                self.clearError(feedbackID);
                ajaxStarted += 1;
                // rename file
                newFilename = 'uploads/' + self.renameFile(file);
                var progress = document.getElementById(parentID).childNodes[1];
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
                        var amount = self.formatByteSize(e.loaded).toString() + ' / ' + self.formatByteSize(e.total).toString();
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
                    self.throwError(feedbackID, 'Error: ' + e);
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
                            self.throwError(feedbackID, 'Upload failed and I don\'t know why! Please let us know about this.');
                            mustStay = false;
                        }
                    }
                });
                    
                //execute the ajax call
                request.open('POST', options.uploadURL);
                request.setRequestHeader('Cache-Control', 'no-cache');
                
                progress.setAttribute('style', 'display: block');
                
                request.send(data);
                
            }
            return newFilename;
        };
    
        self.changeInputFiles = function (thisInput, thisNum) {  // if a file is selected or deselected
            var thisFiles = thisInput.files,
                fileTypeCheck = false,
                fileSizeCheck = false,
                thisID = thisInput.getAttribute('id').toString(),
                thisFeedbackID = thisInput.parentNode.parentNode.childNodes[1].getAttribute('id').toString(),
                thisImages = thisInput.parentNode.parentNode.lastChild, // parent to draw thumbnails into
                id, img, span, x;
        
            while(thisImages.hasChildNodes()) { //empty drawn files
                thisImages.removeChild(thisImages.firstChild);
            }
            
            var totalSize = thisFiles[0].size;
            var allowed = ['png', 'jpg', 'mp4'];
            
            // draw selected files
            var file_ext = thisFiles[0].name.split('.')[thisFiles[0].name.split('.').length - 1].toLowerCase();
            id = 'ezup-thumb-' + thisNum + '-' + 0;
            
            if ($.inArray(file_ext, allowed) !== -1) {
                fileTypeCheck = true;
                
                img = document.createElement('img');
                img.setAttribute('id', id);
                img.setAttribute('class', 'ezup-files-group-img');
                img.setAttribute('title', thisFiles[0].name + ' | ' + self.formatByteSize(thisFiles[0].size));
                
                // decide whether to render an image thumbnail or video thumbnail
                if (file_ext == 'mp4') {
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
                } else {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        img.setAttribute('src', e.target.result);
                    };
                    reader.readAsDataURL(thisFiles[0]);
                }
                thisImages.appendChild(img);
            } else { // if filetype is not allowed
                fileTypeCheck = false;
                self.throwError(thisFeedbackID, 'That filetype is not allowed.');
            }
            
            if (thisFiles.length > 0) { // draw the clear files button
                thisInput.parentNode.parentNode.firstChild.firstChild.innerHTML = 'Change File';
                
                span = document.createElement('span');
                span.setAttribute('id', thisID + '-cancel');
                span.setAttribute('class', 'pointer text-danger');
                span.setAttribute('onclick', 'EaseUp.clearFiles(\'' + thisID + '\', \'' + thisFeedbackID + '\')');
                
                x = document.createElement('i');
                x.setAttribute('class', 'fa fa-times');
            
                thisImages.appendChild(document.createTextNode(' ' + self.formatByteSize(totalSize) + ' | '));
                span.appendChild(document.createTextNode('Remove File '));
                span.appendChild(x);
                thisImages.appendChild(span);
            } else {
                thisInput.parentNode.parentNode.firstChild.firstChild.innerHTML = '<i class="fa fa-plus"></i> Add File';
            }
            
            if (totalSize > 16000000) { // if file size is too large
                fileSizeCheck = false;
                self.throwError(thisFeedbackID, 'File size is too large.');
            } else {
                fileSizeCheck = true;
            }
            
            $('#'+thisFeedbackID).attr('ftc', fileTypeCheck);
            $('#'+thisFeedbackID).attr('fsc', fileSizeCheck);
        };
    
        /******************************FINISH AND PASS RESULTS********************************/
        
        self.formatData = function () { // formats the information into JSON to be used by PHP
            var json = '{',
                parent = document.getElementById('ezup-items');
            
            if (parent.children.length < 2) {
                self.throwError('feedback', '<p class="alert alert-danger">You must choose something to upload.</p>');
                return false;
            }
            if (options.useAccounts) {
                json += '"creator":"' + options.accountName + '",';
                json += '"timestamp":"' + Math.floor(Date.now() / 1000) + '",';
            }
            if (options.useMacroInfo) {
                var title = document.querySelector('[ezup-title=\'title\']').value.toString();
                var description = document.querySelector('[ezup-description=\'description\']').value.toString();
                
                if (title == '' || description == '') {
                    self.throwError('feedback', '<p class="alert alert-danger">You must include a title and a description.</p>');
                    return false;
                } else {
                    json += '"title":"' + title + '",';
                    json += '"description":"' + description + '",';
                }
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
                    
                    if (options.useMicroInfo) {
                        itemDump += '"title":"' + node.querySelector('[ezup-title=\'' + id + '\']').value.toString() + '",';
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
            var data = self.formatData();
            //console.log(JSON.parse(data));
            if (data) {
                self.clearError('feedback');
                self.uploadToDatabase(data); // upload lesson to the database
            }
        };
    
        self.uploadToDatabase = function (data) {  // send AJAX request to push upload to database
            if (ajaxStarted == ajaxFinished) {  // uploads are finished
                $.ajax({
                    url : options.databaseUpdateURL, //URL to the update database php script
                    type : "POST",
                    dataType: "json",
                    data: {
                        callback: options.callbackURL,
                        data: data,
                        ajax: 'true' // just to prevent calling from anywhere else
                    },
                    success: function(url){
                        document.location.href = url; // URL to redirect to after upload
                    },
                    error: function(){
                        alert('Oops, there has been a problem! Please tell us about this so that we can figure out what went wrong.');
                    }
                });
            } else {
                setTimeout(function(){ self.uploadToDatabase(data) }, 500);
            }
        };
        
        return self;
    
    })();
    
    window.EaseUp = EaseUp;
})(window);

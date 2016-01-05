(function (window) {
    "use strict";
    
    var EaseUp = new (function () {
        
        var self = this,
            ajaxURL = '/php/upload.php',
            useHierarchy = true,
            hierarchyId = 'hierarchy',
            useAccounts = true,
            accountName = '',
            useSummary = true,
            titleId = 'title',
            descriptionId = 'description',
            feedbackId = 'feedback';
        
        String.prototype.repeat = function(count) {
            if (count < 1) return '';
            var result = '', pattern = this.valueOf();
            while (count > 1) {
                if (count & 1) result += pattern;
                count >>= 1, pattern += pattern;
            }
            return result + pattern;
        };

        /******************************DOM MANIPULATION********************************/
        
        var subitem, newSubitem, item, newItem;
        
        
        
        self.removeNode = function (thisNode) {  // remove either a topic or a unit, based on what object calls it
            if (confirm('Are you sure you wish to delete this?')){
                var node = thisNode.parentNode.parentNode;
                var parent = node.parentNode;
                parent.removeChild(node);
                self.reNumber(parent);
            }
        };
    
        self.reNumber = function (parent) {  // renumbers the elements in a hierarchy after an element has been removed
            var num = 0, last = parent.lastChild;
            for(var i = 0; i < parent.childNodes.length - 1; i++) {
                var node = parent.childNodes[i], oldValue, bothNums, newID;
                if (node.nodeType == 1) {
                    if(node.getAttribute('ezup-item') != null){
                        oldValue = node.firstChild.lastChild.value;
                        node.setAttribute('ezup-item', num);
                        node.setAttribute('id', 'ezup-item-' + num);
                        node.firstChild.innerHTML = '<a href="javascript:EaseUp.removeNode(this);"><i class="fa fa-times text-danger"></i></a> Item ' +
                            (num + 1) + ': <input type="text" placeholder="Item Name Here" name="ezup-item-' + num + '" value="' + oldValue + '" onkeyup="EaseUp.displayDescription(this, \'item\', ' + num + ')" />';
                    } else if(node.getAttribute('ezup-subitem') != null) {
                        oldValue = node.firstChild.lastChild.value;
                        bothNums = node.parentElement.getAttribute('ezup-item').toString() + (num - 3).toString();
                        newID = 'ezup-subitem-' + bothNums;
                        node.setAttribute('ezup-subitem', (num - 3));
                        node.setAttribute('id', newID);
                        
                        node.lastChild.firstChild.setAttribute('id', 'ezup-subitem-description-'+newID);
                        node.lastChild.firstChild.setAttribute('name', 'ezup-subitem-description-'+newID);
                        node.childNodes[1].firstChild.lastChild.setAttribute('id', 'ezup-subitem-file-'+newID);
                        node.childNodes[1].firstChild.lastChild.setAttribute('name', 'ezup-subitem-file-'+newID);
                        
                        node.firstChild.innerHTML = '&nbsp&nbsp&nbsp&nbsp<a href="javascript:void(0);" onclick="EaseUp.removeNode(this)"><i class="fa fa-times text-danger"></i></a> Subitem '+
                            (num - 2) +': <input type="text" placeholder="Subitem Name Here" name="ezup-subitem-' + bothNums + '" value="' + oldValue + 
                            '" onkeyup="EaseUp.displayDescription(this, \'subitem\', \'' + bothNums + '\')" />';
                    }
                    num += 1;
                }
            }
        
            if(last.getAttribute('ezup-item') != null) {
                last.setAttribute('ezup-item', num);
                last.setAttribute('id', 'ezup-item-' + num);
            } else if (last.getAttribute('ezup-subitem') != null) {
                last.setAttribute('ezup-subitem', (num - 3));
                last.setAttribute('id', 'ezup-subitem-' + (num - 3));
            }
        };
        
        self.displayDescription = function (thisNode, type, num) {  // show description for current unit or topic
            var id = 'ezup-' + type + '-description-' + num;
            if (thisNode.value != null && thisNode.value != "") {
                $('#' + id).css('display', 'block');
            } else {
                $('#' + id).css('display', 'none');
            }
        };
    
        /******************************CREATE HIERARCHY FILE SYSTEM********************************/
        
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
    
        self.formatByteSize = function (bytes) {  // format bytes into KB, MB, GB dynamically
            var sizes = ['bytes', 'KB', 'MB', 'GB'];
            if (bytes == 0) return '0 bytes';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return self.roundToTwo(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        };
        
        self.roundToTwo = function (num) {  // rounds a number to two decimal places
            return +(Math.round(num + "e+2")  + "e-2");
        };

        self.throwError = function (feedbackID, reason) {  // throws a controlled error
            if (arguments.length == 1) {
                errorReason = errorReason; // show the most recent error
            } else {
                errorReason = reason; // show new error
            }
            
            $('#' + feedbackID).html(errorReason);
            $('#' + feedbackID).css('display', 'inline-block');
        };
    
        self.clearError = function (feedbackID) {  // clear error
            $('#' + feedbackID).html(errorReason);
            $('#' + feedbackID).css('display', 'none');
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
            var title = (useSummary) ? $('#' + titleId).val().toLowerCase().replace(/\s/g, "_") + '.' : '';
            
            var d = new Date; // get the date of upload
            var dateTime = d.getMinutes().toString() + d.getHours().toString() + d.getDate().toString() + d.getMonth().toString() + d.getFullYear().toString();
            var rand = Math.floor(100000000 + Math.random() * 900000000);
            var usr = (useAccounts) ? accountName + '.' : '';
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
                request.open('POST', ajaxURL);
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
        
        self.createInformation = function (hierarchy) {  // retrieve hierarchy information
            var hDump = '{';
            var parent = document.getElementById(hierarchy);
            for(var i = 0; i < parent.childNodes.length - 1; i++) { // foreach unit
                var item = parent.childNodes[i];
                if (item.nodeType == 1 && item.firstChild.lastChild.value != null && item.firstChild.lastChild.value != "") {
                    var thisNum = item.getAttribute('ezup-item').toString();
                    var iDump = '"'+thisNum+'":[';
                    var iTitle = item.firstChild.lastChild.value.toString();
                    var iDescription = item.childNodes[2].firstChild.value.toString();
                    var iFilename = self.uploadFile(item.getAttribute('id').toString());
                    iDump += '{"title":"'+iTitle+'","description":"'+iDescription+'","file":"'+iFilename+'"}';
                    if (item.childNodes.length > 4) {
                        iDump += ',';
                    }
                    for(var n = 3; n < item.childNodes.length - 1; n++) { // foreach topic
                        var subitem = item.childNodes[n];
                        if (subitem.nodeType == 1 && subitem.firstChild.lastChild.value != null && subitem.firstChild.lastChild.value != "") {
                            var sTitle = subitem.firstChild.lastChild.value.toString();
                            var sDescription = subitem.childNodes[2].firstChild.value.toString();
                            var sFilename = self.uploadFile(subitem.getAttribute('id').toString());
                            iDump += '{"title":"'+sTitle+'","description":"'+sDescription+'","file":"'+sFilename+'"}';
                            if (n < item.childNodes.length - 2) {
                                iDump += ',';
                            }
                        } else {
                            self.throwError('feedback', 'All Subitems must have a title');
                        }
                    }
                    iDump += ']';
                    if (i < parent.childNodes.length - 3) {
                        iDump += ',';
                    }
                    hDump += iDump;
                } else {
                    self.throwError('feedback', 'All Items must have a title');
                }
            }
            hDump += '}';
            return hDump.toString();
        };
    
        self.createLesson = function (callback) {  // finally attempt to create lesson
            var title = (useSummary) ? $("#" + titleId).val() : '';
            var description = (useSummary) ? $('#' + descriptionId).val() : '';
            
            if (useSummary && (title == '' || description == '')) { // if a field is empty
                self.throwError(feedbackId, '<p class="alert alert-danger squared-off">Your lesson must have a title and a description.</p>');
                return;
            } else {
                var information = self.createInformation(hierarchyId);
                self.clearError(feedbackId);
                // this will be used to upload lesson to the database
                self.uploadLesson(callback, title, description, information);
            }
        };
    
        self.uploadLesson = function (url, title, description, information) {  // send AJAX request to push upload to database
            if (ajaxStarted == ajaxFinished) {  // uploads are finished
                $.ajax({
                    url : url, //URL to the create lesson php script
                    type : "POST",
                    dataType: "json",
                    data: {
                        titlePost: title,
                        descriptionPost: description,
                        infoPost: information,
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
                setTimeout(function(){ self.uploadLesson(url, title, description, information) }, 500);
            }
        };
        
        return self;
    
    })();
    
    window.EaseUp = EaseUp;
})(window);

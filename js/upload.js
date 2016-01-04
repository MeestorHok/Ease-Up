(function (window) {
    "use strict";
    
    var EaseUp = new (function () {
        
        var self = this;
        
        /******************************CREATE HIERARCHY USER INTERFACE********************************/
        
        var topic, newTopic, unit, newUnit;  // variables for hierarchy creation
        
        self.addUnit = function (thisUnit) {  // add a unit to the hierarchy
            unit = thisUnit.parentNode;
            var thisNum = parseInt(unit.getAttribute('unit'));
            var nextNum = thisNum + 1;
            unit.innerHTML = '<div style="display: inline-block; padding-right: 10px; padding-top: 10px"><a href="javascript:void(0);" onclick="EaseUp.removeNode(this)"><i class="fa fa-times text-danger"></i></a> Unit ' +
                nextNum + ': <input type="text" class="h-unit-input squared-off" placeholder="Unit Name Here" name="unit-' + thisNum + '" onkeyup="EaseUp.displayDescription(this, \'unit\', ' + thisNum + ')" /></div>' +
                '<div class="files-group"><a href="javascript:void(0);" onclick="this.lastChild.click()"><div style="display: inline-block"><i class="fa fa-plus"></i> Add File</div><input type="file" id="file-unit-' +
                thisNum + '" accept="image/x-png, image/jpeg, video/mp4" class="inputFile" onchange="EaseUp.changeInputFiles(this, \'unit-' + thisNum + '\')" name="file-unit-' + thisNum + '" style="display: none"></a>' +
                '<div id="feedback-unit-' + thisNum + '" class="feedback" style="display: none;"></div><div style="display: inline-block"></div></div><div style="display:block"><textarea class="unit-description" name="description-unit-' +
                thisNum + '" id="description-unit-' + thisNum + '" placeholder="Write a description of what the user will learn in this unit here."></textarea></div>';
            
            topic = document.createElement('div');
            topic.setAttribute('topic', 0);
            topic.setAttribute('class', 'topic');
            topic.innerHTML = '&nbsp&nbsp&nbsp&nbsp<a href="javascript:void(0);" onclick="EaseUp.addTopic(this)">Add Topic</a>';
            
            unit.appendChild(topic);
            
            newUnit = document.createElement('div');
            newUnit.setAttribute('class', 'unit');
            newUnit.setAttribute('unit', nextNum);
            newUnit.setAttribute('id', 'unit-' + nextNum);
            newUnit.innerHTML = '<a href="javascript:void(0);" onclick="EaseUp.addUnit(this)">Add Unit</a>';
            
            document.getElementById('hierarchy').appendChild(newUnit);
        };
        
        self.addTopic = function (thisTopic) {  // add a topic to the unit within a hierarchy
            topic = thisTopic.parentNode;
            unit = topic.parentNode;
            var unitNum = parseInt(unit.getAttribute('unit'));
            var thisNum = parseInt(topic.getAttribute('topic'));
            var nextNum = thisNum + 1;
            var bothNums = unitNum.toString() + thisNum.toString();
            topic.setAttribute('id', 'topic-' + bothNums);
            topic.innerHTML = '<div style="display: inline-block; padding-right: 10px; padding-top: 10px">&nbsp&nbsp&nbsp&nbsp<a href="javascript:void(0);" onclick="removeNode(this)"><i class="fa fa-times text-danger"></i></a> Topic '+
                nextNum +': <input type="text" class="h-topic-input squared-off" placeholder="Topic Name Here" name="topic-' + bothNums + '" onkeyup="EaseUp.displayDescription(this, \'topic\', \'' + bothNums + '\')" /></div>' +
                '<div class="files-group"><a href="javascript:void(0);" onclick="this.lastChild.click()"><div style="display: inline-block"><i class="fa fa-plus"></i> Add File</div><input type="file" id="file-topic-' +
                bothNums + '" accept="image/x-png, image/jpeg, video/mp4" class="inputFile" onchange="EaseUp.changeInputFiles(this, \'topic-' + bothNums + '\')" name="file-topic-' + bothNums + '" style="display: none"></a>' +
                '<div id="feedback-topic-' + bothNums + '" class="feedback" style="display: none;"></div><div style="display: inline-block"></div></div><div style="display:block"><textarea class="unit-description" name="description-topic-' +
                bothNums + '" id="description-topic-' + bothNums + '" placeholder="Write a description of what this specific topic will cover."></textarea></div>';
            
            newTopic = document.createElement('div');
            newTopic.setAttribute('topic', nextNum);
            newTopic.setAttribute('class', 'topic');
            newTopic.setAttribute('id', 'topic-' + nextNum);
            newTopic.innerHTML = '&nbsp&nbsp&nbsp&nbsp<a href="javascript:void(0);" onclick="EaseUp.addTopic(this)">Add Topic</a>';
            
            topic.parentNode.appendChild(newTopic);
        };
        
        self.removeNode = function (thisNode) {  // remove either a topic or a unit, based on what object calls it
            if (confirm('Deleting this is permanent, are you sure you wish to do this?')){
                var node = thisNode.parentNode.parentNode;
                var parent = node.parentNode;
                parent.removeChild(node);
                self.reNumber(parent);
            }
        };
    
        self.reNumber = function (parent) {  // renumbers the elements in a hierarchy after an element has been removed
            var num = 0;
            for(var i = 0; i < parent.childNodes.length - 1; i++) {
                var node = parent.childNodes[i];
                if (node.nodeType == 1) {
                    if(node.getAttribute('unit') != null){
                        var oldValue = node.firstChild.lastChild.value;
                        node.setAttribute('unit', num);
                        node.setAttribute('id', 'unit-' + num);
                        node.firstChild.innerHTML = '<a href="javascript:void(0);" onclick="removeNode(this)"><i class="fa fa-times text-danger"></i></a> Unit ' +
                            (num + 1) + ': <input type="text" class="h-unit-input squared-off" placeholder="Unit Name Here" name="unit-' + num + '" value="' + oldValue + '" onkeyup="displayDescription(this, \'unit\', ' + num + ')" />';
                    } else if(node.getAttribute('topic') != null) {
                        var oldValue = node.firstChild.lastChild.value;
                        var bothNums = node.parentElement.getAttribute('unit').toString() + (num - 3).toString();
                        var newID = 'topic-' + bothNums;
                        node.setAttribute('topic', (num - 3));
                        node.setAttribute('id', newID);
                        
                        node.lastChild.firstChild.setAttribute('id', 'description-'+newID);
                        node.lastChild.firstChild.setAttribute('name', 'description-'+newID);
                        node.childNodes[1].firstChild.lastChild.setAttribute('id', 'file-'+newID);
                        node.childNodes[1].firstChild.lastChild.setAttribute('name', 'file-'+newID);
                        
                        node.firstChild.innerHTML = '&nbsp&nbsp&nbsp&nbsp<a href="javascript:void(0);" onclick="removeNode(this)"><i class="fa fa-times text-danger"></i></a> Topic '+
                            (num - 2) +': <input type="text" class="h-topic-input squared-off" placeholder="Topic Name Here" name="topic-' + bothNums + '" value="' + 
                            oldValue + '" onkeyup="displayDescription(this, \'topic\', \'' + bothNums + '\')" />';
                    }
                    num += 1;
                }
            }
            var last = parent.lastChild;
        
            if(last.getAttribute('unit') != null) {
                last.setAttribute('unit', num);
                last.setAttribute('id', 'unit-' + num);
            } else if (last.getAttribute('topic') != null) {
                last.setAttribute('topic', (num - 3));
                last.setAttribute('id', 'topic-' + (num - 3));
            }
        };
        
        self.displayDescription = function (thisNode, type, num) {  // show description for current unit or topic
            var id = 'description-' + type + '-' + num;
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
            ajaxFinished = 0;  // variables for uploading
    
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
            var title = $('#title').val().toLowerCase().replace(/\s/g, "_");
            
            var d = new Date; // get the date of upload
            var dateTime = d.getMinutes().toString() + d.getHours().toString() + d.getDate().toString() + d.getMonth().toString() + d.getFullYear().toString();
            var rand = Math.floor(100000000 + Math.random() * 900000000);
            
            var newFilename = usr.toString() + '.' + title + '.' + dateTime + '.' + rand.toString() + '.' + fileExt;
            
            return newFilename.toString();
        };
            
        self.uploadFile = function (parentID) {  // if user clicks upload button
            var file = document.getElementById('file-'+parentID).files[0];
            var feedbackID = 'feedback-' + parentID;
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
                        container.setAttribute('class', 'progress-bar-container');
                        
                        comparison = document.createElement ('p');
                        comparison.appendChild(document.createTextNode(amount));
                        comparison.setAttribute('class', 'progress-bar-text float-left');
                        
                        num = document.createElement('p');
                        num.appendChild(document.createTextNode(percent + '%'));
                        num.setAttribute('class', 'progress-bar-text float-right');
                        
                        filled = document.createElement('div');
                        filled.setAttribute('class', 'progress-bar-progress');
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
                request.open('POST', '/upload.php');
                request.setRequestHeader('Cache-Control', 'no-cache');
                
                progress.setAttribute('style', 'display: block');
                
                request.send(data);
                
            }
            return newFilename;
        };
    
        self.changeInputFiles = function (thisInput, thisNum) {  // if a file is selected or deselected
            var thisFiles = thisInput.files;
            var fileTypeCheck = false;
            var fileSizeCheck = false;
            var thisID = thisInput.getAttribute('id').toString();
            var thisFeedbackID = thisInput.parentNode.parentNode.childNodes[1].getAttribute('id').toString();
            var thisImages = thisInput.parentNode.parentNode.lastChild; // parent to draw thumbnails into
            var id, img, span, x;
        
            while(thisImages.hasChildNodes()) { //empty drawn files
                thisImages.removeChild(thisImages.firstChild);
            }
            
            var totalSize = thisFiles[0].size;
            var allowed = ['png', 'jpg', 'mp4'];
            
            // draw selected files
            var file_ext = thisFiles[0].name.split('.')[thisFiles[0].name.split('.').length - 1].toLowerCase();
            id = 'img-thumb-' + thisNum + '-' + 0;
            
            if ($.inArray(file_ext, allowed) !== -1) {
                fileTypeCheck = true;
                
                img = document.createElement('img');
                img.setAttribute('id', id);
                img.setAttribute('class', 'files-group-img');
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
                span.setAttribute('onclick', 'clearFiles(\'' + thisID + '\', \'' + thisFeedbackID + '\')');
                
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
                var unit = parent.childNodes[i];
                if (unit.nodeType == 1 && unit.firstChild.lastChild.value != null && unit.firstChild.lastChild.value != "") {
                    var thisNum = unit.getAttribute('unit').toString();
                    var uDump = '"'+thisNum+'":[';
                    var uTitle = unit.firstChild.lastChild.value.toString();
                    var uDescription = unit.childNodes[2].firstChild.value.toString();
                    var uFilename = self.uploadFile(unit.getAttribute('id').toString());
                    uDump += '{"title":"'+uTitle+'","description":"'+uDescription+'","file":"'+uFilename+'"}';
                    if (unit.childNodes.length > 4) {
                        uDump += ',';
                    }
                    for(var n = 3; n < unit.childNodes.length - 1; n++) { // foreach topic
                        var topic = unit.childNodes[n];
                        if (topic.nodeType == 1 && topic.firstChild.lastChild.value != null && topic.firstChild.lastChild.value != "") {
                            var tTitle = topic.firstChild.lastChild.value.toString();
                            var tDescription = topic.childNodes[2].firstChild.value.toString();
                            var tFilename = self.uploadFile(topic.getAttribute('id').toString());
                            uDump += '{"title":"'+tTitle+'","description":"'+tDescription+'","file":"'+tFilename+'"}';
                            if (n < unit.childNodes.length - 2) {
                                uDump += ',';
                            }
                        } else {
                        // user must create a title for the Topic
                        }
                    }
                    uDump += ']';
                    if (i < parent.childNodes.length - 3) {
                        uDump += ',';
                    }
                    hDump += uDump;
                } else {
                    // user must create a title for the Unit
                }
            }
            hDump += '}';
            return hDump.toString();
        };
    
        self.createLesson = function (callback) {  // finally attempt to create lesson
            var title = $("#title").val();
            var description = $('#description').val();
            
            if (title == '' || description == '') { // if a field is empty
                self.throwError('feedback', '<p class="alert alert-danger squared-off">Your lesson must have a title and a description.</p>');
                return;
            } else {
                var information = self.createInformation('hierarchy');
                self.clearError('feedback');
                // this will be used to upload lesson to the database
                self.uploadLesson(callback, title, description, information);
            }
        };
    
        self.uploadLesson = function (url, title, description, information) {  // send AJAX request to push upload to database
            if (ajaxStarted == ajaxFinished /*uploads are finished*/) {
                $.ajax({
                    url : url, //URL to the create lesson php script
                    type : "POST",
                    dataType: "json",
                    data: {
                        titlePost: title,
                        descriptionPost: description,
                        infoPost: information,
                        ajax: 'true'
                    },
                    success: function(url){
                        document.location.href = url; // URL to redirect to after upload
                    },
                    error: function(){
                        alert('Oops, there has been a problem! Please tell us about this so that we can figure out what went wrong.');
                    }
                });
            } else {
                setTimeout(function(){ self.uploadLesson(title, description, information) }, 500);
            }
        };
        
        return self;
    
    })();
    
    window.EaseUp = EaseUp;
})(window);

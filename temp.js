var self = this,
        useUploadDescription = true,
        titleID = 'ezup-title',
        descriptionID = 'ezup-description',
        useItemDescriptions = true,
        depth = 1;
        
            

var subitem = document.createElement('div');
subitem.setAttribute('ezup-subitem', 0);
subitem.setAttribute('class', 'ezup-subitem');
subitem.setAttribute('id', 'ezup-subitem-0');

var inputsGroup = document.createElement('div');
inputsGroup.setAttribute('class', 'ezup-inputs-group');

var deleteButton = document.createElement('a');
deleteButton.setAttribute('href', 'javascript:void(0);');
deleteButton.setAttribute('onclick', 'EaseUp.removeNode(this)');

var deleteIcon = document.createElement('i');
deleteIcon.setAttribute('class', 'fa fa-times text-danger');

deleteButton.appendChild(deleteIcon);
inputsGroup.appendChild(deleteButton);

var itemLabel = document.createTextNode('Item ' + (itemNum + 1) + ': ');

inputsGroup.appendChild(itemLabel);

var itemTitle = document.createElement('input');
itemTitle.setAttribute('type', 'text');
itemTitle.setAttribute('placeholder', 'Item Name Here');
itemTitle.setAttribute('name', 'ezup-item-' + itemNum);
itemTitle.setAttribute('onkeyup', 'EaseUp.displayDescription(this,\'item\',' + itemNum + ')');

inputsGroup.appendChild(itemTitle);

subitem.appendChild(inputsGroup);

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
fileInput.setAttribute('type', 'file');
fileInput.setAttribute('id', 'ezup-file-' + itemNum);
fileInput.setAttribute('accept', 'image/x-png, image/jpeg');
fileInput.setAttribute('class', 'ezup-file');
fileInput.setAttribute('onchange', 'EaseUp.changeInputFiles(this,\'item-' + itemNum + '\')');
fileInput.setAttribute('name', 'ezup-file-' + itemNum);
fileInput.setAttribute('style', 'display:none');

getFileButton.appendChild(fileInput);
filesGroup.appendChild(getFileButton);

var feedback = document.createElement('div');
feedback.setAttribute('id', 'ezup-feedback-' + itemNum);
feedback.setAttribute('class', 'ezup-feedback');
feedback.setAttribute('style', 'display:none');

filesGroup.appendChild(feedback);

var progressBar = document.createElement('div');
progressBar.setAttribute('style', 'display:inline-block');

filesGroup.appendChild(progressBar);
subitem.appendChild(filesGroup);

var descriptionContainer = document.createElement('div');
descriptionContainer.setAttribute('style', 'display:block');

var description = document.createElement('textarea');
description.setAttribute('class', 'ezup-description');
description.setAttribute('name', 'ezup-item-description-' + itemNum);
description.setAttribute('id', 'ezup-item-description-' + itemNum);
description.setAttribute('placeholder', 'Write a description of this item.');

descriptionContainer.appendChild(description);
subitem.appendChild(descriptionContainer);

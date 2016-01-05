    var EaseUp = new (function () {
        
        var self = this,
            useUploadDescription = true,
            titleID = 'ezup-title',
            descriptionID = 'ezup-description',
            useEnumeration = true,
            useItemDescriptions = true,
            depth = 1; // depth of sub items, 0 means just top-level

        self.addItem = function (thisItem) {  // add item to parent
            var item, newItem, subItem, itemId, newItemId, idBroken, itemNum, itemDepth, indent;
            
            item = thisItem.parentNode;
            itemId = item.getAttribute('ezup-id') || '0';
            idBroken = itemId.split('-');
            itemNum = parseInt(idBroken.pop());
            itemDepth = parseInt(item.getAttribute('ezup-depth')) || 0;
            item.innerHTML = ''; // empty the item before we add to it
            
            var inputsGroup = document.createElement('div');
            inputsGroup.setAttribute('class', 'ezup-inputs-group');
            
            var deleteButton = document.createElement('a');
            deleteButton.setAttribute('href', 'javascript:void(0);');
            deleteButton.setAttribute('onclick', 'EaseUp.removeNode(this)');
            
            var deleteIcon = document.createElement('i');
            deleteIcon.setAttribute('class', 'fa fa-times text-danger');
            
            deleteButton.appendChild(deleteIcon);
            inputsGroup.appendChild(deleteButton);
            
            var itemLabel = document.createTextNode('Item' + (function () { if (useEnumeration) {  return (itemNum + 1) + ': ' } else {  return ': ' }})());
            
            inputsGroup.appendChild(itemLabel);
            
            var itemTitle = document.createElement('input');
            itemTitle.setAttribute('type', 'text');
            itemTitle.setAttribute('placeholder', 'Item Name Here');
            itemTitle.setAttribute('name', 'ezup-item-' + itemId);
            itemTitle.setAttribute('onkeyup', 'EaseUp.displayDescription(this,\'' + itemId + '\')'); /////////////////////////////////////////////////////////////////////////
            
            inputsGroup.appendChild(itemTitle);
            
            item.appendChild(inputsGroup);
            
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
            fileInput.setAttribute('id', 'ezup-file-' + itemId);
            fileInput.setAttribute('accept', 'image/x-png, image/jpeg');
            fileInput.setAttribute('class', 'ezup-file');
            fileInput.setAttribute('onchange', 'EaseUp.changeInputFiles(this,\'' + itemId + '\')'); /////////////////////////////////////////////////////////////////////////
            fileInput.setAttribute('name', 'ezup-file-' + itemId);
            fileInput.setAttribute('style', 'display:none');
            
            getFileButton.appendChild(fileInput);
            filesGroup.appendChild(getFileButton);
            
            var feedback = document.createElement('div');
            feedback.setAttribute('id', 'ezup-feedback-' + itemId);
            feedback.setAttribute('class', 'ezup-feedback');
            feedback.setAttribute('style', 'display:none');
            
            filesGroup.appendChild(feedback);
            
            var progressBar = document.createElement('div');
            progressBar.setAttribute('style', 'display:inline-block');
            
            filesGroup.appendChild(progressBar);
            item.appendChild(filesGroup);
            
            var descriptionContainer = document.createElement('div');
            descriptionContainer.setAttribute('style', 'display:block');
            
            var description = document.createElement('textarea');
            description.setAttribute('class', 'ezup-description');
            description.setAttribute('name', 'ezup-description-' + itemId);
            description.setAttribute('id', 'ezup-description-' + itemId);
            description.setAttribute('placeholder', 'Write a description of this item.');
            
            descriptionContainer.appendChild(description);
            item.appendChild(descriptionContainer);
            
            if (depth > itemDepth) {
                newItemId = itemId + '-0';
                subItem = document.createElement('div');
                subItem.setAttribute('ezup-id', newItemId);
                subItem.setAttribute('ezup-depth', (itemDepth + 1));
                subItem.setAttribute('class', 'ezup-item');
                subItem.setAttribute('id', 'ezup-' + newItemId);
                indent = '&nbsp'.repeat((itemDepth + 1) * 4);
                subItem.innerHTML = indent + '<a href="javascript:void(0);" onclick="EaseUp.addItem(this)">Add Subitem</a>';
                
                item.appendChild(subItem);
            }
            
            idBroken = idBroken.push((itemNum + 1).toString());
            newItemId = idBroken.join('-');
            newItem = document.createElement('div');
            newItem.setAttribute('class', 'ezup-item');
            newItem.setAttribute('ezup-id', newItemId);
            newItem.setAttribute('ezup-depth', itemDepth);
            item.setAttribute('id', 'ezup-' + newItemId);
            indent = '&nbsp'.repeat(itemDepth * 4);
            newItem.innerHTML = indent + '<a href="javascript:void(0);" onclick="EaseUp.addItem(this)">Add Item</a>';
            
            item.parentNode.appendChild(newItem);
        };
    
    })();
    
    window.EaseUp = EaseUp;
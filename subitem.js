

    function addSubitem (thisSubitem) {  // add a subitem to an item within a hierarchy
        var item, newItem, subitem, itemNum, subNum, bothNums;
        
        subitem = thisSubitem.parentNode;
        item = subitem.parentNode;
        itemNum = parseInt(item.getAttribute('ezup-item'));
        subNum = parseInt(subitem.getAttribute('ezup-subitem'));
        bothNums = itemNum.toString() + subNum.toString();
        subitem.innerHTML = '<div class="ezup-inputs-group">&nbsp&nbsp&nbsp&nbsp<a href="javascript:void(0);" onclick="EaseUp.removeNode(this)"><i class="fa fa-times text-danger"></i></a> Subitem ' + (subNum + 1) + ': ' +
                '<input type="text" placeholder="Subitem Name Here" name="ezup-subitem-' + bothNums + '" onkeyup="EaseUp.displayDescription(this, \'subitem\', \'' + bothNums + '\')" /></div>' +
                '<div class="ezup-files-group"><a href="javascript:void(0);" onclick="this.lastChild.click()"><div style="display: inline-block"><i class="fa fa-plus"></i> Add File</div><input type="file" id="ezup-file-' + 
                bothNums + '" accept="image/x-png, image/jpeg" class="ezup-file" onchange="EaseUp.changeInputFiles(this, \'subitem-' + bothNums + '\')" name="ezup-file-' + bothNums + '" style="display: none">'+
                '</a><div id="ezup-feedback-' + bothNums + '" class="ezup-feedback" style="display: none;"></div><div style="display: inline-block"></div></div><div style="display:block">'+
                '<textarea class="ezup-description" name="ezup-subitem-description-' +bothNums + '" id="ezup-subitem-description-' + bothNums + '" placeholder="Write a description of this subitem."></textarea></div>';
        
        newItem = document.createElement('div');
        newItem.setAttribute('class', 'ezup-subitem');
        newItem.setAttribute('ezup-subitem', (subNum + 1));
        subitem.setAttribute('id', 'ezup-subitem-' + (subNum + 1));
        newItem.innerHTML = '&nbsp&nbsp&nbsp&nbsp<a href="javascript:void(0);" onclick="EaseUp.addSubitem(this)">Add Subitem</a>';
        
        item.appendChild(newItem);
        alert(subitem.innerHTML);
    }
    
    addSubitem(this);
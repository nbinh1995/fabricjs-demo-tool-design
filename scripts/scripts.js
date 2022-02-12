//dasd
const AREA_DATA = {
    front : {
        area: 'front',
        data: undefined
    },
    back : {
        area: 'back',
        data: undefined
    }
};

const AREA_PRINT = ['front','back'];

var objectURL=[];


function removeWhite(canvas){
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {			  
        activeObject.filters[2] =  new fabric.Image.filters.RemoveWhite({hreshold: 100, distance: 10});//0-255, 0-255
        activeObject.applyFilters(canvas.renderAll.bind(canvas));
    }	        
}

function removeItem(canvas){
	var activeGroup = canvas.getActiveObjects();
        if (activeGroup.length) {
            activeGroup.forEach(function(object) {
                canvas.remove(object);
            });
        }
}

function cleanAll(canvas){
    for (const key in AREA_DATA) {
        if (Object.hasOwnProperty.call(AREA_DATA, key)) {
            AREA_DATA[key].data = undefined;
            
        }
    }
    return canvas.clear();
}

function changeViewFace(canvas,index_area){
    var index_next_area =  AREA_PRINT.length > (+index_area + 1) ? +index_area+1 : 0
    document.getElementById("tshirtFacing").src = 'img/clothes/'+document.getElementById('select-shirt').value+'/'+ AREA_DATA[AREA_PRINT[index_next_area]].area+'.png';
    AREA_DATA[AREA_PRINT[index_area]].data= JSON.stringify(canvas);
    canvas.clear();
    try
    {
        var json = JSON.parse(AREA_DATA[AREA_PRINT[index_next_area]].data);
        json && canvas.loadFromJSON(AREA_DATA[AREA_PRINT[index_next_area]].data);
    }
    catch(e)
    {}
    document.querySelectorAll('.change-view').forEach(function(node){
        node.dataset.area = index_next_area;
    });
}

function updateData(canvas){
    var index_area = +document.querySelector('.change-view').dataset.area
    AREA_DATA[AREA_PRINT[index_area]].data= JSON.stringify(canvas);
}

function getRandomNum(min, max) {
    return Math.random() * (max - min) + min;
}

function updateTshirtImage(imageURL,canvas){
	var offset = 50;
    var width = document.querySelector('#drawingArea').offsetWidth;
    var height = document.querySelector('#drawingArea').offsetHeight;
	var left = fabric.util.getRandomInt(0 + offset, width - offset);
	var top = fabric.util.getRandomInt(0 + offset, height - offset);
	fabric.Image.fromURL(imageURL, function(image) {
		image.scale(getRandomNum(0.05, 0.1)).set({
		left: left,
		top: top,
		angle: 0,
		padding: 10,
		cornersize: 10,
	    hasRotatingPoint:true
		});
        canvas.add(image);
	});
}


function onSelectedCleared(){
    document.querySelector('#text-editor-tool').style.opacity = '0';
    document.querySelector('#text-string').value = '';
    document.querySelector('#image-editor-tool').style.opacity = '0';
}

function addText(canvas){
    var text = document.querySelector("#text-string").value;
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'text') {
        activeObject.text = text;
        canvas.renderAll();
    }else{
        document.querySelector('#text-string').value = '';
        var textSample = new fabric.Text(text, {
                    left: fabric.util.getRandomInt(50, 150),
                    top: fabric.util.getRandomInt(50, 350),
                    fontFamily: 'helvetica',
                    angle: 0,
                    fill: '#000000',
                    scaleX: 0.5,
                    scaleY: 0.5,
                    fontWeight: '',
                    hasRotatingPoint:true
                });		    
                canvas.add(textSample);	
                canvas.item(canvas.item.length-1).hasRotatingPoint = true;   
    } 
}

function closePrint () {
    document.body.removeChild(this.__container__);
}

function setPrint () {
    this.contentWindow.__container__ = this;
    this.contentWindow.onbeforeunload = closePrint;
    this.contentWindow.onafterprint = closePrint;
    this.contentWindow.focus(); // Required for IE
    this.contentWindow.print();
}

function printPage (sURL) {
    var oHideFrame = document.createElement("iframe");
    oHideFrame.onload = setPrint;
    oHideFrame.style.position = "fixed";
    oHideFrame.style.right = "0";
    oHideFrame.style.bottom = "0";
    oHideFrame.style.width = "0";
    oHideFrame.style.height = "0";
    oHideFrame.style.border = "0";
    oHideFrame.src = sURL;
    document.body.appendChild(oHideFrame);
}

function b64toBlob(b64Data, contentType='', sliceSize=512){
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

function exportImage(canvas){
    updateData(canvas);
    AREA_PRINT.forEach(function(item){
        var id_img_shirt = item+'_tshirtFacing';
        document.getElementById(id_img_shirt).src = 'img/clothes/'+document.getElementById('select-shirt').value+'/'+ AREA_DATA[item].area+'.png';
        var id_canvas = item+'_canvas';
        var newCanvas = new fabric.Canvas(id_canvas);
        try
        {
            var json = JSON.parse(AREA_DATA[item].data);
            json && newCanvas.loadFromJSON(AREA_DATA[item].data);
        }
        catch(e){
            console.error('oops, something went wrong!');
        }
    })
    var node = document.getElementById('export_image');
    setTimeout(function(){
        node.style.display = 'block';
        domtoimage.toPng(node).then(function (dataUrl) {
            var base64=dataUrl.replace(/^data:image\/\w+;base64,/, "");
            var blob = b64toBlob(base64,'image/png');
            var blobUrl = URL.createObjectURL(blob);
            printPage(blobUrl)
            node.style.display = 'none';
        }).catch(function (error) {
            console.error('oops, something went wrong!');
        });
    },1000);
}

// main
// document.addEventListener("DOMContentLoaded", function() {

    var canvas = new fabric.Canvas('tcanvas',{
        hoverCursor: 'pointer',
        selection: true,
        selectionBorderColor:'blue',
    
    });
    var pickerTextFontColor = new Picker({
            parent: document.querySelector('#text-fontcolor'),
            popup: 'bottom',
            defaultColor:'#000',
            onDone: function(color){
                this.settings.parent.querySelector('.color-preview').style.backgroundColor = color.hex;
                var activeObject = canvas.getActiveObject();
                if (activeObject && activeObject.type === 'text') {
                    activeObject.set('fill',color.hex);
                    canvas.renderAll();
                }
            },
            onOpen: function(color){
                this.setColor(this.settings.parent.querySelector('.color-preview').style.backgroundColor);
            },
            });
    var pickerTextStrokeColor = new Picker({
        parent: document.querySelector('#text-strokecolor'),
        popup: 'bottom',
        defaultColor:'#000',
        onDone: function(color){
            this.settings.parent.querySelector('.color-preview').style.backgroundColor = color.hex;
            var activeObject = canvas.getActiveObject();
                if (activeObject && activeObject.type === 'text') {
                    activeObject.set('stroke',color.hex);
                    canvas.renderAll();
            }
        },
        onOpen: function(color){
            this.setColor(this.settings.parent.querySelector('.color-preview').style.backgroundColor);
        },
        });
    function onSelectedCreated(e) {	 
        var selectedObject = e.target;
        document.querySelector('#text-string').value = '';
        selectedObject.hasRotatingPoint = true
        if (selectedObject && selectedObject.type === 'text') {
            console.log(selectedObject);
            //display text editor    	
            document.querySelector('#text-string').value = selectedObject.text;
            pickerTextFontColor && pickerTextFontColor.setColor(selectedObject.fill);
            pickerTextStrokeColor && pickerTextStrokeColor.setColor(selectedObject.strokeStyle);
            document.querySelector('#text-editor-tool').style.opacity = '1';	
            document.querySelector('#image-editor-tool').style.opacity = '1';	    	
        }
        else if (selectedObject && selectedObject.type === 'image'){
            //display image editor
            document.querySelector('#text-editor-tool').style.opacity = '0';	    	
            document.querySelector('#image-editor-tool').style.opacity = '1';	    	
    
        }
    }
    canvas.on({
        'object:moving': function(e) {		  	
        e.target.opacity = 0.5;
        },
        'object:modified': function(e) {		  	
            e.target.opacity = 1;
        },
        'selection:created':onSelectedCreated,
        'selection:cleared':onSelectedCleared
    });

    document.getElementById("select-shirt").addEventListener("change", function(){
        var index_area = +document.querySelector('.change-view').dataset.area
        var view = AREA_PRINT[index_area];
        document.getElementById("tshirtFacing").src = 'img/clothes/'+this.value+'/'+view+'.png';
    }, false);

    document.querySelectorAll('#shirt-option .color-preview').forEach(function(node){
        node.addEventListener('click', function(e){
            document.querySelectorAll(".page-tshirt").forEach(function(ele){
                ele.style.backgroundColor = e.target.style.backgroundColor;
            })
        },false);
    });

    document.querySelectorAll('.change-view').forEach(function(node){
        node.addEventListener('click', function(){
            changeViewFace(canvas,+this.dataset.area);
        },false);
    });

    document.getElementById('gravatar-option').addEventListener('click',function(e){
        if(e.target.classList.contains('image-preview')){
            var imageUrl = e.target.style.backgroundImage.replace(/(?:^url\(["']?|["']?\)$)/g, "");
            updateTshirtImage(imageUrl,canvas);
        }
    })

    document.getElementById('image_stamp_btn').addEventListener('click',function(e){
        document.getElementById('image_stamp_input').click();
    })

    document.getElementById('image_stamp_input').addEventListener('change',function(){
        objectURL.push(URL.createObjectURL(this.files[0]));
       document.getElementById('image_stamp_input').insertAdjacentHTML('beforebegin','<div class="image-preview"  style="background-image: url('+URL.createObjectURL(this.files[0])+');">')
    })

    document.getElementById('remove-selected').addEventListener('click',function(){
        removeItem(canvas);
    },false)

    document.getElementById('clean-all').addEventListener('click',function(){
        cleanAll(canvas);
    },false)
    document.getElementById('export-file').addEventListener('click',function(){
        exportImage(canvas);
    },false)

    document.getElementById('add-text').addEventListener('click',function(){
        addText(canvas);
    },false)

    document.getElementById("font-family").addEventListener('change',function() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.fontFamily = this.value;
            canvas.renderAll();
        }
    },false);
    // document.getElementById("text-underline").addEventListener('click',function() {
    //     var activeObject = canvas.getActiveObject();
    //     if (activeObject && activeObject.type === 'text') {
    //         activeObject.set('textDecoration',(activeObject.textDecoration == 'underline' ? '' : 'underline'));
    //         canvas.renderAll();
    //     }
    // },false);
    // document.getElementById("text-strike").addEventListener('click',function() {
    //     var activeObject = canvas.getActiveObject();
    //     if (activeObject && activeObject.type === 'text') {
    //         activeObject.set('textDecoration',(activeObject.textDecoration == 'line-through' ? '' : 'line-through'));
    //         canvas.renderAll();
    //     }
    // },false);	
    document.getElementById("text-italic").addEventListener('click',function() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.set('fontStyle',activeObject.fontStyle == 'italic' ? '' : 'italic');
            canvas.renderAll();
        }
    },false);		
    document.getElementById("text-bold").addEventListener('click',function() {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.set('fontWeight',activeObject.fontWeight == 'bold' ? '' : 'bold');
            canvas.renderAll();
        }
    },false);	 	 
// });
function setFont(font){
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'text') {
      activeObject.fontFamily = font;
      canvas.renderAll();
    }
}
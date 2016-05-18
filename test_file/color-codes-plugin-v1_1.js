/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


    var colorArr = {
        "blue": {            
            "C336699": ["#336699", "#4775A3", "#5C85AD", "#7094B8", "#85A3C2", "#99B2CC", "#ADC2D6", "#C2D1E0", "#D6E0EB"],
            "C29537C": ["#29537C", "#3E6489", "#547596", "#6987A3", "#7F98B0", "#94A9BE", "#A9BACB", "#BFCBD8", "#D4DDE5"],
            "C547596": ["#547596", "#6583A0", "#7691AB", "#879EB6", "#98ACC0", "#AABACA", "#BBC8D5", "#CCD6E0", "#DDE3EA"],
            "C7F98B0": ["#7F98B0", "#8CA2B8", "#99ADC0", "#A5B7C8", "#B2C1D0", "#BFCCD8", "#CCD6DF", "#D9E0E7", "#E5EAEF"]
        }
    }
    var colorSeter = ["#993333", "#339966", "#336699"]   //Color Set Is R.G.B(R: "#993333", G: "#339966", B: "#336699")..
function getColor(obj){
    var name = obj.name,
        length = parseInt(obj.length, 10),
        colors = [],
        diff = Math.ceil( length / 4);
    if(obj.colortype == "mix"){
        for(var i = 0; i < diff; i++){
            for(var k in colorArr[name]){
                colors.push(colorArr[name][k][i]);
            }
        }
    }else if(obj.colortype == "serialize"){    
        for(var k in colorArr[name]){
            var remainLength = length - colors.length;
            remainLength = remainLength > colorArr[name][k].length ? colorArr[name][k].length : remainLength;
            for(var i = 0; i < remainLength; i++){
                colors.push(colorArr[name][k][i]);
            }
        }
    }else if(obj.colortype == "gen"){
        var colorIndex = obj.startingColor !== undefined ? 
                    ((obj.startingColor.toUpperCase() === "R") ? 0 :
                    (obj.startingColor.toUpperCase() === "G") ? 1 :
                    (obj.startingColor.toUpperCase() === "B") ? 2 : 0) : 0;
        var colors = shadeColor(colorIndex, 0.5, length);        //Blue Shades.
    }
    return colors;
}

function shadeColor(colorIndex, percent, n) {
    var colorAr = [],
        changeOrder = "desc";
        
    var diff = Math.floor(70 / parseInt(n, 10));
        diff = diff > 20 ? 20 : diff < 5 ? 5 : diff;
    
    for(var i = 0; i< colorSeter.length; i++){
        if(parseInt(colorAr.length, 10) < parseInt(n, 10)){
            
            colorIndex = i === 0 ? colorIndex : (colorIndex >= (colorSeter.length - 1)) ? 0 : (colorIndex + 1);
            var color = colorSeter[parseInt(colorIndex, 10)];   //Get Color From ColorSeter Arr.           
            var num = parseInt(color.slice(1),16);

            var remainLen = parseInt(n, 10) - parseInt(colorAr.length, 10);
            
            var obj = {};
                obj.percent = percent;
                obj.num = num;
                obj.n = remainLen;
                obj.diff = diff;
                obj.changeOrder = changeOrder,
                obj.minPer = parseFloat(0.5),
                obj.maxPer = parseFloat(70);
            
            var returnArr = colorGenerate(obj);
            colorAr = $.merge(colorAr, returnArr);
        }else{
            break;
        }
    }
    return colorAr;
}
/*
 *  @define: Genareting color shades..
 *  @return: color code array.
 *  @use: use only in @getColor function to get color shades array..
 */

function colorGenerate(obj){
    var percent = obj.percent,
        num = obj.num,
        n = obj.n,
        arr = [],
        diff = obj.diff,
        changeOrder = obj.changeOrder,
        minPer = parseFloat(obj.minPer),
        maxPer = parseFloat(obj.maxPer);
    for(var i= 0; i< parseInt(n, 10); i++){
        if((changeOrder === "desc" && percent <= maxPer)){
            var amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            G = (num >> 8 & 0x00FF) + amt,
            B = (num & 0x0000FF) + amt;
            var colorCode = "#"+(0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
            arr.push(colorCode);
            percent += diff;
            
        }
        else{
            break;
        }
    }
//    console.log("arr: "+arr);
    return arr;
}
/*
 *  @define: Genareting color shades..
 *  @return: color code.
 *  @use: use only in @customeCategoryAds plugin..
 */

function colorGenerateSingle(obj){
    var percent = obj.percent,
        num = obj.num,
        changeOrder = obj.changeOrder,
        maxPer = parseFloat(obj.maxPer);
    if((changeOrder === "desc" && percent <= maxPer)){
            var amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            G = (num >> 8 & 0x00FF) + amt,
            B = (num & 0x0000FF) + amt;
            var colorCode = "#"+(0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
            
            return colorCode;
        }
}


customeCategoryAds = function (value){
    var colorIndex = 0,                     // FIxed blue color for starting color..
        color = colorSeter[parseInt(colorIndex, 10)],   //Get Color From ColorSeter Arr.           
        num = parseInt(color.slice(1),16);
    
    var percent = 0.5,
        diff = 5,
        changeOrder = "desc",
        maxPer = parseFloat(70),
        colorStore = {};
        
    var genColor = function(value){             //function manipulate user input...
        //Change the base color if the color index is exceeded( percentage more than 70 )..
        if(colorStore[value] === undefined){
            if(percent > maxPer){
                colorIndex = (colorIndex >= (colorSeter.length - 1)) ? 0 : (colorIndex + 1);
                color = colorSeter[parseInt(colorIndex, 10)]; 
                num = parseInt(color.slice(1),16);
                percent = 0.5;
            }
            var obj = {};
                obj.percent = percent;
                obj.num = num;
                obj.changeOrder = changeOrder,
                obj.maxPer = parseFloat(70);
            percent += diff;
            var colorCode =  colorGenerateSingle(obj);
            colorStore[value] = colorCode;
            return colorCode;
        }else{
            return colorStore[value];
        }
        
    }
    return genColor;
}

/* 
 *  Document   : D3 Pie and Donut Chart Plugin.
    Created on : 12 Feb, 2015, 12:17:59 PM
    Author     : ujjal sannyal
    version    : 1.51
 */


/* 
 * @param: {object}
 * @object: 
 * (1) useTransition: set true for transition the donut path, set false for normal view(@default: true),
 * (2) width: set width(@default: 200),
 * (3) height: set height(@default: 200),
 * (4) transitionDuration: set duration for the transition in milisecond(@default: 500),
 * (5) transitionDelay: set delay for the transition in milisecond(@default: 500),
 * (6) data: data of main donut chart(@default: null),
 * (7) color: main donut color(@default: "#738AFF"),
 * (8) padding: All side padding from border(@default: 0px),
 * (9) thickness: Main donut thickness(@default: 10px),
 * (10) innerRadius: Main donut inner radious(@default: 28px),
 * (11) outerRadius: Main donut outer thickness(@default: 15px),
 * (12) centerLablePrefix: Center value's prefix(@default: "") ex(Rs, Usd, ect),
 * (13) centerLableSuffix: Center value's suffix(@default: "") ex(%, ect),
 * (14) centerLableFontSize: Center Value's font size(@default: 12px),
 * (15) container: Container for donut(@default: "body") use {container: $("id") / container: $("class")},
 * (16) showTotalCount: Show Total Count In the middle(@default: true).
 * (17) centerLablePrefix: 
 * (18) centerLableSuffix: "",
   (19) centerLableFontSize: "12px",
   (20) container: "body",
   (21) subChart: false,
   (22) subChartData: null,
   (23) subChartCenterLablePrefix: "",
   (24) subChartCenterLableSuffix: "",
   (25) subChartCenterLableFontSize: "10px",
   (26) subChartTransition: true,
   (27) subChartTransitionWait: true,
   (28) subChartColor: "#F1F1F1",
   (29) useTip: false,
   (30) afterTransition: function(){}
 **/

var donutchart = (function(){
    var _donutchart = function(param){
/**
* Default Value
**/
        var defaults = {
            useTransition: true,
            width: 200,
            height: 200,
            transitionDuration: 500,
            transitionDelay: 500,
            data: null,
            color: null,
            padding: 0,
            thickness: 10,            
            innerRadius: 28,
            outerRadius: 15,
            isLabelOnPath: false,
            isAnchorLebel: false,
            anchorDistance: 10,
            showTotalCount: true,
            centerLablePrefix: "",
            centerLableSuffix: "",
            centerLableFontSize: "12px",
            container: "body",
            subChart: false,
            subChartData: null,
            subChartCenterLablePrefix: "",
            subChartCenterLableSuffix: "",
            subChartCenterLableFontSize: "10px",
            subChartTransition: true,
            subChartTransitionWait: true,
            subChartColor: "#F1F1F1",
            useTip: false,
            usePathColor: true,
            tipColor: "#FFFFFF"
        };
        //merging parameter object to default object
        var opts = $.extend({},defaults, param);
        //replace default to "this" obj....
        $.extend(this, opts);
        
        this.data = this.prepareData(this.data);
        this.render();
        return this;        
    }
    
    _donutchart.prototype = {
        render: function(){
            var self = this;
            this.PiRadians = 2 * Math.PI;
            this.radius = Math.min(parseFloat(this.width), parseFloat(this.height)) / 2;
            this.ancLabel = this.radius + this.anchorDistance;
            this.outerWidth = parseFloat(this.width) + parseFloat(this.padding) * 2;
            this.outerHeight = parseFloat(this.height) + parseFloat(this.padding) * 2;
            if(this.color !== null){
                this.colorArr = d3.scale.ordinal()
                .range(this.color);
            }else{
                this.colorArr = customeCategoryAds();
            }
            
            this.arc = d3.svg.arc()
            .outerRadius(function(d){
                return d.outerRadius || (self.radius - self.outerRadius);
            })
            .innerRadius(function(d){
                return d.outerRadius || (self.radius - self.innerRadius);
            })
            .startAngle(function(d){
                return d.startAngle || 0;
            })
            .endAngle(function(d, i){
                return d.endAngle || 0;
            });
                        
            this.pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.value;
            });
            
            this.svg = d3.select(this.container).append("svg")
            .attr("width", parseFloat(this.outerWidth))
            .attr("height", parseFloat(this.outerHeight))
            .append("g")
            .attr("transform", "translate(" + parseFloat(this.width) / 2 + "," + parseFloat(this.height) / 2 + ")");
                        
            

                        
            if(this.data.details.length > 0){   
                //Set Color Array
                this.g = this.svg.selectAll(".arc")
                .data(this.pie(this.data.details))
                .enter().append("g")
                .attr("class", "arc");

                this.path = this.g.append("path")
                .style("fill", function(d){
                    return self.colorArr(d.data.name);
                });

                if(this.useTransition){  

                    this.path.transition().delay( parseFloat(self.transitionDelay) ).duration( parseFloat(self.transitionDuration) )                    
                    .attr("d", this.arc)
                    .attrTween("d", function(d) {
                        var interpolate = d3.interpolate(d.startAngle, d.endAngle);
                        return function(t) {
                            d.endAngle = interpolate(t);
                            return self.arc(d);
                        }
                    });
                    if(this.isLabelOnPath){
                        this.labelOnPath();
                    }
                }else{
                    this.path.attr("d", this.arc);
                    if(this.isLabelOnPath){
                        this.labelOnPath();
                    }
                }
                this.afterRender();
            }else{
                this.notAvailable();
            }
        },
        afterRender: function(){
            var self = this;
            this.subChartRender();  
            if(this.showTotalCount){
                this.text1 = this.svg
                    .selectAll("g")
                    .append("text")
                    .attr("class", "total")
                    .attr("y", 0)
                    .attr("x", 0)
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle")
                    .style("font-size", self.centerLableFontSize);

                if(this.useTransition){  

                    this.text1.text("")
                    .datum(function(d){
                        var obj = {
                            prefix: self.centerLablePrefix,
                            value :Math.round(self.data.total),
                            suffix: self.centerLableSuffix
                        }
                        return obj;
                    })
                    .transition().delay( parseFloat(self.transitionDelay) ).duration( parseFloat(self.transitionDuration) )
                    .tween("text",  self.labelTween_T);
                }else{
                    this.text1.text(self.centerLablePrefix + Math.round(self.data.total) + self.centerLableSuffix);
                }

            }
            if(this.useTip){
                this.tip = d3.select("body").append("div").attr("class", "toolTip");
                this.showTip(this.path);
            }
            if(this.isAnchorLebel){
                this.anchorLebel();
            }
        },
        subChartRender: function(){
            var self = this;
            if(this.subChart){
                
                this.subChartData = this.prepareData(this.subChartData); 
                
                this.ratio = this.subChartData.total / this.data.total;
                
                this.arc_2 = d3.svg.arc()
                .outerRadius(this.radius - (this.innerRadius))
                .innerRadius(0)
                .startAngle(function(d){
                    return d.startAngle || 0;
                })
                .endAngle(function(d){
                    return d.endAngle || 0;
                });
                                   
                this.g_2 = this.svg.selectAll(".arc_2")
                .data(this.pie(this.subChartData.details))
                .enter()
                .append("g")
                .attr("class", "arc_2");

                this.path_2 = this.g_2.append("path")
                .datum(function(d){                    
                    d.endAngle = self.ratio * self.PiRadians; 
                    return d;
                })
                .style("fill", self.subChartColor); 
                            
                if(this.subChartTransition){
                    
                    var delay = this.subChartTransitionWait ? (parseFloat(self.transitionDelay) + parseFloat(self.transitionDuration)) : self.transitionDelay;

                    this.path_2.transition().delay(delay).duration(self.transitionDuration)
                    .attr("d", this.arc_2)
                    .attrTween("d", function(d){
                        var interpolate = d3.interpolate(d.startAngle, d.endAngle);
                        return function(t) {
                            d.endAngle = interpolate(t);
                            return self.arc_2(d);
                        }
                    });
                }else{
                    this.path_2.attr("d", this.arc_2);
                }

                this.total_2 = this.svg.selectAll("g")
                .append("text")
                .attr("class", "total-2")
                .attr("y", 32)
                .attr("x", 3)
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .style("font-size", self.subChartCenterLableFontSize);

                if(this.subChartTransition){
                    
                    this.total_2.datum(function(){
                        var obj = {
                            prefix: self.subChartCenterLablePrefix,
                            value : Math.round(self.ratio*100), 
                            suffix: self.subChartCenterLableSuffix
                        }
                        return obj;
                    })
                    .transition().delay(delay).duration(self.transitionDuration )
                    .tween("text",self.labelTween_T);
                }else{
                    this.total_2.text(self.subChartCenterLablePrefix + Math.round(self.ratio*100) + self.subChartCenterLableSuffix);
                }
                
                if(this.useTip){
                    this.showTip(this.path_2);
                }
 
            }
        },
        labelTween_T: function (a) {
            var i = d3.interpolate(0, a.value);
            return function(t) {
                this.textContent = a.prefix + Math.round(i(t)) + a.suffix;
            }
        },
        prepareData: function(data){
            var index_arr = [],
            total = 0,
            self = this;
            data.forEach(function(d, i) {
                self.dataRange = d3.keys(data[i]).filter(function(key) {
                    return key;
                });
                if(d[self.dataRange[0]] != 0){
                    d.name = self.dataRange[0];
                    d.value = d[self.dataRange[0]];
                }else{                                                          // if the value is zero then index is store in array 
                    index_arr.push(i);
                }
            }); 
        
            // those value is zero they are deleted
        
            var arr = $.grep(data, function(n, i) {
                return $.inArray(i, index_arr) == -1;
            });
            
            data = {},
            data.details = [];                                                  
            if(arr.length > 0){
                data.details = arr;                                     //saperate values for different chart
            }    
            
            $.each(data.details, function(key, v){
                total = parseInt(total, 10) + parseInt(v.value, 10);                        
            });
            
            data.total = total;
            return data;
            
        },
        showTip: function(pathObj){
            var self = this;
            pathObj.on("mousemove", function(d){
                var amt = parseFloat(d.data.value) < 0 ? "0" : d.data.value;
                var html = d.data.name+" : <span><strong> "+amt+"</strong></span>";
                self.tip.style("left", d3.event.pageX+10+"px");
                self.tip.style("top", d3.event.pageY-25+"px");
                self.tip.style("display", "inline-block");
                self.tip.html(html);
                if(self.usePathColor){
                    self.tip.style("background", self.colorArr(d.data.name));
                }else{
                    self.tip.style("background", self.tipColor);
                }
            })
            .on("mouseout", function(d){
                self.tip.style("display", "none");
            }).style("cursor","pointer");
        },
        notAvailable: function(){
            this.svg.append("g")
            .attr("transform", "translate(0, 0)")
            .append("text")
            .attr("class", "na-class")
            .attr("x","-18") 
            .attr("y", "0")
            .text("N / A");
        },
        labelOnPath: function(){
            var self = this;
            if(this.useTransition){
                this.g.append("text")
                    .attr("transform", function(d) {
                        return "translate(" + self.arc.centroid(d) + ")";
                    })
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle")
                    .text(function(d) {
                        return d.data.name;
                    });
                    
            }else{
                this.g.append("text")
                    .attr("transform", function(d) {
                        return "translate(" + self.arc.centroid(d) + ")";
                    })
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle")
                    .text(function(d) {
                        return d.data.name;
                    });
            }
        },
        anchorLebel: function(){
            var self = this;
            this.g.append("svg:text")
                .attr("transform", function(d) {
                    var c = self.arc.centroid(d),
                        x = c[0],
                        y = c[1],
                        // pythagorean theorem for hypotenuse
                        h = Math.sqrt(x*x + y*y);
                    return "translate(" + (x/h * self.ancLabel) +  ',' +
                    (y/h * self.ancLabel) +  ")"; 
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) {
                    // are we past the center?
                    return (d.endAngle + d.startAngle)/2 > Math.PI ?
                        "end" : "start";
                })
                .text(function(d, i) { return d.data.name; });
        }
    }
    
    return _donutchart;
        
})();

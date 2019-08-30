
import { readData } from "./preprocessing/processingData";
import { myChart } from "./visualization/myChart.js";
import * as d3 from "d3";

export default function (_dataSpec) {
    
  ///////////////////////////////////////////////////
  // 1.0 ADD visualization specific variables here //
  ///////////////////////////////////////////////////
  let options = {};
  // 1. ADD all options that should be accessible to caller
  options.debugOn = false;
  options.margin = {top: 20, right: 10, bottom: 20, left: 10};
  options.svgDimensions = {height: 800, width: 1400};
  options.nodeLabelLength = 50;
  options.transitionDuration = 750;

  options.defaultColor = "grey";
  
  options.nodeImageFile = false; // node image from file or selection
  options.nodeImageFileAppend = undefined; //callback function which returns a image URL
  options.nodeImageSetBackground = false;
  options.nodeImageWidth = 10;
  options.nodeImageHeight = 10;
  options.nodeImageX = options.nodeImageWidth / 2;
  options.nodeImageY = options.nodeImageHeight / 2;
  options.nodeImageSelectionAppend = undefined;
  options.nodeImageSelectionUpdate = undefined; // if node changes depending on it is expandable or not

  options.nodeLabelPadding = 10;

  options.linkHeight = 20;

  options.linkLabelField = "value";
  options.linkLabelOn = false;
  options.linkLabelUnit = "";
  options.linkLabelOnTop = true;
  options.linkLabelAligned = true; // otherwise centered
  // options.linkLabelFormat = d => d;

  options.locale = undefined;
  options.linkLabelFormatSpecifier = ",.0f"; 
  options.linkLabelFormat = d3.format(options.linkLabelFormatSpecifier);

  options.linkLabelColor; // function for setting the label color based on the value.

  // true if linkWidth is a fixed number, otherwise dynamically calculated from options.linkWidthField
  options.linkWidthStatic = true; 
  options.linkWidthValue = 30;
  options.linkWidthScale = d3.scaleLinear();
  options.linkWidthField = "value";
  options.linkWidthRange = [15, 100];

  // true if linkStrength is a fixed number, otherwise dynamically calculated from options.linkStrengthField
  options.linkStrengthStatic = true; 
  options.linkStrengthValue = 1;
  options.linkStrengthScale = d3.scaleLinear();
  options.linkStrengthField = "value";
  options.linkStrengthRange = [1, 10];

  options.linkColorStatic = true;
  options.linkColorScale = (value) => value; // id function as default - assuming linkColorField contains colors
  options.linkColorField = "color";
  options.linkColorInherit = true; // vertical link inherits color from parent

  options.propagate = false; // default: no propagation
  options.propagateField = "value"; // default field for propagation

  options.alignLeaves = false; // use tree layout as default, otherwise cluster layout
  options.keyField = "key";

  // 2. ADD getter-setter methods here
  chartAPI.debugOn = function(_) {
    if (!arguments.length) return options.debugOn;
    options.debugOn = _;
    return chartAPI;
  }; 

  chartAPI.defaultColor = function(_) {
    if (!arguments.length) return options.defaultColor;
    options.defaultColor = _;
    if (typeof options.updateLinkColor === "function") options.updateLinkColor();
    return chartAPI;
  }; 
  
  chartAPI.margin = function(_) {
    if (!arguments.length) return options.margin;
    options.margin = _;
    return chartAPI;
  }; 

  chartAPI.svgDimensions = function(_) {
    if (!arguments.length) return options.svgDimensions;
    options.svgDimensions = _;
    return chartAPI;
  }; 
    
  chartAPI.nodeLabelLength = function(_) {
    if (!arguments.length) return options.nodeLabelLength;
    options.nodeLabelLength = _;
    return chartAPI;
  };

  chartAPI.nodeLabelPadding = function(_) {
    if (!arguments.length) return options.nodeLabelPadding;
    options.nodeLabelPadding = _;
    return chartAPI;
  };

  chartAPI.transitionDuration = function(_) {
    if (!arguments.length) return options.transitionDuration;
    options.transitionDuration = _;
    return chartAPI;
  };  

  chartAPI.propagateValue = function(_) {
    if (!arguments.length) return options.propagate + ": " + options.propagateField;
    options.propagate = true;
    options.propagateField = _;
    return chartAPI;
  }; 

  chartAPI.formatDefaultLocale = function(_) {
    if (!arguments.length) return options.locale;
    if (_ === "DE"){
      _ = {
        "decimal": ",",
        "thousands": ".",
        "grouping": [3],
        "currency": ["", " €"]   
      };
    }
    options.locale = d3.formatDefaultLocale(_);
    return chartAPI;
  }; 

  // 3. ADD getter-setter methods with updateable functions here
  chartAPI.nodeImageFile = function(_callback, _options = {}) {
    if (!arguments.length) return options.nodeImageFileAppend;
    options.nodeImageFile = true;
    options.nodeImageFileAppend = _callback;
    options.nodeImageWidth = _options.width || options.nodeImageWidth;
    options.nodeImageHeight = _options.height || options.nodeImageHeight;
    options.nodeImageX = _options.x || -1 * options.nodeImageWidth / 2;
    options.nodeImageY = _options.y || -1 * options.nodeImageHeight / 2;
    options.nodeImageSetBackground = _options.setBackground || options.nodeImageSetBackground;
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  };

  chartAPI.nodeImageSelection = function(_append, _update) {
    if (!arguments.length) return options.nodeImageSelectionAppend;
    options.nodeImageSelectionAppend = _append;
    options.nodeImageSelectionUpdate = _update;
    options.nodeImageFile = false;
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  };

  chartAPI.linkHeight = function(_) {
    if (!arguments.length) return options.linkHeight;
    options.linkHeight = _;
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  };

  chartAPI.linkLabel = function(_ = options.linkLabelField, _options = {}) { 
    if (!arguments.length) return options.linkLabelField;

    if (typeof(_)  === "string")  {
      options.linkLabelField = _; 
      options.linkLabelOn = true;
    } else if (typeof(_)  === "boolean") {
      options.linkLabelOn = _;
    }
    if (options.linkLabelOn) {
      if (_options.locale) { chartAPI.formatDefaultLocale(_options.locale); }
      options.linkLabelColor = _options.color || options.linkLabelColor;
      options.linkLabelUnit = _options.unit || options.linkLabelUnit;
      options.linkLabelFormat = (_options.format) ? d3.format(_options.format) : options.linkLabelFormat;
      options.linkLabelOnTop = (typeof (_options.onTop) !== "undefined") ? _options.onTop : options.linkLabelOnTop;
      options.linkLabelAligned = (typeof (_options.align) !== "undefined") ? _options.align : options.linkLabelAligned;
    }
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  };

  chartAPI.linkWidth = function(_ = options.linkWidthField, _options = {}) {
    if (!arguments.length) return options.linkWidthValue;
    if (typeof (_) === "number") { 
      options.linkWidthStatic = true;
      options.linkWidthValue = _;
    }
    else if (typeof(_) === "string") {
      options.linkWidthStatic = false;
      options.linkWidthField = _;
      options.linkWidthScale  = _options.scale || options.linkWidthScale;
      options.linkWidthRange = _options.range || options.linkWidthRange;
    }
    
    if (typeof options.updateLinkWidth === "function") options.updateLinkWidth();
    return chartAPI;
  };

  chartAPI.linkStrength = function(_ = options.linkStrengthField, _options = {}) {
    if (!arguments.length) return options.linkStrengthValue;
    if (typeof (_) === "number") { 
      options.linkStrengthStatic = true;
      options.linkStrengthValue = _;
    }
    else if (typeof(_) === "string") {
      options.linkStrengthStatic = false;
      options.linkStrengthField = _;
      options.linkStrengthScale = _options.scale || options.linkStrengthScale;
      options.linkStrengthRange = _options.range || options.linkStrengthRange;
    }
    
    if (typeof options.updateLinkStrength === "function") options.updateLinkStrength();
    return chartAPI;
  };

  chartAPI.linkColor = function(_ = options.linkColorField, _options = {}) {
    if (!arguments.length) return options.linkColorField;
    options.linkColorStatic = false;
    options.linkColorField = _;
    options.linkColorScale = _options.scale || options.linkColorScale;
    options.linkColorInherit = (typeof (_options.inherit) !== "undefined") ? _options.inherit : options.linkColorInherit;
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  }; 
  /*
  chartAPI.linkColor = function(_ = options.linkColorField, scale = options.linkColorScale) {
    if (!arguments.length) return options.linkColorField;
    options.linkColorStatic = false;
    options.linkColorField = _;
    options.linkColorScale = scale;
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  }; 
  */

  chartAPI.alignLeaves = function(_) {
    if (!arguments.length) return options.alignLeaves;
    options.alignLeaves = _;
    if (typeof options.updateAlignLeaves === "function") options.updateAlignLeaves();
    return chartAPI;
  }; 
  
  ////////////////////////////////////////////////////
  // API for external access                        //
  //////////////////////////////////////////////////// 

  // standard API for selection.call()
  function chartAPI(selection) {
    selection.each( function (d) {
      console.log(d);
      console.log("dataSpec: "); console.log(_dataSpec);
      if (typeof d !== "undefined") { // data processing from outside
        createChart(selection, d);
      }
      else { // data processing here
        const myData = createDataInfo(_dataSpec);
        readData(myData, selection, options.debugOn, createChart);
      }
    });
  }  

  function createDataInfo(dataSpec) {
    let myData = {};

    if (typeof dataSpec === "object"){ 
      myData.data = dataSpec.source;
      myData.hierarchyLevels = dataSpec.hierarchyLevels;
      myData.keyField = dataSpec.key ? dataSpec.key : "key";
      myData.delimiter = dataSpec.delimiter ? dataSpec.delimiter : ",";
    } else {
      console.log("dataspec is not an object!");
    }
    myData.isJSON = typeof (myData.data) === "object";
    if (!myData.isJSON){
      myData.fromFile = (myData.data.endsWith(".json") || myData.data.endsWith(".csv")) ? true : false;
    }
    myData.flatData = Array.isArray(myData.hierarchyLevels) ? true : false;
    options.keyField = myData.keyField;
    return myData;
  }

  // call visualization entry function
  function createChart(selection, data) {
    myChart(selection, data, options);
  }
  
  return chartAPI;
}

FBL.ns(function() { with (FBL) {

// list taken from FirePalette (http://blog.endflow.net/?p=143)
var colorNames = {
  aliceblue: "f0f8ff", antiquewhite: "faebd7", aqua: "00ffff",
  aquamarine: "7fffd4", azure: "f0ffff", beige: "f5f5dc",
  bisque: "ffe4c4", black: "000000", blanchedalmond: "ffebcd",
  blue: "0000ff", blueviolet: "8a2be2", brown: "a52a2a",
  burlywood: "deb887", cadetblue: "5f9ea0", chartreuse: "7fff00",
  chocolate: "d2691e", coral: "ff7f50", cornflowerblue: "6495ed",
  cornsilk: "fff8dc", crimson: "dc143c", cyan: "00ffff",
  darkblue: "00008b", darkcyan: "008b8b", darkgoldenrod: "b8860b",
  darkgray: "a9a9a9", darkgreen: "006400", darkkhaki: "bdb76b",
  darkmagenta: "8b008b", darkolivegreen: "556b2f", darkorange: "ff8c00",
  darkorchid: "9932cc", darkred: "8b0000", darksalmon: "e9967a",
  darkseagreen: "8fbc8f", darkslateblue: "483d8b", darkslategray: "2f4f4f",
  darkturquoise: "00ced1", darkviolet: "9400d3", deeppink: "ff1493",
  deepskyblue: "00bfff", dimgray: "696969", dodgerblue: "1e90ff",
  feldspar: "d19275", firebrick: "b22222", floralwhite: "fffaf0",
  forestgreen: "228b22", fuchsia: "ff00ff", gainsboro: "dcdcdc",
  ghostwhite: "f8f8ff", gold: "ffd700", goldenrod: "daa520",
  gray: "808080", green: "008000", greenyellow: "adff2f",
  honeydew: "f0fff0", hotpink: "ff69b4", indianred : "cd5c5c",
  indigo : "4b0082", ivory: "fffff0", khaki: "f0e68c",
  lavender: "e6e6fa", lavenderblush: "fff0f5", lawngreen: "7cfc00",
  lemonchiffon: "fffacd", lightblue: "add8e6", lightcoral: "f08080",
  lightcyan: "e0ffff", lightgoldenrodyellow: "fafad2", lightgrey: "d3d3d3",
  lightgreen: "90ee90", lightpink: "ffb6c1", lightsalmon: "ffa07a",
  lightseagreen: "20b2aa", lightskyblue: "87cefa", lightslateblue: "8470ff",
  lightslategray: "778899", lightsteelblue: "b0c4de", lightyellow: "ffffe0",
  lime: "00ff00", limegreen: "32cd32", linen: "faf0e6",
  magenta: "ff00ff", maroon: "800000", mediumaquamarine: "66cdaa",
  mediumblue: "0000cd", mediumorchid: "ba55d3", mediumpurple: "9370d8",
  mediumseagreen: "3cb371", mediumslateblue: "7b68ee", mediumspringgreen: "00fa9a",
  mediumturquoise: "48d1cc", mediumvioletred: "c71585", midnightblue: "191970",
  mintcream: "f5fffa", mistyrose: "ffe4e1", moccasin: "ffe4b5",
  navajowhite: "ffdead", navy: "000080", oldlace: "fdf5e6",
  olive: "808000", olivedrab: "6b8e23", orange: "ffa500",
  orangered: "ff4500", orchid: "da70d6", palegoldenrod: "eee8aa",
  palegreen: "98fb98", paleturquoise: "afeeee", palevioletred: "d87093",
  papayawhip: "ffefd5", peachpuff: "ffdab9", peru: "cd853f",
  pink: "ffc0cb", plum: "dda0dd", powderblue: "b0e0e6",
  purple: "800080", red: "ff0000", rosybrown: "bc8f8f",
  royalblue: "4169e1", saddlebrown: "8b4513", salmon: "fa8072",
  sandybrown: "f4a460", seagreen: "2e8b57", seashell: "fff5ee",
  sienna: "a0522d", silver: "c0c0c0", skyblue: "87ceeb",
  slateblue: "6a5acd", slategray: "708090", snow: "fffafa",
  springgreen: "00ff7f", steelblue: "4682b4", tan: "d2b48c",
  teal: "008080", thistle: "d8bfd8", tomato: "ff6347",
  turquoise: "40e0d0", violet: "ee82ee", violetred: "d02090",
  wheat: "f5deb3", white: "ffffff", whitesmoke: "f5f5f5",
  yellow: "ffff00", yellowgreen: "9acd32"
};


// taken from Firebug | cssPanel.js (version 1.10.3)
var reSplitCSS = /(url\("?[^"\)]+"?\)?)|(rgba?\([^)]*\)?)|(hsla?\([^)]*\)?)|(#[\dA-Fa-f]+)|(-?\d+(\.\d+)?(%|[a-z]{1,4})?)|"([^"]*)"?|'([^']*)'?|([^,\s\/!\(\)]+)|(!(.*)?)/;

function parseCSSValue(value, offset) {
  var start = 0;
  var m;
  while (true)
  {
    m = reSplitCSS.exec(value);
    if (m && m.index+m[0].length < offset)
    {
      value = value.substr(m.index+m[0].length);
      start += m.index+m[0].length;
      offset -= m.index+m[0].length;
    }
    else
      break;
  }

  if (m)
  {
    var type;
    if (m[1])
      type = "url";
    else if (m[2] || m[3] || m[4])
      type = "rgb";
    else if (m[3])
      type = "hsl";
    else if (m[5])
      type = "int";

    return {value: m[0], start: start+m.index, end: start+m.index+(m[0].length-1), type: type};
  }
}
// end of firebug helpers

var splitCSSValues = function(cssValue) {
  var offset = 0, cssValues = [], cssValueLength = cssValue.length, nextValue = parseCSSValue(cssValue, offset), previousValue;
  while (nextValue) {
    cssValues.push(nextValue);
    offset        = nextValue.end + 1;
    previousValue = nextValue;
    while ((nextValue = parseCSSValue(cssValue, offset)) && nextValue.start == previousValue.start) { offset++; }
  }
  return cssValues;
};

var Color = function(v1, v2, v3, a) {
  this.v1 = v1 || 0;
  this.v2 = v2 || 0;
  this.v3 = v3 || 0;
  this.a = undefined == a ? 1 : a;
};

Color.prototype = {
  toString: function() {
    var a = this.a, useAlpha = a < 1, colorStr = this.colorType;
    if (useAlpha) { colorStr += 'a'; }
    colorStr += '(' + this.v1toString() + ', ' + this.v2toString() + ', ' + this.v3toString();
    if (useAlpha) { colorStr += ', ' + (Math.round(a * 100) / 100); }
    return colorStr + ')';
  },
  
  v1toString: function() {
    return this.v1;
  },
  
  v2toString: function() {
    return this.v2;
  },
  
  v3toString: function() {
    return this.v3;
  }
};

Color.prototype.toFullString = Color.prototype.toString;

Color.RGB = function(r, g, b, a) {
  Color.call(this, r, g, b, a);
};

Color.RGB.prototype = descend(new Color(), {
  constructor: Color.RGB,
  colorType: 'rgb',
  
  toString: function() {
    return this.a < 1 ? this.toFullString() : this.toHEXString();
  },
  
  toHEXString: function() {
    // taken from firebug
    var r = this.v1, g = this.v2, b = this.v3;
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + (b << 0)).toString(16).substr(-6).toUpperCase();
  },
  
  toRGB: function() {
    return this;
  },
  
  toHSV: function() {
    var r = this.v1, g = this.v2, b = this.v3, a = this.a;
    
    var max   = Math.max(r, g, b),
        min   = Math.min(r, g, b),
        delta = max - min,
        s     = (max === 0) ? 0 : 1-(min/max),
        v     = max, h;

    switch (max) {
       case min: h=0; break;
       case r:   h=(g-b)/delta;
                 if (g<b) {h+=6}
                 break;
       case g:   h=2+(b-r)/delta; break;
       case b:   h=4+(r-g)/delta; break;
    }

    return new Color.HSV(h / 6, s, v / 255, a);
  }
});

Color.HueBased = descend(new Color(), {
  v1toString: function() {
    return Math.round(this.v1 * 360);
  },
  
  v2toString: function() {
    return Math.round(this.v2 * 100) + '%';
  },
  
  v3toString: function() {
    return Math.round(this.v3 * 100) + '%';
  }
});

Color.HSL = function(h, s, l, a) {
  Color.call(this, h, s, l, a);
};

Color.HSL.prototype = descend(Color.HueBase, {
  constructor: Color.HSL,
  colorType: 'hsl',
  
  toHSL: function() {
    return this;
  },
  
  toHSV: function() {
    var h = this.v1, s = this.v2, l = this.v3,
        processedL = l * 2,
        processedS = s * (processedL <= 1 ? processedL : 2 - processedL);
    
    return new Color.HSV(h, (2 * processedS) / (processedL + processedS), (processedL + processedS) / 2, this.a);
  }
});

Color.HSV = function(h, s, v, a) {
  Color.call(this, h, s, v, a);
};

Color.HSV.prototype = descend(Color.HueBase, {
  constructor: Color.HSV,
  colorType: 'hsv',
  
  toHSV: function() {
    return this;
  },
  
  toRGB: function() {
    var h = this.v1, s = this.v2, v = this.v3, a = this.a;
    
    if (h + 0.0000000001 >= 1) {h = 0}
    h *= 6;

    var i = parseInt(h, 10),
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - s * f),
        t = v * (1 - s * (1 - f)),
        r, g, b;

    switch (i) {
        case 0: r=v; g=t; b=p; break;
        case 1: r=q; g=v; b=p; break;
        case 2: r=p; g=v; b=t; break;
        case 3: r=p; g=q; b=v; break;
        case 4: r=t; g=p; b=v; break;
        case 5: r=v; g=p; b=q; break;
    }

    return new Color.RGB(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), this.a);
  },
  
  toHSL: function() {
    var h = this.v1, s = this.v2, v = this.v3, a = this.a,
        newL = (2 - s) * v,
        newS = (s * v) / (newL <= 1 ? newL : 2 - newL);
    
    return new Color.HSL(h, isNaN(newS) ? 0 : newS, newL / 2, this.a);
  },
  
  setH: function(h) {
    this.v1 = h;
  },
  
  getH: function() {
    return this.v1;
  },
  
  setS: function(s) {
    this.v2 = s;
  },
  
  getS: function() {
    return this.v2;
  },
  
  setV: function(v) {
    this.v3 = v;
  },
  
  getV: function() {
    return this.v3;
  },
  
  setA: function(a) {
    this.a = a;
  },
  
  getA: function() {
    return this.a;
  }
});

var ColorValue = function(cssValueObj, translation) {
  this.cssValueObj = cssValueObj;
  this.translation = translation;
};

ColorValue.prototype = {
  bracketedSplitter: /^(rgb|hsl)a?\((\d{1,3})(%?),\s*(\d{1,3})(%?),\s*(\d{1,3})(%?)(?:,\s*([\d.]+))?\s*\)$/i,
  hexColor: /^#([\da-f]{3}|[\da-f]{6})$/i,
  noColor: new Color.RGB(),
  
  preparePrefixSuffix: function(wholeCssValue) {
    this.prefix = wholeCssValue.substring(0, this.cssValueObj.start);
    this.suffix = wholeCssValue.substring(this.cssValueObj.end + 1);
  },
  
  toNewWholeCssValue: function(newColorString) {
    return this.prefix + newColorString + this.suffix;
  },
  
  toColor: function() {
    var color, hexValue;
    if (this.translation) {
      color = this.hex2RGB(this.translation);
    } else if (this.cssValueObj.type == 'rgb' && (hexValue = this.tryToGrabHexColorString())) {
      color = this.hex2RGB(hexValue);
    } else {
      color = this.parseBracketedColor();
    }
    return color || this.noColor;
  },
  
  tryToGrabHexColorString: function() {
    var match;
    return (match = this.getValue().match(this.hexColor)) && match[1];
  },
  
  parseBracketedColor: function() {
    var match = this.cssValueObj.value.match(this.bracketedSplitter);
    if (match) {
      var colorType = match[1].toUpperCase(), v1 = parseInt(match[2], 10), v2 = parseInt(match[4], 10), v3 = parseInt(match[6], 10);
      if (colorType == 'RGB') {
        // convert percentages into byte values (0-255)
        if (match[3]) { v1 = Math.round(v1 * 2.55); }
        if (match[5]) { v2 = Math.round(v2 * 2.55); }
        if (match[7]) { v3 = Math.round(v3 * 2.55); }
      } else if (colorType == 'HSL') {
        // Color.HSL expects its values in the 0-1 range
        v1 /= 360;
        v2 /= 100;
        v3 /= 100;
      }
      return new Color[colorType](v1, v2, v3, match[8]);
    }
  },
  
  hex2RGB: function(hex) {
    if (hex.length == 3) { hex = hex.replace(/(.)/g, '$1$1'); }
    var val = parseInt(hex, 16);
    return new Color.RGB((val & 0xFF0000) >> 16, (val & 0xFF00) >> 8, val & 0xFF);
  },
  
  getValue: function() {
    return this.cssValueObj.value;
  }
};

ColorValue.newIfColor = function(cssValue) {
  var type = cssValue.type, hexTranslation;
  if (type == 'rgb' || type == 'hsl' || (hexTranslation = colorNames[cssValue.value.toLowerCase()])) {
    return new ColorValue(cssValue, hexTranslation);
  }
};

var ColorsDropDown = function(editor, firepicker) {
  this.editor     = editor;
  this.firepicker = firepicker;
};

ColorsDropDown.prototype = {
  tags: domplate({
    container: DIV({'class': 'firepicker_color_container'}, DIV({'class': 'color_list'})),
    valueCell: DIV({'class': 'color_value', style: 'background-color: $color;'},
      DIV({'class': 'css_text'}, '$color')
    )
  }),
  
  editorShown: function() {
    // This is run *after* the panel's onInlineEditorShow callback or else the newly inserted this.listContainer's will screw up the
    // editor.box's DOM structure that Firebug's a11y.js Firebug.A11yModel.onInlineEditorShow is prepared to handle.
    this.onValueChange();
    this.attachInputChangeHandler();
  },
  
  editorHidden: function() {
    // We need to clean-up after ourselves or else we're risking breaking Firebug's a11y.js Firebug.A11yModel.onInlineEditorShow that expects
    // a certain editor.box's DOM structure next time the inline editor is shown.
    // see https://github.com/thedarkone/firepicker/issues/28#issuecomment-9653403
    this.getContainerInsertionPoint().parentNode.removeChild(this.listContainer);
    this.listContainer = null;
  },
  
  attachInputChangeHandler: function() {
    if (!this.boundOnValueChange) { this.boundOnValueChange = bind(this.onValueChange, this); }
    this.editor.input.addEventListener('input', this.boundOnValueChange, false);
  },
  
  getListContainer: function() {
    if (!this.listContainer) { this.listContainer = this.tags.container.insertAfter({}, this.getContainerInsertionPoint()); }
    this.addStylesheet(this.getHTMLRootOf(this.editor.box));
    return this.listContainer;
  },
  
  getContainerInsertionPoint: function() {
    return this.editor.box.getElementsByTagName('input')[0];
  },
  
  getHTMLRootOf: function(element) {
    while (element.tagName != 'HTML' && element.parentNode) { element = element.parentNode; }
    return element;
  },
  
  addStylesheet: function(htmlRoot) {
    if (!htmlRoot._withFirepickerDropDownStylesheet) {
      var styleSheet = createStyleSheet(htmlRoot.ownerDocument, 'chrome://firepicker/skin/css-attribute-dialog.css'),
          head       = htmlRoot.getElementsByTagName('head')[0];
      head.appendChild(styleSheet);
      htmlRoot._withFirepickerDropDownStylesheet = true;
    }
  },
  
  onValueChange: function() {
    this.updateList(this.getCSSColorValues());
  },
  
  getCSSColorValues: function() {
    return this.filterColorValues(splitCSSValues(this.editor.input.value));
  },
  
  filterColorValues: function(cssValues) {
    var colorValues = [], colorValue;
    for (var i = 0, len = cssValues.length; i < len; i++) {
      if (colorValue = ColorValue.newIfColor(cssValues[i])) { colorValues.push(colorValue); }
    }
    return colorValues;
  },
  
  updateList: function(colorValues) {
    var container = this.getListContainer(), colorsList = container.firstChild;
    eraseNode(colorsList);
    for (var i = 0, len = colorValues.length; i < len; i++) { this.addColorCell(colorsList, colorValues[i]); }
    container.style.display = colorValues.length == 0 ? 'none' : 'block';
  },
  
  addColorCell: function(colorsList, colorValue) {
    var newCell = this.tags.valueCell.append({color: colorValue.getValue()}, colorsList);
    newCell.colorValue = colorValue;
    newCell.dropDown   = this;
    newCell.addEventListener('mousedown', this.cellMousedown, false);
  },
  
  cellMousedown: function(e) {
    cancelEvent(e);

    var input = this.dropDown.editor.input, text = this.firstChild, style = this.style, color = this.colorValue;
    
    color.preparePrefixSuffix(input.value);

    this.dropDown.openPopup(this, function(newRGB) {
      var newColorString    = newRGB.toString();
      input.value           = color.toNewWholeCssValue(newColorString);
      text.innerHTML        = newColorString;
      style.backgroundColor = newColorString;

      Firebug.Editor.update(true);
    });
  },
  
  openPopup: function(colorCell, callback) {
    this.firepicker.openPopup(this.editor, colorCell, colorCell.colorValue.toColor(), callback);
  }
};

var Popup = function() {};

Popup.prototype = {
  getPanel: function() {
    if (!this.panel) { this.panel = new this.PickerPanel(); }
    return this.panel;
  },
  
  open: function(editor, colorCell, color, callback) {
    var panel = this.getPanel();
    panel.preopenCheck();
    
    var position = this.computePosition(colorCell, this.getCssWrapperHeight(editor), panel.getBrowser()),
        options = {editor: editor, color: color, callback: callback};

    panel.openPopup(options, colorCell, 'overlap', position.x, position.y, false, false);
  },
  
  getCssWrapperHeight: function(editor) {
    return editor.input.ownerDocument.documentElement.clientHeight;
  },
  
  aggregateScrollOffsetTop: function(element) {
    var offset = 0;
    while (element = getOverflowParent(element)) { offset += element.scrollTop; }
    return offset;
  },
  
  computePosition: function(colorCell, cssWrapperHeight, browser) {
    var clientOffset                 = getClientOffset(colorCell),
        popUpHeight                  = browser.getAttribute('height'),
        scrollOffsetTop              = this.aggregateScrollOffsetTop(colorCell),
        toCellFromWrapperTopBorder   = clientOffset.y - scrollOffsetTop,
        idealPopupShiftUp            = (popUpHeight - colorCell.clientHeight) / 2,
        distanceToBottomScreenBorder = cssWrapperHeight - toCellFromWrapperTopBorder - (colorCell.clientHeight / 2),
        outOfScreenHeight            = Math.max(0, (popUpHeight / 2) - distanceToBottomScreenBorder);
    
    return {x: colorCell.clientWidth - 5, y: -Math.max(idealPopupShiftUp, idealPopupShiftUp + outOfScreenHeight)};
  }
};

Popup.prototype.PickerPanel = function() {
  var boundCallbacks = {};
  this.forEachCallback(function(callbackName, callback) {
    boundCallbacks[callbackName] = bind(callback, this);
  });
  this.callbacks = boundCallbacks;
};

Popup.prototype.PickerPanel.prototype = {
  getElement: function() {
    if (!this.element) { this.setElement(this.queryForElement()); }
    return this.element;
  },
  
  setElement: function(element) {
    if (this.element) { this.detachFromCurrentElement(); }
    element.wrapper = this;
    this.element = element;
    this.setupPopup();
    this.toggleCallbacks(true);
  },
  
  setupPopup: function() {
    this.getBrowser().contentDocument.expose({
      globalDocument: Firebug.FirepickerModel.getCurrentDocument(),
      bind: bind,
      Color: Color
    });
  },
  
  detachFromCurrentElement: function() {
    delete this.element.wrapper;
    this.toggleCallbacks(false);
    delete this.browser;
  },
  
  preopenCheck: function() {
    var freshResult = this.queryForElement()
    if (this.element != freshResult) { this.setElement(freshResult); }
  },
  
  queryForElement: function() {
    return Firebug.FirepickerModel.$('fp-panel');
  },
  
  getBrowser: function() {
    if (!this.browser) { this.browser = this.getElement().getElementsByTagName('browser')[0]; }
    return this.browser;
  },
  
  openPopup: function(options) {
    this.options = options;
    this.getElement().openPopup.apply(this.getElement(), Array.slice(arguments, 1));
  },
  
  toggleCallbacks: function(doAdd) {
    this.forEachCallback(function(callbackName, callback) {
      this.getElement()[doAdd ? 'addEventListener' : 'removeEventListener'](callbackName, callback, false);
    });
  },
  
  forEachCallback: function(fun) {
    for (var callbackName in this.callbacks) {
      fun.call(this, callbackName, this.callbacks[callbackName]);
    }
  },
  
  callbacks: { // these will be bound and executed in the PickerPanel's context
    popuphidden: function() {
      if (this.options) {
        var editor = this.options.editor;
        
        editor.colorsDropDown.onValueChange();
        this.getBrowser().contentDocument.popUpClosed();

        // this has to run through setTimout because FF runs the blur event on editor after this callback
        setTimeout(function(){ editor.colorPickerClosed(); }, 0);
        delete this.options;
      }
    },
    
    popuphiding: function() {
      if (this.options) { this.options.editor.closingColorPicker(); }
    },
    
    popupshown: function() {
      if (this.options) { this.getBrowser().contentDocument.initColorPicker(this.options.color, this.options.callback); }
    }
  },
};

Firebug.FirepickerModel = extend(Firebug.Module, {
  ColorsDropDown: ColorsDropDown,
  Popup: Popup,
  ColorValue: ColorValue,
  colorNames: colorNames,
  
  enable: function() {
    if (!this.initialized) { this.initialize(); }
  },

  initialize: function() {
    this.hookIntoCSSPanel('css');
    this.hookIntoCSSPanel('stylesheet');
    this.initialized = true;
  },
  
  editorExtensions: {
    closingColorPicker: function() {
      // prevent Firebug from closing the editor in FF 3.7+ (the editor gets blur event even though the panel has noautofocus="true")
      this._enterOnBlurWas = this.enterOnBlur;
      this.enterOnBlur     = false;
    },
    
    colorPickerClosed: function() {
      this.enterOnBlur = this._enterOnBlurWas;
      this.input.focus();
    }
  },
  
  hookIntoCSSEditor: function(editor) {
    if (!editor.colorsDropDown) {
      var originalShow = editor.show, originalHide = editor.hide, self = this;

      editor.colorsDropDown = new ColorsDropDown(editor, this);
      editor.show = function() {
        var result = originalShow.apply(this, arguments);
        this.colorsDropDown.editorShown();
        return result;
      };
      
      editor.hide = function() {
        var result = originalHide.apply(this, arguments);
        this.colorsDropDown.editorHidden();
        return result;
      };
      
      editor.closingColorPicker = this.editorExtensions.closingColorPicker;
      editor.colorPickerClosed  = this.editorExtensions.colorPickerClosed;
    }
  },
  
  hookIntoCSSPanel: function(type) {
    var self = this, stylesheetPanelPrototype = Firebug.getPanelType(type).prototype, original = stylesheetPanelPrototype.getEditor;
    stylesheetPanelPrototype.getEditor = function() {
      var result = original.apply(this, arguments);
      if (this.editor) { self.hookIntoCSSEditor(this.editor); }
      return result;
    }
  },
  
  openPopup: function(editor, colorCell, color, callback) {
    if (!this.colorPickerPopup) { this.colorPickerPopup = new Popup(); }
    this.colorPickerPopup.open(editor, colorCell, color, callback);
  },
  
  getCurrentDocument: function() {
    // doing the simple return document; doesn't get the right thing when FB is in detached mode
    return Firebug.currentContext.chrome.window.document;
  },
  
  $: function(id) {
    // doing Firebug.chrome.$(id) might use the incorrect document in the detached mode
    return $(id, this.getCurrentDocument());
  },
  
  log: function() {
    for (var len = arguments.length, i = 0; i < len; i++) {
      Firebug.Console.log(arguments[i]);
    }
  }
});

Firebug.registerModule(Firebug.FirepickerModel);

}});
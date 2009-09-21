FBL.ns(function() { with (FBL) {

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

var cumulativeOffset = function(element) {
  var top = 0, left = 0;
  do {
    top  += element.offsetTop  || 0;
    left += element.offsetLeft || 0;
  } while (element = element.offsetParent);
  return {left: left, top: top};
};

var reSplitCSS = /(url\("?[^"\)]+?"?\))|(rgb\(.*?\))|(#[\dA-Fa-f]+)|(-?\d+(\.\d+)?(%|[a-z]{1,2})?)|([^,\s]+)|"(.*?)"/;

function parseCSSValue(value, offset) {
  var start = 0;
  var m;
  while (1)
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
    else if (m[2] || m[3])
    type = "rgb";
    else if (m[4])
    type = "int";

    return {value: m[0], start: start+m.index, end: start+m.index+(m[0].length-1), type: type};
  }
}

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

function rgbToHex(value) {
  return value.replace(/\brgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/gi, function(_, r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + (b << 0)).toString(16).substr(-6).toUpperCase();
  });
}


Firebug.FirepickerModel = extend(Firebug.Module, {
  tags: domplate({
    colorValuesContainer: DIV({'class': 'firepicker_color_container'}),
    colorValue: DIV({'class': 'color_value', style: 'background-color: $color;'},
      DIV({'class': 'css_text'}, '$color')
    )
  }),
  
  showPanel: function(browser, panel) {
    this.initialize();
  },
  
  enable: function() {
    if (!this.initialized) { this.initialize(); }
  },

  initialize: function() {
    this.hookIntoCSSPanel();
    this.initialized = true;
  },
  
  hookIntoCSSEditor: function(editor) {
    try {
      if (!editor._firePanelCapable) {
        var self = this, originalShow = editor.show, originalOnInput = editor.onInput;
        editor.show = function(target, panel, value, targetSize) {
          try {
            var result = originalShow.apply(this, arguments);
            self.handleValueChangeInEditor(this, value);
            this.input.addEventListener('input', function() {self.handleValueChangeInEditor(editor, this.value);}, false);
            return result;
          } catch(e) {
            self.log(e);
          }
        };
        editor._firePanelCapable = true;
      }
    } catch(e) {
      alert(e);
    }
  },
  
  handleValueChangeInEditor: function(editor, newValue) {
    this.addStyleSheet(editor.box.ownerDocument);
    this.updateEditorColorDropDown(editor.box, this.filterColorValues(this.splitCSSValues(newValue)));
  },
  
  filterColorValues: function(cssValues) {
    var colorValues = [], cssValue;
    for (var i = 0, len = cssValues.length; i < len; i++) {
      cssValue = cssValues[i];
      if (cssValue.type == 'rgb' || isColorKeyword(cssValue.value)) {
        cssValue.value = rgbToHex(cssValue.value);
        colorValues.push(cssValue);
      }
    }
    return colorValues;
  },
  
  isWithColorWord: function(colorValue) {
    var value = colorValue.value.toLowerCase(), rgbValue = colorNames[value];
    if (rgbValue) {
      colorValue.value = '#' + rgbValue;
      return true;
    }
  },
  
  updateEditorColorDropDown: function(editorBox, colorValues) {
    var dropDownContainer = editorBox._colorsDropDown;
    if (!dropDownContainer) {
      dropDownContainer = editorBox._colorsDropDown = this.tags.colorValuesContainer.insertAfter({}, getChildByClass(editorBox, 'textEditorInner1'));
    }
    eraseNode(dropDownContainer);
    var colorValue, newEl, self = this, colors = [];
    for (var i = 0, len = colorValues.length; i < len; i++) {
      colorValue = colorValues[i];
      newEl = this.tags.colorValue.append({color: colorValue.value}, dropDownContainer);
      colors.push(colorValue.value);
      newEl.addEventListener('mousedown', function(e) {
        try {
          cancelEvent(e);
          var input = editorBox.querySelector('input'), value = input.value;
          self.openColorPickerPopUp(newEl, colorValue.value, function(newValue) {
            input.value                 = value.substring(0, colorValue.start) + newValue + value.substring(colorValue.end + 1);
            newEl.firstChild.innerHTML  = newValue;
            newEl.style.backgroundColor = newValue;
            Firebug.Editor.update(true);
          });
        } catch(e) {
          self.log(e);
        }
      }, true);
    }
    dropDownContainer.style.display = colorValues.length == 0 ? 'none' : 'block';
  },
  
  splitCSSValues: function(cssValue) {
    var offset = 0, cssValues = [], nextValue = parseCSSValue(cssValue, offset), previousValue;
    while (nextValue) {
      cssValues.push(nextValue);
      offset        = nextValue.end + 1;
      previousValue = nextValue;
      while ((nextValue = parseCSSValue(cssValue, offset)) && nextValue.start == previousValue.start) { offset++; }
    }
    return cssValues;
  },
  
  hookIntoCSSPanel: function() {
    try {
      var self = this, stylesheetPanelPrototype = Firebug.getPanelType('css').prototype, original = stylesheetPanelPrototype.getEditor;
      stylesheetPanelPrototype.getEditor = function() {
        var result = original.apply(this, arguments);
        if (this.editor) { self.hookIntoCSSEditor(this.editor); }
        return result;
      }
    } catch(e) {
      alert(e);
    }
  },
  
  openColorPickerPopUp: function(colorCell, color, callback) {
    var panel = $('fp-panel', document), deck = $('fbPanelBar2', document).deck,
        browser = $('fp-panel-browser', document), body = browser.contentDocument.body;
    
    var OFFSET = {x: 5, y: 0};
    
    var clientOffset = getClientOffset(colorCell), offsetSize = getOffsetSize(colorCell),
        deckSize  = {height: deck.clientHeight, width: deck.clientWidth}
        popUpSize = {height: browser.getAttribute('height'), width: browser.getAttribute('width')};

    var y = Math.min(clientOffset.y - ((popUpSize.height - colorCell.clientHeight) / 2), deckSize.height - popUpSize.height)
    
    panel.openPopup(deck, "overlap", clientOffset.x + colorCell.clientWidth, y, false, true);
    color = this.fixColor(color);
    setTimeout(function() {browser.contentDocument.initColorPicker(color, callback); }, 50);
  },
  
  fixColor: function(color) {
    var rgbTranslation = colorNames[color.toLowerCase()];
    return rgbTranslation ? '#' + rgbTranslation : rgbToHex(color);
  },
  
  log: function() {
    for (var len = arguments.length, i = 0; i < len; i++) {
      Firebug.Console.log(arguments[i]);
    }
  },
  
  getPickerDialogFrom: function(container, color) {
    var dialog = $('firepicker_dialog', container.ownerDocument);
    if (!dialog) {
      dialog = this.tags.pickerDialog.append({bgColor: color}, container);
      dialog.setAttribute('id', 'firepicker_dialog');
      // dialog.addEventListener('mousedown', bind(this.onCreateColorPicker, this), true);
      var self = this;
      dialog.addEventListener('mousedown', function(){self.log('yeaaah! true');}, true);
      dialog.addEventListener('mousedown', function(){self.log('yeaaah! false');}, false);
    }
    return dialog;
  },
  
  onCreateColorPicker: function(e) {
    var clickedColorElement = e.target, colorValue = clickedColorElement.colorValue;
    this.log('clicked: ');
    this.log(colorValue);
  },
  
  addStyleSheet: function(doc) {
    // Make sure the stylesheet isn't appended twice.
    try {
      if (!$('firePickerStyle', doc)) {
        var styleSheet = createStyleSheet(doc, 'chrome://firepicker/skin/css-attribute-dialog.css');
        styleSheet.setAttribute('id', 'firePickerStyle');
        addStyleSheet(doc, styleSheet);
        this.styleSheet = styleSheet;
        this.log(styleSheet);
      }
    } catch(e) {
      this.log(e);
    }
  },
});



Firebug.registerModule(Firebug.FirepickerModel);

}});
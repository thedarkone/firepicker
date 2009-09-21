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

var ColorsDropDown = function(editor, firepicker) {
  this.editor     = editor;
  this.firepicker = firepicker;
};

ColorsDropDown.prototype = {
  tags: domplate({
    container: DIV({'class': 'firepicker_color_container'}),
    valueCell: DIV({'class': 'color_value', style: 'background-color: $color;'},
      DIV({'class': 'css_text'}, '$color')
    )
  }),
  
  editorShown: function() {
    this.onValueChange();
    this.attachInputChangeHandler();
  },
  
  attachInputChangeHandler: function() {
    if (!this.boundOnValueChange) { this.boundOnValueChange = bind(this.onValueChange, this); }
    this.editor.input.addEventListener('input', this.boundOnValueChange, false);
  },
  
  getListContainer: function() {
    if (!this.listContainer) {
      this.listContainer = this.tags.container.insertAfter({}, getChildByClass(this.editor.box, 'textEditorInner1'));
      this.addStylesheet(this.listContainer.ownerDocument);
    }
    return this.listContainer;
  },
  
  addStylesheet: function(doc) {
    if (!$('firepickerDropDownStyle', doc)) {
      var styleSheet = createStyleSheet(doc, 'chrome://firepicker/skin/css-attribute-dialog.css');
      styleSheet.setAttribute('id', 'firepickerDropDownStyle');
      addStyleSheet(doc, styleSheet);
    }
  },
  
  onValueChange: function() {
    this.updateList(this.getCSSColorValues());
  },
  
  getCSSColorValues: function() {
    return this.filterColorValues(splitCSSValues(this.editor.input.value));
  },
  
  filterColorValues: function(cssValues) {
    var colorValues = [], cssValue;
    for (var i = 0, len = cssValues.length; i < len; i++) {
      cssValue = cssValues[i];
      if (cssValue.type == 'rgb' || isColorKeyword(cssValue.value)) { colorValues.push(cssValue); }
    }
    return colorValues;
  },
  
  updateList: function(colorValues) {
    var container = this.getListContainer();
    eraseNode(container);
    for (var i = 0, len = colorValues.length; i < len; i++) { this.addColorCell(container, colorValues[i]); }
    container.style.display = colorValues.length == 0 ? 'none' : 'block';
  },
  
  addColorCell: function(container, colorValue) {
    var newCell = this.tags.valueCell.append({color: colorValue.value}, container);
    newCell.colorValue = colorValue;
    newCell.dropDown   = this;
    newCell.addEventListener('mousedown', this.cellMousedown, false);
  },
  
  cellMousedown: function(e) {
    cancelEvent(e);

    var input = this.dropDown.editor.input, text = this.firstChild, style = this.style, colorValue = this.colorValue;
    
    colorValue = extend(colorValue, {
      prefix: input.value.substring(0, colorValue.start),
      suffix: input.value.substring(colorValue.end + 1)
    });

    this.dropDown.openPopup(this, function(newValue) {
      input.value           = colorValue.prefix + newValue + colorValue.suffix;
      text.innerHTML        = newValue;
      style.backgroundColor = newValue;

      Firebug.Editor.update(true);
    });
  },
  
  openPopup: function(colorCell, callback) {
    this.firepicker.openPopup(this.editor, colorCell, colorCell.colorValue.value, callback);
  }
};

var Popup = function() {};

Popup.prototype = {
  getPanel: function() {
    if (!this.panel) {
      this.panel = $('fp-panel', document);
      this.panel.addEventListener('popuphidden', function() {
        if (this.cssEditor && this.cssEditor.colorsDropDown) { this.cssEditor.colorsDropDown.onValueChange(); }
      }, false);
    }
    return this.panel;
  },
  
  open: function(editor, colorCell, color, callback) {
    var panel = this.getPanel(), deck = $('fbPanelBar2', document).deck, browser = $('fp-panel-browser', document),
        position = this.computePosition(colorCell, deck, browser);
    
    panel.cssEditor = editor;
    panel.openPopup(deck, "overlap", position.x, position.y, false, true);
    setTimeout(function() {browser.contentDocument.initColorPicker(color, callback); }, 50);
  },
  
  computePosition: function(colorCell, deck, browser) {
    var clientOffset = getClientOffset(colorCell),
        deckSize     = {height: deck.clientHeight, width: deck.clientWidth}
        popUpSize    = {height: browser.getAttribute('height'), width: browser.getAttribute('width')};

    return {
      x: clientOffset.x + colorCell.clientWidth,
      y: Math.min(clientOffset.y - ((popUpSize.height - colorCell.clientHeight) / 2), deckSize.height - popUpSize.height)
    };
  }
};

Firebug.FirepickerModel = extend(Firebug.Module, {
  ColorsDropDown: ColorsDropDown,
  Popup: Popup,
  
  enable: function() {
    if (!this.initialized) { this.initialize(); }
  },

  initialize: function() {
    this.hookIntoCSSPanel();
    this.initialized = true;
  },
  
  hookIntoCSSEditor: function(editor) {
    if (!editor.colorsDropDown) {
      var originalShow = editor.show, self = this;

      editor.colorsDropDown = new ColorsDropDown(editor, this);
      editor.show = function() {
        var result = originalShow.apply(this, arguments);
        this.colorsDropDown.editorShown();
        return result;
      };
    }
  },
  
  hookIntoCSSPanel: function() {
    var self = this, stylesheetPanelPrototype = Firebug.getPanelType('css').prototype, original = stylesheetPanelPrototype.getEditor;
    stylesheetPanelPrototype.getEditor = function() {
      var result = original.apply(this, arguments);
      if (this.editor) { self.hookIntoCSSEditor(this.editor); }
      return result;
    }
  },
  
  openPopup: function(editor, colorCell, color, callback) {
    if (!this.colorPickerPopup) { this.colorPickerPopup = new Popup(); }
    this.colorPickerPopup.open(editor, colorCell, this.fixColor(color), callback);
  },
  
  fixColor: function(color) {
    var rgbTranslation = colorNames[color.toLowerCase()];
    return rgbTranslation ? '#' + rgbTranslation : rgbToHex(color);
  },
  
  log: function() {
    for (var len = arguments.length, i = 0; i < len; i++) {
      Firebug.Console.log(arguments[i]);
    }
  }
});

Firebug.registerModule(Firebug.FirepickerModel);

}});
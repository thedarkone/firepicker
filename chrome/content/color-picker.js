var cumulativeOffset = function(element) {
  var top = 0, left = 0;
  do {
    top  += element.offsetTop  || 0;
    left += element.offsetLeft || 0;
  } while (element = element.offsetParent);
  return {left: left, top: top};
};

var stopEvent = function(e) {
  e.preventDefault();
  e.stopPropagation();
};

var ColorConverter = {
  HSV2RGB: function(h, s, v, a) {
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

    return new Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a && (Math.round(a * 100) / 100));
  },

  HSV2RGBString: function(h, s, v, a) {
    return this.HSV2RGB(h, s, v, a).toString();
  },

  RGB2HSV: function(rgb) {
    var r = rgb.r, g = rgb.g, b = rgb.b, a = rgb.a;
    
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

    return {h: h / 6, s: s, v: v / 255, a: a};
  }
};

var ColorPicker = function(element, color, callback) {
  this.document = element.ownerDocument;
  this.setupSB(element.querySelector('div.saturation_brightness'));
  this.setupOpacity(element.querySelector('div.opacity'));
  this.setupHue(element.querySelector('div.hue'));
  this.setupBounds();
  this.setupObservers();
  this.callback = callback;
  this.setColor(color);
};

ColorPicker.prototype = {
  dispose: function() {
    this.sbPicker.removeEventListener('mousedown', this.sbMousedown);
    this.huePicker.removeEventListener('mousedown', this.hueMousedown);
    var body = this.document.body;
    body.removeEventListener('mousemove', this.mouseMove);
    body.removeEventListener('mouseup', this.mouseUp);
    body.removeEventListener('mousedown', this.bodyMouseDown);
  },

  setupSB: function(sbElement) {
    this.sbPicker     = sbElement;
    sbElement.borders = this.getBorderWidths(sbElement);
    this.sbHandle     = sbElement.querySelector('img');
    this.sbWidth      = sbElement.offsetWidth  - sbElement.borders.left - sbElement.borders.right;
    this.sbHeight     = sbElement.offsetHeight - sbElement.borders.top  - sbElement.borders.bottom;
  },

  setupOpacity: function(opacityElement) {
    this.opacityPicker     = opacityElement;
    opacityElement.borders = this.getBorderWidths(opacityElement);
    this.opacityHandle     = opacityElement.querySelector('img');
    this.opacityWidth      = opacityElement.offsetWidth  - opacityElement.borders.left - opacityElement.borders.right;
  },

  getBorderWidths: function(el) {
    var borders = {}, borderTypes = ['top', 'right', 'bottom', 'left'], borderType, borderCSSName;
    for (var i = 0; borderType = borderTypes[i++];) {
      borderCSSName = 'border' + borderType.charAt(0).toUpperCase() + borderType.substring(1) + 'Width';
      borders[borderType] = parseInt(el.style[borderCSSName] || document.defaultView.getComputedStyle(el, null)[borderCSSName], 10);
    }
    return borders;
  },

  setupHue: function(hueElement) {
    this.huePicker     = hueElement;
    hueElement.borders = this.getBorderWidths(hueElement);
    this.hueHandle     = hueElement.querySelector('img');
    this.hueHeight     = hueElement.offsetHeight - hueElement.borders.top - hueElement.borders.bottom;
  },

  setupBounds: function() {
    var methodsToBind = ['sbMousedown', 'opacityMousedown', 'hueMousedown', 'mouseMove', 'mouseUp', 'browserMouseUp'], i = methodsToBind.length;
    while(i--) { this[methodsToBind[i]] = bind(this[methodsToBind[i]], this); }
  },

  setupObservers: function() {
    this.sbPicker.addEventListener('mousedown', this.sbMousedown, false);
    this.opacityPicker.addEventListener('mousedown', this.opacityMousedown, false);
    this.huePicker.addEventListener('mousedown', this.hueMousedown, false);
    var body = this.document.body;
    body.addEventListener('mousemove', this.mouseMove, false);
    body.addEventListener('mouseup', this.mouseUp, false);
    body.addEventListener('mousedown', this.bodyMouseDown, false);
  },

  popUpOpened: function() {
    globalDocument.addEventListener('mouseup', this.browserMouseUp, false);
  },

  popUpClosed: function() {
    globalDocument.removeEventListener('mouseup', this.browserMouseUp, false);
  },

  cumulativeOffsetWithBorders: function(element) {
    var offset = cumulativeOffset(element);
    return {top: offset.top + element.borders.top, left: offset.left + element.borders.left};
  },

  sbMousedown: function(e) {
    this.sbDrag = true;
    this.offset = this.cumulativeOffsetWithBorders(this.sbPicker);
    this.mouseMove(e);
  },

  opacityMousedown: function(e) {
    this.opacityDrag = true;
    this.offset = this.cumulativeOffsetWithBorders(this.opacityPicker);
    this.mouseMove(e);
  },

  hueMousedown: function(e) {
    this.hueDrag = true;
    this.offset  = this.cumulativeOffsetWithBorders(this.huePicker);
    this.mouseMove(e);
  },

  mouseMove: function(e) {
    if (this.sbDrag) {
      stopEvent(e);
      this.setSbPicker(e.pageY - this.offset.top, e.pageX - this.offset.left);
      this.colorChanged();
    } else if (this.opacityDrag) {
      stopEvent(e);
      this.setOpacity(e.pageX - this.offset.left);
      this.colorChanged();
    } else if (this.hueDrag) {
      stopEvent(e);
      this.setHue(e.pageY - this.offset.top);
      this.colorChanged();
    }
  },

  mouseUp: function(e) {
    this.mouseMove(e);
    this.notDragging();
  },

  notDragging: function() {
    this.sbDrag = this.hueDrag = this.opacityDrag = false;
  },

  browserMouseUp: function() {
    this.notDragging();
  },

  bodyMouseDown: function(e) {
    // stop user from accidentally doing mouse selection (dragger IMG elements are selectable and look ugly when in selection)
    e.preventDefault();
  },

  setColor: function(rgb) {
    var hsv = ColorConverter.RGB2HSV(rgb);
    this.setHue(Math.round(Math.abs(1 - hsv.h) * this.hueHeight));
    this.setSbPicker(this.sbHeight - Math.round(hsv.v * this.sbHeight), Math.round(hsv.s * this.sbWidth));
    this.setOpacity(Math.round(rgb.a * this.opacityWidth));
  },

  setHue: function(top) {
    top    = this.makeWithin(top, 0, this.hueHeight);
    this.h = (this.hueHeight - top) / this.hueHeight;
    this.hueHandle.style.top = top + 'px';

    this.updateSbPickerColor();
    this.updateOpacityPickerColor();
  },

  updateSbPickerColor: function() {
    this.sbPicker.style.backgroundColor = ColorConverter.HSV2RGBString(this.h, 1, 1);
  },

  updateOpacityPickerColor: function() {
    var startColor = ColorConverter.HSV2RGBString(this.h, this.s, this.v, 0);
    var endColor   = ColorConverter.HSV2RGBString(this.h, this.s, this.v, 1);
    this.opacityPicker.style.backgroundImage = '-moz-linear-gradient(0deg, ' + startColor + ', ' + endColor + '), url("chrome://firepicker/skin/checkboard.png")';
  },

  setOpacity: function(left) {
    left = this.makeWithin(left, 0, this.opacityWidth);
    this.a = left / this.opacityWidth;
    this.opacityHandle.style.left = left + 'px';
  },

  setSbPicker: function(top, left) {
    top  = this.makeWithin(top,  0, this.sbHeight);
    left = this.makeWithin(left, 0, this.sbWidth);
    this.v = (this.sbHeight - top) / this.sbHeight;
    this.s = left / this.sbWidth;
    this.sbHandle.style.top  = top  + 'px';
    this.sbHandle.style.left = left + 'px';

    this.updateOpacityPickerColor();
  },

  colorChanged: function() {
    this.callback(this.getRGBColor());
  },

  getRGBColor: function() {
    return ColorConverter.HSV2RGB(this.h, this.s, this.v, this.a);
  },

  makeWithin: function(val, min, max) {
    return val < min ? min : (val > max ? max : val);
  }
};

document.expose = function(values) {
  for (var valueName in values) {
    window[valueName] = values[valueName];
  }
};

document.initColorPicker = function(color, callback) {
  if (!window.colorPicker) {
    colorPicker = new ColorPicker(document.getElementById('picker'), color, callback);
  } else {
    colorPicker.callback = callback;
    colorPicker.setColor(color);
  }
  colorPicker.popUpOpened();
};

document.popUpClosed = function() {
  if (window.colorPicker) { colorPicker.popUpClosed(); }
};
/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GObject = imports.gi.GObject;
const St = imports.gi.St;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;
const Util = imports.misc.util;

const Indicator = GObject.registerClass(
	class Indicator extends PanelMenu.SystemIndicator {
		_init() {
			super._init();

			this._item = new PopupMenu.PopupBaseMenuItem({ activate: false });
			this._item.add(new St.Icon({
				icon_name: 'keyboard-brightness-symbolic',
				style_class: 'popup-menu-icon'
			}));
			this.menu.addMenuItem(this._item);
			
			this._slider = new Slider.Slider(0);
			this._slider.accessible_name = _("Keyboard brightness");
			this._slider.connect('notify::value', this._sliderChanged.bind(this));
			this._item.add_child(this._slider);
			this._item.connect('button-press-event', (actor, event) => {
				return this._slider.startDragging(event);
			});
			this._item.connect('scroll-event', (actor, event) => {
				return this._slider.emit('scroll-event', event);
			});
		}

		_sliderChanged() {
			Util.spawn(['humanfx', 'brightness', Math.round(this._slider.value * 100).toString()]);
		}

		destroy() {
			this.menu.destroy();
			super.destroy();
		}
	}
);

class Extension {
	constructor() {
	}

	enable() {
		log(`enabling ${Me.metadata.name}`);
		this._indicator = new Indicator();
		Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this._indicator.menu, 2);
	}

	disable() {
		log(`disabling ${Me.metadata.name}`);
		this._indicator.destroy();
		this._indicator = null;
	}
}

function init() {
	return new Extension();
}

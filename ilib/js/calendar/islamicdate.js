/*
 * islamicdate.js - Represent a date in the Islamic calendar
 * 
 * Copyright © 2012-2015, JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* !depends 
ilibglobal.js
locale.js
localeinfo.js
timezone.js
date.js
util/math.js
util/search.js
calendar.js
calendar/islamic.js
calendar/ratadie.js
*/

var ilib = require("../ilibglobal.js");
if (!ilib.bsearch || ilib.bsearch.stub) ilib.extend(ilib, require("../util/search.js"));
if (!ilib.signum || ilib.signum.stub) ilib.extend(ilib, require("../util/math.js"));

if (!ilib.Locale || ilib.Locale.stub) ilib.Locale = require("../locale.js");
if (!ilib.LocaleInfo || ilib.LocaleInfo.stub) ilib.LocaleInfo = require("../localeinfo.js");
if (!ilib.TimeZone || ilib.TimeZone.stub) ilib.TimeZone = require("../timezone.js");
if (!ilib.Date || ilib.Date.stub) ilib.Date = require("../date.js");
if (!ilib.Cal || ilib.Cal.stub) ilib.Cal = require("../calendar.js");

if (!ilib.Date.RataDie || ilib.Date.RataDie.stub) ilib.Date.RataDie = require("./ratadie.js");
if (!ilib.Cal.Islamic || ilib.Cal.Islamic.stub) ilib.Cal.Islamic = require("./islamic.js");

/**
 * @class
 * Construct a new Islamic RD date number object. The constructor parameters can 
 * contain any of the following properties:
 * 
 * <ul>
 * <li><i>unixtime<i> - sets the time of this instance according to the given 
 * unix time. Unix time is the number of milliseconds since midnight on Jan 1, 1970.
 * 
 * <li><i>julianday</i> - sets the time of this instance according to the given
 * Julian Day instance or the Julian Day given as a float
 * 
 * <li><i>year</i> - any integer, including 0
 * 
 * <li><i>month</i> - 1 to 12, where 1 means January, 2 means February, etc.
 * 
 * <li><i>day</i> - 1 to 31
 * 
 * <li><i>hour</i> - 0 to 23. A formatter is used to display 12 hour clocks, but this representation 
 * is always done with an unambiguous 24 hour representation
 * 
 * <li><i>minute</i> - 0 to 59
 * 
 * <li><i>second</i> - 0 to 59
 * 
 * <li><i>millisecond</i> - 0 to 999
 * 
 * <li><i>date</i> - use the given intrinsic Javascript date to initialize this one.
 * </ul>
 *
 * If the constructor is called with another Islamic date instance instead of
 * a parameter block, the other instance acts as a parameter block and its
 * settings are copied into the current instance.<p>
 * 
 * If the constructor is called with no arguments at all or if none of the 
 * properties listed above are present, then the RD is calculate based on 
 * the current date at the time of instantiation. <p>
 * 
 * If any of the properties from <i>year</i> through <i>millisecond</i> are not
 * specified in the params, it is assumed that they have the smallest possible
 * value in the range for the property (zero or one).<p>
 * 
 * Depends directive: !depends islamicdate.js
 * 
 * @private
 * @constructor
 * @extends ilib.Date.RataDie
 * @param {Object=} params parameters that govern the settings and behaviour of this Islamic RD date
 */
ilib.Date.IslamicRataDie = function(params) {
	this.cal = params && params.cal || new ilib.Cal.Islamic();
	this.rd = undefined;
	ilib.Date.RataDie.call(this, params);
};

ilib.Date.IslamicRataDie.prototype = new ilib.Date.RataDie();
ilib.Date.IslamicRataDie.prototype.parent = ilib.Date.RataDie;
ilib.Date.IslamicRataDie.prototype.constructor = ilib.Date.IslamicRataDie;

/**
 * The difference between a zero Julian day and the first Islamic date
 * of Friday, July 16, 622 CE Julian. 
 * @private
 * @const
 * @type number
 */
ilib.Date.IslamicRataDie.prototype.epoch = 1948439.5;

/**
 * Calculate the Rata Die (fixed day) number of the given date from the
 * date components.
 *
 * @protected
 * @param {Object} date the date components to calculate the RD from
 */
ilib.Date.IslamicRataDie.prototype._setDateComponents = function(date) {
	var days = (date.year - 1) * 354 +
		Math.ceil(29.5 * (date.month - 1)) +
		date.day +
		Math.floor((3 + 11 * date.year) / 30) - 1;
	var time = (date.hour * 3600000 +
		date.minute * 60000 +
		date.second * 1000 +
		date.millisecond) / 
		86400000; 
	
	//console.log("getRataDie: converting " +  JSON.stringify(date));
	//console.log("getRataDie: days is " +  days);
	//console.log("getRataDie: time is " +  time);
	//console.log("getRataDie: rd is " +  (days + time));

	this.rd = days + time;
};
	
/**
 * @class
 * Construct a new civil Islamic date object. The constructor can be called
 * with a params object that can contain the following properties:<p>
 * 
 * <ul>
 * <li><i>julianday</i> - the Julian Day to set into this date
 * <li><i>year</i> - any integer except 0. Years go from -1 (BCE) to 1 (CE), skipping the zero year
 * <li><i>month</i> - 1 to 12, where 1 means Muharram, 2 means Saffar, etc.
 * <li><i>day</i> - 1 to 30
 * <li><i>hour</i> - 0 to 23. A formatter is used to display 12 hour clocks, but this representation 
 * is always done with an unambiguous 24 hour representation
 * <li><i>minute</i> - 0 to 59
 * <li><i>second</i> - 0 to 59
 * <li><i>millisecond</i> - 0 to 999
 * <li><i>locale</i> - the ilib.TimeZone instance or time zone name as a string 
 * of this julian date. The date/time is kept in the local time. The time zone
 * is used later if this date is formatted according to a different time zone and
 * the difference has to be calculated, or when the date format has a time zone
 * component in it.
 * <li><i>timezone</i> - the time zone of this instance. If the time zone is not 
 * given, it can be inferred from this locale. For locales that span multiple
 * time zones, the one with the largest population is chosen as the one that 
 * represents the locale. 
 * 
 * <li><i>date</i> - use the given intrinsic Javascript date to initialize this one.
 * </ul>
 * 
 * If called with another Islamic date argument, the date components of the given
 * date are copied into the current one.<p>
 * 
 * If the constructor is called with no arguments at all or if none of the 
 * properties listed above 
 * from <i>julianday</i> through <i>millisecond</i> are present, then the date 
 * components are 
 * filled in with the current date at the time of instantiation. Note that if
 * you do not give the time zone when defaulting to the current time and the 
 * time zone for all of ilib was not set with <i>ilib.setTimeZone()</i>, then the
 * time zone will default to UTC ("Universal Time, Coordinated" or "Greenwich 
 * Mean Time").<p>
 * 
 * Depends directive: !depends islamicdate.js
 * 
 * @constructor
 * @extends ilib.Date
 * @param {Object=} params parameters that govern the settings and behaviour of this Islamic date
 */
ilib.Date.IslamicDate = function(params) {
	this.cal = new ilib.Cal.Islamic();
	
	if (params) {
		if (params.locale) {
			this.locale = (typeof(params.locale) === 'string') ? new ilib.Locale(params.locale) : params.locale;
			var li = new ilib.LocaleInfo(this.locale);
			this.timezone = li.getTimeZone(); 
		}
		if (params.timezone) {
			this.timezone = params.timezone;
		}
		
		if (params.year || params.month || params.day || params.hour ||
				params.minute || params.second || params.millisecond ) {
			/**
			 * Year in the Islamic calendar.
			 * @type number
			 */
			this.year = parseInt(params.year, 10) || 0;

			/**
			 * The month number, ranging from 1 to 12 (December).
			 * @type number
			 */
			this.month = parseInt(params.month, 10) || 1;

			/**
			 * The day of the month. This ranges from 1 to 30.
			 * @type number
			 */
			this.day = parseInt(params.day, 10) || 1;
			
			/**
			 * The hour of the day. This can be a number from 0 to 23, as times are
			 * stored unambiguously in the 24-hour clock.
			 * @type number
			 */
			this.hour = parseInt(params.hour, 10) || 0;

			/**
			 * The minute of the hours. Ranges from 0 to 59.
			 * @type number
			 */
			this.minute = parseInt(params.minute, 10) || 0;

			/**
			 * The second of the minute. Ranges from 0 to 59.
			 * @type number
			 */
			this.second = parseInt(params.second, 10) || 0;

			/**
			 * The millisecond of the second. Ranges from 0 to 999.
			 * @type number
			 */
			this.millisecond = parseInt(params.millisecond, 10) || 0;
			
			/**
			 * The day of the year. Ranges from 1 to 355.
			 * @type number
			 */
			this.dayOfYear = parseInt(params.dayOfYear, 10);

			if (typeof(params.dst) === 'boolean') {
				this.dst = params.dst;
			}
			
			this.rd = this.newRd(this);
			
			// add the time zone offset to the rd to convert to UTC
			if (!this.tz) {
				this.tz = new ilib.TimeZone({id: this.timezone});
			}
			// getOffsetMillis requires that this.year, this.rd, and this.dst 
			// are set in order to figure out which time zone rules apply and 
			// what the offset is at that point in the year
			this.offset = this.tz._getOffsetMillisWallTime(this) / 86400000;
			if (this.offset !== 0) {
				this.rd = this.newRd({
					rd: this.rd.getRataDie() - this.offset
				});
			}
		}
	}

	if (!this.rd) {
		this.rd = this.newRd(params);
		this._calcDateComponents();
	}
};

ilib.Date.IslamicDate.prototype = new ilib.Date({noinstance: true});
ilib.Date.IslamicDate.prototype.parent = ilib.Date;
ilib.Date.IslamicDate.prototype.constructor = ilib.Date.IslamicDate;

/**
 * the cumulative lengths of each month, for a non-leap year 
 * @private
 * @const
 * @type Array.<number>
 */
ilib.Date.IslamicDate.cumMonthLengths = [
	0,  /* Muharram */
	30,  /* Saffar */
	59,  /* Rabi'I */
	89,  /* Rabi'II */
	118,  /* Jumada I */
	148,  /* Jumada II */
	177,  /* Rajab */
	207,  /* Sha'ban */
	236,  /* Ramadan */
	266,  /* Shawwal */
	295,  /* Dhu al-Qa'da */
	325,  /* Dhu al-Hijja */
	354
];

/**
 * Number of days difference between RD 0 of the Gregorian calendar and
 * RD 0 of the Islamic calendar. 
 * @private
 * @const
 * @type number
 */
ilib.Date.IslamicDate.GregorianDiff = 227015;

/**
 * Return a new RD for this date type using the given params.
 * @protected
 * @param {Object=} params the parameters used to create this rata die instance
 * @returns {ilib.Date.RataDie} the new RD instance for the given params
 */
ilib.Date.IslamicDate.prototype.newRd = function (params) {
	return new ilib.Date.IslamicRataDie(params);
};

/**
 * Return the year for the given RD
 * @protected
 * @param {number} rd RD to calculate from 
 * @returns {number} the year for the RD
 */
ilib.Date.IslamicDate.prototype._calcYear = function(rd) {
	return Math.floor((30 * rd + 10646) / 10631);
};

/**
 * Calculate date components for the given RD date.
 * @protected
 */
ilib.Date.IslamicDate.prototype._calcDateComponents = function () {
	var remainder,
		rd = this.rd.getRataDie();
	
	this.year = this._calcYear(rd);

	if (typeof(this.offset) === "undefined") {
		this.year = this._calcYear(rd);
		
		// now offset the RD by the time zone, then recalculate in case we were 
		// near the year boundary
		if (!this.tz) {
			this.tz = new ilib.TimeZone({id: this.timezone});
		}
		this.offset = this.tz.getOffsetMillis(this) / 86400000;
	}

	if (this.offset !== 0) {
		rd += this.offset;
		this.year = this._calcYear(rd);
	}

	//console.log("IslamicDate.calcComponent: calculating for rd " + rd);
	//console.log("IslamicDate.calcComponent: year is " + ret.year);
	var yearStart = this.newRd({
		year: this.year,
		month: 1,
		day: 1,
		hour: 0,
		minute: 0,
		second: 0,
		millisecond: 0
	});
	remainder = rd - yearStart.getRataDie() + 1;
	
	this.dayOfYear = remainder;
	
	//console.log("IslamicDate.calcComponent: remainder is " + remainder);
	
	this.month = ilib.bsearch(remainder, ilib.Date.IslamicDate.cumMonthLengths);
	remainder -= ilib.Date.IslamicDate.cumMonthLengths[this.month-1];

	//console.log("IslamicDate.calcComponent: month is " + this.month + " and remainder is " + remainder);
	
	this.day = Math.floor(remainder);
	remainder -= this.day;

	//console.log("IslamicDate.calcComponent: day is " + this.day + " and remainder is " + remainder);

	// now convert to milliseconds for the rest of the calculation
	remainder = Math.round(remainder * 86400000);
	
	this.hour = Math.floor(remainder/3600000);
	remainder -= this.hour * 3600000;
	
	this.minute = Math.floor(remainder/60000);
	remainder -= this.minute * 60000;
	
	this.second = Math.floor(remainder/1000);
	remainder -= this.second * 1000;
	
	this.millisecond = remainder;
};

/**
 * Return the day of the week of this date. The day of the week is encoded
 * as number from 0 to 6, with 0=Sunday, 1=Monday, etc., until 6=Saturday.
 * 
 * @return {number} the day of the week
 */
ilib.Date.IslamicDate.prototype.getDayOfWeek = function() {
	var rd = Math.floor(this.rd.getRataDie() + (this.offset || 0));
	return ilib.mod(rd-2, 7);
};

/**
 * Return the ordinal day of the year. Days are counted from 1 and proceed linearly up to 
 * 354 or 355, regardless of months or weeks, etc. That is, Muharran 1st is day 1, and 
 * Dhu al-Hijja 29 is 354.
 * @return {number} the ordinal day of the year
 */
ilib.Date.IslamicDate.prototype.getDayOfYear = function() {
	return ilib.Date.IslamicDate.cumMonthLengths[this.month-1] + this.day;
};

/**
 * Return the era for this date as a number. The value for the era for Islamic 
 * calendars is -1 for "before the Islamic era" and 1 for "the Islamic era". 
 * Islamic era dates are any date after Muharran 1, 1, which is the same as
 * July 16, 622 CE in the Gregorian calendar. 
 * 
 * @return {number} 1 if this date is in the common era, -1 if it is before the 
 * common era 
 */
ilib.Date.IslamicDate.prototype.getEra = function() {
	return (this.year < 1) ? -1 : 1;
};

/**
 * Return the name of the calendar that governs this date.
 * 
 * @return {string} a string giving the name of the calendar
 */
ilib.Date.IslamicDate.prototype.getCalendar = function() {
	return "islamic";
};

//register with the factory method
ilib.Date._constructors["islamic"] = ilib.Date.IslamicDate;

module.exports = ilib.Date.IslamicDate;
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var now = _interopDefault(require('performance-now'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

/**
 * Player でイベントを随時読み取るためのクラス
 * 精確にスケジューリングするために先読みを行う
 * https://www.html5rocks.com/ja/tutorials/audio/scheduling/
 *
 * これ自体はタイミングを指示するだけで、具体的な midi のメッセージ等を知らない
 *
 * Message[] @ DataSource -> LiveMessage[] @ Sequencer -> Output
 */
var Sequencer = /** @class */ (function () {
    /**
     * @param dataSource Message Source
     * @param output Message Destination
     * @param interval milliseconds
     * @param lookAhead milliseconds
     */
    function Sequencer(dataSource, output, interval, lookAhead) {
        this.loop = {
            begin: 0,
            end: 0,
            enabled: false
        };
        this.dataSource = dataSource;
        this.output = output;
        this.interval = interval;
        this.lookAhead = lookAhead;
    }
    Sequencer.prototype.resume = function () {
        var _this = this;
        if (this.intervalId < 0) {
            this.intervalId = setInterval(function () { return _this.onTimer(); }, this.interval);
            this.startTime = null;
            this.startTimeRelative = null;
        }
    };
    Sequencer.prototype.seek = function (time) {
        this.scheduledTime = time;
        this.startTime = null;
        this.startTimeRelative = null;
    };
    Sequencer.prototype.play = function (time) {
        this.seek(time);
        this.resume();
    };
    Sequencer.prototype.pause = function () {
        clearInterval(this.intervalId);
        this.intervalId = -1;
    };
    Object.defineProperty(Sequencer.prototype, "isPlaying", {
        get: function () {
            return this.intervalId >= 0;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 一定間隔で呼ばれ、先読みしながらメッセージを output に送信する
     *  テスト用に公開
     */
    Sequencer.prototype.onTimer = function (timestamp) {
        if (timestamp === void 0) { timestamp = now(); }
        if (this.startTime === null) {
            this.startTime = timestamp;
        }
        if (this.startTimeRelative === null) {
            this.startTimeRelative = this.scheduledTime;
        }
        var nowTime = this.startTimeRelative + timestamp - this.startTime;
        // 前回スケジュール済みの時点から、
        // 先読み時間までを処理の対象とする
        var fromTime = this.scheduledTime;
        var toTime = nowTime + this.lookAhead;
        var msgs = this.dataSource
            .getMessages(fromTime, toTime)
            .map(function (message) { return (__assign({}, message, { timestamp: timestamp + message.time - nowTime })); });
        this.output.sendMessages(msgs, nowTime);
        this.scheduledTime = toTime;
        if (this.loop.enabled && toTime >= this.loop.end) {
            this.seek(this.loop.begin);
        }
    };
    return Sequencer;
}());

module.exports = Sequencer;
//# sourceMappingURL=index.js.map

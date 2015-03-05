"use strict";

var defaults = require('../opts/values.js'),
    resolve = require('../utils/resolve.js'),
    utils = require('../utils/utils.js'),

    CURRENT = 'current',
    ORIGIN = 'origin',
    FORCE_NUMBER = [CURRENT, ORIGIN, 'to', 'start'],
    
    /*
        Parse setter arguments
    */
    parseSetArgs = function (arg0, arg1) {
        var newProps = {};

        // If we've just got a value, set default
        if (arguments.length === 1) {
            newProps[CURRENT] = arg0;
            
        // Or we've got key/value args
        } else {
            newProps[arg0] = arg1;
        }
        
        return newProps;
    },

    /*
        Value constructor
    */
    Value = function (key, props, inherit, scope) {
        this.key = key;
        this.scope = scope;

        if (props.start) {
            props.current = props.start;
        }

        this.set(props, inherit);
    };
    
Value.prototype = {
    
    /*
        Set value properties
        
        Syntax
            .set('key', value) // Set specific value
            .set({ key: value }) // Set multiple values
            .set({ key: value }, { key: value2 }) // Set multiple with inherit
            .set(value) // Set .current
    */
    set: function () {
        var self = this,
            args = arguments,
            multiVal = utils.isObj(args[0]),
            newProps = multiVal ? args[0] : parseSetArgs.apply(self, args),
            newProp,
            inherit = multiVal ? args[1] : false,
            key = '';
        
        for (key in defaults) {
            newProp = undefined;

            if (inherit && inherit.hasOwnProperty(key)) {
                newProp = inherit[key];
            }
            
            if (newProps.hasOwnProperty(key)) {
                newProp = newProps[key];
            }
            
            if (newProp !== undefined) {
                self[key] = resolve(newProp, self[key], self, self.scope);
                
                if (FORCE_NUMBER.indexOf(key) > -1) {
                    self[key] = parseFloat(self[key]);
                }
    
            } else if (self[key] === undefined) {
                self[key] = defaults[key];
            }
        }
        
        // Set hasRange to true if min and max are numbers
        self.hasRange = (utils.isNum(self.min) && utils.isNum(self.max)) ? true : false;
        
        // Update Action value process order
        self.scope.updateOrder(self.key, utils.isString(self.link));
        
        return self;
    },
    
    /*
        Set current value to origin
    */
    reset: function () {
        return this.set(CURRENT, this[ORIGIN]);
    },
    
    /*
        Swap current target and origin
    */
    flip: function () {
        var newTo = this[ORIGIN],
            newOrigin = (this.to !== undefined) ? this.to : this[CURRENT];

        return this.set({
            to: newTo,
            origin: newOrigin
        });
    }
};

module.exports = Value;
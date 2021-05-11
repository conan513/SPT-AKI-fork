"use strict";

module.exports = {
    "sell": {
        "fees": true,
        "chance": {
            "base": 50,
            "overprices": 0.5,
            "underpriced": 2
        },
        "time": {
            "base": 15,
            "max": 5,
            "min": 15
        },
        "reputation": {
            "gain": 0.0000002,
            "loss": 0.0000002
        }
    },
    "traders": {
        "54cb50c76803fa8b248b4571": true,
        "54cb57776803fa99248b456e": true,
        "579dc571d53a0658a154fbec": false,
        "58330581ace78e27b8b10cee": true,
        "5935c25fb3acc3127c3d8cd9": true,
        "5a7c2eca46aef81a7ca2145d": true,
        "5ac3b934156ae10c4430e83c": true,
        "5c0647fdd443bc2504c2d371": true,
        "ragfair": false
    },
    "dynamic": {
        "enabled": true,
        "liveprices": true,
        "threshold": 8000,
        "batchSize": 1000,
        "price": {
            "min": 0.8,
            "max": 1.2
        },
        "endTime": {
            "min": 15,
            "max": 30
        },
        "condition": {
            "min": 0.5,
            "max": 1
        },
        "stack": {
            "min": 1,
            "max": 2000
        },
        "rating": {
            "min": 0.1,
            "max": 0.95
        },
        "currencies": {
            "5449016a4bdc2d6f028b456f": 75,
            "5696686a4bdc2da3298b456a": 23,
            "569668774bdc2da2298b4568": 2
        }
    }
};
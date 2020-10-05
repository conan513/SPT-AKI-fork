/* account.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

const fs = require("fs");

/*
* An event is an object as follows:
* event = {
*	type: string describing type of event,
*	scheduledTime: unixtime in milliseconds of when this event should be scheduled.
*	data: Object corresponding to the type.*
*/

class EventController
{
    constructor()
    {
        this.scheduleIntervalMillis = 60;
        this.eventCallbacks = {};

        setInterval(() =>
        {
            this.processSchedule();
        },  this.scheduleIntervalMillis * 1000);
    }

    onLoad(sessionID)
    {
        let profile = save_f.saveServer.profiles[sessionID];

        if (!("events" in profile))
        {
            profile.events = [];
        }

        return profile;
    }

    addEvent(type, worker)
    {
        this.eventCallbacks[type] = worker;
    }

    processSchedule()
    {
        let profiles = save_f.saveServer.profiles;
        let now = Date.now();

        for (const sessionID in profiles)
        {
            while (profiles[sessionID].events.length > 0)
            {
                let event = profiles[sessionID].events.shift();

                if (event.scheduledTime < now)
                {
                    this.processEvent(event);
                    continue;
                }

                // The schedule is assumed to be sorted based on scheduledTime, so once we
                // see an event that should not yet be processed, we can exit the loop.
                profiles[sessionID].events.unshift(event);
                break;
            }
        }

        save_f.saveServer.profiles = profiles;
    }

    addToSchedule(sessionID, event)
    {
        save_f.saveServer.profiles[sessionID].events.push(event);
        save_f.saveServer.profiles[sessionID].events.sort(this.compareEvent);
    }

    processEvent(event)
    {
        if (event.type in this.eventCallbacks)
        {
            this.eventCallbacks[event.type](event);
        }
    }

    /* Compare function for events based on their scheduledTime. */
    compareEvent(a, b)
    {
        if (a.scheduledTime < b.scheduledTime)
        {
            return -1;
        }

        if (a.scheduledTime > b.scheduledTime)
        {
            return 1;
        }

        return 0;
    }
}

class EventCallbacks
{
    constructor()
    {
        save_f.saveServer.onLoadCallback["events"] = this.onLoad.bind();
    }

    onLoad(sessionID)
    {
        return event_f.eventController.onLoad(sessionID);
    }
}

module.exports.eventController = new EventController();
module.exports.eventCallbacks = new EventCallbacks();

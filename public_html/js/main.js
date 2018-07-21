/* 
 * Copyright 2018 Albert Santos.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/* global L, Tangram, Symbol, fetch, Promise */

(function() {
    'use strict';
    
var shapes = new Map();
var stops = new Map();
var trips = new Map();
var vehicles = new Map();
var routes = new Map();

var map;
var activeRouteIds = ['Red', 'Orange', 'Blue', 'Green'];

//
// TODO:
// Redo the show/hide stuff so we can filter by type, and instead make it a use/unuse.
//
// Add a sweep phase when updating. How?
// At each tick, clear everyone.
// When someone's updated, that marks them and everything related.
// At the next tick, hide anyone who's still clear.
//
// This gives everything a tick to update.
//
// Change loading to:
//  Load RouteEntry -> This starts loading:
//          -> VehicleEntry
//              -> This results in TripEntry loading.
//              
//          -> ShapeEntry
//              -> This results in StopEntry loading.
// 

class LayerEntry {
    constructor(id, jsonData, mapLayer) {
        this._id = id;
        this._jsonData= jsonData;
        this._mapLayer = mapLayer;
        this._visibleCount = 0;
        this._markCount = 0;
    }
    
    get id() { return this._id; }
    get jsonData() { return this._jsonData; }
    
    // The mark count is used for a mark and sweep type of detection.
    get markCount() { return this._markCount; }
    mark() { ++this._markCount; }
    
    get mapLayer() { return this._mapLayer; }
    set mapLayer(mapLayer) {
        if (this._mapLayer !== mapLayer) {
            if (this._visibleCount > 0) {
                map.removeLayer(this._mapLayer);
            }
            this._mapLayer = mapLayer;
            if (this._mapLayer && (this._visibleCount > 0)) {
                this._mapLaer.addTo(map);
            }
        }
    }
    
    isShowing() {
        return (this._visibleCount > 0);
    }
    
    show() {
        if (this._visibleCount <= 0) {
            this._visibleCount = 1;
            if (this._mapLayer) {
                this._mapLayer.addTo(map);
                this._addedToMap();
            }
        }
        else {
            ++this._visibleCount;
        }
        return this;
    }
    
    hide() {
        --this._visibleCount;
        if (!this._visibleCount) {
            if (this._mapLayer) {
                map.removeLayer(this._mapLayer);
                this._removedFromMap();
            }
        }
        return this;
    }
    
    _addedToMap() {        
    }
    
    _removedFromMap() {        
    }
};


class StopLayerEntry extends LayerEntry {
    constructor(stopId, jsonData, mapLayer) {
        super(stopId, jsonData, mapLayer);
    }
/*
{
  "data": {
    "attributes": {
      "address": null,
      "description": null,
      "latitude": 42.416412,
      "location_type": 0,
      "longitude": -71.196852,
      "name": "Wadsworth Rd @ Homer Rd",
      "platform_code": null,
      "platform_name": null,
      "wheelchair_boarding": 0
    },
    "id": "2465",
    "links": {
      "self": "/stops/2465"
    },
    "relationships": {
      "child_stops": {},
      "facilities": {
        "links": {
          "related": "/facilities/?filter[stop]=2465"
        }
      },
      "parent_station": {
        "data": null
      }
    },
    "type": "stop"
  },
  "jsonapi": {
    "version": "1.0"
  }
}
*/
};


class ShapeLayerEntry extends LayerEntry {
    constructor(shapeId, jsonData, mapLayer) {
        super(shapeId, jsonData, mapLayer);
        
        // Grab the stop ids from the jsonData.
/*        var stopIds = [];
        var stops = jsonData.relationships.stops;
        stops.data.forEach((stopData) => stopIds.push(stopData.id));
        stopLayerEntriesPromise(stopIds).then((stopLayers) => {
            this._stopLayers = stopLayers;
            if (this.isShowing()) {
                this._stopLayers.forEach((stopLayer) => stopLayer.show());
            }
        });
*/
    }
    
    _addedToMap() {
        if (this._stopLayers) {
            this._stopLayers.forEach((stopLayer) => stopLayer.show());
        }
    }
    
    _removedFromMap() {
        if (this._stopLayers) {
            this._stopLayers.forEach((stopLayer) => stopLayer.hide());
        }
    }
/*
{
  "data": {
    "attributes": {
      "direction_id": 1,
      "name": "Harvard",
      "polyline": "ei{aGfcpqL_@`BUjAQjAI~@Kp@E\\[nBCJ??GXq@vDkA~GWe@c@w@c@q@_@i@MO??MOi@i@s@g@]Sc@]c@y@a@aASk@M_@CIKi@Ca@?iA@cA??@WA{AGaAc@cDG}@De@??BWb@gAp@mAVw@?EB]??B_@Cy@U{@sAaDyAmEa@kA??ISk@wB[kACk@HaAVy@TmAh@S@???v@QlA_@~@]~CaB??NIzI}GXU??dEeDnAeA??NMzAgAz@q@r@_@]Qe@_@m@}@a@i@ESCW?WBSBO?ELSL_@Dc@?c@Ge@Ma@M[QE??c@KWBYLURO\\K\\Gd@@`@?B??FZRZ|@p@d@f@^b@`@h@l@|@d@^\\PZD????l@AfCW\\E??rBUvAMr@IVCn@Ir@I^EDg@??B_@XoGF}@NwB??BWFw@l@mFnA_Il@cD??BKF]p@aDJe@??Rw@lB}Gt@mC?A??b@qBb@uBxBeId@_Bt@oBlAqCv@sBl@mB`@aB??DOXeBf@bAd@r@RTlBbDh@z@\\Y??p@k@\\_@`BaBZYfBcB??LM`@_@bBaBbBaB??LMz@e@bBs@ZO??XM`Ac@vAo@ZQh@YTSPWP]d@oAZy@??HS`AgCh@yA\\y@PWd@i@`@SVKn@M\\E??FAdCk@z@Q??PExA]pBa@nAYnAYbAWd@K\\G??v@OrAYvA]??PEtCk@TEFiA??HsA@_@B_AJiBZ}E?e@???W`@wFXsEZ_E??BU`@yDVeCZsCHk@H_@??FWp@sFPoA??Fe@LkAl@eD??N{@PeAn@w@LKFEHGDGDIDU`@aA`BcDlAyBb@y@R[LKNG??@AJEHIDM@K?IAICKEUCSAg@AKTu@f@wA~@oC??HSdA{C|@mC??FS`AsC~@uC`B{El@cB??HS~AqENc@rAuDl@aBj@uAHO??j@mA|@cB\\w@\\m@`@u@b@_A??HS^{@pBqELW??HSnBoEn@sA??HQlAuCr@}AfAcC??LYt@i@`@]t@k@`A{@i@kC_@wBe@qBG{@La@??DONm@fD}@nAa@h@QEEMUJOL]JQJKNEVEf@GtAGTAZAZAl@@h@B\\F??@?j@Nf@Rb@b@P`@Hd@H|@F|@Dz@Bj@Ap@Dp@B|@Nr@PZRVRw@ZaBf@Z\\T",
      "priority": 2
    },
    "id": "780087",
    "links": {
      "self": "/shapes/780087"
    },
    "relationships": {
      "route": {
        "data": {
          "id": "78",
          "type": "route"
        }
      },
      "stops": {
        "data": [
          {
            "id": "2464",
            "type": "stop"
          },
          {
            "id": "2465",
            "type": "stop"
          },
    ...
          {
            "id": "12614",
            "type": "stop"
          },
          {
            "id": "place-harsq",
            "type": "stop"
          },
          {
            "id": "32549",
            "type": "stop"
          }
        ]
      }
    },
    "type": "shape"
  },
  "jsonapi": {
    "version": "1.0"
  }
}
*/    
};


class TripLayerEntry extends LayerEntry {
    constructor(tripId, jsonData) {
        super(tripId, jsonData);
        this._shapeId = jsonData.relationships.shape.data ? jsonData.relationships.shape.data.id : null;
    }
    
    get headsign() { return this.jsonData.attributes.headsign; }
    get routeId() { return this.jsonData.relationships.route.data.id; }
    get shapeId() { return this._shapeId; }
    
/*
{
  "data": {
    "attributes": {
      "block_id": "T78-43",
      "direction_id": 1,
      "headsign": "Harvard",
      "name": "",
      "wheelchair_accessible": 1
    },
    "id": "37476146",
    "links": {
      "self": "/trips/37476146"
    },
    "relationships": {
      "route": {
        "data": {
          "id": "78",
          "type": "route"
        }
      },
      "service": {
        "data": {
          "id": "BUS32018-hbt38017-Sunday-02",
          "type": "service"
        }
      },
      "shape": {
        "data": {
          "id": "780087",
          "type": "shape"
        }
      }
    },
    "type": "trip"
  },
  "jsonapi": {
    "version": "1.0"
  }
}
*/
    show() {
        super.show();
        if (this._shapeLayers) {
            this._shapeLayers.forEach((shapeLayer) => shapeLayer.show());
        }
    }
    
    hide() {
        super.hide();
        if (this._shapeLayers) {
            this._shapeLayers.forEach((shapeLayer) => shapeLayer.hide());
        }
    }
}


var earthCircumference = 40075000;
var xyToLatLong = 2.*3.14159265 / earthCircumference;
var degToRad = Math.PI / 180.;

function verticesToLatitudeLongitude(latitude, longitude, bearingDeg, xys, latLongs) {
    // We're very small scale compared to the earth, we'll just approximate the latitude/longitudes.
    var bearingRad = bearingDeg * degToRad;
    var cosB = Math.cos(bearingRad);
    var sinB = Math.sin(bearingRad);
    
    latLongs.length = xys.length;
    for (let i = xys.length - 1; i >= 0; --i) {
        let x = xys[i][0];
        let y = xys[i][1];
        latLongs[i] = [
            latitude + (x * cosB + y * sinB) * xyToLatLong,
            longitude + (-x * sinB + y * cosB) * xyToLatLong
        ];
    }
}


class VehicleLayerEntry extends LayerEntry {
    constructor(vehicleId, jsonData, vehicleMarker) {
        var mapLayer = vehicleMarker ? vehicleMarker.mapLayer : undefined;
        super(vehicleId, jsonData, mapLayer);
        this._vehicleMarker = vehicleMarker;

        if (this._vehicleMarker) {
            this._vehicleMarker.updateMarkerPosition(this);
        }
    }
    
    get routeId() { return this.jsonData.relationships.route.data.id; }
    get tripId() { return this.jsonData.relationships.trip.data.id; }
    
    get color() { return this.jsonData.attributes.color; }
    get direction() { return this.jsonData.attributes.direction_id; }
    get latitude() { return this.jsonData.attributes.latitude; }
    get longitude() { return this.jsonData.attributes.longitude; }
    get bearing() { return this.jsonData.attributes.bearing; }
    get updatedAt() { return this.jsonData.attributes.updated_at; }
    
/*
{
  "data": [
    {
      "attributes": {
        "bearing": 0,
        "current_status": "IN_TRANSIT_TO",
        "current_stop_sequence": 2,
        "direction_id": 0,
        "label": "1923",
        "latitude": 42.3749885559082,
        "longitude": -71.11891174316406,
        "speed": null,
        "updated_at": "2018-07-17T18:17:20-04:00"
      },
      "id": "y1923",
      "links": {
        "self": "/vehicles/y1923"
      },
      "relationships": {
        "route": {
          "data": {
            "id": "72",
            "type": "route"
          }
        },
        "stop": {
          "data": {
            "id": "2170",
            "type": "stop"
          }
        },
        "trip": {
          "data": {
            "id": "37472385",
            "type": "trip"
          }
        }
      },
      "type": "vehicle"
    }
  ],
  "jsonapi": {
    "version": "1.0"
  }
} */    
    
    _addedToMap() {
    }
    
    _removedFromMap() {
        
    }
    
    updateJSONData(jsonData) {
        var lastRouteId = this.routeId;
        var lastTripId = this.tripId;
        
        this._jsonData = jsonData;

        // If we have a marker, update the marker...
        if (this._vehicleMarker) {
            this._vehicleMarker.updateMarkerPosition(this);
            this._vehicleMarker.updateMarkerPopup(this);
        }
        
        if (lastTripId !== this.tripId) {
            if (this.isShowing()) {
                var tripEntry = trips.get(lastTripId);
                if (tripEntry) {
                    tripEntry.hide();
                }
            }
            
            tripLayerEntriesPromise(this.tripId)
                    .then((tripEntries) => {
                        if (this.isShowing()) {
                            tripEntries.forEach((entry) => entry.show());
                        }
                    });
        }
    }
}


class RouteLayerEntry extends LayerEntry {
    constructor(routeId, jsonData, mapLayer) {
        super(routeId, jsonData, mapLayer);
    }
/*
{
  "data": [
    {
      "attributes": {
        "color": "FFC72C",
        "description": "Local Bus",
        "direction_names": [
          "Outbound",
          "Inbound"
        ],
        "long_name": "",
        "short_name": "78",
        "sort_order": 7800,
        "text_color": "000000",
        "type": 3
      },
      "id": "78",
      "links": {
        "self": "/routes/78"
      },
      "type": "route"
    }
  ],
  "jsonapi": {
    "version": "1.0"
  }
} */    
    
    get routeType() { return this.jsonData.attributes.type; }
    get name() { return this.jsonData.attributes.short_name; }
    get directionNames() { return this.jsonData.attributes.direction_names; }

    show() {
        super.show();
        var routeId = this.id;
        vehicles.forEach((entry, id) => {
            if (entry.routeId === routeId) {
                entry.show();
            }
        });
    }
    
    hide() {
        super.hide();
        var routeId = this.id;
        vehicles.forEach((entry, id) => {
            if (entry.routeId === routeId) {
                entry.hide();
            }
        });
    }
}


class VehicleMarker {
    constructor(mapLayer, vertices) {
        this._mapLayer = mapLayer;
        this._vertices = vertices;
    }
    
    get mapLayer() { return this._mapLayer; }
    
    updateMarkerPosition(vehicleLayerEntry) {
        if (this._mapLayer) {
            this._mapLayer.setLatLng([vehicleLayerEntry.latitude, vehicleLayerEntry.longitude]);
        }
    }
    
    updateMarkerPopup(vehicleLayerEntry) {
        if (this._mapLayer) {            
            var popupMsg = '<div>';
            var routeEntry = routes.get(vehicleLayerEntry.routeId);
            if (routeEntry) {
                popupMsg += routeEntry.name + ' ' + routeEntry.directionNames[vehicleLayerEntry.direction];
            }
            else {
                popupMsg += vehicleLayerEntry.routeId;
            }
            popupMsg += '</div>';
            popupMsg += '<div>Vehicle:' + vehicleLayerEntry.id + '</div>';
            popupMsg += '<div>Last updated: ' + vehicleLayerEntry.updatedAt + '</div>';
            this._mapLayer.bindPopup(popupMsg);
        }
    }
}

class LightRailMarker extends VehicleMarker {
    constructor() {
        var mapLayer = L.marker();
        super(mapLayer);
    }
}

var heavyRailVertices = [
    [0, 0],
    [0, 340 * 12 / 39.37]
];

class HeavyRailMarker extends VehicleMarker {
    constructor() {
        var latLongs = [];
        verticesToLatitudeLongitude(42, -72, 0, heavyRailVertices, latLongs);
        
        var mapLayer = L.polyline(latLongs, {
            color: 'yellow',
            weight: 12
        });
        super(mapLayer);
        
        this._latLongs = latLongs;
    }
    
    updateMarkerPosition(vehicleLayerEntry) {
        if (this._mapLayer) {
            var color;
            switch (vehicleLayerEntry.routeId) {
                case 'Red' :
                    color = 'Red';
                    break;
                case 'Orange' :
                    color = 'Orange';
                    break;
                case 'Blue' :
                    color = 'Blue';
                    break;
            }
            switch (vehicleLayerEntry.direction) {
                case 0 :
                    break;
                case 1 :
                    color = 'dark' + color;
                    break;
            }
            this._mapLayer.setStyle({ color: color });

            verticesToLatitudeLongitude(vehicleLayerEntry.latitude, vehicleLayerEntry.longitude,
                vehicleLayerEntry.bearing, busVertices, this._latLongs);
            this._mapLayer.setLatLngs(this._latLongs);
        }
    }
}

class CommuterRailMarker extends VehicleMarker {
    constructor() {
        var mapLayer = L.marker();
        super(mapLayer);
    }
}

var busVertices = [
    [0, 0],
    [0, 140 * 12 / 39.37]
];
class BusMarker extends VehicleMarker {
    constructor() {
        var latLongs = [];
        verticesToLatitudeLongitude(42, -72, 0, busVertices, latLongs);
        
        var mapLayer = L.polyline(latLongs, {
            color: 'yellow',
            weight: 12
        });
        super(mapLayer);
        
        this._latLongs = latLongs;
    }

    updateMarkerPosition(vehicleLayerEntry) {
        if (this._mapLayer) {
            switch (vehicleLayerEntry.direction) {
                case 0 :
                    this._mapLayer.setStyle({ color: 'lightgray' });
                    break;
                case 1 :
                    this._mapLayer.setStyle({ color: 'darkgray' });
                    break;
            }
            verticesToLatitudeLongitude(vehicleLayerEntry.latitude, vehicleLayerEntry.longitude,
                vehicleLayerEntry.bearing, busVertices, this._latLongs);
            this._mapLayer.setLatLngs(this._latLongs);
        }
    }
}

class FerryMarker extends VehicleMarker {
    constructor() {
        var mapLayer = L.marker();
        super(mapLayer);
    }
}


function isIterable(obj) {
    if (!obj || (typeof obj === 'string') || (obj instanceof String)) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}



///////////////////////////////////
// Stops
///////////////////////////////////

function fetchStops(stopIds) {
    var path = 'https://api-v3.mbta.com/stops?filter%5Bid%5D=';
    if (isIterable(stopIds)) {
        var separator = '';
        for (let stopId of stopIds) {
            path += separator + stopId;
            separator = '%2C';
        }
    }
    else {
        // Presume it's a single value
        path += stopIds;
    }
    
    return fetch(path)
            .then((response) => response.json())
            .then((myJson) => processStopsResult(myJson));
}


function processStopsResult(json) {
    var data = json.data;
    if (Array.isArray(data)) {
        var layerEntries = [];
        for (let i = 0; i < data.length; ++i) {
            layerEntries.push(processStopData(data[i]));
        }
        
        return layerEntries;
    }
    else {
        return processStopData(data);
    }
}


function processStopData(data) {
    var stopId = data.id;
    var marker;
    switch (data.attributes.location_type) {
        case 0 :    // Stop
            marker = createStopMarker(data);
            break;
            
        case 1 :    // Station
        case 2 :    // Station entrance/exit.
            marker = createStationMarker(data);
            break;
    }
    
    if (marker && data.attributes.name) {
        marker.bindPopup(data.attributes.name);
    }
    
    var layerEntry = new StopLayerEntry(stopId, data, marker);
    stops.set(stopId, layerEntry);
    return layerEntry;
}


var stopVertices = [
    [100,0],
    [0,100],
    [-100,0]
];
function createStopMarker(stopJSON) {
    // TODO: Improve this marker...
    var latitude = stopJSON.attributes.latitude;
    var longitude = stopJSON.attributes.longitude;
    var latLongs = [];
    verticesToLatitudeLongitude(latitude, longitude, 0, stopVertices, latLongs);
    var marker = L.polygon(latLongs, { color: 'blue' });
    return marker;
}


function createStationMarker(stopJSON) {
    // TODO: Improve this marker...
    var latitude = stopJSON.attributes.latitude;
    var longitude = stopJSON.attributes.longitude;
    var marker = L.circle([latitude, longitude], {
        radius: 100,
        color: 'darkblue',
        opacity: 0,
        fillOpacity: 0.2
    });
    return marker;
}

function stopLayerEntriesPromise(stopId) {
    if (Array.isArray(stopId)) {
        var idsNeeded = [];
        var existingEntries = [];
        stopId.forEach((id) => {
            var entry = stops.get(id);
            if (entry) {
                existingEntries.push(entry);
            }
            else {
                idsNeeded.push(id);
            }
        });
        
        if (idsNeeded.length > 0) {
            return fetchStops(idsNeeded)
                    .then((stopEntries) => existingEntries.concat(stopEntries));
        }
        else {
            return Promise.resolve(existingEntries);
        }
    }
    
    var stopEntry = stops.get(stopId);
    if (stopEntry) {
        return Promise.resolve(stopEntry);
    }
    return fetchStops(stopId);
}


///////////////////////////////////
// Shape
///////////////////////////////////

function fetchShapesByRouteIds(routeIds) {
    var path = 'https://api-v3.mbta.com/shapes?filter%5Broute%5D=';
    var routesFilter = '';
    if (isIterable(routeIds)) {
        var separator = '';
        for (let stopId of routeIds) {
            routesFilter += separator + stopId;
            separator = '%2C';
        }
    }
    else {
        // Presume it's a single value
        routesFilter += routeIds;
    }
    
    path += routesFilter;
    
    console.log('Fetching Shapes for route: ' + routesFilter);
    
    return fetch(path)
            .then((response) => response.json())
            .then((myJson) => processShapesResult(myJson));
}

function processShapesResult(json) {
    var data = json.data;
    var stopIdsNeeded = new Set();
    var result;
    if (Array.isArray(data)) {
        var layerEntries = [];
        for (let i = 0; i < data.length; ++i) {
            layerEntries.push(processShapeData(data[i], stopIdsNeeded));
        }
        
        result = layerEntries;
    }
    else {
        result = processShapeData(data, stopIdsNeeded);
    }
    
    if (stopIdsNeeded.size > 0) {
        return stopLayerEntriesPromise(stopIdsNeeded)
                .then((stopLayers) => {
                    stopLayers.forEach((stopLayer) => stopLayer.show());
                })
                .then(() => result);
    }

    return result;
}

function processShapeData(data, stopIdsNeeded) {    
    var shapeId = data.id;
    
    var encoded = data.attributes.polyline;
    var polyline = L.polyline(L.PolylineUtil.decode(encoded));
    
    var layerEntry = new ShapeLayerEntry(shapeId, data, polyline);
    shapes.set(shapeId, layerEntry);
    
    var shapeStops = data.relationships.stops;
    shapeStops.data.forEach((stopData) => {
        if (!stops.get(stopData.id)) {
            stopIdsNeeded.add(stopData.id);
        }
    });

    return layerEntry;
}

function shapeLayerEntriesPromiseByTripEntries(tripEntries) {
    var promise;
    
    if (Array.isArray(tripEntries)) {
        var idsNeeded = new Set();
        var existingEntries = [];
        tripEntries.forEach((tripEntry) => {
            if (!tripEntry.shapeId) {
                return;
            }
            var entry = shapes.get(tripEntry.shapeId);
            if (entry) {
                existingEntries.push(entry);
            }
            else {
                idsNeeded.add(tripEntry.routeId);
            }
        });
        
        if (idsNeeded.size > 0) {
            promise = fetchShapesByRouteIds(idsNeeded)
                    .then((entries) => existingEntries.concat(entries));
        }
        else {
            promise = Promise.resolve(existingEntries);
        }
    }
    else {
        if (tripEntries.shapeId) {
            var shapeEntry = shapes.get(tripEntries.shapeId);
            if (shapeEntry) {
                promise = Promise.resolve(shapeEntry);
            }
            else {
                promise = fetchShapesByRouteIds(tripEntries.routeId);
            }
        }
        promise = Promise.resolve(null);
    }
    
    return promise;
}




///////////////////////////////////
// Trip
///////////////////////////////////

function fetchTrips(tripIds) {
    var path = 'https://api-v3.mbta.com/trips?filter%5Bid%5D=';
    if (isIterable(tripIds)) {
        var separator = '';
        for (let stopId of tripIds) {
            path += separator + stopId;
            separator = '%2C';
        }
    }
    else {
        // Presume it's a single value
        path += tripIds;
    }
    
    console.log('Fetching Trip Ids: ' + tripIds);
    
    return fetch(path)
            .then((response) => response.json())
            .then((myJson) => processTripsResult(myJson));
}


function processTripsResult(json) {
    var data = json.data;
    var routeIds = new Set();
    var result;
    if (Array.isArray(data)) {
        var layerEntries = [];
        for (let i = 0; i < data.length; ++i) {
            layerEntries.push(processTripData(data[i]));
            routeIds.add(layerEntries[i].routeId);
        }
        
        result = layerEntries;
    }
    else {
        result = processTripData(data);
        routeIds.add(result.routeId);
    }
    
    return shapeLayerEntriesPromiseByTripEntries(result)
            .then((shapeEntries) => {
                shapeEntries.forEach((entry) => {
                    entry.show();
                });
            })
            .then(() => result);
}


function processTripData(data) {
    var tripId = data.id;
    
    var layerEntry = trips.get(tripId);
    if (!layerEntry) {
        layerEntry = new TripLayerEntry(tripId, data);
        trips.set(tripId, layerEntry);
    }
    return layerEntry;
}


function tripLayerEntriesPromise(tripId) {
    var promise;
    
    if (Array.isArray(tripId)) {
        var idsNeeded = [];
        var existingEntries = [];
        tripId.forEach((id) => {
            var entry = trips.get(id);
            if (entry) {
                existingEntries.push(entry);
            }
            else {
                idsNeeded.push(id);
            }
        });
        
        if (idsNeeded.length > 0) {
            promise = fetchTrips(idsNeeded)
                    .then((entries) => existingEntries.concat(entries));
        }
        else {
            promise = Promise.resolve(existingEntries);
        }
    }
    else {
        var tripEntry = trips.get(tripId);
        if (tripEntry) {
            promise = Promise.resolve(tripEntry);
        }
        else {
            promise = fetchTrips(tripId);
        }
    }
    
    return promise;
}


///////////////////////////////////
// Vehicles
///////////////////////////////////

function fetchVehicles(vehicleIds) {
    var path = 'https://api-v3.mbta.com/vehicles?filter%5Bid%5D=';
    if (isIterable(vehicleIds)) {
        var separator = '';
        for (let id of vehicleIds) {
            path += separator + id;
            separator = '%2C';
        }
    }
    else {
        // Presume it's a single value
        path += vehicleIds;
    }
    
    return fetch(path)
            .then((response) => response.json())
            .then((myJson) => processVehiclesResult(myJson));
}


function fetchRouteVehicles(routeIds) {
    var path = 'https://api-v3.mbta.com/vehicles?filter%5Broute%5D=';
    if (isIterable(routeIds)) {
        var separator = '';
        for (let id of routeIds) {
            path += separator + id;
            separator = '%2C';
        }
    }
    else {
        // Presume it's a single value
        path += routeIds;
    }
    
    return fetch(path)
            .then((response) => response.json())
            .then((myJson) => processVehiclesResult(myJson));
}

function createVehicleMarkerFromRouteLayerEntry(routeLayerEntry) {
    if (!routeLayerEntry) {
        return;
    }
    
    switch (routeLayerEntry.routeType) {
        case 0 :    // Light rail (Green Line, Silver Line?)
            return new LightRailMarker();
        case 1 :    // Heavy rail (Red, Orange, Blue?)
            return new HeavyRailMarker();
        case 2 :    // Commuter rail
            return new CommuterRailMarker();
        case 3 :    // Bus
            return new BusMarker();
        case 4 :    // Ferry
            return new FerryMarker();
    }
}

// This will also be used for updating vehicle locations, so the entry may already exist.
function processVehicleData(data) {
    var id = data.id;
    var layerEntry = vehicles.get(id);
    if (!layerEntry) {
        var marker;
        var routeLayerEntry = routes.get(data.relationships.route.data.id);
        var marker = createVehicleMarkerFromRouteLayerEntry(routeLayerEntry);
        
        layerEntry = new VehicleLayerEntry(id, data, marker);
        vehicles.set(id, layerEntry);
    }
    else {
        layerEntry.updateJSONData(data);
    }
    
    return layerEntry;
}


function processVehiclesResult(json) {
    var result;
    var data = json.data;
    var tripIds = [];
    var logMsg = ' ';
    if (Array.isArray(data)) {
        var layerEntries = [];
        for (let i = 0; i < data.length; ++i) {
            layerEntries.push(processVehicleData(data[i]));
            tripIds.push(layerEntries[i].tripId);
            logMsg += layerEntries[i].id + '[' + layerEntries[i].latitude + ',' + layerEntries[i].longitude + '] ';
        }
        
        result = layerEntries;
    }
    else {
        var layerEntry = processVehicleData(data);
        tripIds.push(layerEntry.tripId);
        
        logMsg = layerEntry.id + '[' + layerEntry.latitude + ',' + layerEntry.longitude + ']';
        
        result = layerEntry;
    }
    
    console.log('Processed Vehicle Ids: ' + logMsg);
    
    return tripLayerEntriesPromise(tripIds)
            .then((tripEntries) => {
                tripEntries.forEach((entry) => {
                    entry.show();
                });
                return result;
            })
            .then(() => result );
}


function vehicleLayerEntryPromise(routeIds) {
    return fetchRouteVehicles(routeIds);
}



///////////////////////////////////
// Route Layer Entries
///////////////////////////////////

function fetchRouteLayerEntries(routeIds) {
    var path = 'https://api-v3.mbta.com/routes?filter%5Bid%5D=';
    if (isIterable(routeIds)) {
        var separator = '';
        for (let id of routeIds) {
            path += separator + id;
            separator = '%2C';
        }
    }
    else {
        // Presume it's a single value
        path += routeIds;
    }
    
    return fetch(path)
            .then((response) => response.json())
            .then((myJson) => processRoutesResultForLayer(myJson));
}

function processRouteDataForLayer(data) {
    var id = data.id;
    var layerEntry = routes.get(id);
    if (!layerEntry) {
        layerEntry = new RouteLayerEntry(id, data, null);
        routes.set(id, layerEntry);
    }
    
    return layerEntry;
}

function processRoutesResultForLayer(json) {
    var data = json.data;
    if (Array.isArray(data)) {
        var layerEntries = [];
        for (let i = 0; i < data.length; ++i) {
            layerEntries.push(processRouteDataForLayer(data[i]));
        }
        
        return layerEntries;
    }
    else {
        return processRouteDataForLayer(data);
    }
}

// This is the main updating.
// This returns a promise whose argument is an array of RouteLayerEntry objects for the route ids.
function routeLayerEntryPromise(routeIds) {
    if (!Array.isArray(routeIds)) {
        routeIds = [ routeIds ];
    }
    
    var routeIdsNeeded = [];
    var routeEntries = [];
    routeIds.forEach((routeId) => {
        var entry = routes.get(routeId);
        if (entry) {
            routeEntries.push(entry);
        }
        else {
            routeIdsNeeded.push(routeId);
        }
    });

    var promise;
    if (routeIdsNeeded.length > 0) {
        var routePromises = [];
        routeIdsNeeded.forEach((routeId) => {
            promise = fetchRouteLayerEntries([routeId])
                    .then((entries) => routeEntries.concat(entries));
            routePromises.push(promise);
        });
        promise = Promise.all(routePromises).then(() => routeEntries);
    }
    else {
        promise = Promise.resolve(routeEntries);
    }

    return promise
            .then((entries) => {
                return vehicleLayerEntryPromise(routeIds).then(() => entries);
            });
}



function fetchRouteIds(types) {
    var path = 'https://api-v3.mbta.com/routes';
    if (isIterable(types)) {
        path += '?filter%5Btype%5D=';
        var separator = '';
        for (let id of types) {
            path += separator + id;
            separator = '%2C';
        }
    }
    else if (types) {
        // Presume it's a single value
        path += '?filter%5Btype%5D=';
        path += types;
    }
    
    return fetch(path)
            .then((response) => response.json())
            .then((myJson) => processRoutesResultForIds(myJson));
}

function processRoutesResultForIds(json) {
    var ids = [];
    var data = json.data;
    var layerEntries = [];
    for (let i = 0; i < data.length; ++i) {
        ids.push(data[i].id);
    }

    return ids;
}


// Let's see:
// We want to basically filter by routes, so we grab the routes we want.
// Then we grab the vehicles for those routes.
// For each vehicle, we need to grab the shape.


// Configuration UI:
// Hierarchy check list:
//  Subways:
//      - All
//      - None
//      Blue Line
//      Green Line
//      Orange Line
//      Red Line
//
//  Commuter Rail:
//      - All
//      - None
//      Fitchburg
//      Etc.
//  
//  Buses:
//      - All
//      - None
//      
//  Boats:
//      - All
//      - None
//      
//
//  Style:
//      Bus Stops: Diamond
//      Subway Stops: Circle
//      Commuter Rail Stops: Square
//

    // Some notes:
    // Have color start to fade to gray as the data gets stale.
    
    // Inbound routes one color
    // Outbound routes another color?

function onUpdateBtn() {
    routeLayerEntryPromise(activeRouteIds)
            .then((routeEntries) => {
                routeEntries.forEach((routeEntry) => routeEntry.show());
            });
}


    map = L.map('map');
    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
    });
    layer.addTo(map);
    map.setView([42.356402, -71.062471], 13);
    
    //fetchRouteIds([1]).then((routeIds) => { activeRouteIds = routeIds; });
    
    routeLayerEntryPromise(activeRouteIds).then(function(routeEntries) {
        routeEntries.forEach((routeEntry) => routeEntry.show());
    });
    
    setInterval(onUpdateBtn, 10000);

    // TODO:
    // When we update vehicles, do a mark and sweep on the vehicles.
    // When there is a change in visible routes, do a mark and sweep on the shapes.
    // Should also do this whenever vehicles are hidden/appear.

}());

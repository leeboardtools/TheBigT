# TheBigT
A big picture of the MBTA's trains, buses and boats, and where they are now (or at least
where they are as reported by the MBTA).

This uses:
- [MBTA's API](https://api-v3.mbta.com/) for the MBTA information. [MassDOT](http://www.massdot.state.ma.us/) is the provider of the data provided through the MBTA API.
- [Tangram](https://github.com/tangrams/tangram) for the map, which in turn is based upon [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org).
- [Encoded polyline Leaflet plug-in](https://github.com/jieter/Leaflet.encoded) is used to decode the encoded polylines for the MBTA shapes.
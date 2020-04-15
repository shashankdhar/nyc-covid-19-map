import React from "react";

import * as d3 from 'd3';
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { geoPath, geoAlbers } from "d3-geo";
import { feature } from "topojson";

import zipcode from "./zipcode.json";
import zipresults from "./zip_cases.csv";

export default class ChoroplethMap extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data_places: [],
    };
  }

  componentDidMount() { 
    d3.csv(zipresults).then(function(data) {
      this.setState({
        data_places: data
      });
    }.bind(this));
  }

  render() {
    const width = 1110,
      height = 600;

    const color = scaleOrdinal(schemeCategory10);

    const zipunits = feature(zipcode, zipcode.objects.ZIP_CODE_040114);

    const gprojection = geoAlbers()
      .center([0, 40.7])
      .rotate([74, 0])
      .translate([width / 2, height / 2])
      .scale(75000);

    const gPath = geoPath().projection(gprojection);  

    function getPositiveValue(data_places, ZIPCODE) {
      let count = 0;
      if(data_places.length > 0) {
         let place = data_places.filter(place => place.MODZCTA === ZIPCODE);
         if(place.length > 0) {
            count = place[0].Positive;
         }
      }
      return count;
    };

    return (
      <div className="main-wrapper">
          <svg width={width} height={height}>
            {zipunits.features.map((d, i) => (
                <path d={gPath(d)} key={i} fill={color(i)} >
                  <title>{ getPositiveValue(this.state.data_places, d.properties.ZIPCODE) } </title>
                </path>
            ))}
          </svg>
          <h1 className="heading-map">City of New York</h1>
      </div>     
    );
  }
}

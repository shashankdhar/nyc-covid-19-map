import React from "react";

import * as d3 from 'd3';
import { scaleThreshold } from "d3-scale";
import { geoPath, geoAlbers } from "d3-geo";
import { feature } from "topojson";
import ReactTooltip from "react-tooltip";

import zipcode from "./zipcode.json";
import zipresults from "./zip_cases.csv";

export default class ChoroplethMap extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      zipunits: feature(zipcode, zipcode.objects.ZIP_CODE_040114),
      hoveredArea: {}
    };
  }

  getPositiveValue(data_places, ZIPCODE) {
      let zipInfo = null;
      if(data_places.length > 0) {
         let place = data_places.filter(place => place.MODZCTA === ZIPCODE);
         if(place.length > 0) {
            zipInfo = {};
            zipInfo.positive = place[0].Positive;
            zipInfo.total = place[0].Total;
            zipInfo.perc_pos = place[0]['zcta_cum.perc_pos'];
         }
      }
      return zipInfo;
  }

  componentDidMount() { 
    d3.csv(zipresults).then(function(data) {
      let zips = this.state.zipunits;
      zips.features.map((d, i) => (
        d.zipInfo = this.getPositiveValue(data, d.properties.ZIPCODE)
      ));
      this.setState({
        zipunits: zips
      });
    }.bind(this));
  }

  render() {
    const width = 1110,
      height = 600;

    const colorScheme = d3.schemeReds[6];

    const color = scaleThreshold().domain([1, 100, 500, 1000, 2000, 3000])
                  .range(colorScheme);

    const gprojection = geoAlbers()
      .center([0, 40.7])
      .rotate([74, 0])
      .translate([width / 2, height / 2])
      .scale(75000);

    const gPath = geoPath().projection(gprojection);    

    return (
      <div className="main-wrapper">
          <svg width={width} height={height}>
            {this.state.zipunits.features.map((d, i) => (
                <path data-tip
                  d={gPath(d)} key={i} fill={color(d.zipInfo ? d.zipInfo.positive : i)}
                  onMouseOver={ () => this.setState( {hoveredArea: d.zipInfo }) }
                  onMouseOut={ () => this.setState( {hoveredArea: {} }) } 
                >
                </path>
            ))}
          </svg>
          <ReactTooltip place="top" type="error" effect="solid">
              <table>
                <thead>
                  <tr>
                    <th colSpan="3">Positive</th>
                    <th colSpan="3">Total</th>
                    <th colSpan="3">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="3">{ this.state.hoveredArea ? this.state.hoveredArea.positive : '' }</td>
                    <td colSpan="3">{ this.state.hoveredArea ? this.state.hoveredArea.total : '' } </td>
                    <td colSpan="3">{ this.state.hoveredArea ? this.state.hoveredArea.perc_pos : '' } </td>
                  </tr>
                </tbody>
              </table>
          </ReactTooltip>
          <h1 className="heading-map">City of New York</h1>
      </div>     
    );
  }
}

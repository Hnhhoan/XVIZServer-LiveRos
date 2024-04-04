// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/* eslint-disable camelcase */
import { add,multiply } from '../common/common';
import { quaternionToEuler } from '../common/quaternion';

export default class DetectedObjects {
  constructor(topicConfig,option) {
    this.streamName=topicConfig.config.xvizStream;
    this.topicConfig=topicConfig;
  }
  async convertMessage(synchronizedData, xvizBuilder) {
    const detectedObjects=synchronizedData.get(this.topicConfig.topic); 
    if (!detectedObjects) {
      return;
    }
    detectedObjects.objects.forEach(object => {
        // Here you can see how the *classes* are used to tag the object
        // allowing for the *style* information to be shared across
        // categories of objects.
        const l=object.dimensions.x;
        const w=object.dimensions.y;
        const h=object.dimensions.z;
        const {x,y,z}=object.pose.position;
        const {roll,pitch,yaw}=quaternionToEuler(object.pose.orientation);
        const R=[
            [   Math.cos(yaw)*Math.cos(pitch),
                Math.cos(yaw)*Math.sin(pitch)*Math.sin(roll)-Math.sin(yaw)*Math.cos(roll),
                Math.cos(yaw)*Math.sin(pitch)*Math.cos(roll)+Math.sin(yaw)*Math.sin(roll)],

            [   Math.sin(yaw)*Math.cos(pitch),
                Math.sin(yaw)*Math.sin(pitch)*Math.sin(roll)+Math.cos(yaw)*Math.cos(roll),
                Math.sin(yaw)*Math.sin(pitch)*Math.cos(roll)-Math.cos(yaw)*Math.sin(roll)],

            [   -Math.sin(pitch),
                Math.cos(pitch)*Math.sin(roll),
                Math.cos(pitch)*Math.cos(roll)]];
            
            const location=[[x],[y],[z]];
            let vertices=[
                [[l/2.0],[-w/2.0],[-h/2.0]],
                [[l/2.0],[w/2.0],[-h/2.0]],
                [[-l/2.0],[w/2.0],[-h/2.0]],
                [[-l/2.0],[-w/2.0],[-h/2.0]]
            ];
            vertices=vertices.map(v=>{
                let r_v=multiply(R,v);
                r_v=add(location,r_v);
                return r_v.flat();
            });
            //.timestamp(TimeUtil.toDate(timestamp).getTime() / 1e3)
        xvizBuilder
          .primitive(this.streamName)
          .polygon(vertices)
          .classes([object.label])
          .style({
            height: h
          })
          .id(object.id);
        xvizBuilder
          .primitive(this.topicConfig.xvizStreamOfTrackingPoints)
          .circle([object.pose.position.x,object.pose.position.y,object.pose.position.z])
          .id(object.id);
/*
          xvizBuilder
          .primitive(this.config.xvizStreamOfLabel)
          // float above the object
          .position([object.pose.position.x,object.pose.position.y,object.pose.position.z+2])
          .text(object.label);*/
      });
  }

  getMetadata(xvizMetaBuilder) {
    // You can see the type of metadata we allow to define.
    // This helps validate data consistency and has automatic
    // behavior tied to the viewer.
    
    xvizMetaBuilder
    .stream(this.streamName)
      .category('primitive')
      .type('polygon')
      .coordinate('VEHICLE_RELATIVE')
      .streamStyle({
        extruded: true,
        fill_color: '#00000080'
      })
      .styleClass('car', {
        fill_color: '#50B3FF80',
        stroke_color: '#50B3FF'
      })
      .styleClass('cyclist', {
        fill_color: '#957FCE80',
        stroke_color: '#957FCE'
      })
      .styleClass('pedestrian', {
        fill_color: '#FFC6AF80',
        stroke_color: '#FFC6AF'
      })
      .styleClass('van', {
        fill_color: '#5B91F480',
        stroke_color: '#5B91F4'
      })
      .styleClass('Unknown', {
        fill_color: '#E2E2E280',
        stroke_color: '#E2E2E2'
      })
      .styleClass('truck', {
        fill_color: '#5B923480',
        stroke_color: '#5B91F4'
      })
      .styleClass('bus', {
        fill_color: '#5B923480',
        stroke_color: '#5B91F4'
      })
      .styleClass('tricyclistus', {
        fill_color: '#BB920000',
        stroke_color: '#5B91F4'
      })
      .styleClass('bike', {
        fill_color: '#0FFB0E',
        stroke_color: '#5B91F4'
      })
      .styleClass('highlighted', {
        fill_color: '#ff8000aa'
      })
      
      .stream(this.topicConfig.xvizStreamOfTrackingPoints)
      .category('primitive')
      .type('circle')
      .streamStyle({
        radius: 0.2,
        stroke_width: 0,
        fill_color: '#FFC043'
      })
      .coordinate('VEHICLE_RELATIVE')
      /*
      .stream(this.config.xvizStreamOfLabel)
      .category('primitive')
      .type('text')
      .streamStyle({
        text_size: 18,
        fill_color: 'red'
      })
      .coordinate('VEHICLE_RELATIVE')*/
  }
}

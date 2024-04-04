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

import {XVIZBuilder, XVIZMetadataBuilder} from '@xviz/builder';
import RosSubscriber from '../helpers/ros-subscriber';
import PoseConverter from './pose-converter';
import VisualizationMarkerArray from './visualization-markerarray-converter';
import LidarConverter from './lidar-converter';
import DetectedObjects  from './detected-objects-converter';
import VehiclePose from './vehicle-pose-converter';
import BoundingBoxConverter from './bounding-box-converter';
import Float32Converter from './float32-converter';
//import { poseTopicConfig,topicConfig } from '../topic-config';
import  { poseTopicConfig,topicConfig } from "../2024-01-30-13-15-03-filtered-topic-config";
import { exTopicConfig } from '../ext-topic-config';
export class LiveRosXVIZConverter {
  constructor(option){
		this.topics=option.topics;
    this.option=option;
		this.rosSubscriber=new RosSubscriber({poseTopic:poseTopicConfig,topics:topicConfig,exTopics:exTopicConfig});
	}
  initialize() {
    const poseConverter=new PoseConverter(poseTopicConfig,this.option);
    const _topicConfig=this.rosSubscriber.getTopicConfig();
    console.log(_topicConfig);
    this.converters=this.matchConfigToConverters(_topicConfig);
    const boundingBoxConverter =new BoundingBoxConverter();
    this.converters.unshift(boundingBoxConverter);
    this.converters.unshift(poseConverter);
  }
  async isSubcribed(){
    //return await this.rosSubscriber.start();
    console.log("isSubcribed");
    const ok= await this.rosSubscriber.start();
    this.metadata=this.getMetadata();
    return ok;
  }
  convertMessage(){
    const xvizBuilder = new XVIZBuilder({
        metadata: this.metadata
      });
      // As builder instance is shared across all the converters, to avoid race conditions',
      // Need wait for each converter to finish
      const synchronizedData=this.rosSubscriber.synchronizeData();
      /*const synchronizedData=new Map();
      this.rosSubscriber.synchronizeData(synchronizedData,1)*/
      if(synchronizedData.get(poseTopicConfig.topic)!=undefined)
      {
        for (let i = 0; i < this.converters.length; i++){ 
          {
            this.converters[i].convertMessage(synchronizedData,xvizBuilder);
          }
        }
        return xvizBuilder.getMessage();
      }
      return synchronizedData.get(poseTopicConfig.topic);
    }
  getMetadata(){
		const xb = new XVIZMetadataBuilder();
    xb.startTime(this.rosSubscriber.getStartTimestamp()).endTime(this.getEndTimestamp());
		this.converters.forEach(converter => converter.getMetadata(xb));
		//xb.ui(getDeclarativeUI());
		return xb.getMetadata();
	}
  getStartTimestamp(){
    return this.rosSubscriber.getStartTimestamp();
  }
  getEndTimestamp(){
    return this.rosSubscriber.getStartTimestamp()+parseFloat(this.option.duration);
  }
  matchConfigToConverters(topicConfig){
    const converters=[];
    topicConfig.forEach(topic=>{
      if(topic.type=="sensor_msgs/PointCloud2")
      {
        converters.push(new LidarConverter(topic,this.option));
      }
      else if(topic.type=="visualization_msgs/MarkerArray")
      {
        converters.push(new VisualizationMarkerArray(topic,this.option));
      }else if(topic.type=="autoware_msgs/DetectedObjectArray")
      {
        converters.push(new DetectedObjects(topic,this.option));
      }else if (topic.type=="sensor_msgs/NavSatFix"&&topic.namespace)
      {
        converters.push(new VehiclePose(topic,this.option));
      }else if(topic.type=="std_msgs/Float32")
      {
        converters.push(new Float32Converter(topic,this.option));
      }
    })
    return converters;
  }
  shutdown(){
    this.rosSubscriber.shutdown();
  }
}


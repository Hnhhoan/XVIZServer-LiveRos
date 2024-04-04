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

import path from 'path';
import {resizeImage,annotate2DImage,annotate3DImage} from '../parsers/process-image';
export default class ImageConverter{
  constructor(rootDir,info,side,getPose,options) {
    this.rootDir=rootDir;
    this.side=side;
    this.getPose=getPose;
    this.sideDir=`${side}-side`;
    this.streamName = `/${this.sideDir}/camera`;
    this.info=info;
    this.options = options;
  }

  async loadMessage(side_frame) {
    // Load the data for this message
    const {calib,label}=this.getPose();
    const {maxWidth, maxHeight} = this.options;
    const srcFilePath = path.join(this.rootDir,`/${this.sideDir}/image/${side_frame}.jpg`);
    const {data, width, height, originWidth , originHeight} = await resizeImage(srcFilePath, maxWidth, maxHeight);
    if(this.options.is3DAnnotated){
      const boxLabel=this.side=='vehicle'?label.vehicle_side.lidar:label.infrastructure_side.lidar;
      return annotate3DImage({data, width, height,originWidth , originHeight},boxLabel,calib,this.side);
    }
    if(this.options.is2DAnnotated)
    {
      const boxLabel=this.side=='vehicle'?label.vehicle_side.camera:label.infrastructure_side.camera;
      return annotate2DImage({data, width, height,originWidth , originHeight},boxLabel);
    }
    
    return {data, width, height};
  }
  async convertMessage(messageNumber, xvizBuilder) {
    const side_frame=this.info.cooperative_info[messageNumber][`${this.side}_frame`];
    const {data, width, height} = await this.loadMessage(side_frame);
    const typedArrayData=nodeBufferToTypedArray(data);
    xvizBuilder
      .primitive(this.streamName)
      .image(typedArrayData, 'jpg')
      .dimensions(width, height);
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.streamName)
      .category('primitive')
      .type('image');
  }
}

function nodeBufferToTypedArray(buffer) {
  // TODO - per docs we should just be able to call buffer.buffer, but there are issues
  const typedArray = new Uint8Array(buffer);
  return typedArray;
}

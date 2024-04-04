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

import fs from 'fs';
import {createCanvas,loadImage  } from 'canvas';
import {multiply,add} from './common';
//const {createCanvas } = require('canvas');
import sharp from 'sharp';


function getResizeDimension(width, height, maxWidth, maxHeight) {
  const ratio = width / height;

  let resizeWidth = null;
  let resizeHeight = null;

  if (maxHeight > 0 && maxWidth > 0) {
    resizeWidth = Math.min(maxWidth, maxHeight * ratio);
    resizeHeight = Math.min(maxHeight, maxWidth / ratio);
  } else if (maxHeight > 0) {
    resizeWidth = maxHeight * ratio;
    resizeHeight = maxHeight;
  } else if (maxWidth > 0) {
    resizeWidth = maxWidth;
    resizeHeight = maxWidth / ratio;
  } else {
    resizeWidth = width;
    resizeHeight = height;
  }

  return {
    resizeWidth: Math.floor(resizeWidth),
    resizeHeight: Math.floor(resizeHeight)
  };
}

// preserve aspect ratio
export async function resizeImage(filePath, maxWidth, maxHeight) {
  const metadata = await getImageMetadata(filePath);
  const {width, height} = metadata;

  let imageData = null;
  const {resizeWidth, resizeHeight} = getResizeDimension(width, height, maxWidth, maxHeight);

  if (resizeWidth === width && resizeHeight === height) {
    imageData = fs.readFileSync(filePath);
  } else {
    imageData = await sharp(filePath)
      .resize(resizeWidth, resizeHeight)
      .toBuffer()
      .then(data => data);
  }

  return {
    width: resizeWidth,
    height: resizeHeight,
    originWidth:width,
    originHeight:height,
    data: imageData
  };
}

export async function annotate2DImage(resizedImage,label)
{
  const canvas = createCanvas(resizedImage.width, resizedImage.height);
  const ctx = canvas.getContext('2d');
  const image= await loadImage(resizedImage.data);
  ctx.drawImage(image, 0, 0,resizedImage.width, resizedImage.height,0, 0,resizedImage.width, resizedImage.height);
  label.forEach(box => {
    let {xmin,ymin,xmax,ymax}=box["2d_box"];
    let x=(resizedImage.width/resizedImage.originWidth)*xmin;
    let y=(resizedImage.height/resizedImage.originHeight)*ymin;
    let b_w=(resizedImage.width/resizedImage.originWidth)*xmax -x;
    let b_h=(resizedImage.height/resizedImage.originHeight)*ymax-y;
    ctx.strokeStyle = "red";
    ctx.rect(x, y, b_w, b_h);
    ctx.stroke();
  });
  return {
    width: resizedImage.width,
    height: resizedImage.height,
    originWidth:resizedImage.originWidth,
    originHeight:resizedImage.originHeight,
    data: canvas.toBuffer()
  };;
}

export async function annotate3DImage(resizedImage,label,calib,side)
{
  const canvas = createCanvas(resizedImage.width, resizedImage.height);
  const ctx = canvas.getContext('2d');
  const image= await loadImage(resizedImage.data);
  ctx.drawImage(image, 0, 0,resizedImage.width, resizedImage.height,0, 0,resizedImage.width, resizedImage.height);
  label.forEach(object => {
    /*
    let {xmin,ymin,xmax,ymax}=box["2d_box"];
    let x=(resizedImage.width/resizedImage.originWidth)*xmin;
    let y=(resizedImage.height/resizedImage.originHeight)*ymin;
    let b_w=(resizedImage.width/resizedImage.originWidth)*xmax -x;
    let b_h=(resizedImage.height/resizedImage.originHeight)*ymax-y;
    */
   if(side=="vehicle")
   {
      const {l,w,h}=object["3d_dimensions"];
      const {rotation,translation}=calib.vehicle_side.lidar_to_camera;
      if(calib.vehicle_side.camera_intrinsic==null)
        return resizedImage;
      let {cam_K}=calib.vehicle_side.camera_intrinsic;
      cam_K=to3x3Array(cam_K);
      const {x,y,z}=object["3d_location"];
      const Rz=[[Math.cos(object.rotation),-Math.sin(object.rotation),0],
                      [Math.sin(object.rotation),Math.cos(object.rotation),0],
                      [0                        ,0                        ,1]];
      const location=[[x],[y],[z]];
      let vertices=[
          [[l/2.0],[-w/2.0],[-h/2.0]],
          [[l/2.0],[w/2.0],[-h/2.0]],
          [[-l/2.0],[w/2.0],[-h/2.0]],
          [[-l/2.0],[-w/2.0],[-h/2.0]],
          [[l/2.0],[-w/2.0],[h/2.0]],
          [[l/2.0],[w/2.0],[h/2.0]],
          [[-l/2.0],[w/2.0],[h/2.0]],
          [[-l/2.0],[-w/2.0],[h/2.0]],
      ];
      vertices=vertices.map(v=>{
          let r_v=multiply(Rz,v);
          r_v=add(location,r_v);
          r_v=multiply(rotation,r_v);
          r_v=add(translation,r_v);
          r_v=multiply(cam_K,r_v);
          r_v=normalVertor(r_v.flat());
          return {x:r_v[0]*resizedImage.width/resizedImage.originWidth,
                  y:r_v[1]*resizedImage.height/resizedImage.originHeight,
                  z:r_v[2]
                }
      });
      console.log("---------------------------");
      console.log(vertices);
      console.log("---------------------------");
    /// calculate coordinate of  bounding-box vertices to render resized image
      drawLine(ctx,vertices[0],vertices[1]);
      drawLine(ctx,vertices[1],vertices[2]);
      drawLine(ctx,vertices[2],vertices[3]);
      drawLine(ctx,vertices[3],vertices[0]);

      drawLine(ctx,vertices[4],vertices[5]);
      drawLine(ctx,vertices[5],vertices[6]);
      drawLine(ctx,vertices[6],vertices[7]);
      drawLine(ctx,vertices[7],vertices[4]);

      drawLine(ctx,vertices[0],vertices[4]);
      drawLine(ctx,vertices[1],vertices[5]);
      drawLine(ctx,vertices[2],vertices[6]);
      drawLine(ctx,vertices[3],vertices[7]);
   }
  });
  return {
    width: resizedImage.width,
    height: resizedImage.height,
    originWidth:resizedImage.originWidth,
    originHeight:resizedImage.originHeight,
    data: canvas.toBuffer()
  };;
}
export async function getImageMetadata(filePath) {
  return await sharp(filePath).metadata();
}

function drawLine(ctx,startLine,endLine){
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(startLine.x, startLine.y);
    ctx.lineTo(endLine.x, endLine.y);
    // Draw the Path
    ctx.stroke();
}
function to3x3Array(cam_K){
  let cam3x3=[];
  for(var i=0;i<3;i++)
  {
    let row=[];
    for(var j=0;j<3;j++)
    {
      row.push(cam_K[i*3+j]);
    }
    cam3x3.push(row);
  }
  return cam3x3;
}
function normalVertor(v){
  return v[2]!==0? [v[0]/v[2],v[1]/v[2],1]:v;
}
